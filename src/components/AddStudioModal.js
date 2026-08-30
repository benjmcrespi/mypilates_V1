"use client";
import { useState, useRef, useEffect } from 'react';
import Autocomplete from 'react-google-autocomplete';
import { supabase } from '@/lib/supabaseClient';
import { inferCategoryId } from '@/lib/categories';

// Converts an ISO timestamp to a <input type="datetime-local"> value in the
// browser's local time - mirrors the conversion already used when editing a
// draft elsewhere in the dashboard, for consistent round-tripping.
function toDateTimeLocalValue(isoString) {
  const d = new Date(isoString);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d - tzOffset).toISOString().slice(0, 16);
}

// Generates weekly occurrence dates for a manually-entered recurring class,
// where (unlike a parsed calendar) we don't have real future dates to work with.
function buildWeeklyDates(startIso, weeks) {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
  const dates = [];
  let occurrence = new Date(start);
  while (occurrence <= end) {
    dates.push(occurrence.toISOString());
    occurrence = new Date(occurrence.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  return dates;
}

// One unified "Add a Studio" screen: the same visible fields whether the
// instructor fills them by hand or pastes a booking/calendar link to auto-fill
// them. Always creates a new studio - reconciling ICS links onto an existing
// studio happens from that studio's settings card, not from here.
export default function AddStudioModal({ instructorId, categories, timeZone, onClose, onSaved }) {
  const [calendarUrlInput, setCalendarUrlInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const lastParsedUrl = useRef('');

  const [studioName, setStudioName] = useState('');
  const [studioAddress, setStudioAddress] = useState('');
  const [studioLocationUrl, setStudioLocationUrl] = useState('');
  const [addressFlagged, setAddressFlagged] = useState(false);
  const studioInputRef = useRef(null);

  // Places search degrades to a plain text field instead of Google's own error
  // dialog when the Maps script can't authenticate (bad key, referrer, billing)
  // or fails to load at all (network, ad blockers) - manual entry still works.
  const [mapsUnavailable, setMapsUnavailable] = useState(false);
  useEffect(() => {
    window.gm_authFailure = () => setMapsUnavailable(true);
    const timer = setTimeout(() => {
      if (!(typeof google !== 'undefined' && google.maps?.places)) setMapsUnavailable(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // >1 entry means the checklist replaces the single class name/time fields below.
  const [parsedClasses, setParsedClasses] = useState([]);
  const [singleParsedGroup, setSingleParsedGroup] = useState(null);

  const [className, setClassName] = useState('');
  const [dateTimeLocal, setDateTimeLocal] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [recurringWeekly, setRecurringWeekly] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const handleParseUrl = async (url) => {
    const trimmed = (url || '').trim();
    if (!trimmed || trimmed === lastParsedUrl.current) return;
    lastParsedUrl.current = trimmed;
    setIsParsing(true);
    try {
      const res = await fetch('/api/parse-ics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarUrl: trimmed, timeZone }),
      });
      const data = await res.json();
      const groups = (data.classes || []).map((c, i) => ({ ...c, key: `${i}-${c.representativeDateTime}`, checked: true }));

      if (groups.length > 1) {
        setParsedClasses(groups);
        setSingleParsedGroup(null);
      } else if (groups.length === 1) {
        setParsedClasses([]);
        setSingleParsedGroup(groups[0]);
        setClassName(groups[0].className);
        setDateTimeLocal(toDateTimeLocalValue(groups[0].representativeDateTime));
        setRecurringWeekly(groups[0].recurring);
        if (groups[0].url) setBookingUrl(groups[0].url);
      }

      if (data.locationGuess && !studioAddress) {
        setStudioAddress(data.locationGuess);
        setAddressFlagged(true);
      }
    } catch {
      // Dead or unreadable link: stay on manual entry, same screen, no error shown.
    }
    setIsParsing(false);
  };

  const toggleChecklistItem = (key) => {
    setParsedClasses(prev => prev.map(c => c.key === key ? { ...c, checked: !c.checked } : c));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const showChecklist = parsedClasses.length > 1;
    // Falls back to whatever text is sitting in the search box even if the instructor
    // never clicked a Places suggestion - typing a name manually must work just as well.
    const finalStudioName = studioName.trim() || studioInputRef.current?.value?.trim() || '';
    if (!finalStudioName) { alert('Please enter a studio name.'); return; }
    if (!showChecklist && (!className.trim() || !dateTimeLocal)) { alert('Please add a class name and time.'); return; }
    if (showChecklist && parsedClasses.every(c => !c.checked)) { alert('Select at least one class to save.'); return; }

    setIsSaving(true);
    try {
      const { data: studioRow, error: studioError } = await supabase
        .from('studios')
        .insert([{
          name: finalStudioName,
          location_url: studioLocationUrl || '',
          address: studioAddress.trim() || null,
          calendar_url: calendarUrlInput.trim() || null,
          instructor_id: instructorId,
        }])
        .select()
        .single();
      if (studioError) throw studioError;

      const rows = [];

      if (showChecklist) {
        parsedClasses.filter(c => c.checked).forEach(group => {
          const categoryId = inferCategoryId(group.className, categories, null);
          const seriesId = group.recurring ? crypto.randomUUID() : null;
          const dates = group.recurring ? group.occurrenceDateTimes : [group.representativeDateTime];
          dates.forEach(dt => rows.push({
            instructor_id: instructorId,
            studio_id: studioRow.id,
            studio_name: studioRow.name,
            location_url: studioRow.location_url,
            class_name: group.className,
            category_id: categoryId,
            category_other: null,
            date_time: dt,
            booking_url: group.url || '',
            booking_type: 'direct',
            booking_note: null,
            status: 'published',
            series_id: seriesId,
          }));
        });
      } else {
        const categoryId = inferCategoryId(className, categories, null);
        const isoStart = new Date(dateTimeLocal).toISOString();
        // If the instructor hasn't edited a single parsed match, expand it using its
        // real future occurrence dates instead of guessing synthetic weekly ones.
        const unedited = singleParsedGroup
          && singleParsedGroup.className === className
          && toDateTimeLocalValue(singleParsedGroup.representativeDateTime) === dateTimeLocal
          && singleParsedGroup.recurring === recurringWeekly;
        const seriesId = recurringWeekly ? crypto.randomUUID() : null;
        const dates = !recurringWeekly
          ? [isoStart]
          : (unedited ? singleParsedGroup.occurrenceDateTimes : buildWeeklyDates(isoStart, 8));
        dates.forEach(dt => rows.push({
          instructor_id: instructorId,
          studio_id: studioRow.id,
          studio_name: studioRow.name,
          location_url: studioRow.location_url,
          class_name: className.trim(),
          category_id: categoryId,
          category_other: null,
          date_time: dt,
          booking_url: bookingUrl || '',
          booking_type: 'direct',
          booking_note: null,
          status: 'published',
          series_id: seriesId,
        }));
      }

      if (rows.length > 0) {
        const { error: classesError } = await supabase.from('classes').insert(rows);
        if (classesError) throw classesError;
      }

      onSaved();
    } catch (err) {
      alert('Error saving: ' + err.message);
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
  };

  const showChecklist = parsedClasses.length > 1;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-bark">Add a New Studio</h2>
          <button type="button" onClick={onClose} className="text-stone hover:text-bark text-sm px-2 py-1">✕</button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone mb-1.5 uppercase tracking-wider">
              Have a booking link? <span className="font-normal normal-case">Paste it here to auto-fill</span>
            </label>
            <input type="url" placeholder="Paste your studio's booking or calendar link..."
              value={calendarUrlInput}
              onChange={e => setCalendarUrlInput(e.target.value)}
              onPaste={e => {
                const text = e.clipboardData.getData('text');
                setTimeout(() => handleParseUrl(text), 0);
              }}
              onBlur={e => handleParseUrl(e.target.value)}
              className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-linen text-sm" />
            {isParsing && <p className="text-xs text-stone mt-1.5 animate-pulse">Reading your link…</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Studio Name</label>
            {mapsUnavailable ? (
              <input type="text" ref={studioInputRef}
                onChange={e => setStudioName(e.target.value)}
                className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-linen text-sm"
                placeholder="e.g. SoulCycle Yaletown" />
            ) : (
              <Autocomplete
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                options={{ types: ["establishment"], fields: ["name", "url", "formatted_address"] }}
                libraries={["places"]}
                ref={studioInputRef}
                onKeyUp={() => { setStudioName(''); setStudioLocationUrl(''); }}
                onPlaceSelected={(place) => {
                  if (place && place.name) {
                    setStudioName(place.name);
                    setStudioLocationUrl(place.url || '');
                    setStudioAddress(place.formatted_address || '');
                    setAddressFlagged(false);
                    if (studioInputRef.current) studioInputRef.current.value = place.name;
                  }
                }}
                className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-linen text-sm"
                placeholder="Search on Google Maps..." />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Address <span className="text-stone font-normal text-xs">(optional)</span>
            </label>
            <input type="text" placeholder="123 Main St, City, Province"
              value={studioAddress}
              onChange={e => { setStudioAddress(e.target.value); setAddressFlagged(false); }}
              className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-linen text-sm" />
            {addressFlagged && (
              <p className="text-[11px] text-clay-dark mt-1.5">⚠ Pulled from your calendar link. Double-check this.</p>
            )}
          </div>

          {showChecklist ? (
            <div>
              <label className="block text-sm font-medium mb-2">
                Classes found ({parsedClasses.filter(c => c.checked).length} selected)
              </label>
              <div className="border border-sand rounded-lg divide-y divide-sand max-h-64 overflow-y-auto">
                {parsedClasses.map(c => (
                  <label key={c.key} className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer hover:bg-linen">
                    <input type="checkbox" checked={c.checked} onChange={() => toggleChecklistItem(c.key)}
                      className="w-4 h-4 accent-clay flex-shrink-0" />
                    <span className="flex-1">
                      <span className="font-medium text-bark">{c.className}</span>
                      <span className="text-stone"> — {c.dayLabel}s, {c.timeLabel}</span>
                      {c.recurring && (
                        <span className="ml-2 text-[11px] text-sage font-semibold uppercase tracking-wider">Weekly</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Class Name</label>
                <input type="text" value={className} onChange={e => setClassName(e.target.value)}
                  required className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Day & Time</label>
                <input type="datetime-local" value={dateTimeLocal} onChange={e => setDateTimeLocal(e.target.value)}
                  required className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Booking Link <span className="text-stone font-normal text-xs">(optional)</span>
                </label>
                <input type="url" placeholder="https://..." value={bookingUrl} onChange={e => setBookingUrl(e.target.value)}
                  className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen" />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={recurringWeekly} onChange={e => setRecurringWeekly(e.target.checked)}
                  className="w-4 h-4 accent-clay" />
                Repeats weekly
              </label>
            </>
          )}

          <button type="submit" disabled={isSaving}
            className="w-full bg-clay text-white font-medium py-3 rounded-lg hover:bg-clay-dark disabled:opacity-50 transition-colors">
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}

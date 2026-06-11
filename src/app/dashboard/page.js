"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Autocomplete from 'react-google-autocomplete';

const CLASS_TYPES = ['Mat Pilates', 'Reformer Pilates', 'Stretch and Mobility', 'Yoga'];

function inferClassType(className) {
  const name = (className || '').toLowerCase();
  if (name.includes('reformer')) return 'Reformer Pilates';
  if (name.includes('mat')) return 'Mat Pilates';
  if (name.includes('yoga') || name.includes('vinyasa') || name.includes('flow')) return 'Yoga';
  if (name.includes('stretch') || name.includes('mobility') || name.includes('flex')) return 'Stretch and Mobility';
  return '';
}

const WEEKDAY_INDEX = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

// Returns { year, month, day, weekday } for a date as observed in the given timezone
function getTZDateParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  }).formatToParts(date);
  const obj = {};
  parts.forEach(p => { if (p.type !== 'literal') obj[p.type] = p.value; });
  return obj;
}

// Groups items with a date_time into "this week" (through Sunday), "next week" (Mon-Sun), and "later",
// based on calendar days in the given timezone.
function groupByWeek(items, timeZone) {
  const todayParts = getTZDateParts(new Date(), timeZone);
  const todayUTC = Date.UTC(+todayParts.year, +todayParts.month - 1, +todayParts.day);
  const todayDow = WEEKDAY_INDEX[todayParts.weekday] ?? 0;
  const thisWeekEnd = 6 - todayDow; // days from today through Sunday
  const nextWeekEnd = thisWeekEnd + 7;

  const groups = { thisWeek: [], nextWeek: [], later: [] };

  items.forEach((item) => {
    const itemParts = getTZDateParts(new Date(item.date_time), timeZone);
    const itemUTC = Date.UTC(+itemParts.year, +itemParts.month - 1, +itemParts.day);
    const dayOffset = Math.round((itemUTC - todayUTC) / 86400000);

    if (dayOffset <= thisWeekEnd) groups.thisWeek.push(item);
    else if (dayOffset <= nextWeekEnd) groups.nextWeek.push(item);
    else groups.later.push(item);
  });

  return groups;
}

const PLATFORMS = [
  { value: '', label: 'Select platform...' },
  { value: 'mindbody', label: 'Mindbody' },
  { value: 'mariana_tek', label: 'Mariana Tek' },
  { value: 'other', label: 'Other' },
];

const BOOKING_TYPES = [
  { value: 'direct', label: 'Direct link' },
  { value: 'membership_required', label: 'Membership required' },
  { value: 'app_recommended', label: 'App recommended' },
  { value: 'dropin_welcome', label: 'Drop-in welcome' },
];

const TIMEZONES = [
  { value: 'America/Vancouver',   label: 'Pacific Time (Vancouver)' },
  { value: 'America/Edmonton',    label: 'Mountain Time (Edmonton)' },
  { value: 'America/Winnipeg',    label: 'Central Time (Winnipeg)' },
  { value: 'America/Toronto',     label: 'Eastern Time (Toronto)' },
  { value: 'America/Halifax',     label: 'Atlantic Time (Halifax)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
  { value: 'America/Denver',      label: 'Mountain Time (Denver)' },
  { value: 'America/Chicago',     label: 'Central Time (Chicago)' },
  { value: 'America/New_York',    label: 'Eastern Time (New York)' },
  { value: 'Europe/London',       label: 'GMT (London)' },
  { value: 'Australia/Sydney',    label: 'AEDT (Sydney)' },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [isChecking, setIsChecking] = useState(true);

  const [savedStudios, setSavedStudios] = useState([]);
  const [newStudioName, setNewStudioName] = useState('');
  const [newStudioUrl, setNewStudioUrl] = useState('');
  const settingsStudioRef = useRef(null);
  const formRef = useRef(null);

  const [editingDraftId, setEditingDraftId] = useState(null);
  const [categoryAutoSet, setCategoryAutoSet] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const [classData, setClassData] = useState({
    classType: '',
    className: '',
    dateTime: '',
    bookingUrl: '',
    bookingType: 'direct',
    bookingNote: '',
    studioName: '',
    locationUrl: '',
    repeatFrequency: 'none',
    repeatDuration: '2weeks',
    repeatEndDate: '',
  });

  const [settingsData, setSettingsData] = useState({
    bio: '',
    timezone: 'America/Vancouver',
    years_experience: '',
    instagram_handle: '',
    certifications: [],
  });
  const [certInput, setCertInput] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishingAll, setIsPublishingAll] = useState(false);
  const [isPublishingSelected, setIsPublishingSelected] = useState(false);
  const [selectedDraftIds, setSelectedDraftIds] = useState([]);
  const [showLaterDrafts, setShowLaterDrafts] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [myClasses, setMyClasses] = useState([]);
  const [followerCount, setFollowerCount] = useState(null);
  const [clickStats, setClickStats] = useState({ total: 0, weekTotal: 0, perClass: {}, topClassId: null, topCount: 0 });

  const fetchMyClasses = async (userId) => {
    const { data } = await supabase
      .from('classes')
      .select('*')
      .eq('instructor_id', userId)
      .order('date_time', { ascending: true });
    if (data) setMyClasses(data);
  };

  const fetchFollowerCount = async (userId) => {
    const { count } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('instructor_id', userId)
      .eq('confirmed', true);
    setFollowerCount(count ?? 0);
  };

  const fetchClickStats = async (userId) => {
    const { data } = await supabase
      .from('analytics_events')
      .select('class_id, created_at')
      .eq('instructor_id', userId)
      .eq('event_type', 'book_spot_click');

    if (!data) return;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const perClass = {};
    let weekTotal = 0;

    data.forEach(ev => {
      perClass[ev.class_id] = (perClass[ev.class_id] || 0) + 1;
      if (new Date(ev.created_at) >= weekAgo) weekTotal++;
    });

    let topClassId = null;
    let topCount = 0;
    Object.entries(perClass).forEach(([id, count]) => {
      if (count > topCount) { topCount = count; topClassId = id; }
    });

    setClickStats({ total: data.length, weekTotal, perClass, topClassId, topCount });
  };

  const fetchSavedStudios = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return;
    const { data } = await supabase
      .from('studios')
      .select('*')
      .eq('instructor_id', user.id);
    if (data) setSavedStudios(data);
  };

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      fetchSavedStudios();
      fetchMyClasses(session.user.id);
      fetchFollowerCount(session.user.id);
      fetchClickStats(session.user.id);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setSettingsData({
          bio: profileData.bio || '',
          timezone: profileData.timezone || 'America/Vancouver',
          years_experience: profileData.years_experience ?? '',
          instagram_handle: profileData.instagram_handle || '',
          certifications: profileData.certifications || [],
        });
        if (profileData.avatar_url) setAvatarPreview(profileData.avatar_url);
      }
      setIsChecking(false);
    };

    loadDashboard();
  }, [router]);

  useEffect(() => {
    if (editingDraftId && activeTab === 'add' && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingDraftId, activeTab]);

  // ── Waitlist toggle ──────────────────────────────────────────────────────────
  const handleToggleWaitlist = async (id, currentStatus) => {
    setMyClasses(prev => prev.map(c => c.id === id ? { ...c, is_waitlisted: !currentStatus } : c));
    const { error } = await supabase.from('classes').update({ is_waitlisted: !currentStatus }).eq('id', id);
    if (error) console.error("Error updating waitlist:", error);
  };

  // ── Draft editing ────────────────────────────────────────────────────────────
  const handleEditDraft = (draft) => {
    const messyLocation = (draft.studio_name || "").toLowerCase();
    const matchedStudio = savedStudios.find(s =>
      messyLocation.includes(s.name.toLowerCase().split(' ')[0])
    ) || { name: '', location_url: '' };

    const d = new Date(draft.date_time);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d - tzOffset)).toISOString().slice(0, 16);

    const resolvedType = draft.class_type !== 'TBD' ? draft.class_type : inferClassType(draft.class_name);

    setClassData({
      classType: resolvedType,
      className: draft.class_name,
      dateTime: localISOTime,
      bookingUrl: draft.booking_url || '',
      bookingType: draft.booking_type || 'direct',
      bookingNote: draft.booking_note || '',
      studioName: matchedStudio.name,
      locationUrl: matchedStudio.location_url || '',
    });
    setCategoryAutoSet(draft.class_type === 'TBD');

    setEditingDraftId(draft.id);
  };

  const cancelEdit = () => {
    setEditingDraftId(null);
    setCategoryAutoSet(true);
    setClassData({
      classType: '', className: '', dateTime: '',
      bookingUrl: '', bookingType: 'direct', bookingNote: '',
      studioName: '', locationUrl: '',
      repeatFrequency: 'none', repeatDuration: '2weeks', repeatEndDate: '',
    });
  };

  // ── Studio CRUD ──────────────────────────────────────────────────────────────
  const handleUpdateStudio = async (studioId, updates) => {
    const { error } = await supabase.from('studios').update(updates).eq('id', studioId);
    if (!error) {
      setSavedStudios(prev => prev.map(s => s.id === studioId ? { ...s, ...updates } : s));
      setSuccessMessage('Studio settings saved!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      alert("Error saving: " + error.message);
    }
  };

  const handleAddSavedStudio = async () => {
    const finalName = newStudioName || settingsStudioRef.current?.value;
    if (!finalName) return;
    setIsSaving(true);

    const { error } = await supabase.from('studios').insert([{
      name: finalName,
      location_url: newStudioUrl,
      instructor_id: user.id,
      booking_type: 'direct',
    }]);

    if (!error) {
      setSuccessMessage('Studio successfully added to your profile!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setNewStudioName('');
      setNewStudioUrl('');
      if (settingsStudioRef.current) settingsStudioRef.current.value = '';
      fetchSavedStudios();
    }
    setIsSaving(false);
  };

  const handleDeleteStudio = async (studioId) => {
    if (!window.confirm("Are you sure you want to remove this studio? This won't affect classes you've already published there.")) return;
    setIsSaving(true);
    const { error } = await supabase.from('studios').delete().eq('id', studioId);
    if (!error) {
      setSuccessMessage('Studio removed from your profile!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchSavedStudios();
    } else {
      alert("Error: " + error.message);
    }
    setIsSaving(false);
  };

  // ── Class CRUD ───────────────────────────────────────────────────────────────
  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class? This cannot be undone.")) return;
    setIsSaving(true);
    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (!error) {
      setSuccessMessage('Class removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchMyClasses(user.id);
      setSelectedDraftIds(prev => prev.filter(id => id !== classId));
      if (editingDraftId === classId) cancelEdit();
    }
    setIsSaving(false);
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      class_type: classData.classType,
      class_name: classData.className,
      date_time: new Date(classData.dateTime).toISOString(),
      booking_url: classData.bookingUrl,
      booking_type: classData.bookingType || 'direct',
      booking_note: classData.bookingNote || null,
      studio_name: classData.studioName,
      location_url: classData.locationUrl,
      status: 'published',
    };

    if (editingDraftId) {
      const { error } = await supabase.from('classes').update(payload).eq('id', editingDraftId);
      if (!error) {
        setSuccessMessage("Success! Class published to live schedule.");
        setTimeout(() => setSuccessMessage(''), 3000);
        cancelEdit();
        fetchMyClasses(user.id);
      }
    } else if (classData.repeatFrequency !== 'none') {
      const intervalDays = classData.repeatFrequency === 'biweekly' ? 14 : 7;
      const startDate = new Date(classData.dateTime);

      let endBoundary;
      if (classData.repeatDuration === 'custom') {
        endBoundary = classData.repeatEndDate ? new Date(`${classData.repeatEndDate}T23:59:59`) : startDate;
      } else {
        const weeks = classData.repeatDuration === '4weeks' ? 4 : classData.repeatDuration === '8weeks' ? 8 : 2;
        endBoundary = new Date(startDate.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
      }

      const seriesId = crypto.randomUUID();
      const rows = [];
      let occurrence = new Date(startDate);
      while (occurrence <= endBoundary) {
        rows.push({
          instructor_id: user.id,
          ...payload,
          date_time: occurrence.toISOString(),
          status: 'draft',
          series_id: seriesId,
        });
        occurrence = new Date(occurrence.getTime() + intervalDays * 24 * 60 * 60 * 1000);
      }

      const { error } = await supabase.from('classes').insert(rows);
      if (!error) {
        setSuccessMessage(`Success! ${rows.length} draft classes created.`);
        setTimeout(() => setSuccessMessage(''), 3000);
        cancelEdit();
        fetchMyClasses(user.id);
      }
    } else {
      const { error } = await supabase.from('classes').insert([{ instructor_id: user.id, ...payload }]);
      if (!error) {
        setSuccessMessage("Success! Class published manually.");
        setTimeout(() => setSuccessMessage(''), 3000);
        cancelEdit();
        fetchMyClasses(user.id);
      }
    }
    setIsSaving(false);
  };

  // ── Publish helpers ──────────────────────────────────────────────────────────
  const publishClassIds = async (ids) => {
    const { error } = await supabase.from('classes').update({ status: 'published' }).in('id', ids);
    if (!error) {
      setSuccessMessage(`${ids.length} class${ids.length > 1 ? 'es' : ''} published to your live schedule!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchMyClasses(user.id);
      setSelectedDraftIds(prev => prev.filter(id => !ids.includes(id)));

      // Notify confirmed followers about new classes (fire and forget)
      if (followerCount > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        fetch('/api/notify-followers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ classIds: ids }),
        }).catch(err => console.error('Notify followers failed:', err));
      }
    } else {
      alert("Error publishing: " + error.message);
    }
  };

  const handlePublishAll = async () => {
    const drafts = myClasses.filter(c => c.status === 'draft' && new Date(c.date_time) >= new Date());
    if (drafts.length === 0) return;
    if (!window.confirm(`Publish all ${drafts.length} draft${drafts.length > 1 ? 's' : ''} to your live schedule?`)) return;

    setIsPublishingAll(true);
    await publishClassIds(drafts.map(d => d.id));
    setIsPublishingAll(false);
  };

  const handlePublishSelected = async () => {
    if (selectedDraftIds.length === 0) return;
    if (!window.confirm(`Publish ${selectedDraftIds.length} selected draft${selectedDraftIds.length > 1 ? 's' : ''} to your live schedule?`)) return;

    setIsPublishingSelected(true);
    await publishClassIds(selectedDraftIds);
    setIsPublishingSelected(false);
  };

  const toggleDraftSelection = (id) => {
    setSelectedDraftIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // ── Profile / avatar ─────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAddCert = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = certInput.trim().replace(/,$/, '');
      if (val && !settingsData.certifications.includes(val)) {
        setSettingsData(prev => ({ ...prev, certifications: [...prev.certifications, val] }));
      }
      setCertInput('');
    }
  };

  const handleRemoveCert = (cert) => {
    setSettingsData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c !== cert) }));
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    let avatar_url = profile?.avatar_url || null;

    if (avatarFile) {
      setIsUploadingAvatar(true);
      const ext = avatarFile.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true });
      setIsUploadingAvatar(false);
      if (uploadError) {
        alert("Photo upload failed: " + uploadError.message);
        setIsSaving(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      avatar_url = publicUrl;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      bio: settingsData.bio,
      timezone: settingsData.timezone,
      years_experience: settingsData.years_experience === '' ? null : Number(settingsData.years_experience),
      instagram_handle: settingsData.instagram_handle || null,
      certifications: settingsData.certifications,
      avatar_url,
    });
    if (!error) {
      setProfile(prev => ({ ...prev, avatar_url }));
      setAvatarFile(null);
      setSuccessMessage("Profile saved successfully!");
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    setIsSaving(false);
  };

  // ── Calendar sync ────────────────────────────────────────────────────────────
  const handleSync = async () => {
    const studiosWithLinks = savedStudios.filter(s => s.calendar_url);
    if (studiosWithLinks.length === 0) return alert("Please add at least one iCal link to a saved studio in your settings!");

    setIsSyncing(true);
    let totalCount = 0;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      for (const studio of studiosWithLinks) {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({
            calendarUrl: studio.calendar_url,
            instructorId: user.id,
            studioName: studio.name,
            defaultBookingUrl: studio.default_booking_url || '',
            defaultClassType: studio.default_class_type || '',
            defaultBookingType: studio.booking_type || 'direct',
            defaultBookingNote: studio.booking_note || '',
          }),
        });
        const result = await res.json();
        if (result.count) totalCount += result.count;
      }

      setSuccessMessage(`Sync complete! Pulled ${totalCount} upcoming classes.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchMyClasses(user.id);
    } catch (err) {
      alert("Error syncing: " + err.message);
    }
    setIsSyncing(false);
  };

  const tz = settingsData.timezone || 'America/Vancouver';
  const pendingDrafts = myClasses.filter(c => c.status === 'draft' && new Date(c.date_time) >= new Date());

  if (isChecking) return <div className="min-h-screen bg-linen"></div>;

  return (
    <div className="min-h-screen bg-linen text-bark py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {successMessage && (
          <div className="mb-6 p-4 bg-[#EAF5ED] text-[#1D5E34] border border-[#BCE1C7] rounded-xl text-sm font-medium shadow-sm">
            {successMessage}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-5 sm:gap-8 mb-8 border-b border-sand">
          {[
            ['schedule', 'Schedule', 'Live Schedule'],
            ['add', 'Add & Drafts', 'Add & Drafts'],
            ['settings', 'Settings', 'Instructor Settings'],
          ].map(([tab, mobileLabel, desktopLabel]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold transition-colors shrink-0 ${activeTab === tab ? 'border-b-2 border-clay text-clay' : 'text-stone hover:text-bark'}`}>
              <span className="sm:hidden">{mobileLabel}</span>
              <span className="hidden sm:inline">{desktopLabel}</span>
              {tab === 'add' && pendingDrafts.length > 0 && (
                <span className="ml-2 bg-clay text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingDrafts.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══ LIVE SCHEDULE TAB ══ */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">

          {/* Follower count metric */}
          {followerCount !== null && (
            <div className="flex items-center gap-4 bg-white rounded-xl border border-sand p-5 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-clay-light flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-clay" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-bark leading-none">{followerCount}</p>
                <p className="text-xs text-stone uppercase tracking-wider mt-0.5">Confirmed follower{followerCount !== 1 ? 's' : ''}</p>
              </div>
              {profile?.handle && (
                <a
                  href={`/${profile.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs font-semibold text-clay hover:underline"
                >
                  View your page →
                </a>
              )}
            </div>
          )}

          {/* Click-through metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-sand p-5 shadow-sm">
              <p className="text-2xl font-bold text-bark leading-none">{clickStats.total}</p>
              <p className="text-xs text-stone uppercase tracking-wider mt-1.5">Total Book Spot clicks</p>
            </div>
            <div className="bg-white rounded-xl border border-sand p-5 shadow-sm">
              <p className="text-2xl font-bold text-bark leading-none">{clickStats.weekTotal}</p>
              <p className="text-xs text-stone uppercase tracking-wider mt-1.5">Clicks this week</p>
            </div>
            <div className="bg-white rounded-xl border border-sand p-5 shadow-sm col-span-2 sm:col-span-1">
              <p className="text-2xl font-bold text-bark leading-none truncate">
                {clickStats.topClassId
                  ? (myClasses.find(c => c.id === clickStats.topClassId)?.class_name || '—')
                  : '—'}
              </p>
              <p className="text-xs text-stone uppercase tracking-wider mt-1.5">
                Top class{clickStats.topCount > 0 ? ` · ${clickStats.topCount} click${clickStats.topCount !== 1 ? 's' : ''}` : ''}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-sand p-6">
            <h2 className="text-xl font-bold mb-4">Your Published Classes</h2>

            {myClasses.filter(c => c.status === 'published' && new Date(c.date_time) >= new Date()).length === 0 ? (
              <p className="text-stone text-center p-8 bg-white rounded-xl border border-sand">No live classes currently published.</p>
            ) : (
              <div className="space-y-4">
                {myClasses.filter(c => c.status === 'published' && new Date(c.date_time) >= new Date()).map((c) => (
                  <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-xl border border-sand shadow-sm transition-all hover:shadow-md">
                    <div className="mb-4 sm:mb-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-bold text-lg text-bark">{c.class_name}</h4>
                        <span className="text-xs font-medium bg-clay-light px-2 py-0.5 rounded border border-sand">{c.class_type}</span>
                        {clickStats.perClass[c.id] > 0 && (
                          <span className="text-xs font-medium bg-sage-light text-sage px-2 py-0.5 rounded border border-sage/30">
                            {clickStats.perClass[c.id]} click{clickStats.perClass[c.id] !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone">
                        {new Date(c.date_time).toLocaleDateString('en-US', { timeZone: tz })} • {new Date(c.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: tz })} @ {c.studio_name}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 w-full sm:w-auto border-t sm:border-t-0 border-sand pt-3 sm:pt-0">
                      <div onClick={() => handleToggleWaitlist(c.id, c.is_waitlisted)} className="flex items-center space-x-2 cursor-pointer group">
                        <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${c.is_waitlisted ? 'bg-clay' : 'bg-sand'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${c.is_waitlisted ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="text-sm font-medium text-stone group-hover:text-bark transition-colors">Waitlisted</span>
                      </div>

                      <span className="text-sand hidden sm:inline">|</span>

                      <button onClick={() => handleDeleteClass(c.id)}
                        className="text-sm font-medium text-red-600 bg-white border border-sand hover:bg-red-50 px-4 py-2 rounded-lg transition-colors active:scale-95">
                        Delete
                      </button>

                      <button onClick={() => {
                        setEditingDraftId(c.id);
                        const d = new Date(c.date_time);
                        const tzOffset = d.getTimezoneOffset() * 60000;
                        const localISOTime = (new Date(d - tzOffset)).toISOString().slice(0, 16);
                        setClassData({
                          classType: c.class_type,
                          className: c.class_name,
                          dateTime: localISOTime,
                          bookingUrl: c.booking_url || '',
                          bookingType: c.booking_type || 'direct',
                          bookingNote: c.booking_note || '',
                          studioName: c.studio_name || '',
                          locationUrl: c.location_url || '',
                        });
                        setActiveTab('add');
                      }}
                        className="text-sm font-medium text-bark bg-white border border-sand hover:bg-linen px-4 py-2 rounded-lg transition-colors active:scale-95">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        )}

        {/* ══ ADD & DRAFTS TAB ══ */}
        {activeTab === 'add' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Sync Drafts panel — first on mobile so Pull + Publish All are immediately visible */}
            <div className="order-1 lg:order-2 bg-clay-light rounded-xl shadow-sm border border-sand p-6 h-fit">
              <h2 className="text-xl font-bold mb-2">Sync Drafts</h2>
              <p className="text-sm text-stone mb-4">Pull the latest classes directly from your linked calendars.</p>

              <button onClick={handleSync} disabled={isSyncing}
                className="w-full bg-white border border-sand text-bark font-bold py-3 rounded-lg mb-3 shadow-sm hover:bg-linen transition-colors disabled:opacity-50">
                {isSyncing ? "Syncing Calendar..." : "↓ Pull Latest Schedule"}
              </button>

              {pendingDrafts.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 mb-6">
                  <button onClick={handlePublishAll} disabled={isPublishingAll || isPublishingSelected}
                    className="flex-1 bg-clay text-white font-bold py-3 rounded-lg shadow-sm hover:bg-clay-dark transition-colors disabled:opacity-50">
                    {isPublishingAll ? "Publishing..." : `✓ Publish All ${pendingDrafts.length} Drafts`}
                  </button>
                  {selectedDraftIds.length > 0 && (
                    <button onClick={handlePublishSelected} disabled={isPublishingAll || isPublishingSelected}
                      className="flex-1 bg-bark text-white font-bold py-3 rounded-lg shadow-sm hover:bg-espresso transition-colors disabled:opacity-50">
                      {isPublishingSelected ? "Publishing..." : `Publish Selected (${selectedDraftIds.length})`}
                    </button>
                  )}
                </div>
              )}

              {!pendingDrafts.length && <div className="mb-6" />}

              {pendingDrafts.length === 0 ? (
                <div className="bg-white/50 border border-sand border-dashed rounded-lg p-8 text-center text-stone text-sm font-medium">
                  No pending drafts. You're all caught up!
                </div>
              ) : (
                (() => {
                  const { thisWeek, nextWeek, later } = groupByWeek(pendingDrafts, tz);
                  return (
                    <div className="max-h-[600px] overflow-y-auto pr-2 space-y-5">
                      {thisWeek.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-stone uppercase tracking-wider">This Week</h3>
                          {thisWeek.map((c) => (
                            <DraftRow key={c.id} c={c} tz={tz} isSelected={selectedDraftIds.includes(c.id)}
                              onToggle={() => toggleDraftSelection(c.id)}
                              onDelete={() => handleDeleteClass(c.id)} onEdit={() => handleEditDraft(c)} />
                          ))}
                        </div>
                      )}

                      {nextWeek.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-stone uppercase tracking-wider">Next Week</h3>
                          {nextWeek.map((c) => (
                            <DraftRow key={c.id} c={c} tz={tz} isSelected={selectedDraftIds.includes(c.id)}
                              onToggle={() => toggleDraftSelection(c.id)}
                              onDelete={() => handleDeleteClass(c.id)} onEdit={() => handleEditDraft(c)} />
                          ))}
                        </div>
                      )}

                      {later.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-stone uppercase tracking-wider">Later</h3>
                          {showLaterDrafts ? (
                            later.map((c) => (
                              <DraftRow key={c.id} c={c} tz={tz} isSelected={selectedDraftIds.includes(c.id)}
                                onToggle={() => toggleDraftSelection(c.id)}
                                onDelete={() => handleDeleteClass(c.id)} onEdit={() => handleEditDraft(c)} />
                            ))
                          ) : (
                            <button
                              onClick={() => setShowLaterDrafts(true)}
                              className="w-full bg-white border border-sand text-stone font-semibold text-sm py-3 rounded-lg hover:bg-linen hover:text-bark transition-colors"
                            >
                              Show {later.length} more draft{later.length !== 1 ? 's' : ''}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Publish form — second on mobile, first column on desktop */}
            <div ref={formRef} className={`order-2 lg:order-1 bg-white rounded-xl shadow-sm border p-6 transition-all ${editingDraftId ? 'border-yellow-400 ring-4 ring-yellow-50' : 'border-sand'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingDraftId ? "📝 Finish Publishing Draft" : "Publish a New Class"}
                </h2>
                {editingDraftId && (
                  <button type="button" onClick={cancelEdit} className="text-sm font-medium text-red-500 hover:underline">Cancel</button>
                )}
              </div>

              <form onSubmit={handleClassSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Specific Class Name</label>
                  <input type="text" value={classData.className}
                    onChange={e => {
                      const className = e.target.value;
                      const inferred = inferClassType(className);
                      if (categoryAutoSet && inferred) {
                        setClassData({ ...classData, className, classType: inferred });
                      } else {
                        setClassData({ ...classData, className });
                      }
                    }}
                    required className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category & Studio</label>
                  <div className="grid grid-cols-2 gap-4">
                    <select value={classData.classType}
                      onChange={e => {
                        setCategoryAutoSet(false);
                        setClassData({ ...classData, classType: e.target.value });
                      }}
                      required className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen">
                      <option value="" disabled>Select Category...</option>
                      {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <select value={classData.studioName}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setClassData({ ...classData, studioName: 'custom', locationUrl: '' });
                          return;
                        }
                        const s = savedStudios.find(s => s.name === e.target.value);
                        setClassData({
                          ...classData,
                          studioName: s?.name || '',
                          locationUrl: s?.location_url || '',
                          bookingType: s?.booking_type || 'direct',
                          bookingNote: s?.booking_note || '',
                        });
                      }}
                      className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen appearance-none">
                      <option value="" disabled>Select a Studio...</option>
                      {savedStudios.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      <option value="custom">+ Add One Time Location</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date & Time</label>
                  <input type="datetime-local" value={classData.dateTime}
                    onChange={e => setClassData({ ...classData, dateTime: e.target.value })}
                    required className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen" />
                </div>

                {!editingDraftId && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Repeat</label>
                      <select value={classData.repeatFrequency}
                        onChange={e => setClassData({ ...classData, repeatFrequency: e.target.value })}
                        className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen">
                        <option value="none">Does not repeat</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Every 2 weeks</option>
                      </select>
                    </div>
                    {classData.repeatFrequency !== 'none' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Ends</label>
                        <select value={classData.repeatDuration}
                          onChange={e => setClassData({ ...classData, repeatDuration: e.target.value })}
                          className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen">
                          <option value="2weeks">Next 2 weeks</option>
                          <option value="4weeks">Next 4 weeks</option>
                          <option value="8weeks">Next 8 weeks</option>
                          <option value="custom">Custom end date</option>
                        </select>
                      </div>
                    )}
                    {classData.repeatFrequency !== 'none' && classData.repeatDuration === 'custom' && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Repeat Until</label>
                        <input type="date" value={classData.repeatEndDate}
                          onChange={e => setClassData({ ...classData, repeatEndDate: e.target.value })}
                          required className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen" />
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Checkout Link</label>
                  <input type="url" placeholder="https://..." value={classData.bookingUrl}
                    onChange={e => setClassData({ ...classData, bookingUrl: e.target.value })}
                    required className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen" />
                </div>

                {/* Booking context — collapsible override */}
                <div className="border border-sand rounded-lg p-4 bg-linen/50 space-y-3">
                  <p className="text-xs font-bold text-stone uppercase tracking-wider">Booking Context (shown to students)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone mb-1">Booking Type</label>
                      <select value={classData.bookingType}
                        onChange={e => setClassData({ ...classData, bookingType: e.target.value })}
                        className="w-full border border-sand rounded-lg px-3 py-2 outline-none focus:border-clay bg-white text-sm">
                        {BOOKING_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone mb-1">Booking Note <span className="font-normal">(optional)</span></label>
                      <input type="text" placeholder="e.g. Book via the Altea app"
                        value={classData.bookingNote}
                        onChange={e => setClassData({ ...classData, bookingNote: e.target.value })}
                        className="w-full border border-sand rounded-lg px-3 py-2 outline-none focus:border-clay bg-white text-sm" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={isSaving}
                  className="w-full bg-clay text-white font-medium py-3 rounded-lg mt-2 transition-colors hover:bg-clay-dark disabled:opacity-50">
                  {isSaving ? "Saving..." : (editingDraftId ? "Publish Draft Live" : (classData.repeatFrequency !== 'none' ? "Create Draft Series" : "Publish Class"))}
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ══ SETTINGS TAB ══ */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-sand p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Instructor Profile</h2>
            <form onSubmit={handleSettingsSubmit} className="space-y-6">

              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium mb-3">Profile Photo</label>
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-clay-light border border-sand overflow-hidden flex items-center justify-center shrink-0">
                    {avatarPreview
                      ? <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                      : <span className="text-2xl font-bold text-stone">{profile?.full_name?.charAt(0) || 'I'}</span>
                    }
                  </div>
                  <div>
                    <label htmlFor="avatar-upload" className="cursor-pointer inline-block bg-linen border border-sand text-sm font-medium px-4 py-2 rounded-lg hover:bg-clay-light transition-colors">
                      {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    <input id="avatar-upload" type="file" accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange} className="hidden" />
                    <p className="text-xs text-stone mt-1.5">JPG, PNG or WebP · Max 5 MB</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-1">Public Bio</label>
                <textarea rows="4" value={settingsData.bio}
                  onChange={e => setSettingsData({ ...settingsData, bio: e.target.value })}
                  placeholder="Tell students about your teaching style..."
                  className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen/50" />
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium mb-1">Certifications</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {settingsData.certifications.map(cert => (
                    <span key={cert} className="flex items-center gap-1.5 bg-clay-light text-bark text-sm px-3 py-1 rounded-full border border-sand">
                      {cert}
                      <button type="button" onClick={() => handleRemoveCert(cert)} className="text-stone hover:text-bark leading-none">×</button>
                    </span>
                  ))}
                </div>
                <input type="text" value={certInput}
                  onChange={e => setCertInput(e.target.value)}
                  onKeyDown={handleAddCert}
                  placeholder="Type a certification and press Enter (e.g. STOTT Pilates)"
                  className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen text-sm" />
                <p className="text-xs text-stone mt-1">Press Enter or comma to add each certification.</p>
              </div>

              {/* Years of experience + Instagram */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Years of Experience</label>
                  <input type="number" min="0" max="60" value={settingsData.years_experience}
                    onChange={e => setSettingsData({ ...settingsData, years_experience: e.target.value })}
                    placeholder="e.g. 8" className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Instagram Handle</label>
                  <div className="flex items-center border border-sand rounded-lg bg-linen overflow-hidden focus-within:border-clay">
                    <span className="pl-3 text-stone text-sm select-none">@</span>
                    <input type="text" value={settingsData.instagram_handle}
                      onChange={e => setSettingsData({ ...settingsData, instagram_handle: e.target.value.replace(/^@/, '') })}
                      placeholder="yourhandle" className="flex-1 px-2 py-2 outline-none bg-transparent text-sm" />
                  </div>
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium mb-1">Your Timezone</label>
                <select value={settingsData.timezone}
                  onChange={e => setSettingsData({ ...settingsData, timezone: e.target.value })}
                  className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen">
                  {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                </select>
                <p className="text-xs text-stone mt-1">All your class times will display in this timezone.</p>
              </div>

              <button type="submit" disabled={isSaving || isUploadingAvatar}
                className="w-full bg-clay text-white font-medium py-3 rounded-lg mt-4 hover:bg-clay-dark disabled:opacity-50">
                {isUploadingAvatar ? "Uploading photo..." : isSaving ? "Saving..." : "Save Profile"}
              </button>
            </form>

            {/* ── Studios & Calendars ── */}
            <div className="mt-10 pt-8 border-t border-sand">
              <h2 className="text-xl font-bold mb-6">My Saved Studios & Calendars</h2>
              <div className="mb-8 space-y-4">
                {savedStudios.length === 0 ? (
                  <p className="text-sm text-stone">You haven't saved any studios yet.</p>
                ) : (
                  savedStudios.map(studio => (
                    <div key={studio.id} className="p-5 bg-linen border border-sand rounded-lg shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">{studio.name}</span>
                        <button onClick={() => handleDeleteStudio(studio.id)}
                          className="text-stone hover:text-red-500 transition-all px-2 py-1 text-xs font-bold uppercase tracking-wider">
                          ✕ Remove
                        </button>
                      </div>

                      {/* Platform */}
                      <div>
                        <label className="block text-xs font-bold text-stone mb-1.5 uppercase tracking-wider">Booking Platform</label>
                        <select defaultValue={studio.platform || ''}
                          onChange={e => handleUpdateStudio(studio.id, { platform: e.target.value })}
                          className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-white text-sm">
                          {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </div>

                      {/* Booking type */}
                      <div>
                        <label className="block text-xs font-bold text-stone mb-1.5 uppercase tracking-wider">Default Booking Type</label>
                        <select defaultValue={studio.booking_type || 'direct'}
                          onChange={e => handleUpdateStudio(studio.id, { booking_type: e.target.value })}
                          className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-white text-sm">
                          {BOOKING_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                        </select>
                        <p className="text-[11px] text-stone mt-1.5">Shown to students so they know what to expect before clicking Book Spot.</p>
                      </div>

                      {/* Booking note */}
                      <div>
                        <label className="block text-xs font-bold text-stone mb-1.5 uppercase tracking-wider">Booking Note <span className="font-normal normal-case">(optional)</span></label>
                        <input type="text" placeholder="e.g. Book via the Altea app, First class free"
                          defaultValue={studio.booking_note || ''}
                          onBlur={e => {
                            if (e.target.value !== (studio.booking_note || '')) {
                              handleUpdateStudio(studio.id, { booking_note: e.target.value });
                            }
                          }}
                          className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-white text-sm" />
                        <p className="text-[11px] text-stone mt-1.5">Short note shown on each class card. Auto-saves on blur.</p>
                      </div>

                      {/* Default class type */}
                      <div>
                        <label className="block text-xs font-bold text-stone mb-1.5 uppercase tracking-wider">Default Class Type</label>
                        <select defaultValue={studio.default_class_type || ''}
                          onChange={e => handleUpdateStudio(studio.id, { default_class_type: e.target.value })}
                          className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-white text-sm">
                          <option value="">No default — tag each class manually</option>
                          {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <p className="text-[11px] text-stone mt-1.5">Synced classes from this studio will be auto-tagged with this type.</p>
                      </div>

                      {/* Default booking URL */}
                      <div>
                        <label className="block text-xs font-bold text-stone mb-1.5 uppercase tracking-wider">Default Booking URL</label>
                        <input type="url" placeholder="https://studiobooking.com/schedule"
                          defaultValue={studio.default_booking_url || ''}
                          onBlur={e => {
                            if (e.target.value !== (studio.default_booking_url || '')) {
                              handleUpdateStudio(studio.id, { default_booking_url: e.target.value });
                            }
                          }}
                          className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-white text-sm" />
                        <p className="text-[11px] text-stone mt-1.5">Used for studios like Mindbody where all classes share one booking page. Auto-saves on blur.</p>
                      </div>

                      {/* iCal link */}
                      <div>
                        <label className="block text-xs font-bold text-stone mb-1.5 uppercase tracking-wider">Studio iCal Link</label>
                        <input type="url" placeholder="Paste specific studio .ics link here..."
                          defaultValue={studio.calendar_url || ''}
                          onBlur={e => {
                            if (e.target.value !== (studio.calendar_url || '')) {
                              handleUpdateStudio(studio.id, { calendar_url: e.target.value });
                            }
                          }}
                          className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-white text-sm" />
                        <p className="text-[11px] text-stone mt-1.5">Auto-saves on blur.</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add new studio */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Add a New Studio</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Autocomplete
                      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                      options={{ types: ["establishment"], fields: ["name", "url"] }}
                      libraries={["places"]}
                      ref={settingsStudioRef}
                      onKeyUp={() => { setNewStudioName(''); setNewStudioUrl(''); }}
                      onPlaceSelected={(place) => {
                        if (place && place.name) {
                          setNewStudioName(place.name);
                          setNewStudioUrl(place.url || '');
                          if (settingsStudioRef.current) settingsStudioRef.current.value = place.name;
                        }
                      }}
                      className="w-full border border-sand rounded-lg px-4 py-3 outline-none focus:border-clay bg-white text-sm shadow-sm"
                      placeholder="Search on Google Maps..."
                    />
                  </div>
                  <button type="button" onClick={handleAddSavedStudio} disabled={isSaving}
                    className="w-full sm:w-auto px-6 py-3 bg-clay text-white rounded-lg font-medium hover:bg-clay-dark disabled:opacity-50 transition-colors text-sm whitespace-nowrap shadow-sm">
                    {isSaving ? 'Saving...' : 'Save Studio'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function DraftRow({ c, tz, isSelected, onToggle, onDelete, onEdit }) {
  return (
    <div className={`bg-white p-4 rounded-lg border text-sm flex justify-between items-center shadow-sm transition-colors ${isSelected ? 'border-clay ring-2 ring-clay/20' : 'border-sand'}`}>
      <div className="flex items-center gap-3 pr-4 min-w-0">
        <input type="checkbox" checked={isSelected} onChange={onToggle}
          className="w-4 h-4 shrink-0 accent-clay cursor-pointer" />
        <div className="min-w-0">
          <p className="font-bold truncate">{c.class_name}</p>
          <p className="text-stone text-xs mt-0.5">
            {new Date(c.date_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz })}
            {' '}@ {c.studio_name || 'Pending Studio'}
          </p>
          {c.booking_type && c.booking_type !== 'direct' && (
            <span className="inline-block mt-1 text-[10px] font-medium bg-sand text-stone px-2 py-0.5 rounded-full">
              {BOOKING_TYPES.find(bt => bt.value === c.booking_type)?.label}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={onDelete}
          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 rounded-md transition-colors">
          Delete
        </button>
        <button onClick={onEdit}
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-bold px-4 py-2 rounded-md transition-colors">
          Edit
        </button>
      </div>
    </div>
  );
}

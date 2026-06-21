"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Autocomplete from 'react-google-autocomplete';
import OnboardingFlow from '@/components/OnboardingFlow';
import { startProductTour } from '@/components/ProductTour';
import CategorySelect from '@/components/CategorySelect';
import { inferCategoryId, categoryLabel } from '@/lib/categories';

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// Returns { year, month, day, weekday } for a date as observed in the given timezone
function getTZDateParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  }).formatToParts(date);
  const obj = {};
  parts.forEach(p => { if (p.type !== 'literal') obj[p.type] = p.value; });
  return obj;
}

// Groups items with a date_time into "this week" (through Saturday), "next week" (Sun-Sat), and "later",
// based on calendar days in the given timezone.
function groupByWeek(items, timeZone) {
  const todayParts = getTZDateParts(new Date(), timeZone);
  const todayUTC = Date.UTC(+todayParts.year, +todayParts.month - 1, +todayParts.day);
  const todayDow = WEEKDAY_INDEX[todayParts.weekday] ?? 0;
  const thisWeekEnd = 6 - todayDow; // days from today through Saturday
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

  const [categories, setCategories] = useState([]);

  const [classData, setClassData] = useState({
    categoryId: '',
    categoryOther: '',
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

  const [studioSearchKey, setStudioSearchKey] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishingAll, setIsPublishingAll] = useState(false);
  const [isPublishingSelected, setIsPublishingSelected] = useState(false);
  const [isPublishingThisWeek, setIsPublishingThisWeek] = useState(false);
  const [isPublishingNextWeek, setIsPublishingNextWeek] = useState(false);
  const [savedFields, setSavedFields] = useState({});
  const [selectedDraftIds, setSelectedDraftIds] = useState([]);
  const [showLaterDrafts, setShowLaterDrafts] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [myClasses, setMyClasses] = useState([]);
  const [followerCount, setFollowerCount] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const tourStartedRef = useRef(false);
  const [clickStats, setClickStats] = useState({ total: 0, weekTotal: 0, perClass: {}, topClassId: null, topCount: 0 });

  const fetchMyClasses = async (userId) => {
    const { data } = await supabase
      .from('classes')
      .select('*')
      .eq('instructor_id', userId)
      .order('date_time', { ascending: true });
    if (data) setMyClasses(data);
  };


  const fetchSavedStudios = async (userId) => {
    const { data } = await supabase
      .from('studios')
      .select('*')
      .eq('instructor_id', userId);
    if (data) setSavedStudios(data);
  };

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const uid = session.user.id;
      setUser(session.user);

      try {
        const [
          { data: profileData },
          { data: studiosData },
          { data: classesData },
          { data: categoriesData },
          { count: followerCount },
          { data: clickData },
        ] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', uid).single(),
          supabase.from('studios').select('*').eq('instructor_id', uid),
          supabase.from('classes').select('*').eq('instructor_id', uid).order('date_time', { ascending: true }),
          supabase.from('class_categories').select('*').eq('active', true).order('sort_order', { ascending: true }),
          supabase.from('followers').select('*', { count: 'exact', head: true }).eq('instructor_id', uid).eq('confirmed', true),
          supabase.from('analytics_events').select('class_id, created_at').eq('instructor_id', uid).eq('event_type', 'book_spot_click'),
        ]);

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
          if (!profileData.onboarding_completed) setShowOnboarding(true);
        }

        if (studiosData) setSavedStudios(studiosData);
        if (classesData) setMyClasses(classesData);
        if (categoriesData) setCategories(categoriesData);
        setFollowerCount(followerCount ?? 0);

        if (clickData) {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const perClass = {};
          let weekTotal = 0;
          clickData.forEach(ev => {
            perClass[ev.class_id] = (perClass[ev.class_id] || 0) + 1;
            if (new Date(ev.created_at) >= weekAgo) weekTotal++;
          });
          let topClassId = null, topCount = 0;
          Object.entries(perClass).forEach(([id, count]) => {
            if (count > topCount) { topCount = count; topClassId = id; }
          });
          setClickStats({ total: clickData.length, weekTotal, perClass, topClassId, topCount });
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setIsChecking(false);
      }
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

    const resolvedCategoryId = draft.category_id
      || inferCategoryId(draft.class_name, categories, matchedStudio.default_category_id);

    setClassData({
      categoryId: resolvedCategoryId || (draft.category_other ? 'other' : ''),
      categoryOther: draft.category_other || '',
      className: draft.class_name,
      dateTime: localISOTime,
      bookingUrl: draft.booking_url || '',
      bookingType: draft.booking_type || 'direct',
      bookingNote: draft.booking_note || '',
      studioName: matchedStudio.name,
      locationUrl: matchedStudio.location_url || '',
    });
    setCategoryAutoSet(!draft.category_id && !draft.category_other);

    setEditingDraftId(draft.id);
  };

  const cancelEdit = () => {
    setEditingDraftId(null);
    setCategoryAutoSet(true);
    setClassData({
      categoryId: '', categoryOther: '', className: '', dateTime: '',
      bookingUrl: '', bookingType: 'direct', bookingNote: '',
      studioName: '', locationUrl: '',
      repeatFrequency: 'none', repeatDuration: '2weeks', repeatEndDate: '',
    });
  };

  // ── Studio CRUD ──────────────────────────────────────────────────────────────
  const markFieldSaved = (fieldKey) => {
    setSavedFields(prev => ({ ...prev, [fieldKey]: (prev[fieldKey] || 0) + 1 }));
  };

  const handleUpdateStudio = async (studioId, updates, fieldKey = null) => {
    const { error } = await supabase.from('studios').update(updates).eq('id', studioId);
    if (!error) {
      setSavedStudios(prev => prev.map(s => s.id === studioId ? { ...s, ...updates } : s));
      if (fieldKey) markFieldSaved(fieldKey);
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
    }]);

    if (!error) {
      setSuccessMessage('Studio successfully added to your profile!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setNewStudioName('');
      setNewStudioUrl('');
      setStudioSearchKey(k => k + 1);
      fetchSavedStudios(user.id);
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
      fetchSavedStudios(user.id);
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
      category_id: classData.categoryId && classData.categoryId !== 'other' ? classData.categoryId : null,
      category_other: classData.categoryId === 'other' ? classData.categoryOther : null,
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

      // Queue classes for batched follower digest (fire and forget)
      if (followerCount > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        fetch('/api/queue-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ classIds: ids }),
        }).catch(err => console.error('Queue notification failed:', err));
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

  const handlePublishThisWeek = async () => {
    const drafts = myClasses.filter(c => c.status === 'draft' && new Date(c.date_time) >= new Date());
    const timezone = settingsData.timezone || 'America/Vancouver';
    const { thisWeek } = groupByWeek(drafts, timezone);
    if (thisWeek.length === 0) return;
    setIsPublishingThisWeek(true);
    await publishClassIds(thisWeek.map(d => d.id));
    setIsPublishingThisWeek(false);
  };

  const handlePublishNextWeek = async () => {
    const drafts = myClasses.filter(c => c.status === 'draft' && new Date(c.date_time) >= new Date());
    const timezone = settingsData.timezone || 'America/Vancouver';
    const { nextWeek } = groupByWeek(drafts, timezone);
    if (nextWeek.length === 0) return;
    setIsPublishingNextWeek(true);
    await publishClassIds(nextWeek.map(d => d.id));
    setIsPublishingNextWeek(false);
  };

  const toggleDraftSelection = (id) => {
    setSelectedDraftIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    setActiveTab('settings');
    if (!profile?.onboarding_completed) {
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id);
      setProfile(prev => ({ ...prev, onboarding_completed: true }));
    }
  };

  const markTourCompleted = async () => {
    if (profile?.tour_completed) return;
    await supabase.from('profiles').update({ tour_completed: true }).eq('id', user.id);
    setProfile(prev => ({ ...prev, tour_completed: true }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://instruktor.ca/${profile?.handle}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStartTour = () => {
    startProductTour({ setActiveTab, onFinish: markTourCompleted });
  };

  // Auto-trigger the product tour on first login after onboarding is complete
  useEffect(() => {
    if (isChecking || showOnboarding || !profile || tourStartedRef.current) return;
    if (profile.onboarding_completed && !profile.tour_completed) {
      tourStartedRef.current = true;
      handleStartTour();
    }
  }, [isChecking, showOnboarding, profile]);

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
      // Bust cache so the new image loads instead of the previously cached file at this same path
      avatar_url = `${publicUrl}?t=${Date.now()}`;
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
            defaultCategoryId: studio.default_category_id || '',
            defaultCategoryOther: studio.default_category_other || '',
            defaultBookingType: studio.booking_type || null,
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
  const { thisWeek: thisWeekDrafts, nextWeek: nextWeekDrafts } = groupByWeek(pendingDrafts, tz);

  if (isChecking) return <div className="min-h-screen bg-linen"></div>;

  return (
    <div className="min-h-screen bg-linen text-bark py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} />}
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
            ['add', 'My Classes', 'My Classes'],
            ['settings', 'Settings', 'Instructor Settings'],
          ].map(([tab, mobileLabel, desktopLabel]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              data-tour={tab === 'settings' ? 'settings-tab' : tab === 'add' ? 'add-drafts-tab' : undefined}
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
          <div data-tour="analytics-cards" className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                  ? (myClasses.find(c => c.id === clickStats.topClassId)?.class_name || 'N/A')
                  : 'N/A'}
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
                        <span className="text-xs font-medium bg-clay-light px-2 py-0.5 rounded border border-sand">{categoryLabel(c, categories) || 'Needs category'}</span>
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
                          categoryId: c.category_id || (c.category_other ? 'other' : ''),
                          categoryOther: c.category_other || '',
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8">

            {/* Sync Classes panel: first on mobile so Pull + Publish All are immediately visible */}
            <div data-tour="publish-all-panel" className="lg:order-3 bg-clay-light rounded-xl shadow-sm border border-sand p-6 h-fit">
              <h2 className="text-xl font-bold mb-2">Sync Classes</h2>
              <p className="text-sm text-stone mb-4">Pull the latest classes directly from your linked calendars.</p>

              <button onClick={handleSync} disabled={isSyncing}
                className="w-full bg-white border border-sand text-bark font-bold py-3 rounded-lg mb-3 shadow-sm hover:bg-linen transition-colors disabled:opacity-50">
                {isSyncing ? "Syncing Calendar..." : "↓ Pull Latest Schedule"}
              </button>

              {pendingDrafts.length > 0 && (
                <div className="flex flex-col gap-2 mb-6">
                  {thisWeekDrafts.length > 0 ? (
                    <button onClick={handlePublishThisWeek}
                      disabled={isPublishingThisWeek || isPublishingNextWeek || isPublishingAll || isPublishingSelected}
                      data-tour="publish-all-btn"
                      className="w-full bg-clay text-white font-bold py-3 rounded-lg shadow-sm hover:bg-clay-dark transition-colors disabled:opacity-50">
                      {isPublishingThisWeek ? "Publishing..." : `✓ Publish This Week's Schedule (${thisWeekDrafts.length})`}
                    </button>
                  ) : (
                    <button disabled className="w-full bg-sand/50 text-stone font-medium py-3 rounded-lg text-sm cursor-not-allowed">
                      Nothing to publish this week
                    </button>
                  )}

                  {nextWeekDrafts.length > 0 ? (
                    <button onClick={handlePublishNextWeek}
                      disabled={isPublishingThisWeek || isPublishingNextWeek || isPublishingAll || isPublishingSelected}
                      className="w-full border border-clay text-clay font-semibold py-2.5 rounded-lg hover:bg-clay-light transition-colors disabled:opacity-50 text-sm">
                      {isPublishingNextWeek ? "Publishing..." : `Publish Next Week's Schedule (${nextWeekDrafts.length})`}
                    </button>
                  ) : (
                    <button disabled className="w-full border border-sand text-stone font-medium py-2.5 rounded-lg text-sm cursor-not-allowed">
                      Nothing to publish next week
                    </button>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    {selectedDraftIds.length > 0 ? (
                      <button onClick={handlePublishSelected}
                        disabled={isPublishingAll || isPublishingThisWeek || isPublishingNextWeek || isPublishingSelected}
                        className="text-xs font-semibold text-bark border border-sand hover:bg-linen px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                        {isPublishingSelected ? "Publishing..." : `Publish Selected (${selectedDraftIds.length})`}
                      </button>
                    ) : <span />}
                    <button onClick={handlePublishAll}
                      disabled={isPublishingAll || isPublishingThisWeek || isPublishingNextWeek || isPublishingSelected}
                      className="text-xs text-stone hover:text-bark underline transition-colors disabled:opacity-50 ml-auto">
                      {isPublishingAll ? "Publishing..." : `Publish all ${pendingDrafts.length} drafts`}
                    </button>
                  </div>
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

            {/* OR divider: the two cards are alternative ways to add classes (horizontal on mobile, vertical on desktop) */}
            <div className="lg:order-2 flex items-center justify-center gap-3 lg:flex-col lg:gap-4">
              <span className="h-px w-12 bg-sand lg:h-12 lg:w-px" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-widest text-stone">or</span>
              <span className="h-px w-12 bg-sand lg:h-12 lg:w-px" aria-hidden="true" />
            </div>

            {/* Publish form: alternative to syncing, first column on desktop */}
            <div data-tour="add-class-form" ref={formRef} className={`lg:order-1 bg-white rounded-xl shadow-sm border p-6 transition-all ${editingDraftId ? 'border-yellow-400 ring-4 ring-yellow-50' : 'border-sand'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingDraftId ? "📝 Finish Publishing Draft" : "Add a New Class"}
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
                      const inferred = inferCategoryId(className, categories, null);
                      if (categoryAutoSet && inferred) {
                        setClassData({ ...classData, className, categoryId: inferred, categoryOther: '' });
                      } else {
                        setClassData({ ...classData, className });
                      }
                    }}
                    required className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category & Studio</label>
                  <div className="grid grid-cols-2 gap-4">
                    <CategorySelect
                      categories={categories}
                      value={classData.categoryId}
                      otherValue={classData.categoryOther}
                      onChange={val => {
                        setCategoryAutoSet(false);
                        setClassData({ ...classData, categoryId: val, categoryOther: val === 'other' ? classData.categoryOther : '' });
                      }}
                      onOtherChange={val => setClassData({ ...classData, categoryOther: val })}
                      placeholder={{ value: '', label: 'Select Category...', disabled: true }}
                      required
                      className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen"
                    />

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

                {/* Booking context: collapsible override */}
                <div className="border border-sand rounded-lg p-4 bg-linen/50 space-y-3">
                  <p className="text-xs font-bold text-stone uppercase tracking-wider">Booking Note (optional)</p>
                  <div>
                    <label className="block text-xs font-medium text-stone mb-1">Booking Note <span className="font-normal">(optional)</span></label>
                    <input type="text" placeholder="e.g. Membership required · Book via the MyAltea App · First class free"
                      value={classData.bookingNote}
                      onChange={e => setClassData({ ...classData, bookingNote: e.target.value })}
                      className="w-full border border-sand rounded-lg px-3 py-2 outline-none focus:border-clay bg-white text-sm" />
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

              {/* Your Page */}
              <div data-tour="your-page-link">
                <label className="block text-sm font-medium mb-1">Your Page</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 border border-sand rounded-lg px-4 py-2 bg-linen text-bark text-sm font-medium select-all overflow-hidden text-ellipsis whitespace-nowrap">
                    instruktor.ca/{profile?.handle}
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="p-2.5 border border-sand rounded-lg bg-linen hover:bg-clay-light transition-colors"
                      aria-label="Copy link"
                    >
                      <svg className="w-4 h-4 text-stone" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    </button>
                    {copiedLink && (
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-bark text-linen text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none">
                        Copied!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile fields: the area highlighted by step 1 of the product tour */}
              <div data-tour="your-profile" className="space-y-6">

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
              </div>
            </form>

            {/* ── Studios & Calendars ── */}
            <div data-tour="saved-studios" className="mt-10 pt-8 border-t border-sand">
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

                      {/* Booking note */}
                      <div>
                        <label className="block text-xs font-bold text-stone mb-1.5 uppercase tracking-wider">Booking Note <span className="font-normal normal-case">(optional)</span></label>
                        <input type="text" placeholder="e.g. Membership required · Book via the MyAltea App · First class free"
                          defaultValue={studio.booking_note || ''}
                          onBlur={e => {
                            if (e.target.value !== (studio.booking_note || '')) {
                              handleUpdateStudio(studio.id, { booking_note: e.target.value }, `${studio.id}_booking_note`);
                            }
                          }}
                          className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-white text-sm" />
                        <div className="flex items-center gap-2 mt-1.5">
                          <p className="text-[11px] text-stone">Short note shown on each class card.</p>
                          {savedFields[`${studio.id}_booking_note`] && (
                            <span key={savedFields[`${studio.id}_booking_note`]} className="text-[11px] text-sage font-semibold" style={{animation:'checkFade 1.5s ease-out forwards'}} onAnimationEnd={() => setSavedFields(prev => { const next = {...prev}; delete next[`${studio.id}_booking_note`]; return next; })}>✓ Saved</span>
                          )}
                        </div>
                      </div>

                      {/* Default class type */}
                      <div>
                        <label className="block text-xs font-bold text-stone mb-1.5 uppercase tracking-wider">Default Class Type</label>
                        <CategorySelect
                          categories={categories}
                          value={studio.default_category_id || (studio.default_category_other ? 'other' : '')}
                          otherValue={studio.default_category_other || ''}
                          onChange={val => handleUpdateStudio(studio.id, {
                            default_category_id: val && val !== 'other' ? val : null,
                            default_category_other: val === 'other' ? (studio.default_category_other || '') : null,
                          })}
                          onOtherChange={val => handleUpdateStudio(studio.id, { default_category_other: val })}
                          placeholder={{ value: '', label: 'No default. Tag each class manually.', disabled: false }}
                          className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-white text-sm"
                        />
                        <p className="text-[11px] text-stone mt-1.5">Synced classes from this studio will be auto-tagged with this type.</p>
                      </div>

                      {/* Default booking URL */}
                      <div>
                        <label className="block text-xs font-bold text-stone mb-1.5 uppercase tracking-wider">Default Booking Link</label>
                        <input type="url" placeholder="https://studiobooking.com/schedule"
                          defaultValue={studio.default_booking_url || ''}
                          onBlur={e => {
                            if (e.target.value !== (studio.default_booking_url || '')) {
                              handleUpdateStudio(studio.id, { default_booking_url: e.target.value }, `${studio.id}_default_booking_url`);
                            }
                          }}
                          className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-white text-sm" />
                        <div className="flex items-center gap-2 mt-1.5">
                          <p className="text-[11px] text-stone">Used for studios like Mindbody where all classes share one booking page.</p>
                          {savedFields[`${studio.id}_default_booking_url`] && (
                            <span key={savedFields[`${studio.id}_default_booking_url`]} className="text-[11px] text-sage font-semibold" style={{animation:'checkFade 1.5s ease-out forwards'}} onAnimationEnd={() => setSavedFields(prev => { const next = {...prev}; delete next[`${studio.id}_default_booking_url`]; return next; })}>✓ Saved</span>
                          )}
                        </div>
                      </div>

                      {/* iCal link */}
                      <div>
                        <label className="block text-xs font-bold text-stone mb-1.5 uppercase tracking-wider">Studio iCal Link</label>
                        <input type="url" placeholder="Paste specific studio .ics link here..."
                          defaultValue={studio.calendar_url || ''}
                          onBlur={e => {
                            if (e.target.value !== (studio.calendar_url || '')) {
                              handleUpdateStudio(studio.id, { calendar_url: e.target.value }, `${studio.id}_calendar_url`);
                            }
                          }}
                          className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-white text-sm" />
                        {savedFields[`${studio.id}_calendar_url`] && (
                          <span key={savedFields[`${studio.id}_calendar_url`]} className="block text-[11px] text-sage font-semibold mt-1.5" style={{animation:'checkFade 1.5s ease-out forwards'}} onAnimationEnd={() => setSavedFields(prev => { const next = {...prev}; delete next[`${studio.id}_calendar_url`]; return next; })}>✓ Saved</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add new studio */}
              <div data-tour="add-studio">
                <h3 className="text-sm font-semibold mb-3">Add a New Studio</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Autocomplete
                      key={studioSearchKey}
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

            {/* ── Walkthrough ── */}
            <div className="mt-10 pt-8 border-t border-sand flex flex-col items-start gap-2">
              <button type="button" onClick={() => setShowOnboarding(true)}
                className="text-sm font-semibold text-clay hover:underline">
                Watch walkthrough again
              </button>
              <button type="button" onClick={handleStartTour}
                className="text-sm font-semibold text-clay hover:underline">
                Watch product tour
              </button>
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

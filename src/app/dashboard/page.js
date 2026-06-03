"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Autocomplete from 'react-google-autocomplete';

const CLASS_TYPES = ['Mat Pilates', 'Reformer Pilates', 'Stretch and Mobility', 'Yoga'];

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

  const [editingDraftId, setEditingDraftId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [classData, setClassData] = useState({
    classType: '',
    className: '',
    dateTime: '',
    bookingUrl: '',
    studioName: '',
    locationUrl: ''
  });

  const [settingsData, setSettingsData] = useState({
    bio: '',
    timezone: 'America/Vancouver'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [myClasses, setMyClasses] = useState([]);

  const fetchMyClasses = async (userId) => {
    const { data } = await supabase
      .from('classes')
      .select('*')
      .eq('instructor_id', userId)
      .order('date_time', { ascending: true });
    if (data) setMyClasses(data);
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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setSettingsData({
          bio: profileData.bio || '',
          timezone: profileData.timezone || 'America/Vancouver'
        });
      }
      setIsChecking(false);
    };

    loadDashboard();
  }, [router]);

  const handleToggleWaitlist = async (id, currentStatus) => {
    setMyClasses(prevClasses =>
      prevClasses.map(c =>
        c.id === id ? { ...c, is_waitlisted: !currentStatus } : c
      )
    );
    const { error } = await supabase
      .from('classes')
      .update({ is_waitlisted: !currentStatus })
      .eq('id', id);
    if (error) console.error("Error updating waitlist:", error);
  };

  const handleEditDraft = (draft) => {
    const messyLocation = (draft.studio_name || "").toLowerCase();
    const matchedStudio = savedStudios.find(s =>
      messyLocation.includes(s.name.toLowerCase().split(' ')[0])
    ) || { name: '', location_url: '' };

    const d = new Date(draft.date_time);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d - tzOffset)).toISOString().slice(0, 16);

    setClassData({
      classType: draft.class_type !== 'TBD' ? draft.class_type : '',
      className: draft.class_name,
      dateTime: localISOTime,
      bookingUrl: draft.booking_url || '',
      studioName: matchedStudio.name,
      locationUrl: matchedStudio.location_url || ''
    });

    setEditingDraftId(draft.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingDraftId(null);
    setClassData({
      classType: '', className: '', dateTime: '', bookingUrl: '',
      studioName: '', locationUrl: ''
    });
  };

  const handleUpdateStudio = async (studioId, updates) => {
    const { error } = await supabase
      .from('studios')
      .update(updates)
      .eq('id', studioId);

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

    const { error } = await supabase
      .from('studios')
      .insert([{
        name: finalName,
        location_url: newStudioUrl,
        instructor_id: user.id
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

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class? This cannot be undone.")) return;
    setIsSaving(true);
    const { error } = await supabase.from('classes').delete().eq('id', classId);

    if (!error) {
      setSuccessMessage('Class removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchMyClasses(user.id);
      if (editingDraftId === classId) cancelEdit();
    }
    setIsSaving(false);
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    if (editingDraftId) {
      const { error } = await supabase
        .from('classes')
        .update({
          class_type: classData.classType,
          class_name: classData.className,
          date_time: new Date(classData.dateTime).toISOString(),
          booking_url: classData.bookingUrl,
          studio_name: classData.studioName,
          location_url: classData.locationUrl,
          status: 'published'
        })
        .eq('id', editingDraftId);

      if (!error) {
        setSuccessMessage("Success! Class published to live schedule.");
        setTimeout(() => setSuccessMessage(''), 3000);
        cancelEdit();
        fetchMyClasses(user.id);
      }
    } else {
      const { error } = await supabase
        .from('classes')
        .insert([{
          instructor_id: user.id,
          class_type: classData.classType,
          class_name: classData.className,
          date_time: new Date(classData.dateTime).toISOString(),
          booking_url: classData.bookingUrl,
          studio_name: classData.studioName,
          location_url: classData.locationUrl,
          status: 'published'
        }]);

      if (!error) {
        setSuccessMessage("Success! Class published manually.");
        setTimeout(() => setSuccessMessage(''), 3000);
        cancelEdit();
        fetchMyClasses(user.id);
      }
    }
    setIsSaving(false);
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      bio: settingsData.bio,
      timezone: settingsData.timezone
    });
    if (!error) {
      setSuccessMessage("Profile saved successfully!");
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    setIsSaving(false);
  };

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
            defaultClassType: studio.default_class_type || ''
          })
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

  if (isChecking) return <div className="min-h-screen bg-linen"></div>;

  return (
    <div className="min-h-screen bg-linen text-bark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {successMessage && (
          <div className="mb-6 p-4 bg-[#EAF5ED] text-[#1D5E34] border border-[#BCE1C7] rounded-xl text-sm font-medium shadow-sm transition-all animate-fade-in">
            {successMessage}
          </div>
        )}

        <div className="flex space-x-8 mb-8 border-b border-sand">
          <button onClick={() => setActiveTab('schedule')} className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'schedule' ? 'border-b-2 border-clay text-clay' : 'text-stone hover:text-bark'}`}>Live Schedule</button>
          <button onClick={() => setActiveTab('add')} className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'add' ? 'border-b-2 border-clay text-clay' : 'text-stone hover:text-bark'}`}>Add & Drafts</button>
          <button onClick={() => setActiveTab('settings')} className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'settings' ? 'border-b-2 border-clay text-clay' : 'text-stone hover:text-bark'}`}>Instructor Settings</button>
        </div>

        {activeTab === 'schedule' && (
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
                      </div>
                      <p className="text-sm text-stone">
                        {new Date(c.date_time).toLocaleDateString('en-US', { timeZone: tz })} • {new Date(c.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: tz })} @ {c.studio_name}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 w-full sm:w-auto border-t sm:border-t-0 border-sand pt-3 sm:pt-0">
                      <div
                        onClick={() => handleToggleWaitlist(c.id, c.is_waitlisted)}
                        className="flex items-center space-x-2 cursor-pointer group"
                      >
                        <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${c.is_waitlisted ? 'bg-clay' : 'bg-sand'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${c.is_waitlisted ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="text-sm font-medium text-stone group-hover:text-bark transition-colors">Waitlisted</span>
                      </div>

                      <span className="text-sand hidden sm:inline">|</span>

                      <button
                        onClick={() => handleDeleteClass(c.id)}
                        className="text-sm font-medium text-red-600 bg-white border border-sand hover:bg-red-50 px-4 py-2 rounded-lg transition-colors active:scale-95"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => {
                          setEditingDraftId(c.id);
                          const d = new Date(c.date_time);
                          const tzOffset = d.getTimezoneOffset() * 60000;
                          const localISOTime = (new Date(d - tzOffset)).toISOString().slice(0, 16);
                          setClassData({
                            classType: c.class_type,
                            className: c.class_name,
                            dateTime: localISOTime,
                            bookingUrl: c.booking_url || '',
                            studioName: c.studio_name || '',
                            locationUrl: c.location_url || ''
                          });
                          setActiveTab('add');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-sm font-medium text-bark bg-white border border-sand hover:bg-linen px-4 py-2 rounded-lg transition-colors active:scale-95"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${editingDraftId ? 'border-yellow-400 ring-4 ring-yellow-50' : 'border-sand'}`}>
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
                  <input
                    type="text"
                    value={classData.className}
                    onChange={e => setClassData({ ...classData, className: e.target.value })}
                    required
                    className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category & Studio</label>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={classData.classType}
                      onChange={e => setClassData({ ...classData, classType: e.target.value })}
                      required
                      className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen"
                    >
                      <option value="" disabled>Select Category...</option>
                      {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <select
                      value={classData.studioName}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setClassData({ ...classData, studioName: 'custom', locationUrl: '' });
                          return;
                        }
                        const selectedStudio = savedStudios.find(s => s.name === e.target.value);
                        setClassData({
                          ...classData,
                          studioName: selectedStudio?.name || '',
                          locationUrl: selectedStudio?.location_url || ''
                        });
                      }}
                      className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen appearance-none"
                    >
                      <option value="" disabled>Select a Studio...</option>
                      {savedStudios.map((studio) => (
                        <option key={studio.id} value={studio.name}>{studio.name}</option>
                      ))}
                      <option value="custom">+ Add One Time Location</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={classData.dateTime}
                    onChange={e => setClassData({ ...classData, dateTime: e.target.value })}
                    required
                    className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Checkout Link</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={classData.bookingUrl}
                    onChange={e => setClassData({ ...classData, bookingUrl: e.target.value })}
                    required
                    className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-clay text-white font-medium py-3 rounded-lg mt-2 transition-colors hover:bg-clay-dark disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : (editingDraftId ? "Publish Draft Live" : "Publish Class")}
                </button>
              </form>
            </div>

            <div className="bg-clay-light rounded-xl shadow-sm border border-sand p-6 h-fit">
              <h2 className="text-xl font-bold mb-2">Sync Drafts</h2>
              <p className="text-sm text-stone mb-4">Pull the latest classes directly from your linked calendars.</p>

              <button onClick={handleSync} disabled={isSyncing} className="w-full bg-white border border-sand text-bark font-bold py-3 rounded-lg mb-6 shadow-sm hover:bg-linen transition-colors disabled:opacity-50">
                {isSyncing ? "Syncing Calendar..." : "↓ Pull Latest Schedule"}
              </button>

              {myClasses.filter(c => c.status === 'draft' && new Date(c.date_time) >= new Date()).length === 0 ? (
                <div className="bg-white/50 border border-sand border-dashed rounded-lg p-8 text-center text-stone text-sm font-medium">
                  No pending drafts. You're all caught up!
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {myClasses.filter(c => c.status === 'draft' && new Date(c.date_time) >= new Date()).map((c) => (
                    <div key={c.id} className="bg-white p-4 rounded-lg border border-sand text-sm flex justify-between items-center shadow-sm">
                      <div className="pr-4">
                        <p className="font-bold">{c.class_name}</p>
                        <p className="text-stone text-xs mt-0.5 line-clamp-1">
                          {new Date(c.date_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz })}
                          @ {c.studio_name || 'Pending Studio'}
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleDeleteClass(c.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 rounded-md transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleEditDraft(c)}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-bold px-4 py-2 rounded-md transition-colors"
                        >
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

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-sand p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Instructor Profile</h2>
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Public Bio</label>
                <textarea
                  rows="4"
                  value={settingsData.bio}
                  onChange={e => setSettingsData({ ...settingsData, bio: e.target.value })}
                  placeholder="Tell students about your teaching style..."
                  className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Your Timezone</label>
                <select
                  value={settingsData.timezone}
                  onChange={e => setSettingsData({ ...settingsData, timezone: e.target.value })}
                  className="w-full border border-sand rounded-lg px-4 py-2 outline-none focus:border-clay bg-linen"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
                <p className="text-xs text-stone mt-1">All your class times will display in this timezone.</p>
              </div>

              <button type="submit" disabled={isSaving} className="w-full bg-clay text-white font-medium py-3 rounded-lg mt-4 hover:bg-clay-dark disabled:opacity-50">
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </form>

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
                        <button
                          onClick={() => handleDeleteStudio(studio.id)}
                          className="text-stone hover:text-red-500 transition-all px-2 py-1 text-xs font-bold uppercase tracking-wider"
                        >
                          ✕ Remove
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone mb-1.5 uppercase tracking-wider">Default Class Type</label>
                        <select
                          defaultValue={studio.default_class_type || ''}
                          onChange={(e) => handleUpdateStudio(studio.id, { default_class_type: e.target.value })}
                          className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-white text-sm"
                        >
                          <option value="">No default — tag each class manually</option>
                          {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <p className="text-[11px] text-stone mt-1.5">Synced classes from this studio will be auto-tagged with this type.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone mb-1.5 uppercase tracking-wider">Default Booking URL</label>
                        <input
                          type="url"
                          placeholder="https://studiobooking.com/schedule"
                          defaultValue={studio.default_booking_url || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (studio.default_booking_url || '')) {
                              handleUpdateStudio(studio.id, { default_booking_url: e.target.value });
                            }
                          }}
                          className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-white text-sm"
                        />
                        <p className="text-[11px] text-stone mt-1.5">Used for studios like Mindbody where all classes share one booking page. Auto-saves on blur.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone mb-1.5 uppercase tracking-wider">Studio iCal Link</label>
                        <input
                          type="url"
                          placeholder="Paste specific studio .ics link here..."
                          defaultValue={studio.calendar_url || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (studio.calendar_url || '')) {
                              handleUpdateStudio(studio.id, { calendar_url: e.target.value });
                            }
                          }}
                          className="w-full border border-sand rounded-lg px-4 py-2.5 outline-none focus:border-clay bg-white text-sm"
                        />
                        <p className="text-[11px] text-stone mt-1.5">Auto-saves on blur.</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Add a New Studio</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Autocomplete
                      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                      options={{
                        types: ["establishment"],
                        fields: ["name", "url"]
                      }}
                      libraries={["places"]}
                      ref={settingsStudioRef}
                      onKeyUp={() => {
                        setNewStudioName('');
                        setNewStudioUrl('');
                      }}
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
                  <button
                    type="button"
                    onClick={handleAddSavedStudio}
                    disabled={isSaving}
                    className="px-6 py-3 bg-clay text-white rounded-lg font-medium hover:bg-clay-dark disabled:opacity-50 transition-colors text-sm whitespace-nowrap shadow-sm"
                  >
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

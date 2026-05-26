"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Autocomplete from 'react-google-autocomplete';

const STUDIOS = [
  { name: "Altea Active West 6", url: "https://maps.google.com/?q=Altea+Active+West+6+Vancouver" },
  { name: "InSoul Pilates", url: "https://maps.google.com/?q=InSoul+Pilates+Vancouver" }
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [isChecking, setIsChecking] = useState(true);
  
  const [editingDraftId, setEditingDraftId] = useState(null);
  
  const [classData, setClassData] = useState({
    classType: '', 
    className: '',
    dateTime: '',
    bookingUrl: '',
    studioName: STUDIOS[0].name,
    locationUrl: STUDIOS[0].url 
  });
  
  const [settingsData, setSettingsData] = useState({
    bio: '',
    calendar_url: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [myClasses, setMyClasses] = useState([]);
  const studioInputRef = useRef(null);

  const handleToggleWaitlist = async (id, currentStatus) => {
    // 1. Instantly update the UI so the toggle feels lightning fast
    setMyClasses(prevClasses => 
      prevClasses.map(c => 
        c.id === id ? { ...c, is_waitlisted: !currentStatus } : c
      )
    );

    // 2. Quietly update the database in the background
    const { error } = await supabase
      .from('classes')
      .update({ is_waitlisted: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error("Error updating waitlist:", error);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileData) {
        setProfile(profileData);
        setSettingsData({
          bio: profileData.bio || '',
          calendar_url: profileData.calendar_url || ''
        });
      }

      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .eq('instructor_id', session.user.id)
        .order('date_time', { ascending: true });

      if (classesData) setMyClasses(classesData);
      setIsChecking(false);
    };
    
    loadDashboard();
  }, [router]);

  const handleEditDraft = (draft) => {
    let matchedStudio = STUDIOS[0];
    const messyLocation = (draft.studio_name || "").toLowerCase();
    
    if (messyLocation.includes("insoul")) {
      matchedStudio = STUDIOS.find(s => s.name === "InSoul Pilates");
    } else if (messyLocation.includes("altea")) {
      matchedStudio = STUDIOS.find(s => s.name === "Altea Active West 6");
    }

    const d = new Date(draft.date_time);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d - tzOffset)).toISOString().slice(0, 16);

    setClassData({
      classType: '', 
      className: draft.class_name,
      dateTime: localISOTime,
      bookingUrl: '', 
      studioName: matchedStudio.name,
      locationUrl: matchedStudio.url
    });
    
    setEditingDraftId(draft.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingDraftId(null);
    setClassData({
      classType: '', className: '', dateTime: '', bookingUrl: '', 
      studioName: STUDIOS[0].name, locationUrl: STUDIOS[0].url 
    });
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
// FORCE OVERRIDE: Check if the Google Input has a value and prioritize it
  const finalStudioName = studioInputRef.current?.value || classData.studioName;
    if (editingDraftId) {
      const { error } = await supabase
        .from('classes')
        .update({
          class_type: classData.classType,
          class_name: classData.className,
          date_time: new Date(classData.dateTime).toISOString(),
          booking_url: classData.bookingUrl,
          studio_name: finalStudioName, // Use the forced value
          location_url: classData.locationUrl,
          status: 'published' 
        })
        .eq('id', editingDraftId);

      if (!error) {
        alert("Success! Draft published to live schedule.");
        window.location.reload();
      } else {
        alert("Error: " + error.message);
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
        alert("Success! Class published manually.");
        window.location.reload();
      } else {
        alert("Error: " + error.message);
      }
    }
    setIsSaving(false);
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase.from('profiles').update({ bio: settingsData.bio, calendar_url: settingsData.calendar_url }).eq('id', user.id);
    if (!error) alert("Settings saved successfully!");
    else alert("Error saving settings.");
    setIsSaving(false);
  };

  const handleSync = async () => {
    if (!settingsData.calendar_url) return alert("Please save a calendar URL in settings first!");
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ calendarUrl: settingsData.calendar_url, instructorId: user.id })
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      alert(`Sync complete! Checked ${result.count || 0} upcoming classes.`);
      window.location.reload();
    } catch (err) {
      alert("Error syncing: " + err.message);
    }
    setIsSyncing(false);
  };

  if (isChecking) return <div className="min-h-screen bg-[#FAF9F6]"></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C2A28] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
      

        <div className="flex space-x-8 mb-8 border-b border-[#E8E6E1]">
          <button onClick={() => setActiveTab('schedule')} className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'schedule' ? 'border-b-2 border-[#2C2A28] text-[#2C2A28]' : 'text-[#7A7571] hover:text-[#2C2A28]'}`}>Live Schedule</button>
          <button onClick={() => setActiveTab('add')} className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'add' ? 'border-b-2 border-[#2C2A28] text-[#2C2A28]' : 'text-[#7A7571] hover:text-[#2C2A28]'}`}>Add & Drafts</button>
          <button onClick={() => setActiveTab('settings')} className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'settings' ? 'border-b-2 border-[#2C2A28] text-[#2C2A28]' : 'text-[#7A7571] hover:text-[#2C2A28]'}`}>Instructor Settings</button>
        </div>

{activeTab === 'schedule' && (
                <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-6">
                  <h2 className="text-xl font-bold mb-4">Your Published Classes</h2>
                  
                  {myClasses.filter(c => c.status === 'published' && new Date(c.date_time) >= new Date()).length === 0 ? (
                    <p className="text-[#7A7571] text-center p-8 bg-white rounded-xl border border-[#E8E6E1]">No live classes currently published.</p>
                  ) : (
                    <div className="space-y-4">
                      {myClasses.filter(c => c.status === 'published' && new Date(c.date_time) >= new Date()).map((c) => (
                        <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-xl border border-[#E8E6E1] shadow-sm transition-all hover:shadow-md">
                          <div className="mb-4 sm:mb-0">
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className="font-bold text-lg text-[#2C2A28]">{c.class_name}</h4>
                              <span className="text-xs font-medium bg-[#F3F0EA] px-2 py-0.5 rounded border border-[#E8E6E1]">{c.class_type}</span>
                            </div>
                            <p className="text-sm text-[#7A7571]">
                              {new Date(c.date_time).toLocaleDateString()} • {new Date(c.date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} @ {c.studio_name}
                            </p>
                          </div>
                          
                          {/* NEW CONTROLS: Waitlist Toggle & Edit Button */}
                          <div className="flex items-center space-x-4 w-full sm:w-auto border-t sm:border-t-0 border-[#E8E6E1] pt-3 sm:pt-0">
                            
                            {/* FIX: Added the onClick handler right here! */}
                            <div 
                              onClick={() => handleToggleWaitlist(c.id, c.is_waitlisted)}
                              className="flex items-center space-x-2 cursor-pointer group"
                            >
                              <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${c.is_waitlisted ? 'bg-[#2C2A28]' : 'bg-[#E8E6E1]'}`}>
                                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${c.is_waitlisted ? 'translate-x-4' : 'translate-x-0'}`}></div>
                              </div>
                              <span className="text-sm font-medium text-[#7A7571] group-hover:text-[#2C2A28] transition-colors">Waitlisted</span>
                            </div>
                            
                            <span className="text-[#E8E6E1] hidden sm:inline">|</span>
                            
                            <button 
                              onClick={() => {
                                // 1. Tell the form which class we are updating
                                setEditingDraftId(c.id); 
                                
                                // 2. Pre-fill the modal with the live class data
                                setClassData({
                                  classType: c.class_type,
                                  className: c.class_name,
                                  dateTime: c.date_time.slice(0, 16), // Formats cleanly for HTML datetime inputs
                                  bookingUrl: c.booking_url || '',
                                  studioName: c.studio_name || '',
                                  locationUrl: c.location_url || ''
                                });

                                // 3. Open the modal
                                setActiveTab('add');
                              }}
                              className="text-sm font-medium text-[#2C2A28] bg-white border border-[#E8E6E1] hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors active:scale-95"
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
            <div className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${editingDraftId ? 'border-yellow-400 ring-4 ring-yellow-50' : 'border-[#E8E6E1]'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingDraftId ? "📝 Finish Publishing Draft" : "Publish a New Class"}
                </h2>
                {editingDraftId && (
                  <button type="button" onClick={cancelEdit} className="text-sm font-medium text-red-500 hover:underline">Cancel</button>
                )}
              </div>
              
              <form onSubmit={handleClassSubmit} className="space-y-5">
                {/* 1. Class Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">Specific Class Name</label>
                  <input 
                    type="text" 
                    value={classData.className} 
                    onChange={e => setClassData({...classData, className: e.target.value})} 
                    required 
                    className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2 outline-none focus:border-black bg-[#FAF9F6]"
                  />
                </div>

                {/* 2. Category & Studio */}
                <div>
                  <label className="block text-sm font-medium mb-1">Category & Studio</label>
                  <div className="grid grid-cols-2 gap-4">
                    <select 
                      value={classData.classType} 
                      onChange={e => setClassData({...classData, classType: e.target.value})} 
                      required 
                      className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2 outline-none focus:border-black bg-[#FAF9F6]"
                    >
                      <option value="" disabled>Select Category...</option>
                      <option value="Reformer Pilates">Reformer Pilates</option>
                      <option value="Mat Pilates">Mat Pilates</option>
                      <option value="Yoga">Yoga</option>
                    </select>

                    <div className="relative">
                      <Autocomplete
  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
  options={{ types: ["establishment"] }}
  libraries={["places"]}
  ref={studioInputRef} // <--- Add the ref here
  onPlaceSelected={(place) => {
    if (place && place.name) {
      setClassData(prev => ({
        ...prev,
        studioName: place.name,
        locationUrl: place.url || prev.locationUrl 
      }));
    }
  }}
  defaultValue={classData.studioName}
  className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2 outline-none focus:border-black bg-[#FAF9F6]"
  placeholder="Search on Google Maps..."
/>
                      {classData.locationUrl && (
                        <span className="absolute -bottom-5 left-1 text-[10px] text-green-600 font-bold">✓ Location Linked</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Date & Time */}
                <div>
                  <label className="block text-sm font-medium mb-1">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={classData.dateTime} 
                    onChange={e => setClassData({...classData, dateTime: e.target.value})} 
                    required 
                    className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2 outline-none focus:border-black bg-[#FAF9F6]"
                  />
                </div>

                {/* 4. Checkout Link */}
                <div>
                  <label className="block text-sm font-medium mb-1">Checkout Link</label>
                  <input 
                    type="url" 
                    placeholder="https://..." 
                    value={classData.bookingUrl} 
                    onChange={e => setClassData({...classData, bookingUrl: e.target.value})} 
                    className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2 outline-none focus:border-black bg-[#FAF9F6]"
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isSaving} 
                  className="w-full bg-[#2C2A28] text-white font-medium py-3 rounded-lg mt-2 transition-colors hover:bg-black disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : (editingDraftId ? "Publish Draft Live" : "Publish Class")}
                </button>
              </form>
              </div>

            <div className="bg-[#F3F0EA] rounded-xl shadow-sm border border-[#E8E6E1] p-6 h-fit">
              <h2 className="text-xl font-bold mb-2">Sync Drafts</h2>
              <p className="text-sm text-[#7A7571] mb-4">Pull the latest classes directly from your linked calendar.</p>
              
              <button onClick={handleSync} disabled={isSyncing || !settingsData.calendar_url} className="w-full bg-white border border-[#E8E6E1] text-[#2C2A28] font-bold py-3 rounded-lg mb-6 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                {isSyncing ? "Syncing Calendar..." : "↓ Pull Latest Schedule"}
              </button>

              {myClasses.filter(c => c.status === 'draft' && new Date(c.date_time) >= new Date()).length === 0 ? (
                <div className="bg-white/50 border border-[#E8E6E1] border-dashed rounded-lg p-8 text-center text-[#7A7571] text-sm font-medium">
                  No pending drafts. You're all caught up!
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {myClasses.filter(c => c.status === 'draft' && new Date(c.date_time) >= new Date()).map((c) => (
                    <div key={c.id} className="bg-white p-4 rounded-lg border border-[#E8E6E1] text-sm flex justify-between items-center shadow-sm">
                      <div className="pr-4">
                        <p className="font-bold">{c.class_name}</p>
<p className="text-[#7A7571] text-xs mt-0.5 line-clamp-1">
  {new Date(c.date_time).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})} 
  @ {c.studio_name}
</p>                      </div>
                      <button 
                        onClick={() => handleEditDraft(c)}
                        className="shrink-0 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-bold px-4 py-2 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Instructor Profile & Sync</h2>
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Public Bio</label>
                <textarea rows="4" value={settingsData.bio} onChange={e => setSettingsData({...settingsData, bio: e.target.value})} placeholder="Tell students about your teaching style..." className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2 outline-none focus:border-black bg-[#FAF9F6]/50"></textarea>
              </div>
              <div className="pt-4 border-t border-[#E8E6E1]">
                <h3 className="font-bold text-lg mb-2">Automated Calendar Sync</h3>
                <p className="text-sm text-[#7A7571] mb-4">Paste your Mindbody or Apple/Google .ics link here. We will check it daily for new classes.</p>
                <label className="block text-sm font-medium mb-1">iCal URL (.ics)</label>
                <input type="url" value={settingsData.calendar_url} onChange={e => setSettingsData({...settingsData, calendar_url: e.target.value})} placeholder="https://calendar.google.com/.../basic.ics" className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2 outline-none focus:border-black bg-[#FAF9F6]/50" />
              </div>
              <button type="submit" disabled={isSaving} className="w-full bg-[#2C2A28] text-white font-medium py-3 rounded-lg mt-4 hover:bg-[#4A4744]">
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
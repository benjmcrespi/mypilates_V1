"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STUDIOS = [
  { name: "Altea Active West 6", url: "https://maps.google.com/?q=Altea+Active+West+6+Vancouver" },
  { name: "InSoul Pilates", url: "https://maps.google.com/?q=InSoul+Pilates+Vancouver" }
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule', 'add', 'settings'
  const [isChecking, setIsChecking] = useState(true);
  
  // Forms State
  const [classData, setClassData] = useState({
    classType: 'Reformer Pilates',
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
  const [myClasses, setMyClasses] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      setUser(session.user);

      // Fetch Profile
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

      // Fetch Classes
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

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const { data, error } = await supabase
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
      alert("Success! Class published.");
      window.location.reload(); // Quick refresh to show new class
    } else {
      alert("Error: " + error.message);
    }
    setIsSaving(false);
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        bio: settingsData.bio,
        calendar_url: settingsData.calendar_url
      })
      .eq('id', user.id);

    if (!error) {
      alert("Settings saved successfully!");
    } else {
      alert("Error saving settings.");
    }
    setIsSaving(false);
  };

  if (isChecking) return <div className="min-h-screen bg-[#FAF9F6]"></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C2A28] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 flex justify-between items-end border-b border-[#E8E6E1] pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile?.full_name?.split(' ')[0] || 'Instructor'}</h1>
            <p className="text-[#7A7571] mt-1">Manage your schedule, drafts, and settings.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm font-medium text-[#7A7571] hover:text-[#2C2A28] transition-colors">
              View Live Site
            </Link>
            <span className="text-[#E8E6E1]">|</span>
            <button 
              onClick={() => { supabase.auth.signOut(); router.push('/login'); }}
              className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex space-x-8 mb-8 border-b border-[#E8E6E1]">
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'schedule' ? 'border-b-2 border-[#2C2A28] text-[#2C2A28]' : 'text-[#7A7571] hover:text-[#2C2A28]'}`}
          >
            Live Schedule
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'add' ? 'border-b-2 border-[#2C2A28] text-[#2C2A28]' : 'text-[#7A7571] hover:text-[#2C2A28]'}`}
          >
            Add & Drafts
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'settings' ? 'border-b-2 border-[#2C2A28] text-[#2C2A28]' : 'text-[#7A7571] hover:text-[#2C2A28]'}`}
          >
            Instructor Settings
          </button>
        </div>

        {/* TAB 1: LIVE SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-6">
            <h2 className="text-xl font-bold mb-4">Your Published Classes</h2>
            {myClasses.filter(c => c.status === 'published').length === 0 ? (
              <p className="text-[#7A7571]">You have no upcoming classes. Head to the Add tab to publish one!</p>
            ) : (
              <div className="space-y-4">
                {myClasses.filter(c => c.status === 'published').map(c => (
                  <div key={c.id} className="flex justify-between items-center p-4 bg-[#FAF9F6] rounded-lg border border-[#E8E6E1]">
                    <div>
                      <h3 className="font-bold">{c.class_name} <span className="text-xs font-normal bg-white px-2 py-0.5 rounded border ml-2">{c.class_type}</span></h3>
                      <p className="text-sm text-[#7A7571] mt-1">{new Date(c.date_time).toLocaleString()} @ {c.studio_name}</p>
                    </div>
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">Published</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADD & DRAFTS */}
        {activeTab === 'add' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-6">
              <h2 className="text-xl font-bold mb-6">Publish a New Class</h2>
              <form onSubmit={handleClassSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Specific Class Name</label>
                  <input type="text" value={classData.className} onChange={e => setClassData({...classData, className: e.target.value})} required className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2 outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category & Studio</label>
                  <div className="grid grid-cols-2 gap-4">
                    <select value={classData.classType} onChange={e => setClassData({...classData, classType: e.target.value})} className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2 outline-none focus:border-black">
                      <option>Reformer Pilates</option>
                      <option>Mat Pilates</option>
                      <option>Yoga</option>
                    </select>
                    <select value={classData.studioName} onChange={e => {
                      const studio = STUDIOS.find(s => s.name === e.target.value);
                      setClassData({...classData, studioName: studio.name, locationUrl: studio.url});
                    }} className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2 outline-none focus:border-black">
                      {STUDIOS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date & Time</label>
                  <input type="datetime-local" value={classData.dateTime} onChange={e => setClassData({...classData, dateTime: e.target.value})} required className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2 outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Checkout Link</label>
                  <input type="url" placeholder="https://..." value={classData.bookingUrl} onChange={e => setClassData({...classData, bookingUrl: e.target.value})} required className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2 outline-none focus:border-black" />
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-[#2C2A28] text-white font-medium py-3 rounded-lg mt-2">
                  {isSaving ? "Publishing..." : "Publish Class"}
                </button>
              </form>
            </div>

            <div className="bg-[#F3F0EA] rounded-xl shadow-sm border border-[#E8E6E1] p-6 h-fit">
              <h2 className="text-xl font-bold mb-2">Sync Drafts</h2>
              <p className="text-sm text-[#7A7571] mb-4">When your iCal sync runs, un-published classes will appear here for you to categorize and publish.</p>
              <div className="bg-white/50 border border-[#E8E6E1] border-dashed rounded-lg p-8 text-center text-[#7A7571] text-sm">
                No pending drafts. You're all caught up!
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Instructor Profile & Sync</h2>
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Public Bio</label>
                <textarea 
                  rows="4" 
                  value={settingsData.bio} 
                  onChange={e => setSettingsData({...settingsData, bio: e.target.value})}
                  placeholder="Tell students about your teaching style..."
                  className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2 outline-none focus:border-black"
                ></textarea>
              </div>
              
              <div className="pt-4 border-t border-[#E8E6E1]">
                <h3 className="font-bold text-lg mb-2">Automated Calendar Sync</h3>
                <p className="text-sm text-[#7A7571] mb-4">Paste your Mindbody or Apple/Google .ics link here. We will check it daily for new classes.</p>
                <label className="block text-sm font-medium mb-1">iCal URL (.ics)</label>
                <input 
                  type="url" 
                  value={settingsData.calendar_url} 
                  onChange={e => setSettingsData({...settingsData, calendar_url: e.target.value})}
                  placeholder="https://calendar.google.com/.../basic.ics" 
                  className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2 outline-none focus:border-black" 
                />
              </div>

              <button type="submit" disabled={isSaving} className="w-full bg-[#2C2A28] text-white font-medium py-3 rounded-lg mt-4">
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
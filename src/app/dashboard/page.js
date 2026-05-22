"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

// 1. THE UPDATED STUDIO LIST
// I added Google Maps search links that will automatically pull up the studios
const STUDIOS = [
  { name: "Altea Active West 6", url: "https://maps.google.com/?q=Altea+Active+West+6+Vancouver" },
  { name: "InSoul Pilates", url: "https://maps.google.com/?q=InSoul+Pilates+Vancouver" },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  
  const [classData, setClassData] = useState({
    classType: 'Reformer Pilates',
    className: '',
    dateTime: '',
    bookingUrl: '',
    studioName: STUDIOS[0].name,
    locationUrl: STUDIOS[0].url 
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        setIsChecking(false);
      }
    };
    checkUser();
  }, [router]);

  const handleChange = (e) => {
    setClassData({ ...classData, [e.target.name]: e.target.value });
  };

  const handleStudioChange = (e) => {
    const selectedName = e.target.value;
    const selectedStudio = STUDIOS.find(s => s.name === selectedName);
    
    setClassData({
      ...classData,
      studioName: selectedStudio.name,
      locationUrl: selectedStudio.url
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to do this!");
    
    setIsSaving(true);

    const { data, error } = await supabase
      .from('classes')
      .insert([
        {
          instructor_id: user.id,
          class_type: classData.classType,
          class_name: classData.className,
          // 2. THE TIMEZONE FIX: This permanently locks the time to the creator's local timezone
          date_time: new Date(classData.dateTime).toISOString(),
          booking_url: classData.bookingUrl,
          studio_name: classData.studioName,
          location_url: classData.locationUrl
        }
      ]);

    if (error) {
      alert("Error saving class: " + error.message);
      console.error(error);
    } else {
      alert("Success! Class published to the live schedule.");
      setClassData({ 
        ...classData, 
        className: '', 
        dateTime: '', 
        bookingUrl: '',
        studioName: STUDIOS[0].name,
        locationUrl: STUDIOS[0].url
      });
    }
    
    setIsSaving(false);
  };

  if (isChecking) return <div className="min-h-screen bg-gray-50"></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Studio Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your schedule and publish new classes.</p>
          </div>
          <button 
            onClick={() => { supabase.auth.signOut(); router.push('/login'); }}
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Create a Class</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    name="classType"
                    value={classData.classType}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none"
                  >
                    <option>Reformer Pilates</option>
                    <option>Mat Pilates</option>
                    <option>Yoga</option>
                    <option>Barre</option>
                    <option>Stretch and Mobility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specific Class Name</label>
                  <input 
                    type="text" 
                    name="className"
                    placeholder="e.g. Reformer Elevate"
                    value={classData.className}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Studio Location</label>
                <select 
                  name="studioName"
                  value={classData.studioName}
                  onChange={handleStudioChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none"
                >
                  {STUDIOS.map((studio, index) => (
                    <option key={index} value={studio.name}>
                      {studio.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    name="dateTime"
                    value={classData.dateTime}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">External Booking Link</label>
                  <input 
                    type="url" 
                    name="bookingUrl"
                    placeholder="https://..."
                    value={classData.bookingUrl}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-black text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 mt-4"
              >
                {isSaving ? "Publishing..." : "Publish Class"}
              </button>
            </form>
          </div>

          <div className="bg-gray-100 rounded-xl p-6 border border-gray-200 h-fit">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Live Preview</h3>
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                  {classData.classType}
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-900">
                {classData.className || "Class Name"}
              </h4>
              <p className="text-gray-500 text-sm mt-1">
                📍 {classData.studioName}
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-gray-500 text-sm font-medium">
                  {classData.dateTime ? new Date(classData.dateTime).toLocaleString() : "Select a date & time"}
                </p>
                <div className="mt-4 block w-full text-center bg-gray-50 text-gray-400 font-medium py-2 rounded-lg border border-gray-200">
                  Book Now
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
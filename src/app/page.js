"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function Home() {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('date_time', { ascending: true });

      if (!error && data) {
        // Filter out past classes so the schedule stays fresh
        const freshClasses = data.filter(c => new Date(c.date_time) >= new Date());
        setClasses(freshClasses);
      }
      setIsLoading(false);
    };

    fetchClasses();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C2A28] font-sans">
      {/* GLOBAL NAVBAR */}
      <nav className="border-b border-[#E8E6E1] bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold tracking-tight text-[#2C2A28]">
            MyPilates<span className="text-[#7A7571] font-light">.ca</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-sm font-medium text-[#7A7571] hover:text-[#2C2A28] transition-colors">
              Instructor Dashboard
            </Link>
            <Link href="/login" className="bg-[#2C2A28] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#4A4744] transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="max-w-4xl mx-auto text-center py-20 px-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2C2A28] mb-6">
          Find Your Next Movement.
        </h1>
        <p className="text-lg text-[#7A7571] max-w-xl mx-auto mb-8">
          A beautifully clean, real-time schedule hub for independent Pilates instructors in Vancouver.
        </p>
      </header>

      {/* LIVE SCHEDULE FEED */}
      <main className="max-w-4xl mx-auto px-6 pb-24">
        <div className="flex justify-between items-center mb-8 border-b border-[#E8E6E1] pb-4">
          <h2 className="text-xl font-bold text-[#2C2A28]">Upcoming Live Schedule</h2>
          <span className="text-xs font-semibold bg-[#E8E6E1] text-[#7A7571] px-2.5 py-1 rounded-full uppercase tracking-wider">
            {classes.length} Active Classes
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-[#7A7571] animate-pulse">Loading live schedule...</div>
        ) : classes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E8E6E1] p-8">
            <p className="text-[#7A7571] font-medium">No classes scheduled for this week yet.</p>
            <p className="text-sm text-[#A39E99] mt-1">Check back soon or contact your instructor!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((c) => (
              <div key={c.id} className="bg-white border border-[#E8E6E1] rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="text-xs font-semibold bg-[#F3F0EA] text-[#7A7571] px-2 py-0.5 rounded">
                      {c.class_type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#2C2A28]">{c.class_name}</h3>
                  <p className="text-sm text-[#7A7571] mt-1 flex items-center">
                    📍 <span className="underline ml-1 font-medium">{c.studio_name}</span>
                  </p>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 sm:pt-0 border-t sm:border-0 border-[#F3F0EA]">
                  <div className="sm:text-right">
                    <p className="text-sm font-bold text-[#2C2A28]">
                      {new Date(c.date_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-[#7A7571] font-medium mt-0.5">
                      {new Date(c.date_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  <a 
                    href={c.booking_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#2C2A28] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#4A4744] transition-colors text-center shadow-sm"
                  >
                    Book Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
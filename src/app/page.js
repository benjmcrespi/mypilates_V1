"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function Home() {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingClass, setBookingClass] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('status', 'published')
        .order('date_time', { ascending: true });

      if (data) setClasses(data);
      setIsLoading(false);
    };

    fetchClasses();
  }, []);

  const handleBookClick = (classItem) => {
    if (
      classItem.studio_name === "InSoul Pilates" || 
      (classItem.booking_url && classItem.booking_url.includes('cart.mindbodyonline.com'))
    ) {
      setBookingClass(classItem);
    } else {
      window.open(classItem.booking_url || '#', '_blank');
    }
  };

  const getTargetUrl = (classItem) => {
    if (!classItem) return '#';
    let url = classItem.booking_url;
    
    const d = new Date(classItem.date_time);
    const dateParam = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    if (url.includes('insoulpilates.com/schedule')) {
      url = url.includes('?') ? `${url}&start_date=${dateParam}` : `${url}?start_date=${dateParam}`;
    }
    
    return url;
  };

  if (isLoading) return <div className="min-h-screen bg-[#FAF9F6]"></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C2A28] font-sans relative pb-20">
      

      {/* SCHEDULE FEED */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">Live Schedule</h2>
          <p className="text-[#7A7571] text-sm sm:text-base">Book your next session below.</p>
        </div>

        {classes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-10 text-center text-[#7A7571]">
            No upcoming classes scheduled right now. Check back soon!
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-5 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center transition-all">
                <div className="mb-4 sm:mb-0">
                  <div className="flex items-center space-x-3 mb-1.5">
                    <h3 className="text-lg font-bold leading-tight">{c.class_name}</h3>
                    <span className="text-xs font-medium bg-[#F3F0EA] px-2 py-0.5 rounded border border-[#E8E6E1] whitespace-nowrap">
                      {c.class_type}
                    </span>
                  </div>
                  <p className="text-[#7A7571] text-sm sm:text-base">
                    {new Date(c.date_time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} <span className="mx-1">•</span> {new Date(c.date_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                  
                  <a 
                    href={c.location_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block text-sm text-[#7A7571] hover:text-black font-medium mt-2 underline decoration-dotted"
                  >
                    📍 {c.studio_name}
                  </a>
                </div>
                
                {/* Mobile Full-Width Button */}
                <button 
                  onClick={() => handleBookClick(c)}
                  className="w-full sm:w-auto bg-[#2C2A28] text-white font-bold py-3.5 px-8 rounded-lg hover:bg-[#4A4744] active:bg-black transition-colors"
                >
                  Book Spot
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MOBILE-OPTIMIZED BOTTOM SHEET MODAL */}
      {bookingClass && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          {/* Background Blur Overlay */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setBookingClass(null)}
          ></div>
          
          {/* Modal Container */}
          <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 pb-10 sm:pb-6 animate-in slide-in-from-bottom-full sm:fade-in sm:zoom-in-95 duration-300">
            
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-[#E8E6E1] rounded-full mx-auto mb-6 sm:hidden"></div>
            
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-5 mx-auto sm:mx-0">
              <span className="text-2xl">🗓️</span>
            </div>
            
            <h3 className="text-xl font-bold mb-2 text-center sm:text-left">Studio Booking Instructions</h3>
            
            <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E8E6E1] mb-6">
              <p className="text-[#7A7571] text-sm leading-relaxed text-center sm:text-left">
                This studio uses a main schedule page. You will likely land on <strong>today's date</strong>. Please navigate to the date below to find Hannah's class:
              </p>
              <div className="mt-4 p-4 bg-white border border-[#E8E6E1] rounded-lg text-center shadow-sm">
                <span className="block text-black font-bold text-lg sm:text-xl">
                  {new Date(bookingClass.date_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="block text-[#7A7571] text-sm font-medium mt-1">
                  @ {new Date(bookingClass.date_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <a 
                href={getTargetUrl(bookingClass)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setBookingClass(null)} 
                className="w-full bg-[#2C2A28] text-white font-bold py-4 sm:py-3 rounded-xl text-center hover:bg-[#4A4744] active:scale-[0.98] transition-all"
              >
                Continue to Studio Schedule
              </a>
              <button 
                onClick={() => setBookingClass(null)}
                className="w-full bg-white border border-[#E8E6E1] text-[#7A7571] font-bold py-4 sm:py-3 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
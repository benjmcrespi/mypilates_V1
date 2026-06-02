"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Reformer Pilates', 'Mat Pilates', 'Yoga', 'Barre', 'Stretch and Mobility'];

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        profiles (full_name)
      `)
      .eq('status', 'published')
      .order('date_time', { ascending: true });

    if (error) {
      console.error("Error fetching schedule:", error.message);
    } else {
      const upcomingClasses = data.filter(c => new Date(c.date_time) > new Date());
      setClasses(upcomingClasses);
    }
    setLoading(false);
  };

  const displayedClasses = activeFilter === 'All' 
    ? classes 
    : classes.filter(c => c.class_type === activeFilter);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-bold text-[#2C2A28]">Live Schedule</h1>
          <p className="text-[#7A7571] mt-3 text-lg">Find your next session and book directly with the instructor.</p>
        </div>

        <div className="flex overflow-x-auto pb-4 mb-8 hide-scrollbar space-x-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === category
                  ? 'bg-[#2C2A28] text-[#FAF9F6]'
                  : 'bg-white text-[#7A7571] border border-[#E8E6E1] hover:bg-[#F3F0EA]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#96908B]">Loading schedule...</div>
        ) : displayedClasses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E8E6E1]">
            <p className="text-[#7A7571]">No upcoming classes for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedClasses.map((cls) => {
              const { day, time } = formatDateTime(cls.date_time);
              return (
                <div key={cls.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8E6E1] hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                  
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-semibold bg-[#F3F0EA] text-[#7A7571] px-3 py-1 rounded-md">
                        {cls.class_type}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-[#2C2A28] mb-1">{cls.class_name}</h3>
                    <p className="text-[#7A7571] text-sm font-medium mb-4">
                      with {cls.profiles?.full_name || "Instructor"}
                    </p>
                    
                    <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E8E6E1] mb-6">
                      <div className="flex justify-between text-sm font-medium text-[#2C2A28] mb-1">
                        <span>{day}</span>
                      </div>
                      <div className="text-[#7A7571] text-sm">
                        {time}
                      </div>
                    </div>
                  </div>

                  <a 
                    href={cls.booking_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-[#2C2A28] text-[#FAF9F6] font-medium py-3 rounded-lg hover:bg-black transition-colors"
                  >
                    Book Class
                  </a>
                  
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
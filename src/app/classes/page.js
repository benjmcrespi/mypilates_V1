"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { categoryLabel } from '@/lib/categories';
import Link from 'next/link';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchCategories();
    fetchClasses();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('class_categories')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (data) setCategories(data);
  };

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('*, profiles(full_name, handle, timezone), class_categories(id, name)')
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
    : classes.filter(c => c.category_id === activeFilter);

  const formatDateTime = (dateString, timezone = 'America/Vancouver') => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: timezone }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timezone })
    };
  };

  return (
    <div className="min-h-screen bg-linen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-bold text-bark">Live Schedule</h1>
          <p className="text-stone mt-3 text-lg">Find your next session and book directly with the instructor.</p>
        </div>

        <div className="flex overflow-x-auto pb-4 mb-8 hide-scrollbar space-x-2">
          <button
            onClick={() => setActiveFilter('All')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'All'
                ? 'bg-clay text-white'
                : 'bg-white text-stone border border-sand hover:bg-clay-light'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === category.id
                  ? 'bg-clay text-white'
                  : 'bg-white text-stone border border-sand hover:bg-clay-light'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone">Loading schedule...</div>
        ) : displayedClasses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-sand">
            <p className="text-stone">No upcoming classes for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedClasses.map((cls) => {
              const tz = cls.profiles?.timezone || 'America/Vancouver';
              const { day, time } = formatDateTime(cls.date_time, tz);
              return (
                <div key={cls.id} className="bg-white p-6 rounded-2xl shadow-sm border border-sand hover:shadow-md transition-shadow flex flex-col justify-between h-full">

                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-semibold bg-clay-light text-stone px-3 py-1 rounded-md">
                        {categoryLabel(cls, categories) || 'Uncategorized'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-bark mb-1">{cls.class_name}</h3>

                    {cls.profiles?.handle ? (
                      <Link href={`/${cls.profiles.handle}`} className="text-stone text-sm font-medium mb-4 hover:text-bark hover:underline block">
                        with {cls.profiles.full_name || "Instructor"}
                      </Link>
                    ) : (
                      <p className="text-stone text-sm font-medium mb-4">
                        with {cls.profiles?.full_name || "Instructor"}
                      </p>
                    )}

                    <div className="bg-linen p-4 rounded-xl border border-sand mb-6">
                      <div className="text-sm font-medium text-bark mb-1">{day}</div>
                      <div className="text-stone text-sm">{time}</div>
                      <div className="text-stone text-xs mt-1">{cls.studio_name}</div>
                    </div>
                  </div>

                  <a
                    href={cls.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-clay text-white font-medium py-3 rounded-lg hover:bg-clay-dark transition-colors"
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

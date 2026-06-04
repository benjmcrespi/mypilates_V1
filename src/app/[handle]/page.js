"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';

export default function InstructorProfile() {
  const params = useParams();
  const [instructor, setInstructor] = useState(null);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingClass, setBookingClass] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!params?.handle) return;

      // 1. Find the instructor by the URL handle
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('handle', params.handle.toLowerCase())
        .single();

      if (profileError || !profile) {
        setIsLoading(false);
        return;
      }
      setInstructor(profile);

     // 2. Pull published classes AND join our new Studios table logic
      // FIX: Only pull classes where the date_time is greater than or equal to right now
      const now = new Date().toISOString();

      const { data: classData } = await supabase
        .from('classes')
        .select('*, studios(*)')
        .eq('instructor_id', profile.id)
        .eq('status', 'published')
        .gte('date_time', now)
        .order('date_time', { ascending: true });

      if (classData) setClasses(classData);
      setIsLoading(false);
    };

    fetchData();
  }, [params]);

  const handleBookClick = (classItem) => {
    // THE INTELLIGENCE: Read the studio database to decide the flow
    const flow = classItem.studios?.booking_flow || 'direct_route';

    if (flow === 'handoff_modal') {
      setBookingClass(classItem);
    } else {
      window.open(classItem.booking_url || '#', '_blank');
    }
  };

  if (isLoading) return <div className="min-h-screen bg-linen"></div>;

  if (!instructor) return (
    <div className="min-h-screen bg-linen flex flex-col items-center justify-center text-center p-6">
      <h2 className="text-2xl font-bold text-bark mb-2">Profile Not Found</h2>
      <p className="text-stone">This instructor hasn't set up their schedule yet.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-linen text-bark pb-20">

      {/* BIO HEADER */}
      <div className="bg-white border-b border-sand py-12 px-6 text-center">
        <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 border-sand bg-clay-light flex items-center justify-center">
          {instructor.avatar_url
            ? <img src={instructor.avatar_url} alt={instructor.full_name} className="w-full h-full object-cover" />
            : <span className="text-3xl font-bold text-stone">{instructor.full_name?.charAt(0) || 'I'}</span>
          }
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{instructor.full_name}</h1>

        {/* Meta row: years experience + Instagram */}
        {(instructor.years_experience || instructor.instagram_handle) && (
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-stone">
            {instructor.years_experience && (
              <span>{instructor.years_experience} yrs experience</span>
            )}
            {instructor.years_experience && instructor.instagram_handle && (
              <span className="text-sand">·</span>
            )}
            {instructor.instagram_handle && (
              <a
                href={`https://instagram.com/${instructor.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-bark transition-colors"
              >
                @{instructor.instagram_handle}
              </a>
            )}
          </div>
        )}

        <p className="text-stone max-w-md mx-auto mt-3 text-sm leading-relaxed">
          {instructor.bio || "Welcome to my schedule! View upcoming classes and book your spot below."}
        </p>

        {/* Certifications */}
        {instructor.certifications?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md mx-auto">
            {instructor.certifications.map(cert => (
              <span key={cert} className="bg-clay-light text-bark text-xs font-medium px-3 py-1 rounded-full border border-sand">
                {cert}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SCHEDULE FEED */}
      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <h2 className="text-xl font-bold mb-6">Upcoming Classes</h2>

        {classes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-sand p-10 text-center text-stone">
            No upcoming classes scheduled right now.
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow-sm border border-sand p-5 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center transition-all">
                <div className="mb-4 sm:mb-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1.5">
                    <h3 className="text-lg font-bold leading-tight">{c.class_name}</h3>
                    <span className="text-xs font-medium bg-clay-light px-2 py-0.5 rounded border border-sand">
                      {c.class_type}
                    </span>
                    {c.booking_type === 'membership_required' && (
                      <span className="text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">Membership required</span>
                    )}
                    {c.booking_type === 'app_recommended' && (
                      <span className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">Book via app</span>
                    )}
                    {c.booking_type === 'dropin_welcome' && (
                      <span className="text-xs font-medium bg-sage-light text-sage border border-sage/30 px-2 py-0.5 rounded">Drop-in welcome</span>
                    )}
                  </div>
                  <p className="text-stone text-sm sm:text-base">
  {new Date(c.date_time).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    timeZone: instructor.timezone || 'America/Vancouver'
  })}
  <span className="mx-1">•</span>
  {new Date(c.date_time).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
    timeZone: instructor.timezone || 'America/Vancouver'
  })}
</p>

                  <a
                    href={c.studios?.location_url || c.location_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-stone hover:text-bark font-medium mt-2 underline decoration-dotted"
                  >
                    📍 {c.studios?.name || c.studio_name}
                  </a>

                  {c.booking_note && (
                    <p className="text-xs text-stone mt-1.5 italic">{c.booking_note}</p>
                  )}
                </div>

                {/* DYNAMIC BUTTON: Checks if the class is waitlisted */}
                {c.is_waitlisted ? (
                  <button
                    onClick={() => handleBookClick(c)}
                    className="w-full sm:w-auto bg-sand text-stone font-bold py-3.5 px-8 rounded-lg hover:bg-sand/70 hover:text-bark active:scale-[0.98] transition-all"
                  >
                    Join Waitlist
                  </button>
                ) : (
                  <button
                    onClick={() => handleBookClick(c)}
                    className="w-full sm:w-auto bg-clay text-white font-bold py-3.5 px-8 rounded-lg hover:bg-clay-dark active:scale-[0.98] transition-all"
                  >
                    Book Spot
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MOBILE-OPTIMIZED BOTTOM SHEET MODAL (Mindbody Only) */}
      {bookingClass && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setBookingClass(null)}></div>

          <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 pb-10 sm:pb-6 animate-in slide-in-from-bottom-full sm:fade-in sm:zoom-in-95 duration-300">
            <div className="w-12 h-1.5 bg-sand rounded-full mx-auto mb-6 sm:hidden"></div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-5 mx-auto sm:mx-0">
              <span className="text-2xl">🗓️</span>
            </div>

            <h3 className="text-xl font-bold mb-2 text-center sm:text-left">Studio Booking Instructions</h3>

            <div className="bg-linen p-4 rounded-xl border border-sand mb-6">
              <p className="text-stone text-sm leading-relaxed text-center sm:text-left">
                This studio uses a main schedule page. You will likely land on <strong>today's date</strong>. Please navigate to the date below:
              </p>
              <div className="mt-4 p-4 bg-white border border-sand rounded-lg text-center shadow-sm">
                <span className="block text-bark font-bold text-lg sm:text-xl">
{new Date(bookingClass.date_time).toLocaleDateString('en-US', {
  weekday: 'short', month: 'short', day: 'numeric',
  timeZone: instructor.timezone || 'America/Vancouver'
})}                </span>
                <span className="block text-stone text-sm font-medium mt-1">
{new Date(bookingClass.date_time).toLocaleTimeString('en-US', {
  hour: 'numeric', minute: '2-digit',
  timeZone: instructor.timezone || 'America/Vancouver'
})}                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <a
                href={bookingClass.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setBookingClass(null)}
                className="w-full bg-clay text-white font-bold py-4 sm:py-3 rounded-xl text-center hover:bg-clay-dark active:scale-[0.98] transition-all"
              >
                Continue to Studio Schedule
              </a>
              <button
                onClick={() => setBookingClass(null)}
                className="w-full bg-linen border border-sand text-stone font-bold py-4 sm:py-3 rounded-xl hover:bg-clay-light active:scale-[0.98] transition-all"
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

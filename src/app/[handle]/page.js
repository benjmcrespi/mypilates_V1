"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const WEEKDAY_INDEX = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

// Returns { year, month, day, weekday } for a date as observed in the given timezone
function getTZDateParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  }).formatToParts(date);
  const obj = {};
  parts.forEach(p => { if (p.type !== 'literal') obj[p.type] = p.value; });
  return obj;
}

// Groups classes into "this week" (through Sunday), "next week" (Mon-Sun), and "later",
// based on calendar days in the instructor's timezone.
function groupClassesByWeek(classes, timeZone) {
  const todayParts = getTZDateParts(new Date(), timeZone);
  const todayUTC = Date.UTC(+todayParts.year, +todayParts.month - 1, +todayParts.day);
  const todayDow = WEEKDAY_INDEX[todayParts.weekday] ?? 0;
  const thisWeekEnd = 6 - todayDow; // days from today through Sunday
  const nextWeekEnd = thisWeekEnd + 7;

  const groups = { thisWeek: [], nextWeek: [], later: [] };

  classes.forEach((c) => {
    const cParts = getTZDateParts(new Date(c.date_time), timeZone);
    const cUTC = Date.UTC(+cParts.year, +cParts.month - 1, +cParts.day);
    const dayOffset = Math.round((cUTC - todayUTC) / 86400000);

    if (dayOffset <= thisWeekEnd) groups.thisWeek.push(c);
    else if (dayOffset <= nextWeekEnd) groups.nextWeek.push(c);
    else groups.later.push(c);
  });

  return groups;
}

function truncateBio(bio, maxLength) {
  if (bio.length <= maxLength) return bio;
  const truncated = bio.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trimEnd() + '…';
}

export default function InstructorProfile() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [instructor, setInstructor] = useState(null);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingClass, setBookingClass] = useState(null);
  const [showLater, setShowLater] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  // Follow widget state
  const [followEmail, setFollowEmail] = useState('');
  const [followState, setFollowState] = useState('idle'); // idle | submitting | done | confirmed | already | error
  const followParam = searchParams?.get('follow');

  // Unfollow widget state
  const [showUnfollow, setShowUnfollow] = useState(false);
  const [unfollowEmail, setUnfollowEmail] = useState('');
  const [unfollowState, setUnfollowState] = useState('idle'); // idle | submitting | done | error

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
        .select('*, studios(*), class_categories(id, name)')
        .eq('instructor_id', profile.id)
        .eq('status', 'published')
        .gte('date_time', now)
        .order('date_time', { ascending: true });

      if (classData) setClasses(classData);
      setIsLoading(false);
    };

    fetchData();
  }, [params]);

  // Show confirmed state if redirected from confirm link
  useEffect(() => {
    if (followParam === 'confirmed') setFollowState('confirmed');
    if (followParam === 'error') setFollowState('error');
  }, [followParam]);

  const handleFollow = async (e) => {
    e.preventDefault();
    if (!followEmail || !instructor) return;
    setFollowState('submitting');

    const res = await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: followEmail,
        instructor_id: instructor.id,
        instructor_name: instructor.full_name,
        handle: params.handle,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setFollowState('error');
    } else if (data.status === 'already_following') {
      setFollowState('already');
    } else {
      setFollowState('done');
    }
  };

  const handleUnfollow = async (e) => {
    e.preventDefault();
    if (!unfollowEmail || !instructor) return;
    setUnfollowState('submitting');

    const res = await fetch('/api/unfollow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: unfollowEmail, instructor_id: instructor.id }),
    });

    setUnfollowState(res.ok ? 'done' : 'error');
  };

  const handleBookClick = (classItem) => {
    // Log the click — fire and forget, never block the booking flow
    fetch('/api/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instructor_id: instructor.id,
        class_id: classItem.id,
        follower_email: followEmail || null,
        source: 'profile_page',
      }),
    }).catch(() => {});

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

      {/* BIO HEADER — dark espresso per brand spec */}
      <div className="bg-espresso text-linen py-12 px-6 text-center">
        <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 border-white/20 bg-bark flex items-center justify-center">
          {instructor.avatar_url
            ? <img src={instructor.avatar_url} alt={instructor.full_name} className="w-full h-full object-cover" />
            : <span className="text-3xl font-bold text-smoke">{instructor.full_name?.charAt(0) || 'I'}</span>
          }
        </div>
        <h1 className="font-serif text-4xl font-normal tracking-wide text-linen">{instructor.full_name}</h1>

        {/* Meta row: years experience + Instagram */}
        {(instructor.years_experience || instructor.instagram_handle) && (
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-smoke">
            {instructor.years_experience && (
              <span>{instructor.years_experience} yrs experience</span>
            )}
            {instructor.years_experience && instructor.instagram_handle && (
              <span className="text-smoke/40">·</span>
            )}
            {instructor.instagram_handle && (
              <a
                href={`https://instagram.com/${instructor.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-linen transition-colors"
              >
                @{instructor.instagram_handle}
              </a>
            )}
          </div>
        )}

        {(() => {
          const bio = instructor.bio || "Welcome to my schedule! View upcoming classes and book your spot below.";
          const isLong = bio.length > 200;
          return (
            <p className="text-smoke max-w-md mx-auto mt-3 text-sm leading-relaxed">
              {isLong && !bioExpanded ? truncateBio(bio, 200) : bio}
              {isLong && (
                <>
                  {' '}
                  <button
                    type="button"
                    onClick={() => setBioExpanded(!bioExpanded)}
                    className="text-clay font-medium hover:underline"
                  >
                    {bioExpanded ? 'Show less' : 'Read more'}
                  </button>
                </>
              )}
            </p>
          );
        })()}

        {/* Certifications */}
        {instructor.certifications?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md mx-auto">
            {instructor.certifications.map(cert => (
              <span key={cert} className="bg-bark/60 text-linen text-xs font-medium px-3 py-1 rounded-full border border-white/10">
                {cert}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* FOLLOW WIDGET */}
      <div className="bg-linen border-b border-sand py-6 px-4">
        <div className="max-w-md mx-auto">
          {followState === 'done' ? (
            <div className="bg-sage-light border border-sage/30 rounded-xl px-5 py-4 text-center">
              <p className="text-sage font-semibold text-sm">Check your inbox to confirm your follow.</p>
              <p className="text-stone text-xs mt-1">You'll get notified when {instructor.full_name?.split(' ')[0]} adds new classes.</p>
            </div>
          ) : followState === 'confirmed' ? (
            <div className="bg-sage-light border border-sage/30 rounded-xl px-5 py-4 text-center">
              <p className="text-sage font-semibold text-sm">You're now following {instructor.full_name?.split(' ')[0]}!</p>
              <p className="text-stone text-xs mt-1">You'll get notified when {instructor.full_name?.split(' ')[0]} adds new classes.</p>
            </div>
          ) : followState === 'already' ? (
            <div className="bg-sage-light border border-sage/30 rounded-xl px-5 py-4 text-center">
              <p className="text-sage font-semibold text-sm">You're already following {instructor.full_name?.split(' ')[0]}.</p>
            </div>
          ) : (
            <form onSubmit={handleFollow} className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-stone uppercase tracking-wider mb-2">
                  Follow {instructor.full_name?.split(' ')[0]} — get notified when new classes are added
                </label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={followEmail}
                  onChange={e => setFollowEmail(e.target.value)}
                  className="w-full border border-sand rounded-lg px-4 py-2.5 text-sm outline-none focus:border-clay bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={followState === 'submitting'}
                className="sm:self-end bg-clay text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-clay-dark active:scale-95 transition-all disabled:opacity-60 whitespace-nowrap"
              >
                {followState === 'submitting' ? 'Sending...' : 'Follow'}
              </button>
            </form>
          )}
          {followState === 'error' && (
            <p className="text-red-600 text-xs mt-2 text-center">Something went wrong. Please try again.</p>
          )}

          {/* Unfollow section */}
          {unfollowState === 'done' ? (
            <p className="text-stone text-xs mt-3 text-center">You've been unfollowed from {instructor.full_name?.split(' ')[0]}.</p>
          ) : (
            <div className="mt-3 text-center">
              {!showUnfollow ? (
                <button
                  type="button"
                  onClick={() => setShowUnfollow(true)}
                  className="text-xs text-stone hover:text-bark underline decoration-dotted transition-colors"
                >
                  Already following? Unfollow
                </button>
              ) : (
                <form onSubmit={handleUnfollow} className="flex gap-2 justify-center mt-1">
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={unfollowEmail}
                    onChange={e => setUnfollowEmail(e.target.value)}
                    className="border border-sand rounded-lg px-3 py-2 text-xs outline-none focus:border-stone bg-white w-48"
                  />
                  <button
                    type="submit"
                    disabled={unfollowState === 'submitting'}
                    className="text-xs text-stone border border-sand bg-white px-3 py-2 rounded-lg hover:bg-sand/40 transition-colors disabled:opacity-60 whitespace-nowrap"
                  >
                    {unfollowState === 'submitting' ? 'Removing…' : 'Unfollow'}
                  </button>
                </form>
              )}
              {unfollowState === 'error' && (
                <p className="text-red-600 text-xs mt-1">Something went wrong. Please try again.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SCHEDULE FEED */}
      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <h2 className="text-xl font-bold mb-6">Upcoming Classes</h2>

        {classes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-sand p-10 text-center text-stone">
            No upcoming classes scheduled right now.
          </div>
        ) : (
          (() => {
            const tz = instructor.timezone || 'America/Vancouver';
            const { thisWeek, nextWeek, later } = groupClassesByWeek(classes, tz);

            return (
              <div className="space-y-8">
                {thisWeek.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-stone uppercase tracking-wider">This Week</h3>
                    {thisWeek.map((c) => (
                      <ClassCard key={c.id} c={c} tz={tz} handleBookClick={handleBookClick} />
                    ))}
                  </div>
                )}

                {nextWeek.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-stone uppercase tracking-wider">Next Week</h3>
                    {nextWeek.map((c) => (
                      <ClassCard key={c.id} c={c} tz={tz} handleBookClick={handleBookClick} />
                    ))}
                  </div>
                )}

                {later.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-stone uppercase tracking-wider">Later</h3>
                    {showLater ? (
                      later.map((c) => (
                        <ClassCard key={c.id} c={c} tz={tz} handleBookClick={handleBookClick} />
                      ))
                    ) : (
                      <button
                        onClick={() => setShowLater(true)}
                        className="w-full bg-white border border-sand text-stone font-semibold text-sm py-3 rounded-lg hover:bg-clay-light hover:text-bark transition-colors"
                      >
                        Show {later.length} more class{later.length !== 1 ? 'es' : ''}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })()
        )}
      </main>

      {/* VIRAL FOOTER */}
      <footer className="text-center pb-8 px-4">
        <Link href="/" className="text-xs text-stone hover:text-clay transition-colors">
          Build your own schedule page — Instruktor.ca
        </Link>
      </footer>

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

function ClassCard({ c, tz, handleBookClick }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-sand p-5 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center transition-all">
      <div className="mb-4 sm:mb-0">
        <div className="flex items-center flex-wrap gap-2 mb-1.5">
          <h3 className="text-lg font-bold leading-tight">{c.class_name}</h3>
          <span className="text-xs font-medium bg-clay-light px-2 py-0.5 rounded border border-sand">
            {c.class_categories?.name || c.category_other || 'Uncategorized'}
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
            timeZone: tz
          })}
          <span className="mx-1">•</span>
          {new Date(c.date_time).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit',
            timeZone: tz
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
  );
}

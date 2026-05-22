'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { ArrowUpRight, Check, Camera, Globe } from 'lucide-react';

export default function InstructorProfile({ params }) {
  // 1. Unwrapping our dynamic variable from the URL path parameter
  const unwrappedParams = React.use(params);
  const instructorId = unwrappedParams.instructorId;

  const [profile, setProfile] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInstructorData() {
      try {
        setLoading(true);

        // Fetch instructor details
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', instructorId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch all calendar rows linked to this profile ID
        const { data: slotsData, error: slotsError } = await supabase
          .from('slots')
          .select('*')
          .eq('profile_id', instructorId);

        if (slotsError) throw slotsError;

        // Sort rows by sequential weekday priority
        const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const sortedSlots = (slotsData || []).sort((a, b) => daysOrder.indexOf(a.day_of_week) - daysOrder.indexOf(b.day_of_week));
        
        setSlots(sortedSlots);
      } catch (err) {
        console.error("Error loading profile dataset:", err.message);
      } finally {
        setLoading(false);
      }
    }

    if (instructorId) {
      fetchInstructorData();
    }
  }, [instructorId]);

  // Color helper assignments matching studio names
  function getStudioStyles(studioName) {
    const name = studioName.toLowerCase();
    if (name.includes('altea')) return 'bg-orange-100 text-amber-900 border-orange-200';
    if (name.includes('soul')) return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    if (name.includes('house') || name.includes('concept')) return 'bg-blue-100 text-blue-900 border-blue-200';
    return 'bg-neutral-100 text-neutral-800 border-neutral-200';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121413] flex items-center justify-center text-[#EFECE6] text-sm tracking-widest font-light">
        LOADING PLATFORM...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#121413] flex flex-col items-center justify-center text-[#EFECE6] p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-sm text-neutral-400">This profile endpoint hasn't been configured or claimed yet.</p>
      </div>
    );
  }

  let currentDayGroup = "";

  return (
    <div className="min-h-screen bg-[#121413] text-[#242725] flex flex-col items-center justify-start p-4 md:p-8">
      <div className="w-full max-w-md bg-[#F6F5F2] rounded-[40px] shadow-2xl border-[8px] border-[#242725] overflow-hidden flex flex-col min-h-[780px]">
        
        {/* Profile Details Template Card */}
        <div className="bg-[#EFECE6] p-6 pt-8 text-center rounded-b-[32px] border-b border-[#EFECE6] shadow-sm shrink-0">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#8FA491] to-[#C89D7C] p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-[#EFECE6] flex items-center justify-center overflow-hidden">
                <span className="text-xl font-semibold text-[#576859]">
                  {profile.full_name ? profile.full_name.split(' ').map(n => n[0]).join('') : 'HW'}
                </span>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 bg-[#242725] text-white rounded-full p-1 border-2 border-[#EFECE6]">
              <Check className="w-3 h-3 text-[#8FA491]" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold tracking-tight text-[#242725]">{profile.full_name}</h2>
          <p className="text-xs text-[#576859] font-medium uppercase tracking-wider mt-0.5">Verified Instructor</p>
          <p className="text-sm text-neutral-600 mt-2 max-w-xs mx-auto leading-relaxed">{profile.bio}</p>
          
          <div className="flex justify-center gap-3 mt-4 text-[#576859]">
            {profile.instagram_handle && (
              <a href={`https://instagram.com/${profile.instagram_handle}`} target="_blank" rel="noreferrer" className="p-1.5 bg-[#F6F5F2]/60 hover:bg-[#F6F5F2] rounded-full transition-colors">
<Camera className="w-4 h-4" />              </a>
            )}
            <a href="#" className="p-1.5 bg-[#F6F5F2]/60 hover:bg-[#F6F5F2] rounded-full transition-colors">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Dynamic Class Grid Rendering */}
        <div className="p-5 flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-500">Weekly Classes</h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#8FA491]/20 text-[#576859] rounded-full">Live Tracker</span>
          </div>

          <div className="space-y-4">
            {slots.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-xs italic border border-dashed border-neutral-300 rounded-2xl">
                No class schedule blocks posted for this week.
              </div>
            ) : (
              slots.map((slot) => {
                const showHeader = slot.day_of_week !== currentDayGroup;
                if (showHeader) currentDayGroup = slot.day_of_week;

                return (
                  <div key={slot.id} className="space-y-2">
                    {showHeader && (
                      <div className="text-xs font-bold uppercase tracking-wider text-[#576859] mt-4 mb-1 flex items-center gap-2">
                        <span>{slot.day_of_week}</span>
                        <div className="h-[1px] bg-neutral-300 flex-1"></div>
                      </div>
                    )}
                    <a 
                      href={slot.booking_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="group bg-white hover:bg-[#EFECE6] border border-neutral-200/60 p-3.5 rounded-2xl shadow-sm transition-all duration-200 flex items-center justify-between active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-bold text-[#242725]">{slot.time_slot}</div>
                        <div className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transform transition-colors duration-200 ${getStudioStyles(slot.studio_name)}`}>
                          @ {slot.studio_name}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#F6F5F2] flex items-center justify-center text-[#576859] group-hover:bg-[#242725] group-hover:text-white transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
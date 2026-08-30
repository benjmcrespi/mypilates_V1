import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { inferCategoryId } from '@/lib/categories';
import { parseIcsEvents, isBlockedIcsResponse } from '@/lib/icsParser';

export async function POST(req) {
  try {
    const {
      calendarUrl,
      instructorId,
      studioId,
      studioName,
      defaultBookingUrl,
      defaultCategoryId,
      defaultCategoryOther,
      defaultBookingType,
      defaultBookingNote,
    } = await req.json();

    const authHeader = req.headers.get('Authorization');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: categories } = await supabase
      .from('class_categories')
      .select('*')
      .eq('active', true);

    const response = await fetch(calendarUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/calendar'
      }
    });

    const icsText = await response.text();

    if (isBlockedIcsResponse(icsText)) {
      return NextResponse.json({ error: "Mindbody firewall blocked the request. Try generating a new link in your app." }, { status: 400 });
    }

    const now = new Date();
    const draftClasses = parseIcsEvents(icsText)
      .filter(event => event.start && event.start >= now)
      .map(event => {
        const categoryId = inferCategoryId(event.summary, categories || [], defaultCategoryId || null);
        return {
          instructor_id: instructorId,
          studio_id: studioId || null,
          class_name: event.summary,
          category_id: categoryId,
          category_other: !categoryId ? (defaultCategoryOther || null) : null,
          date_time: event.start.toISOString(),
          studio_name: studioName || event.location || 'Studio TBD',
          external_uid: event.uid || `auto-${Date.now()}-${Math.random()}`,
          status: 'draft',
          booking_url: event.url || defaultBookingUrl || '', // Prefer native ICS URL over studio default
          booking_type: defaultBookingType || null,
          booking_note: defaultBookingNote || null,
          location_url: '',
        };
      });

    if (draftClasses.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No new future classes found.' });
    }

    const { error } = await supabase
      .from('classes')
      .upsert(draftClasses, { onConflict: 'external_uid', ignoreDuplicates: true });

    if (error) throw error;

    return NextResponse.json({ success: true, count: draftClasses.length });

  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

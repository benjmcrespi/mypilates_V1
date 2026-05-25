import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper to translate ICS time (e.g. 20260524T153000) into standard Javascript Time
function parseICSDate(icsDate) {
  if (!icsDate) return null;
  const str = icsDate.replace(/[-:]/g, ''); 
  if (str.length >= 15) {
    const year = str.substring(0, 4);
    const month = str.substring(4, 6);
    const day = str.substring(6, 8);
    const hour = str.substring(9, 11);
    const min = str.substring(11, 13);
    const sec = str.substring(13, 15);
    const isUTC = str.endsWith('Z');
    return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}${isUTC ? 'Z' : ''}`);
  }
  return new Date(); 
}

export async function POST(req) {
  try {
    const { calendarUrl, instructorId } = await req.json();
    const authHeader = req.headers.get('Authorization');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: authHeader } } }
    );

    // 1. Fetch the data disguised as a normal browser
    const response = await fetch(calendarUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/calendar'
      }
    });

    const icsText = await response.text();

    // 2. Safety Catch: If Mindbody's firewall blocks us, return a clean JSON error, NOT an HTML crash
    if (icsText.trim().toUpperCase().startsWith('<!DOCTYPE') || icsText.trim().toUpperCase().startsWith('<HTML')) {
      return NextResponse.json({ error: "Mindbody firewall blocked the request. Try generating a new link in your app." }, { status: 400 });
    }

    // 3. Custom Zero-Dependency Parser
    const lines = icsText.split(/\r?\n/);
    const draftClasses = [];
    let inEvent = false;
    let currentEvent = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('BEGIN:VEVENT')) {
        inEvent = true;
        currentEvent = {};
      } else if (line.startsWith('END:VEVENT')) {
        inEvent = false;
        
        if (currentEvent.start) {
           const eventDate = parseICSDate(currentEvent.start);
           // Only keep classes happening in the future
           if (eventDate >= new Date()) {
              draftClasses.push({
                instructor_id: instructorId,
                class_name: currentEvent.summary || 'Imported Class',
                date_time: eventDate.toISOString(),
                studio_name: currentEvent.location || 'Studio TBD',
                external_uid: currentEvent.uid || `auto-${Date.now()}-${Math.random()}`,
                status: 'draft',
                class_type: 'TBD',
                location_url: '',
                booking_url: ''
              });
           }
        }
      } else if (inEvent) {
         if (line.startsWith('SUMMARY:')) currentEvent.summary = line.substring(8).trim();
else if (line.startsWith('LOCATION:')) {
         currentEvent.location = line.substring(9).trim().replace(/\\,/g, ',').replace(/\\n/gi, ', ');
      }         else if (line.startsWith('UID:')) currentEvent.uid = line.substring(4).trim();
         else if (line.startsWith('DTSTART')) {
            const parts = line.split(':');
            if (parts.length > 1) currentEvent.start = parts[1].trim();
         }
      }
    }

    if (draftClasses.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No new future classes found.' });
    }

    // 4. Push to Supabase
    const { error } = await supabase
      .from('classes')
      .upsert(draftClasses, { onConflict: 'external_uid', ignoreDuplicates: true });

    if (error) throw error;

    return NextResponse.json({ success: true, count: draftClasses.length });

  } catch (error) {
    console.error("Sync Error:", error);
    // Force a JSON return on fatal errors to prevent the <!DOCTYPE crash
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
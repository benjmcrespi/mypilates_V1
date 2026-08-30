import { NextResponse } from 'next/server';
import { parseIcsEvents, isBlockedIcsResponse } from '@/lib/icsParser';

// Groups raw events by class name + weekday + time-of-day so a weekly class that a
// studio's feed expands into many individual VEVENTs collapses back into one entry
// for review, instead of flooding the Add a Studio checklist with duplicates.
function groupEvents(events, timeZone) {
  const dayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone });
  const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone });
  const keyFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone });

  const groups = new Map();
  for (const event of events) {
    const key = `${event.summary.trim().toLowerCase()}|${keyFmt.format(event.start)}`;
    if (!groups.has(key)) {
      groups.set(key, {
        className: event.summary,
        representativeDateTime: event.start.toISOString(),
        dayLabel: dayFmt.format(event.start),
        timeLabel: timeFmt.format(event.start),
        uid: event.uid,
        url: event.url,
        occurrenceDateTimes: [],
      });
    }
    groups.get(key).occurrenceDateTimes.push(event.start.toISOString());
  }

  return Array.from(groups.values())
    .map(g => ({ ...g, recurring: g.occurrenceDateTimes.length > 1 }))
    .sort((a, b) => new Date(a.representativeDateTime) - new Date(b.representativeDateTime));
}

export async function POST(req) {
  try {
    const { calendarUrl, timeZone } = await req.json();
    const tz = timeZone || 'America/Vancouver';

    if (!calendarUrl) {
      return NextResponse.json({ classes: [], locationGuess: null });
    }

    const response = await fetch(calendarUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/calendar',
      },
    });
    const icsText = await response.text();

    if (isBlockedIcsResponse(icsText)) {
      return NextResponse.json({ classes: [], locationGuess: null });
    }

    const now = new Date();
    const events = parseIcsEvents(icsText).filter(event => event.start && event.start >= now);

    if (events.length === 0) {
      return NextResponse.json({ classes: [], locationGuess: null });
    }

    const locationGuess = events.find(e => e.location)?.location || null;

    return NextResponse.json({ classes: groupEvents(events, tz), locationGuess });
  } catch (error) {
    // A dead or unreadable link degrades to manual entry, not an error state -
    // the Add a Studio screen never shows an error modal for a bad paste.
    console.error('Parse ICS error:', error);
    return NextResponse.json({ classes: [], locationGuess: null });
  }
}

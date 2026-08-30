// Shared ICS text parsing used by /api/sync (pulls + writes drafts) and
// /api/parse-ics (previews classes for the Add a Studio screen without writing).

export function parseICSDate(icsDate) {
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

// A Mindbody firewall block (or any non-calendar response) comes back as an HTML page.
export function isBlockedIcsResponse(text) {
  const trimmed = text.trim().toUpperCase();
  return trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<HTML');
}

// Parses raw .ics text into a flat list of { summary, location, uid, url, start (Date) }
// events, one per VEVENT block. Does not expand RRULE - most studio platforms already
// emit one VEVENT per future occurrence rather than a single recurring master event.
export function parseIcsEvents(icsText) {
  const lines = icsText.split(/\r?\n/);
  const events = [];
  let inEvent = false;
  let currentEvent = {};

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      currentEvent = {};
    } else if (line.startsWith('END:VEVENT')) {
      inEvent = false;
      if (currentEvent.start) {
        events.push({
          summary: currentEvent.summary || 'Imported Class',
          location: currentEvent.location || '',
          uid: currentEvent.uid || null,
          url: currentEvent.url || '',
          start: parseICSDate(currentEvent.start),
        });
      }
    } else if (inEvent) {
      if (line.startsWith('SUMMARY:')) currentEvent.summary = line.substring(8).trim();
      else if (line.startsWith('LOCATION:')) currentEvent.location = line.substring(9).trim().replace(/\\,/g, ',').replace(/\\n/gi, ', ');
      else if (line.startsWith('UID:')) currentEvent.uid = line.substring(4).trim();
      else if (line.startsWith('URL:')) currentEvent.url = line.substring(4).trim();
      else if (line.startsWith('DTSTART')) {
        const parts = line.split(':');
        if (parts.length > 1) currentEvent.start = parts[1].trim();
      }
    }
  }

  return events;
}

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const BATCH_THRESHOLD = 5;
const HOLD_MINUTES = 30;
const RATE_LIMIT_HOURS = 24;

export async function GET(request) {
  // Vercel automatically sends CRON_SECRET as a Bearer token for cron-triggered requests
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const holdCutoff = new Date(now.getTime() - HOLD_MINUTES * 60 * 1000).toISOString();
  const rateLimitCutoff = new Date(now.getTime() - RATE_LIMIT_HOURS * 60 * 60 * 1000).toISOString();

  // Fetch all instructors with pending classes
  const { data: queue, error: queueError } = await supabaseAdmin
    .from('notification_queue')
    .select('instructor_id, pending_class_ids, last_queued_at')
    .not('pending_class_ids', 'eq', '{}');

  if (queueError) {
    console.error('Queue fetch error:', queueError);
    return Response.json({ error: 'Queue fetch failed' }, { status: 500 });
  }

  if (!queue?.length) return Response.json({ processed: 0 });

  let processed = 0;
  let held = 0;

  for (const entry of queue) {
    const { instructor_id, pending_class_ids, last_queued_at } = entry;

    // Trigger condition: batch has 5+ classes OR last publish was 30+ min ago
    const triggerReady =
      pending_class_ids.length >= BATCH_THRESHOLD ||
      last_queued_at <= holdCutoff;

    if (!triggerReady) {
      held++;
      continue;
    }

    // Rate limit: check 24h window on the instructor's profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, handle, timezone, last_notification_sent_at')
      .eq('id', instructor_id)
      .single();

    if (!profile) continue;

    const withinRateLimit =
      profile.last_notification_sent_at &&
      profile.last_notification_sent_at > rateLimitCutoff;

    if (withinRateLimit) {
      held++;
      continue;
    }

    // Snapshot and clear the queue atomically before sending
    await supabaseAdmin
      .from('notification_queue')
      .delete()
      .eq('instructor_id', instructor_id);

    // Fetch the actual class details (future classes only)
    const { data: classes } = await supabaseAdmin
      .from('classes')
      .select('class_name, date_time, studio_name')
      .in('id', pending_class_ids)
      .gte('date_time', now.toISOString())
      .order('date_time', { ascending: true });

    if (!classes?.length) continue;

    // Fetch confirmed followers
    const { data: followers } = await supabaseAdmin
      .from('followers')
      .select('email, unsubscribe_token')
      .eq('instructor_id', instructor_id)
      .eq('confirmed', true);

    if (!followers?.length) continue;

    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const tz = profile.timezone || 'America/Vancouver';

    const emails = followers.map(f => ({
      from: 'Instruktor <noreply@instruktor.ca>',
      to: f.email,
      subject: `${profile.full_name} just added new classes`,
      html: digestEmailHtml({
        profile, classes, baseUrl, tz,
        unsubscribeUrl: `${baseUrl}/unfollow?token=${f.unsubscribe_token}`,
      }),
    }));

    try {
      // Resend batch API handles up to 100 per call
      for (let i = 0; i < emails.length; i += 100) {
        await resend.batch.send(emails.slice(i, i + 100));
      }
    } catch (err) {
      console.error(`Email send failed for instructor ${instructor_id}:`, err);
      // Re-queue the classes so they aren't lost
      await supabaseAdmin.from('notification_queue').upsert({
        instructor_id,
        pending_class_ids,
        last_queued_at,
      }, { onConflict: 'instructor_id' });
      continue;
    }

    // Stamp rate-limit timestamp only after successful send
    await supabaseAdmin
      .from('profiles')
      .update({ last_notification_sent_at: now.toISOString() })
      .eq('id', instructor_id);

    processed++;
  }

  return Response.json({ processed, held });
}

function digestEmailHtml({ profile, classes, baseUrl, tz, unsubscribeUrl }) {
  const classRows = classes.map(c => {
    const date = new Date(c.date_time).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', timeZone: tz,
    });
    const time = new Date(c.date_time).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', timeZone: tz,
    });
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #E4CDB8;">
          <p style="margin:0 0 2px;font-weight:700;color:#2C1810;font-size:15px;">${c.class_name}</p>
          <p style="margin:0;color:#9B8070;font-size:13px;">${date} · ${time}${c.studio_name ? ` · ${c.studio_name}` : ''}</p>
        </td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F3EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EE;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

        <tr><td style="background:#1A0E07;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          <p style="margin:0 0 4px;color:#BFA090;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Instruktor</p>
          <h1 style="margin:0;color:#F7F3EE;font-size:22px;font-weight:700;">${profile.full_name} just added new classes</h1>
        </td></tr>

        <tr><td style="background:#ffffff;padding:32px;border-left:1px solid #E4CDB8;border-right:1px solid #E4CDB8;">
          <p style="margin:0 0 20px;color:#9B8070;font-size:14px;">Here's what's new on the schedule:</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${classRows}
          </table>
          <a href="${baseUrl}/${profile.handle}" style="display:block;margin-top:28px;background:#C4683A;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:16px 24px;border-radius:12px;text-align:center;">
            Book your spot
          </a>
        </td></tr>

        <tr><td style="background:#F7F3EE;border:1px solid #E4CDB8;border-top:none;border-radius:0 0 16px 16px;padding:20px;text-align:center;">
          <p style="margin:0;color:#9B8070;font-size:12px;line-height:1.5;">
            You're following ${profile.full_name} on Instruktor.<br>
            <a href="${baseUrl}/${profile.handle}" style="color:#C4683A;text-decoration:none;">View full schedule</a>
            &nbsp;·&nbsp;
            <a href="${unsubscribeUrl}" style="color:#9B8070;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

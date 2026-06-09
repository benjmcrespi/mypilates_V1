import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  // Verify instructor auth
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { classIds } = await request.json();
  if (!classIds?.length) return Response.json({ sent: 0 });

  // Get the instructor's profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, handle, timezone')
    .eq('id', user.id)
    .single();

  if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

  // Get the newly published classes
  const { data: newClasses } = await supabaseAdmin
    .from('classes')
    .select('class_name, class_type, date_time, studio_name')
    .in('id', classIds)
    .gte('date_time', new Date().toISOString())
    .order('date_time', { ascending: true });

  if (!newClasses?.length) return Response.json({ sent: 0 });

  // Get confirmed followers
  const { data: followers } = await supabaseAdmin
    .from('followers')
    .select('email')
    .eq('instructor_id', user.id)
    .eq('confirmed', true);

  if (!followers?.length) return Response.json({ sent: 0 });

  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const tz = profile.timezone || 'America/Vancouver';

  // Resend batch API — max 100 per batch
  const emails = followers.map(f => ({
    from: 'Instruktor <onboarding@resend.dev>',
    to: f.email,
    subject: `New classes from ${profile.full_name}`,
    html: newClassesEmailHtml({ profile, newClasses, baseUrl, tz }),
  }));

  try {
    await resend.batch.send(emails);
  } catch (err) {
    console.error('Notify followers email failed:', err);
    return Response.json({ error: 'Email send failed' }, { status: 500 });
  }

  return Response.json({ sent: followers.length });
}

function newClassesEmailHtml({ profile, newClasses, baseUrl, tz }) {
  const classRows = newClasses.map(c => {
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
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

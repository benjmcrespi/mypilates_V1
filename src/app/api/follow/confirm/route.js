import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Resend } from 'resend';
import { redirect } from 'next/navigation';

const resend = new Resend(process.env.RESEND_API_KEY);

const MILESTONES = [1, 10, 25, 50];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const handle = searchParams.get('handle');

  if (!id || !handle) {
    redirect('/');
  }

  // Confirm the follower
  const { data: follower, error } = await supabaseAdmin
    .from('followers')
    .update({ confirmed: true })
    .eq('id', id)
    .select('instructor_id, confirmed')
    .single();

  if (error || !follower) {
    redirect(`/${handle}?follow=error`);
  }

  // Count confirmed followers for milestone check
  const { count } = await supabaseAdmin
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('instructor_id', follower.instructor_id)
    .eq('confirmed', true);

  if (MILESTONES.includes(count)) {
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, handle')
        .eq('id', follower.instructor_id)
        .single();

      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(follower.instructor_id);

      if (user?.email && profile) {
        const url = new URL(request.url);
        const baseUrl = `${url.protocol}//${url.host}`;
        await resend.emails.send({
          from: 'Instruktor <onboarding@resend.dev>',
          to: user.email,
          subject: `You hit ${count} follower${count > 1 ? 's' : ''} on Instruktor!`,
          html: milestoneEmailHtml({ count, profile, baseUrl }),
        });
      }
    } catch (err) {
      console.error('Milestone email failed:', err);
    }
  }

  redirect(`/${handle}?follow=confirmed`);
}

function milestoneEmailHtml({ count, profile, baseUrl }) {
  const messages = {
    1:  { headline: 'Your first follower!', body: 'Someone just confirmed they want to be notified when you add new classes. Your professional presence is working.' },
    10: { headline: '10 followers!', body: 'Ten people are now following your schedule. Keep publishing consistently — this is how you build a portable following.' },
    25: { headline: '25 followers!', body: 'Twenty-five people trust you enough to hand over their email. That\'s a real audience you own.' },
    50: { headline: '50 followers!', body: 'Fifty people following your schedule. You\'re building something real here.' },
  };
  const { headline, body } = messages[count] || { headline: `${count} followers!`, body: 'Your following keeps growing.' };

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F3EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EE;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

        <tr><td style="background:#1A0E07;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          <p style="margin:0 0 4px;color:#BFA090;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Instruktor</p>
          <h1 style="margin:0;color:#F7F3EE;font-size:28px;font-weight:700;">${headline}</h1>
        </td></tr>

        <tr><td style="background:#ffffff;padding:32px;border-left:1px solid #E4CDB8;border-right:1px solid #E4CDB8;">
          <p style="margin:0 0 16px;color:#2C1810;font-size:16px;line-height:1.6;">${body}</p>
          <p style="margin:0 0 28px;color:#9B8070;font-size:14px;line-height:1.6;">
            They'll get notified automatically every time you publish new classes.
          </p>
          <a href="${baseUrl}/${profile.handle}" style="display:block;background:#C4683A;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:16px 24px;border-radius:12px;text-align:center;">
            View your schedule
          </a>
        </td></tr>

        <tr><td style="background:#F7F3EE;border:1px solid #E4CDB8;border-top:none;border-radius:0 0 16px 16px;padding:20px;text-align:center;">
          <p style="margin:0;color:#9B8070;font-size:12px;">instruktor.ca/${profile.handle}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

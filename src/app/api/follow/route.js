import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const { email, instructor_id, instructor_name, handle } = await request.json();

  if (!email || !instructor_id || !instructor_name || !handle) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const emailLower = email.toLowerCase().trim();

  // Insert follower — ignore if already following
  const { data: follower, error } = await supabaseAdmin
    .from('followers')
    .insert({ email: emailLower, instructor_id })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      // Already following — don't re-send confirmation, just acknowledge
      return Response.json({ status: 'already_following' });
    }
    console.error('Follow insert error:', error);
    return Response.json({ error: 'Could not save follow' }, { status: 500 });
  }

  // Build confirmation URL from request origin
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const confirmUrl = `${baseUrl}/api/follow/confirm?id=${follower.id}&handle=${handle}`;

  // Send confirmation email
  try {
    await resend.emails.send({
      from: 'Instruktor <onboarding@resend.dev>',
      to: emailLower,
      subject: `Confirm: Follow ${instructor_name} on Instruktor`,
      html: confirmEmailHtml({ instructor_name, confirmUrl, handle, baseUrl }),
    });
  } catch (emailError) {
    console.error('Confirmation email failed:', emailError);
    // Don't fail the whole request — follower is saved, email is best-effort
  }

  return Response.json({ status: 'pending_confirmation' });
}

function confirmEmailHtml({ instructor_name, confirmUrl, handle, baseUrl }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F3EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EE;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

        <!-- Header -->
        <tr><td style="background:#1A0E07;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          <p style="margin:0 0 4px;color:#BFA090;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Instruktor</p>
          <h1 style="margin:0;color:#F7F3EE;font-size:24px;font-weight:700;">Follow confirmed?</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px;border-left:1px solid #E4CDB8;border-right:1px solid #E4CDB8;">
          <p style="margin:0 0 16px;color:#2C1810;font-size:16px;line-height:1.6;">
            You asked to follow <strong>${instructor_name}</strong>'s schedule on Instruktor.
          </p>
          <p style="margin:0 0 28px;color:#9B8070;font-size:14px;line-height:1.6;">
            Click the button below to confirm. You'll get an email whenever ${instructor_name} adds new classes.
          </p>
          <a href="${confirmUrl}" style="display:block;background:#C4683A;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:16px 24px;border-radius:12px;text-align:center;">
            Yes, follow ${instructor_name}
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#F7F3EE;border:1px solid #E4CDB8;border-top:none;border-radius:0 0 16px 16px;padding:20px;text-align:center;">
          <p style="margin:0;color:#9B8070;font-size:12px;line-height:1.5;">
            If you didn't request this, you can safely ignore it.<br>
            <a href="${baseUrl}/${handle}" style="color:#C4683A;text-decoration:none;">View ${instructor_name}'s schedule</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  const body = await request.json();

  // Token-based unsubscribe (from email link via /unfollow page)
  if (body.token) {
    const { data: follower, error } = await supabaseAdmin
      .from('followers')
      .select('id, profiles(full_name)')
      .eq('unsubscribe_token', body.token)
      .single();

    if (error || !follower) {
      return Response.json({ error: 'Invalid or expired unsubscribe link.' }, { status: 404 });
    }

    await supabaseAdmin.from('followers').delete().eq('id', follower.id);

    return Response.json({ instructor_name: follower.profiles?.full_name || 'this instructor' });
  }

  // Email + instructor_id unsubscribe (from student-facing page form)
  if (body.email && body.instructor_id) {
    const emailLower = body.email.toLowerCase().trim();

    const { error } = await supabaseAdmin
      .from('followers')
      .delete()
      .eq('email', emailLower)
      .eq('instructor_id', body.instructor_id);

    if (error) {
      return Response.json({ error: 'Could not process unfollow.' }, { status: 500 });
    }

    return Response.json({ success: true });
  }

  return Response.json({ error: 'Missing token or email.' }, { status: 400 });
}

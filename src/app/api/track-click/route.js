import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  const { instructor_id, class_id, follower_email, source } = await request.json();

  if (!instructor_id || !class_id) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('analytics_events')
    .insert({
      event_type: 'book_spot_click',
      instructor_id,
      class_id,
      follower_email: follower_email || null,
      source: source || null,
    });

  if (error) {
    console.error('Track click insert error:', error);
    return Response.json({ error: 'Could not log click' }, { status: 500 });
  }

  return Response.json({ status: 'ok' });
}

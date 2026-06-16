import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
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
  if (!classIds?.length) return Response.json({ queued: 0 });

  // Merge incoming class IDs with any already pending for this instructor
  const { data: existing } = await supabaseAdmin
    .from('notification_queue')
    .select('pending_class_ids')
    .eq('instructor_id', user.id)
    .single();

  const merged = existing
    ? [...new Set([...existing.pending_class_ids, ...classIds])]
    : classIds;

  await supabaseAdmin
    .from('notification_queue')
    .upsert(
      { instructor_id: user.id, pending_class_ids: merged, last_queued_at: new Date().toISOString() },
      { onConflict: 'instructor_id' }
    );

  return Response.json({ queued: merged.length });
}

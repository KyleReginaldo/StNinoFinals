import { getActor } from '@/lib/audit';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';


// GET /api/admin/activity-logs?from=YYYY-MM-DD&to=YYYY-MM-DD&table=users&q=name&page=1
// Admin only: the log contains IP addresses and before/after values.
export async function GET(request: NextRequest) {
  const db = getSupabaseAdmin() as any; // activity_logs isn't in the generated types' select helpers we use
  const actor = await getActor();
  if (!actor?.id) {
    return NextResponse.json({ success: false, error: 'Please sign in again.' }, { status: 401 });
  }
  const { data: me } = await db.from('users').select('role').eq('id', actor.id).maybeSingle();
  if (me?.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admins only.' }, { status: 403 });
  }

  const p = new URL(request.url).searchParams;
  const page = Math.max(1, parseInt(p.get('page') ?? '1', 10) || 1);
  const PAGE_SIZE = Math.min(200, Math.max(10, parseInt(p.get('pageSize') ?? '50', 10) || 50));
  let query = db
    .from('activity_logs')
    .select('id, created_at, action, table_name, record_id, ip_address, user_agent, user_id, old_values, new_values', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  // Dates are school-local (Philippines, UTC+8)
  const from = p.get('from');
  const to = p.get('to');
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) query = query.gte('created_at', `${from}T00:00:00+08:00`);
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) query = query.lte('created_at', `${to}T23:59:59.999+08:00`);
  const table = p.get('table');
  if (table && /^[a-z_]+$/.test(table)) query = query.eq('table_name', table);

  const q = p.get('q')?.trim();
  if (q && q.replace(/[%,()"\\*_\s]/g, '')) {
    // Characters with meaning in PostgREST filters / LIKE are dropped
    const term = q.replace(/[%,()"\\*_]/g, ' ').trim();
    const { data: matches } = await db
      .from('users')
      .select('id')
      .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`)
      .limit(200);
    const ids = (matches ?? []).map((u: { id: string }) => u.id);
    if (!ids.length) return NextResponse.json({ success: true, logs: [], total: 0, pageSize: PAGE_SIZE });
    query = query.in('user_id', ids);
  }

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const actorIds = [...new Set((data ?? []).map((r: any) => r.user_id).filter(Boolean))];
  const { data: people } = actorIds.length
    ? await db.from('users').select('id, first_name, last_name, role').in('id', actorIds)
    : { data: [] };
  const byId = new Map((people ?? []).map((u: any) => [u.id, u]));

  const logs = (data ?? []).map((r: any) => {
    const u: any = r.user_id ? byId.get(r.user_id) : null;
    return {
      ...r,
      actor: u ? { name: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(), role: u.role } : null,
    };
  });
  return NextResponse.json({ success: true, logs, total: count ?? 0, pageSize: PAGE_SIZE });
}

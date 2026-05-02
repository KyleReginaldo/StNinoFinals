import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const admin = getSupabaseAdmin();

    const startISO = startDate
      ? `${startDate}T00:00:00.000Z`
      : (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0] + 'T00:00:00.000Z'; })();
    const endISO = endDate
      ? `${endDate}T23:59:59.999Z`
      : new Date().toISOString().split('T')[0] + 'T23:59:59.999Z';

    let query = admin
      .from('attendance_records')
      .select(`
        id,
        scan_time,
        status,
        users!attendance_records_user_id_fkey (
          id,
          first_name,
          last_name,
          student_number,
          grade_level,
          section,
          role
        )
      `)
      .gte('scan_time', startISO)
      .lte('scan_time', endISO)
      .eq('users.role', 'student')
      .order('scan_time', { ascending: false });

    if (section && section !== 'all') {
      query = query.eq('users.section', section);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const records = (data || [])
      .filter((r: any) => r.users)
      .map((r: any) => ({
        id: r.id,
        scan_time: r.scan_time,
        status: r.status || 'present',
        student_name: `${r.users.first_name} ${r.users.last_name}`,
        student_number: r.users.student_number,
        grade_level: r.users.grade_level,
        section: r.users.section,
      }));

    // Derive available sections from records (when no filter applied)
    const sections = [...new Set(records.map((r: any) => r.section).filter(Boolean))].sort();

    return NextResponse.json({ success: true, records, sections });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // --- Attendance data for range (or last 7 days) ---
    const days: { label: string; date: string }[] = [];

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const current = new Date(start);
      while (current <= end) {
        days.push({
          label: current.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          date: current.toISOString().split('T')[0],
        });
        current.setDate(current.getDate() + 1);
      }
    } else {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
          label: d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          date: d.toISOString().split('T')[0],
        });
      }
    }

    // Limit to 31 days max for performance
    const chartDays = days.slice(-31);

    const { count: totalStudents } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');

    const weeklyAttendance = await Promise.all(
      chartDays.map(async ({ label, date }) => {
        const { data } = await supabaseAdmin
          .from('attendance_records')
          .select('user_id')
          .gte('scan_datetime', `${date}T00:00:00`)
          .lte('scan_datetime', `${date}T23:59:59`);

        const unique = new Set((data ?? []).map((r: any) => r.user_id)).size;
        return {
          day: label,
          present: unique,
          absent: Math.max(0, (totalStudents ?? 0) - unique),
        };
      })
    );

    // --- Grade Approvals breakdown (filtered by date if provided) ---
    let gradesQuery = supabaseAdmin.from('grades').select('status, created_at');
    if (startDate) gradesQuery = gradesQuery.gte('created_at', `${startDate}T00:00:00`);
    if (endDate) gradesQuery = gradesQuery.lte('created_at', `${endDate}T23:59:59`);

    const { data: gradeRows } = await gradesQuery;

    const gradeCounts = { pending: 0, approved: 0, rejected: 0 };
    for (const row of gradeRows ?? []) {
      const s = row.status as keyof typeof gradeCounts;
      if (s in gradeCounts) gradeCounts[s]++;
    }

    const gradeApprovals = [
      { name: 'Pending', value: gradeCounts.pending, fill: '#f59e0b' },
      { name: 'Approved', value: gradeCounts.approved, fill: '#22c55e' },
      { name: 'Rejected', value: gradeCounts.rejected, fill: '#ef4444' },
    ];

    return NextResponse.json({
      success: true,
      data: { weeklyAttendance, gradeApprovals },
    });
  } catch (error: any) {
    console.error('chart-data error:', error);
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}

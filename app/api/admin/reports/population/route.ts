import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

const GRADE_ORDER = [
  'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
];

export async function GET(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const school_year = searchParams.get('school_year') || null;
    const grade_level = searchParams.get('grade_level') || null;

    // Get all distinct school years for filter dropdown
    const { data: yearRows } = await admin
      .from('enrollment_requests')
      .select('school_year')
      .eq('status', 'approved');
    const schoolYears = [...new Set((yearRows || []).map((r: any) => r.school_year).filter(Boolean))].sort().reverse();

    // Build main query
    let query = admin
      .from('enrollment_requests')
      .select('grade_level, users!enrollment_requests_student_id_fkey(gender)')
      .eq('status', 'approved');

    if (school_year) query = query.eq('school_year', school_year);
    if (grade_level) query = query.eq('grade_level', grade_level);

    const { data: rows, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Aggregate by grade level
    const map: Record<string, { male: number; female: number; other: number }> = {};
    (rows || []).forEach((row: any) => {
      const gl = row.grade_level || 'Unknown';
      if (!map[gl]) map[gl] = { male: 0, female: 0, other: 0 };
      const gender = (row.users?.gender || '').toLowerCase();
      if (gender === 'male' || gender === 'm') map[gl].male++;
      else if (gender === 'female' || gender === 'f') map[gl].female++;
      else map[gl].other++;
    });

    // Sort by grade order
    const byGrade = Object.entries(map)
      .map(([grade_level, counts]) => ({
        grade_level,
        male: counts.male,
        female: counts.female,
        other: counts.other,
        total: counts.male + counts.female + counts.other,
      }))
      .sort((a, b) => {
        const ai = GRADE_ORDER.indexOf(a.grade_level);
        const bi = GRADE_ORDER.indexOf(b.grade_level);
        if (ai === -1 && bi === -1) return a.grade_level.localeCompare(b.grade_level);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });

    const grandTotal = byGrade.reduce((s, r) => s + r.total, 0);

    return NextResponse.json({
      success: true,
      data: { byGrade, grandTotal, schoolYears },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

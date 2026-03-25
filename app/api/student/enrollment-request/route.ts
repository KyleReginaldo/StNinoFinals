import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  if (!studentId) {
    return NextResponse.json(
      { success: false, error: 'studentId is required' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('enrollment_requests')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      gradeLevel,
      strand,
      schoolYear,
      semester,
      previousGradesUrl,
    } = body;

    if (!studentId || !gradeLevel || !schoolYear || !semester) {
      return NextResponse.json(
        {
          success: false,
          error: 'studentId, gradeLevel, schoolYear, and semester are required',
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from('enrollment_requests')
      .select('id')
      .eq('student_id', studentId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'You already have a pending enrollment request.',
        },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('enrollment_requests')
      .insert({
        student_id: studentId,
        submitted_by: studentId,
        grade_level: gradeLevel,
        strand: strand ?? null,
        school_year: schoolYear,
        semester: Number(semester),
        status: 'pending',
        previous_grades_url: previousGradesUrl ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

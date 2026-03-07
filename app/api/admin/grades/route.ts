import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('grades')
      .select(
        `
        id,
        grade,
        subject,
        status,
        created_at,
        updated_at,
        reviewed_at,
        student:users!grades_student_id_fkey(id, first_name, last_name, student_number),
        teacher:users!grades_teacher_id_fkey(id, first_name, last_name),
        reviewer:users!grades_reviewed_by_fkey(id, first_name, last_name)
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin grades GET error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Admin grades GET unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = getSupabaseAdmin();
    const { id, status, reviewedBy } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing grade id' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be approved or rejected' },
        { status: 400 }
      );
    }

    const { data, error } = await admin
      .from('grades')
      .update({
        status,
        reviewed_by: reviewedBy ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Admin grades PATCH error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Admin grades PATCH unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

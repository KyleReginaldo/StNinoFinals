import { EmailService } from '@/lib/services/email-service';
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

const GRADE_REVIEW_SELECT =
  '*, student:users!grades_student_id_fkey(first_name, last_name, email), teacher:users!grades_teacher_id_fkey(first_name, last_name, email)';

async function logHistory(admin: ReturnType<typeof getSupabaseAdmin>, entry: any) {
  try {
    await admin.from('grade_history').insert({
      grade_id: entry.id,
      student_id: entry.student_id,
      subject: entry.subject,
      quarter: entry.quarter ?? null,
      grade_value: entry.grade,
      status: entry.status,
      rejection_reason: entry.rejection_reason ?? null,
      reviewed_by: entry.reviewed_by ?? null,
    });
  } catch (historyError) {
    console.error('Failed to record grade history:', historyError);
  }
}

async function notifyRejection(entry: any) {
  const student = Array.isArray(entry.student) ? entry.student[0] : entry.student;
  const teacher = Array.isArray(entry.teacher) ? entry.teacher[0] : entry.teacher;

  if (student?.email) {
    try {
      await EmailService.sendGradeRejection({
        to: student.email,
        studentName: `${student.first_name} ${student.last_name}`,
        subject: entry.subject,
        quarter: entry.quarter ?? null,
        adminNotes: entry.rejection_reason ?? null,
      });
    } catch (emailError) {
      console.error('Failed to send grade rejection email to student:', emailError);
    }
  }

  if (teacher?.email) {
    try {
      await EmailService.sendGradeRejectionToTeacher({
        to: teacher.email,
        teacherName: `${teacher.first_name} ${teacher.last_name}`,
        studentName: student ? `${student.first_name} ${student.last_name}` : 'the student',
        subject: entry.subject,
        quarter: entry.quarter ?? null,
        reason: entry.rejection_reason || 'No reason provided.',
      });
    } catch (emailError) {
      console.error('Failed to send grade rejection email to teacher:', emailError);
    }
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = getSupabaseAdmin();
    const body = await request.json();
    const { id, ids, status, reviewedBy, rejection_reason } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be approved or rejected' },
        { status: 400 }
      );
    }

    // Batch update
    if (ids && Array.isArray(ids) && ids.length > 0) {
      const { data, error } = await admin
        .from('grades')
        .update({
          status,
          reviewed_by: reviewedBy ?? null,
          reviewed_at: new Date().toISOString(),
          rejection_reason: status === 'rejected' ? rejection_reason || null : null,
        })
        .in('id', ids)
        .eq('status', 'pending')
        .select(GRADE_REVIEW_SELECT);

      if (error) {
        console.error('Admin grades batch PATCH error:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      for (const entry of data || []) {
        await logHistory(admin, entry);
        if (status === 'rejected') await notifyRejection(entry);
      }

      return NextResponse.json({
        success: true,
        data,
        count: data?.length ?? 0,
      });
    }

    // Single update
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing grade id or ids' },
        { status: 400 }
      );
    }

    const { data, error } = await admin
      .from('grades')
      .update({
        status,
        reviewed_by: reviewedBy ?? null,
        reviewed_at: new Date().toISOString(),
        rejection_reason: status === 'rejected' ? rejection_reason || null : null,
      })
      .eq('id', id)
      .select(GRADE_REVIEW_SELECT)
      .single();

    if (error) {
      console.error('Admin grades PATCH error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (data) {
      await logHistory(admin, data);
      if (status === 'rejected') await notifyRejection(data);
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

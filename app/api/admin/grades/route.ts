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
      .select('*, student:users!grades_student_id_fkey(first_name, last_name, email)')
      .single();

    if (error) {
      console.error('Admin grades PATCH error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Send email notification on rejection
    if (status === 'rejected' && data?.student) {
      try {
        const student = Array.isArray(data.student) ? data.student[0] : data.student;
        if (student?.email) {
          await EmailService.sendEmail({
            to: student.email,
            subject: 'Grade Submission Update - Sto Niño de Praga Academy',
            text: `Dear ${student.first_name} ${student.last_name},\n\nThe grade submission for ${data.subject} (Quarter ${data.quarter || 'N/A'}) has been rejected by the administrator.\n\nPlease contact your teacher or the school administration for more details.\n\nBest regards,\nSto Niño de Praga Academy`,
            html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;"><h2 style="color:#7A0C0C;margin-top:0;">Grade Submission Update</h2><p>Dear ${student.first_name} ${student.last_name},</p><p>The grade submission for <strong>${data.subject}</strong> (Quarter ${data.quarter || 'N/A'}) has been rejected by the administrator.</p><p>Please contact your teacher or the school administration for more details.</p><p style="color:#666;font-size:13px;margin-top:20px;">Best regards,<br>Sto Niño de Praga Academy</p></div>`,
          });
        }
      } catch (emailError) {
        console.error('Failed to send grade rejection email:', emailError);
      }
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

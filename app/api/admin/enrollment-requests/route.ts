import { EmailService } from '@/lib/services/email-service';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('enrollment_requests')
    .select(
      `*, student:users!enrollment_requests_student_id_fkey(id, first_name, last_name, email)`
    )
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status as 'pending' | 'approved' | 'rejected');
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, data });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, status, classId, adminNotes } = body;

    if (!requestId || !status) {
      return NextResponse.json(
        { success: false, error: 'requestId and status are required' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'status must be approved or rejected' },
        { status: 400 }
      );
    }

    if (status === 'approved' && !classId) {
      return NextResponse.json(
        { success: false, error: 'classId is required when approving' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch the request with student info
    const { data: enrollmentRequest, error: fetchError } = await supabase
      .from('enrollment_requests')
      .select(
        'id, student_id, grade_level, school_year, assigned_class_id, student:users!enrollment_requests_student_id_fkey(first_name, last_name, email)'
      )
      .eq('id', requestId)
      .single();

    if (fetchError || !enrollmentRequest) {
      return NextResponse.json(
        { success: false, error: 'Enrollment request not found' },
        { status: 404 }
      );
    }

    // Update the request
    const updatePayload: Record<string, unknown> = {
      status,
      admin_notes: adminNotes ?? null,
      updated_at: new Date().toISOString(),
    };
    if (classId) {
      updatePayload.assigned_class_id = classId;
    }

    const { error: updateError } = await supabase
      .from('enrollment_requests')
      .update(updatePayload)
      .eq('id', requestId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // On approval, add student to the class (upsert to avoid duplicate)
    if (status === 'approved' && classId) {
      const { error: classError } = await supabase.from('user_classes').upsert(
        {
          user_id: enrollmentRequest.student_id,
          class_id: classId,
          membership_type: 'student',
        },
        { onConflict: 'user_id,class_id', ignoreDuplicates: true }
      );

      if (classError) {
        return NextResponse.json(
          {
            success: false,
            error: `Approved but failed to enroll student in class: ${classError.message}`,
          },
          { status: 500 }
        );
      }
    } else if (status === 'rejected') {
      // Un-enroll if they were previously assigned to a class
      const classToRemove = enrollmentRequest.assigned_class_id;
      if (classToRemove) {
        await supabase
          .from('user_classes')
          .delete()
          .eq('user_id', enrollmentRequest.student_id)
          .eq('class_id', classToRemove);
      }
    }

    // Send email notification on rejection
    if (status === 'rejected') {
      try {
        const student = Array.isArray(enrollmentRequest.student)
          ? enrollmentRequest.student[0]
          : enrollmentRequest.student;
        if (student?.email) {
          await EmailService.sendEmail({
            to: student.email,
            subject: 'Enrollment Request Update - Sto Niño de Praga Academy',
            text: `Dear ${student.first_name} ${student.last_name},\n\nWe regret to inform you that your enrollment request for ${enrollmentRequest.grade_level} (S.Y. ${enrollmentRequest.school_year}) was not approved at this time.\n\n${adminNotes ? `Reason: ${adminNotes}\n\n` : ''}If you have questions, please contact the school administration.\n\nBest regards,\nSto Niño de Praga Academy`,
            html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;"><h2 style="color:#7A0C0C;margin-top:0;">Enrollment Request Update</h2><p>Dear ${student.first_name} ${student.last_name},</p><p>We regret to inform you that your enrollment request for <strong>${enrollmentRequest.grade_level}</strong> (S.Y. ${enrollmentRequest.school_year}) was not approved at this time.</p>${adminNotes ? `<div style="background:#fff3cd;border-left:4px solid #ffc107;padding:12px;border-radius:4px;margin:16px 0;"><strong>Reason:</strong> ${adminNotes}</div>` : ''}<p>If you have questions, please contact the school administration.</p><p style="color:#666;font-size:13px;margin-top:20px;">Best regards,<br>Sto Niño de Praga Academy</p></div>`,
          });
        }
      } catch (emailError) {
        console.error('Failed to send enrollment rejection email:', emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

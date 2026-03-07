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

    // Fetch the request to get student_id
    const { data: enrollmentRequest, error: fetchError } = await supabase
      .from('enrollment_requests')
      .select('id, student_id')
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
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

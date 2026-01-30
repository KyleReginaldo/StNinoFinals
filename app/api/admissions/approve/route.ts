import { Database } from '@/database.types';
import { EmailService } from '@/lib/services/email-service';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

type Admission = Database['public']['Tables']['admissions']['Row'];

// POST - Approve or Reject an admission
export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const { admissionId, action } = body; // action: 'approve' or 'reject'

    if (!admissionId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing admissionId or action' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { success: false, error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Fetch the admission record
    const { data: admission, error: fetchError } = await supabase
      .from('admissions')
      .select('*')
      .eq('id', admissionId)
      .single();

    if (fetchError || !admission) {
      return NextResponse.json(
        { success: false, error: 'Admission not found' },
        { status: 404 }
      );
    }

    if (action === 'reject') {
      // Simply update status to rejected
      const { error: updateError } = await supabase
        .from('admissions')
        .update({ status: 'rejected' })
        .eq('id', admissionId);

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }

      // TODO: Send rejection email

      return NextResponse.json({
        success: true,
        message: 'Admission rejected successfully',
      });
    }

    // APPROVAL PROCESS
    if (action === 'approve') {
      // Generate a temporary password
      const tempPassword = `SN${Math.random().toString(36).slice(-8)}${Date.now().toString(36)}`;

      // Create user in Supabase Auth
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: admission.email_address,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            first_name: admission.first_name,
            last_name: admission.last_name,
            role: 'student',
          },
        });

      if (authError) {
        console.error('Auth creation error:', authError);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to create auth user: ${authError.message}`,
          },
          { status: 500 }
        );
      }

      if (!authData.user) {
        return NextResponse.json(
          { success: false, error: 'Failed to create auth user' },
          { status: 500 }
        );
      }

      // Create user record in users table
      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: admission.email_address,
        first_name: admission.first_name,
        last_name: admission.last_name,
        role: 'student',
        grade_level: admission.intended_grade_level,
        created_at: new Date().toISOString(),
      });

      if (userError) {
        console.error('User creation error:', userError);
        // Rollback: Delete auth user if user record creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to create user record: ${userError.message}`,
          },
          { status: 500 }
        );
      }

      // Update admission status to approved
      const { error: updateError } = await supabase
        .from('admissions')
        .update({ status: 'approved' })
        .eq('id', admissionId);

      if (updateError) {
        console.error('Status update error:', updateError);
      }

      // Send approval email with credentials
      try {
        await EmailService.sendAdmissionApproval({
          parentName: admission.parent_name,
          studentFirstName: admission.first_name,
          studentLastName: admission.last_name,
          email: admission.email_address,
          password: tempPassword,
          gradeLevel: admission.intended_grade_level,
          loginUrl: `${request.headers.get('origin')}/student`,
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Don't fail the whole process if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Admission approved and student account created successfully',
        data: {
          userId: authData.user.id,
          email: admission.email_address,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Approval/Rejection error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

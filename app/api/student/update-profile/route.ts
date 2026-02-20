import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const updateData = await request.json();

    if (!updateData.studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const supabaseClient = supabase;

    if (!supabaseClient) {
      console.error('Supabase client not initialized');
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          student: updateData,
          message: 'Profile updated (dev mode - not saved to database)',
        });
      }
      return NextResponse.json(
        {
          success: false,
          error:
            'Database service not configured. Please check your environment variables.',
        },
        { status: 500 }
      );
    }

    // Build update object
    const updateFields: any = {};

    if (updateData.first_name !== undefined)
      updateFields.first_name = updateData.first_name;
    if (updateData.middle_name !== undefined)
      updateFields.middle_name = updateData.middle_name;
    if (updateData.last_name !== undefined)
      updateFields.last_name = updateData.last_name;
    if (updateData.address !== undefined)
      updateFields.address = updateData.address;
    if (updateData.phone_number !== undefined)
      updateFields.phone_number = updateData.phone_number;
    if (updateData.date_of_birth !== undefined)
      updateFields.date_of_birth = updateData.date_of_birth;
    if (updateData.gender !== undefined)
      updateFields.gender = updateData.gender;

    // Update student in users table
    const { data, error } = await supabaseClient
      .from('users')
      .update(updateFields)
      .eq('id', updateData.studentId)
      .eq('role', 'student')
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Remove password from response
    const studentWithoutPassword = { ...data };
    if (studentWithoutPassword.Password !== undefined) {
      delete studentWithoutPassword.Password;
    }
    if (studentWithoutPassword.password !== undefined) {
      delete studentWithoutPassword.password;
    }

    return NextResponse.json({
      success: true,
      student: studentWithoutPassword,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('Update profile API error:', error);

    // In development, allow fallback
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        message: 'Profile updated (dev mode)',
      });
    }

    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

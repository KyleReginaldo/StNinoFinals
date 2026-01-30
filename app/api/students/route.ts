import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentNumber = searchParams.get('studentNumber');

    if (!studentNumber) {
      return NextResponse.json(
        { success: false, error: 'Student number is required' },
        { status: 400 }
      );
    }

    // Query student from users table where role = 'student'
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, student_number, grade_level, section')
      .eq('student_number', studentNumber)
      .eq('role', 'student')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student: data,
    });
  } catch (error: any) {
    console.error('Students API GET error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const studentData = await request.json();

    // Validate required fields
    if (
      !studentData.name ||
      !studentData.studentId ||
      !studentData.gradeLevel ||
      !studentData.section
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields (name, studentId, gradeLevel, section)',
        },
        { status: 400 }
      );
    }

    // Generate email if not provided (use student ID as username)
    const email = studentData.email || `${studentData.studentId}@sndpa.edu.ph`;

    // Try to insert into Supabase
    // Note: You'll need to create a 'students' table in your Supabase database
    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          name: studentData.name,
          student_id: studentData.studentId,
          grade_level: studentData.gradeLevel,
          section: studentData.section,
          email: email,
          phone: studentData.phone || null,
          password: studentData.password || null, // Store password (should be hashed in production)
          Password: studentData.password || null, // Also store in Password field for compatibility
          username: studentData.username || studentData.studentId,
          first_login: studentData.firstLogin !== false, // Default to true
          status: 'enrolled',
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      // For development: log but don't fail
      console.error('Database error (will continue in dev mode):', error);

      // In development, return success even if table doesn't exist
      if (process.env.NODE_ENV === 'development') {
        console.log('Student data (dev mode):', studentData);
        return NextResponse.json({
          success: true,
          message: 'Student added (dev mode - not saved to database)',
        });
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Student added successfully',
    });
  } catch (error: any) {
    console.error('Students API error:', error);
    // In development, allow fallback
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        message: 'Student added (dev mode)',
      });
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

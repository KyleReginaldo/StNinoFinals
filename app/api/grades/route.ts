import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Missing studentId parameter' },
        { status: 400 }
      );
    }

    const { data, error } = await admin
      .from('grades')
      .select('*')
      .eq('student_id', studentId)
      .order('subject');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      grades: data || [],
    });
  } catch (error: any) {
    console.error('Grades API error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = getSupabaseAdmin();
    const { studentId, subject, grade } = await request.json();

    console.log('Grades POST received:', { studentId, subject, grade });

    if (!studentId || !subject || grade === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate grade is a number and within valid range
    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      return NextResponse.json(
        { success: false, error: 'Grade must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    console.log('Upserting grade:', {
      student_id: studentId,
      subject: subject,
      grade: numericGrade,
    });

    // First, check if a grade already exists
    const { data: existingGrade, error: selectError } = await admin
      .from('grades')
      .select('id')
      .eq('student_id', studentId)
      .eq('subject', subject)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine
      console.error('Error checking existing grade:', selectError);
      return NextResponse.json(
        { success: false, error: selectError.message },
        { status: 500 }
      );
    }

    let result;
    if (existingGrade) {
      // Update existing grade
      const { data, error } = await admin
        .from('grades')
        .update({
          grade: numericGrade,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingGrade.id)
        .select();

      if (error) {
        console.error('Error updating grade:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
      result = data;
      console.log('Grade updated successfully:', data);
    } else {
      // Insert new grade
      const { data, error } = await admin
        .from('grades')
        .insert({
          student_id: studentId,
          subject: subject,
          grade: numericGrade,
        })
        .select();

      if (error) {
        console.error('Error inserting grade:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
      result = data;
      console.log('Grade inserted successfully:', data);
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Grade saved successfully',
    });
  } catch (error: any) {
    console.error('Grades API error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

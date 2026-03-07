import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'studentId is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get student profile
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select(
        'id, first_name, last_name, student_number, grade_level, section, email, enrollment_date, status'
      )
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get classes the student is enrolled in
    const { data: userClasses, error: userClassesError } = await supabase
      .from('user_classes')
      .select('class_id, created_at')
      .eq('user_id', studentId)
      .eq('membership_type', 'student');

    if (userClassesError) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch enrollment data' },
        { status: 500 }
      );
    }

    if (!userClasses || userClasses.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          student: {
            name: `${student.first_name} ${student.last_name}`.trim(),
            studentNumber: student.student_number,
            gradeLevel: student.grade_level,
            section: student.section,
            enrollmentDate: student.enrollment_date,
            status: student.status,
          },
          enrollment: {
            schoolYear: null,
            semester: null,
            isEnrolled: false,
          },
          classes: [],
        },
      });
    }

    const classIds = userClasses.map((uc) => uc.class_id);

    // Get class details with teacher info
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select(
        'id, class_name, class_code, grade_level, section, semester, school_year, room, schedule, is_active, teacher_id'
      )
      .in('id', classIds);

    if (classesError) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch class details' },
        { status: 500 }
      );
    }

    // Get unique teacher IDs
    const teacherIds = [
      ...new Set(
        (classes || [])
          .map((c) => c.teacher_id)
          .filter((id): id is string => !!id)
      ),
    ];

    // Fetch teacher names
    let teacherMap: Record<string, string> = {};
    if (teacherIds.length > 0) {
      const { data: teachers } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .in('id', teacherIds);

      if (teachers) {
        teacherMap = Object.fromEntries(
          teachers.map((t) => [t.id, `${t.first_name} ${t.last_name}`.trim()])
        );
      }
    }

    // Determine current school year and semester from active classes
    const activeClasses = (classes || []).filter((c) => c.is_active);
    const primaryClass =
      activeClasses.length > 0 ? activeClasses[0] : classes?.[0];

    const semesterLabel = (sem: string | number | null) => {
      if (sem === 1 || sem === '1') return 'First Semester';
      if (sem === 2 || sem === '2') return 'Second Semester';
      if (typeof sem === 'string' && sem.length > 0) return sem;
      return null;
    };

    const formattedClasses = (classes || []).map((cls) => ({
      id: cls.id,
      className: cls.class_name,
      classCode: cls.class_code,
      gradeLevel: cls.grade_level,
      section: cls.section,
      semester: semesterLabel(cls.semester),
      schoolYear: cls.school_year,
      room: cls.room,
      schedule: cls.schedule,
      isActive: cls.is_active,
      teacher: cls.teacher_id ? teacherMap[cls.teacher_id] || 'TBD' : 'TBD',
    }));

    return NextResponse.json({
      success: true,
      data: {
        student: {
          name: `${student.first_name} ${student.last_name}`.trim(),
          studentNumber: student.student_number,
          gradeLevel: student.grade_level,
          section: student.section,
          enrollmentDate: student.enrollment_date,
          status: student.status,
        },
        enrollment: {
          schoolYear: primaryClass?.school_year ?? null,
          semester: semesterLabel(primaryClass?.semester ?? null),
          isEnrolled: formattedClasses.length > 0,
        },
        classes: formattedClasses,
      },
    });
  } catch (error) {
    console.error('Enrollment API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

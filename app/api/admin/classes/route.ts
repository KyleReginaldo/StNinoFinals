import { parseScheduleTime, timesOverlap } from '@/lib/rooms';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all classes or a specific class
export async function GET(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (classId) {
      // Fetch specific class with teacher and student details
      const { data: classData, error: classError } = await admin
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (classError) {
        console.error('Error fetching class:', classError);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch class' },
          { status: 500 }
        );
      }

      // Get teacher info if exists
      let teacher = null;
      if (classData.teacher_id) {
        const { data: teacherData } = await admin
          .from('users')
          .select('id, first_name, last_name, email')
          .eq('id', classData.teacher_id)
          .eq('role', 'teacher')
          .single();
        teacher = teacherData;
      }

      // Get students in this class from user_classes
      const { data: userClasses } = await admin
        .from('user_classes')
        .select('user_id')
        .eq('class_id', classId);

      const studentIds = userClasses?.map((uc) => uc.user_id) || [];
      let students = [];
      if (studentIds.length > 0) {
        const { data: studentsData } = await admin
          .from('users')
          .select(
            'id, first_name, last_name, student_number, grade_level, section'
          )
          .in('id', studentIds)
          .eq('role', 'student');
        students = studentsData || [];
      }

      return NextResponse.json({
        success: true,
        class: {
          ...classData,
          teacher,
          students,
        },
      });
    }

    // Fetch all classes
    const { data: classes, error } = await admin
      .from('classes')
      .select('*')
      .order('school_year', { ascending: false })
      .order('quarter', { ascending: false })
      .order('class_name', { ascending: true });

    if (error) {
      console.error('Error fetching classes:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch classes' },
        { status: 500 }
      );
    }

    // Get teacher names for each class
    const classesWithTeachers = await Promise.all(
      (classes || []).map(async (classItem) => {
        if (classItem.teacher_id) {
          const { data: teacher } = await admin
            .from('users')
            .select('first_name, last_name')
            .eq('id', classItem.teacher_id)
            .eq('role', 'teacher')
            .single();

          return {
            ...classItem,
            teacher_name: teacher
              ? `${teacher.first_name} ${teacher.last_name}`
              : null,
          };
        }
        return { ...classItem, teacher_name: null };
      })
    );

    return NextResponse.json({
      success: true,
      classes: classesWithTeachers,
    });
  } catch (error: any) {
    console.error('Classes API GET error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function getSlotsFromSchedule(schedule: string): { day: string; start: number; end: number }[] {
  try {
    const parsed = JSON.parse(schedule);
    if (Array.isArray(parsed)) {
      return parsed.flatMap((item: any) => {
        const t = parseScheduleTime(`${item.day} ${item.start} - ${item.end}`);
        return t ? [{ day: item.day as string, ...t }] : [];
      });
    }
  } catch {}
  const t = parseScheduleTime(schedule);
  const dayMatch = schedule.match(/^([A-Za-z]+)/);
  if (!t || !dayMatch) return [];
  return [{ day: dayMatch[1], ...t }];
}

async function checkRoomConflict(
  admin: ReturnType<typeof getSupabaseAdmin>,
  room: string,
  schedule: string,
  school_year: string,
  excludeId?: string
): Promise<string | null> {
  if (!room || !schedule) return null;
  const newSlots = getSlotsFromSchedule(schedule);
  if (newSlots.length === 0) return null;

  let query = admin
    .from('classes')
    .select('id, class_name, schedule')
    .eq('room', room)
    .eq('school_year', school_year)
    .eq('is_active', true);

  if (excludeId) query = query.neq('id', excludeId);

  const { data: existing } = await query;
  if (!existing) return null;

  for (const cls of existing) {
    if (!cls.schedule) continue;
    const existingSlots = getSlotsFromSchedule(cls.schedule);
    for (const n of newSlots) {
      for (const e of existingSlots) {
        if (n.day !== e.day) continue;
        if (timesOverlap({ start: n.start, end: n.end }, { start: e.start, end: e.end })) {
          return `Room "${room}" is already booked by "${cls.class_name}" on ${n.day}.`;
        }
      }
    }
  }
  return null;
}

// POST - Create new class
export async function POST(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin();
    const body = await request.json();
    const {
      class_code,
      class_name,
      grade_level,
      section,
      school_year,
      semester,
      teacher_id,
      room,
      schedule,
      description,
      student_ids,
    } = body;

    // Validate required fields
    if (!class_code || !class_name || !school_year || !semester) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: class_code, class_name, school_year, semester',
        },
        { status: 400 }
      );
    }

    // Check for room/time conflict
    if (room && schedule) {
      const conflict = await checkRoomConflict(admin, room, schedule, school_year);
      if (conflict) {
        return NextResponse.json({ success: false, error: conflict }, { status: 409 });
      }
    }

    // Create the class
    const { data: newClass, error: classError } = await admin
      .from('classes')
      .insert({
        class_code,
        class_name,
        grade_level: grade_level || null,
        section: section || null,
        school_year,
        quarter: parseInt(semester),
        teacher_id: teacher_id || null,
        room: room || null,
        schedule: schedule || null,
        description: description || null,
        is_active: true,
      })
      .select()
      .single();

    if (classError) {
      console.error('Error creating class:', classError);
      return NextResponse.json(
        { success: false, error: 'Failed to create class' },
        { status: 500 }
      );
    }

    // Add teacher to user_classes if provided
    if (teacher_id && newClass) {
      await admin.from('user_classes').insert({
        user_id: teacher_id,
        class_id: newClass.id,
        membership_type: 'teacher',
      });
    }

    // Add students to user_classes if provided
    if (student_ids && student_ids.length > 0 && newClass) {
      const studentMemberships = student_ids.map((studentId: string) => ({
        user_id: studentId,
        class_id: newClass.id,
        membership_type: 'student',
      }));

      await admin.from('user_classes').insert(studentMemberships);
    }

    return NextResponse.json({
      success: true,
      class: newClass,
      message: 'Class created successfully',
    });
  } catch (error: any) {
    console.error('Classes API POST error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update existing class
export async function PUT(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin();
    const body = await request.json();
    const {
      id,
      class_code,
      class_name,
      grade_level,
      section,
      school_year,
      semester,
      teacher_id,
      room,
      schedule,
      description,
      is_active,
      student_ids,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Class ID is required' },
        { status: 400 }
      );
    }

    // Check for room/time conflict (exclude the class being edited)
    if (room && schedule && school_year) {
      const conflict = await checkRoomConflict(admin, room, schedule, school_year, id);
      if (conflict) {
        return NextResponse.json({ success: false, error: conflict }, { status: 409 });
      }
    }

    // Update the class
    const { data: updatedClass, error: updateError } = await admin
      .from('classes')
      .update({
        class_code,
        class_name,
        grade_level: grade_level || null,
        section: section || null,
        school_year,
        quarter: parseInt(semester),
        teacher_id: teacher_id || null,
        room: room || null,
        schedule: schedule || null,
        description: description || null,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating class:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update class' },
        { status: 500 }
      );
    }

    // Update user_classes - remove all existing and re-add
    await admin.from('user_classes').delete().eq('class_id', id);

    // Add teacher
    if (teacher_id) {
      await admin.from('user_classes').insert({
        user_id: teacher_id,
        class_id: id,
        membership_type: 'teacher',
      });
    }

    // Add students
    if (student_ids && student_ids.length > 0) {
      const studentMemberships = student_ids.map((studentId: string) => ({
        user_id: studentId,
        class_id: id,
        membership_type: 'student',
      }));

      await admin.from('user_classes').insert(studentMemberships);
    }

    return NextResponse.json({
      success: true,
      class: updatedClass,
      message: 'Class updated successfully',
    });
  } catch (error: any) {
    console.error('Classes API PUT error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a class
export async function DELETE(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { success: false, error: 'Class ID is required' },
        { status: 400 }
      );
    }

    // Delete user_classes entries first (foreign key constraint)
    await admin.from('user_classes').delete().eq('class_id', classId);

    // Delete the class
    const { error: deleteError } = await admin
      .from('classes')
      .delete()
      .eq('id', classId);

    if (deleteError) {
      console.error('Error deleting class:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete class' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error: any) {
    console.error('Classes API DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

import { DAY_LABELS, parseScheduleSlots } from '@/lib/rooms'
import { normalizeSchoolYear } from '@/lib/school-year'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const date = searchParams.get('date')

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID is required' },
        { status: 400 }
      )
    }

    // Get teacher's classes with schedule info
    const { data: classes, error: classesError } = await admin
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('is_active', true)

    if (classesError) {
      console.error('Error fetching schedule:', classesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch schedule' },
        { status: 500 }
      )
    }

    if (!classes || classes.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No schedule found for this teacher'
      })
    }

    // Admin saves classes.schedule as [{ day: 'M'|'T'|'W'|'Th'|'F', start, end }]
    // (older rows: "MWF 08:00 - 09:00"); parseScheduleSlots handles both.
    const scheduleItems: any[] = []

    classes.forEach(classInfo => {
      const base = {
        classId: classInfo.id,
        className: classInfo.class_name,
        subject: classInfo.class_name,
        section: classInfo.section || 'N/A',
        gradeLevel: classInfo.grade_level || 'N/A',
        room: classInfo.room || 'TBA',
        schoolYear: normalizeSchoolYear(classInfo.school_year),
        semester: (classInfo as any).quarter,
      }
      const raw = classInfo.schedule as unknown
      const slots = parseScheduleSlots(typeof raw === 'string' ? raw : raw ? JSON.stringify(raw) : null)
      if (slots.length === 0) {
        scheduleItems.push({ ...base, id: classInfo.id, day: 'TBA', timeStart: 'TBA', timeEnd: 'TBA' })
        return
      }
      slots.forEach(slot => {
        scheduleItems.push({
          ...base,
          id: `${classInfo.id}-${slot.day}-${slot.start}`,
          day: DAY_LABELS[slot.day] ?? slot.day,
          timeStart: slot.start,
          timeEnd: slot.end,
        })
      })
    })

    // Filter by date if provided
    let filteredSchedule = scheduleItems
    if (date) {
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
      filteredSchedule = scheduleItems.filter(item => item.day === dayName)
    }

    // Sort by time
    filteredSchedule.sort((a, b) => {
      if (a.timeStart === 'TBA') return 1
      if (b.timeStart === 'TBA') return -1
      return a.timeStart.localeCompare(b.timeStart)
    })

    return NextResponse.json({
      success: true,
      data: filteredSchedule
    })
  } catch (error: any) {
    console.error('Teacher schedule API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Internal server error'
      },
      { status: 500 }
    )
  }
}

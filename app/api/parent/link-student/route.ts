import { isValidLrn } from '@/lib/lrn';
import { maskStudentName } from '@/lib/person';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

// GET ?lrn=… → masked name + grade so the guardian can confirm before linking.
export async function GET(request: Request) {
  const lrn = (new URL(request.url).searchParams.get('lrn') ?? '').trim()
  if (!isValidLrn(lrn)) {
    return NextResponse.json({ success: false, error: 'LRN must be exactly 12 digits' }, { status: 400 })
  }
  const { data: student } = await getSupabaseAdmin()
    .from('users')
    .select('first_name, last_name, grade_level')
    .eq('student_number', lrn)
    .eq('role', 'student')
    .maybeSingle()
  if (!student) {
    return NextResponse.json({ success: false, error: 'No student found with this LRN' }, { status: 404 })
  }
  return NextResponse.json({
    success: true,
    student: { name: maskStudentName(student.first_name, student.last_name), grade_level: student.grade_level },
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      parent_id,
      student_number,
      relationship_type,
    } = body

    if (!parent_id || !student_number) {
      return NextResponse.json(
        { success: false, error: 'Parent ID and LRN are required' },
        { status: 400 }
      )
    }

    if (!isValidLrn(String(student_number).trim())) {
      return NextResponse.json(
        { success: false, error: 'LRN must be exactly 12 digits' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Find student by student number
    const { data: student, error: studentError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, student_number, grade_level, section, email')
      .eq('student_number', String(student_number).trim())
      .eq('role', 'student')
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, error: 'No student found with this LRN' },
        { status: 404 }
      )
    }

    // Check if relationship already exists
    const { data: existing } = await supabaseAdmin
      .from('user_relationships')
      .select('id')
      .eq('user_id', parent_id)
      .eq('related_user_id', student.id)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This student is already linked to your account' },
        { status: 400 }
      )
    }

    // Create relationship
    const { error: insertError } = await supabaseAdmin
      .from('user_relationships')
      .insert({
        user_id: parent_id,
        related_user_id: student.id,
        relationship_type: relationship_type || 'parent',
        is_primary: false,
        can_pickup: true,
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Student linked successfully',
      student: {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        student_number: student.student_number,
        grade_level: student.grade_level,
        section: student.section,
        email: student.email,
      }
    })
  } catch (error: any) {
    console.error('Link student error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

import { Database } from '@/database.types';
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

type AdmissionInsert = Database['public']['Tables']['admissions']['Insert'];

// GET - Fetch all admissions with pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('admissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('GET Admissions error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new admission
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.first_name ||
      !body.last_name ||
      !body.email_address ||
      !body.phone_number
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: first_name, last_name, email_address, phone_number',
        },
        { status: 400 }
      );
    }

    const admissionData: AdmissionInsert = {
      first_name: body.first_name,
      last_name: body.last_name,
      parent_name: body.parent_name,
      email_address: body.email_address,
      phone_number: body.phone_number,
      intended_grade_level: body.intended_grade_level,
      previous_school: body.previous_school,
      additional_message: body.additional_message || null,
      status: 'pending', // Set default status
    };

    const { data, error } = await supabase
      .from('admissions')
      .insert([admissionData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Admission inquiry submitted successfully',
    });
  } catch (error: any) {
    console.error('POST Admissions error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update admission status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing admission ID' },
        { status: 400 }
      );
    }

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status. Must be pending, approved, or rejected',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('admissions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Admission status updated successfully',
    });
  } catch (error: any) {
    console.error('PATCH Admissions error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

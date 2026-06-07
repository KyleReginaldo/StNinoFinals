import { getActivePeriod, getPeriodsForYear } from '@/lib/academic-period';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/academic-periods?schoolYear=2026-2027
// Returns all four periods for the given school year (defaults to active year).
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let schoolYear = searchParams.get('schoolYear');

    if (!schoolYear) {
      const active = await getActivePeriod();
      schoolYear = active?.schoolYear ?? null;
    }

    if (!schoolYear) {
      return NextResponse.json({ success: false, error: 'No active school year found' }, { status: 404 });
    }

    const periods = await getPeriodsForYear(schoolYear);

    // If the table doesn't exist yet (pre-migration), return an empty array gracefully.
    return NextResponse.json({ success: true, data: periods, schoolYear });
  } catch (error: any) {
    console.error('GET /api/admin/academic-periods:', error);
    return NextResponse.json({ success: false, error: error?.message ?? 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/academic-periods
// Updates a single period's dates or grading-open flag.
// Body: { schoolYear, quarter, startDate?, endDate?, isGradingOpen? }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolYear, quarter, startDate, endDate, isGradingOpen } = body;

    if (!schoolYear || !quarter) {
      return NextResponse.json({ success: false, error: 'schoolYear and quarter are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const update: Record<string, any> = {};
    if (startDate    !== undefined) update.start_date      = startDate    || null;
    if (endDate      !== undefined) update.end_date        = endDate      || null;
    if (isGradingOpen !== undefined) update.is_grading_open = isGradingOpen;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    const { error } = await supabase
      .from('academic_periods')
      .update(update)
      .eq('school_year', schoolYear)
      .eq('quarter', quarter);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PATCH /api/admin/academic-periods:', error);
    return NextResponse.json({ success: false, error: error?.message ?? 'Internal server error' }, { status: 500 });
  }
}

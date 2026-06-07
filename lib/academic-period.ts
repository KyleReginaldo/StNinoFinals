import { getSupabaseAdmin } from './supabaseAdmin';

export interface AcademicPeriod {
  id: string;
  schoolYear: string;
  quarter: number;
  label: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  isGradingOpen: boolean;
}

/**
 * Returns the single currently active academic period.
 * Reads from the academic_periods table first; falls back to system_settings
 * so the system works before the migration has been run.
 */
export async function getActivePeriod(): Promise<AcademicPeriod | null> {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('academic_periods')
    .select('*')
    .eq('is_active', true)
    .maybeSingle();

  if (data) {
    return rowToAcademicPeriod(data);
  }

  // Fallback: derive from system_settings
  const { data: rows } = await supabase
    .from('system_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['active_school_year', 'active_quarter']);

  if (!rows || rows.length === 0) return null;

  const map: Record<string, string> = {};
  for (const r of rows) map[r.setting_key] = r.setting_value ?? '';

  const schoolYear = map['active_school_year'];
  const quarter = parseInt(map['active_quarter'] || '1', 10);
  if (!schoolYear || !quarter) return null;

  return {
    id: '',
    schoolYear,
    quarter,
    label: `Quarter ${quarter}`,
    startDate: null,
    endDate: null,
    isActive: true,
    isGradingOpen: true,
  };
}

/**
 * Returns all four periods for the given school year, ordered by quarter.
 */
export async function getPeriodsForYear(schoolYear: string): Promise<AcademicPeriod[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('academic_periods')
    .select('*')
    .eq('school_year', schoolYear)
    .order('quarter', { ascending: true });

  return (data || []).map(rowToAcademicPeriod);
}

/**
 * Returns the display label for the active quarter, formatted for the given
 * student's grade level.  Grade 11/12 → "1st Semester" or "2nd Semester".
 * All other levels → "Quarter N".
 */
export function getSemesterLabel(quarter: number, gradeLevel: string): string {
  if (gradeLevel === 'Grade 11' || gradeLevel === 'Grade 12') {
    return quarter <= 2 ? '1st Semester' : '2nd Semester';
  }
  return `Quarter ${quarter}`;
}

/**
 * Returns both quarters that make up the given SHS semester.
 * semester 1 → [1, 2],  semester 2 → [3, 4]
 */
export function getQuartersForSemester(semester: 1 | 2): [number, number] {
  return semester === 1 ? [1, 2] : [3, 4];
}

// ─── internal ────────────────────────────────────────────────────────────────

function rowToAcademicPeriod(row: any): AcademicPeriod {
  return {
    id: row.id,
    schoolYear: row.school_year,
    quarter: row.quarter,
    label: row.label,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    isActive: row.is_active,
    isGradingOpen: row.is_grading_open,
  };
}

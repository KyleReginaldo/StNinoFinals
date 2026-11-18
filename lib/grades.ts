import { normalizeGradeLevel } from './grade-levels';
import { normalizeSchoolYear } from './school-year';

export interface GradeSummaryRow {
  subject: string;
  quarters: Partial<Record<1 | 2 | 3 | 4, number>>;
  average: number | null;
}

/** Per-subject quarter grades + average (of the quarters that exist) for one school year. */
export function summarizeGrades(
  grades: { subject: string; grade: string | number; quarter: number | null; school_year: string | null }[],
  schoolYear: string
): GradeSummaryRow[] {
  const sy = normalizeSchoolYear(schoolYear);
  const bySubject = new Map<string, GradeSummaryRow>();
  for (const g of grades) {
    const value = Number(g.grade);
    if (!g.school_year || normalizeSchoolYear(g.school_year) !== sy || !Number.isFinite(value)) continue;
    const row = bySubject.get(g.subject) ?? { subject: g.subject, quarters: {}, average: null };
    if (g.quarter && g.quarter >= 1 && g.quarter <= 4) row.quarters[g.quarter as 1 | 2 | 3 | 4] = value;
    bySubject.set(g.subject, row);
  }
  return [...bySubject.values()]
    .map((r) => {
      const vals = Object.values(r.quarters) as number[];
      return { ...r, average: vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject));
}

/** A grade of at least this passes (the report card's "Remarks"). */
export const PASSING_GRADE = 75;

/** Mean of the numeric grades to one decimal, or null when there are none. */
export function gradeAverage(values: (string | number)[]): number | null {
  const nums = values.map(Number).filter(Number.isFinite);
  return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null;
}

/** Which school year to open first: the current one if it has grades, else the latest that does. */
export function defaultSchoolYear(yearsWithGrades: string[], activeYear: string): string {
  const years = [...new Set(yearsWithGrades.map(normalizeSchoolYear))].sort().reverse();
  return years.includes(normalizeSchoolYear(activeYear)) ? normalizeSchoolYear(activeYear) : years[0] ?? '';
}

export interface ReportRow {
  subject: string;
  grade: number;
  remarks: 'PASSED' | 'FAILED';
}

/**
 * Report-card rows for one school year. 'all' = each subject's average over its quarters;
 * a quarter number = only the subjects graded in that quarter, with that quarter's grade.
 */
export function reportRows(
  grades: { subject: string; grade: string | number; quarter: number | null; school_year: string | null }[],
  schoolYear: string,
  quarter: number | 'all'
): ReportRow[] {
  const remark = (g: number): ReportRow['remarks'] => (g >= PASSING_GRADE ? 'PASSED' : 'FAILED');
  return summarizeGrades(grades, schoolYear).flatMap((r) => {
    const grade = quarter === 'all' ? r.average : r.quarters[quarter as 1 | 2 | 3 | 4] ?? null;
    return grade === null ? [] : [{ subject: r.subject, grade, remarks: remark(grade) }];
  });
}

/** The grade level the student was enrolled in for a school year (approved enrollment), or null. */
export function gradeLevelForYear(
  history: { school_year: string; grade_level: string; status: string }[],
  schoolYear: string
): string | null {
  const sy = normalizeSchoolYear(schoolYear);
  const hit = history.find((h) => h.status === 'approved' && normalizeSchoolYear(h.school_year) === sy);
  return hit ? normalizeGradeLevel(hit.grade_level) : null;
}

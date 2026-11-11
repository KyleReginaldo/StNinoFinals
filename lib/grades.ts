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

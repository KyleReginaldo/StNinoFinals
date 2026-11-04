import { normalizeGradeLevel } from './grade-levels';

// DepEd Learner Reference Number: exactly 12 digits.
export const isValidLrn = (v: string) => /^\d{12}$/.test(v);

/** LRN is optional only for Kinder (first-time enrollees have none yet). */
export const lrnRequired = (gradeLevel: string | null | undefined) =>
  normalizeGradeLevel(gradeLevel) !== 'Kinder';

export function lrnError(
  lrn: string | null | undefined,
  gradeLevel: string | null | undefined
): string | null {
  const v = (lrn ?? '').trim();
  if (!v) return lrnRequired(gradeLevel) ? 'LRN is required' : null;
  return isValidLrn(v) ? null : 'LRN must be exactly 12 digits';
}

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

/**
 * Editing an existing student: an LRN left exactly as saved is not re-validated, so old
 * records (short legacy numbers, or none) can still be edited. A changed LRN must be valid.
 */
export function lrnEditError(
  lrn: string | null | undefined,
  savedLrn: string | null | undefined,
  gradeLevel: string | null | undefined
): string | null {
  if ((lrn ?? '').trim() === (savedLrn ?? '').trim()) return null;
  return lrnError(lrn, gradeLevel);
}

/**
 * Comparison key for matching an LRN/student number from a file against the system's:
 * ignores spaces and leading zeros ("000000000611" and "611" are the same learner).
 */
export function lrnKey(value: string | null | undefined): string {
  const v = (value ?? '').trim();
  return /^\d+$/.test(v) ? v.replace(/^0+(?=\d)/, '') : v;
}

// Canonical grade_level values. Store and compare only these strings.
export const GRADE_LEVELS: readonly string[] = [
  'Kinder',
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
];

/** "kindergarten" → "Kinder", "grade1" → "Grade 1"; unknown values pass through trimmed. */
export function normalizeGradeLevel(v: string | null | undefined): string | null {
  const s = (v ?? '').trim();
  if (!s) return null;
  if (/^kinder(garten)?$/i.test(s)) return 'Kinder';
  const m = s.match(/^grade\s*(\d+)$/i);
  return m ? `Grade ${parseInt(m[1], 10)}` : s;
}

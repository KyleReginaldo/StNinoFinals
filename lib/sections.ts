// Section names per grade, from the `sections` table (what Admin › Sections edits).
export function groupSectionNames(
  rows: { name: string; grade_level: string }[]
): Record<string, string[]> {
  const out: Record<string, Set<string>> = {};
  for (const r of rows) (out[r.grade_level] ??= new Set()).add(r.name);
  return Object.fromEntries(Object.entries(out).map(([g, s]) => [g, [...s].sort()]));
}

export async function fetchSectionsByGrade(): Promise<Record<string, string[]>> {
  const res = await fetch('/api/admin/sections?schoolYear=active');
  const data = await res.json().catch(() => ({}));
  return data?.success ? groupSectionNames(data.sections ?? []) : {};
}

/** Validates a new section capacity against how many students are already in it. */
export function capacityError(capacity: number, enrolled: number): string | null {
  if (!Number.isInteger(capacity) || capacity < 1) return 'Capacity must be a whole number of at least 1.';
  if (capacity < enrolled) return `This section already has ${enrolled} students. Capacity can’t be lower than that.`;
  return null;
}

/** Message when there's no seat left for one more student, else null. */
export function fullSectionError(name: string, enrolled: number, capacity: number): string | null {
  return enrolled >= capacity
    ? `Section "${name}" is full (${enrolled}/${capacity}). Raise its capacity in Sections or choose another section.`
    : null;
}

/** Students currently in a section (users.section + grade, same rule as the Sections list). */
export async function countSectionStudents(
  db: { from: (t: 'users') => any },
  name: string,
  gradeLevel: string
): Promise<number> {
  const { count } = await db
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'student')
    .eq('section', name)
    .eq('grade_level', gradeLevel);
  return count ?? 0;
}

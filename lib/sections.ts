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

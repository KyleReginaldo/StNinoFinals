// Display helpers for the Change Log (activity_logs rows).

type Row = Record<string, unknown> | null | undefined;

const IGNORED = new Set(['id', 'created_at', 'updated_at']);

export const TABLE_LABELS: Record<string, string> = {
  users: 'User',
  admissions: 'Admission',
  enrollment_requests: 'Enrollment Request',
  sections: 'Section',
  classes: 'Subject',
  class_subjects: 'Section Subject',
  grades: 'Grade',
  rooms: 'Room',
  announcements: 'Announcement',
  academic_periods: 'Academic Period',
  user_relationships: 'Guardian Link',
  system_settings: 'Setting',
  attendance_records: 'Attendance',
};

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const empty = (v: unknown) => v === null || v === undefined || v === '';

/** Field-level changes: insert → new values, delete → old values, update → changed fields only. */
export function diffChanges(oldV: Row, newV: Row): { field: string; from: unknown; to: unknown }[] {
  const keys = [...new Set([...Object.keys(oldV ?? {}), ...Object.keys(newV ?? {})])].filter((k) => !IGNORED.has(k));
  return keys
    .map((field) => ({ field, from: oldV?.[field] ?? null, to: newV?.[field] ?? null }))
    .filter((c) => !same(c.from, c.to) && !(empty(c.from) && empty(c.to)));
}

/** A readable name for the changed record. */
export function describeRecord(_table: string, row: Row): string {
  const r = row ?? {};
  const s = (k: string) => (typeof r[k] === 'string' && r[k] ? (r[k] as string) : '');
  const person = [s('first_name'), s('last_name')].filter(Boolean).join(' ');
  if (person) return person;
  if (s('class_name')) return s('class_name');
  if (s('name')) return s('grade_level') ? `${s('name')} (${s('grade_level')})` : s('name');
  if (s('title')) return s('title');
  if (s('label')) return s('label');
  return String(r.id ?? '—');
}

/** "grade_level" → "Grade level" */
export const fieldLabel = (f: string) => (f.charAt(0).toUpperCase() + f.slice(1)).replace(/_/g, ' ');

export function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

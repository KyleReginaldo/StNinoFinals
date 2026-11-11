import { normalizeSchoolYear } from './school-year';
export interface ScheduleSlot { day: string; start: string; end: string; }

export const DAY_LABELS: Record<string, string> = { M: 'Monday', T: 'Tuesday', W: 'Wednesday', Th: 'Thursday', F: 'Friday' };

/** Parse a schedule value (old string OR JSON array) into per-day slots. */
export function parseScheduleSlots(schedule: string | null | undefined): ScheduleSlot[] {
  if (!schedule) return [];
  try {
    const parsed = JSON.parse(schedule);
    if (Array.isArray(parsed)) return parsed as ScheduleSlot[];
  } catch {}
  // Old format: "MWF 08:00 - 09:00"
  const daysMatch = schedule.match(/^([A-Za-z]+)/);
  const timeMatch = schedule.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
  if (!daysMatch || !timeMatch) return [];
  const days = parseDayTokensSimple(daysMatch[1]);
  return days.map((day) => ({ day, start: timeMatch[1], end: timeMatch[2] }));
}

function parseDayTokensSimple(daysStr: string): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < daysStr.length) {
    if (i + 1 < daysStr.length && ['Th', 'Sa', 'Su'].includes(daysStr.slice(i, i + 2))) {
      result.push(daysStr.slice(i, i + 2));
      i += 2;
    } else {
      result.push(daysStr[i]);
      i += 1;
    }
  }
  return result;
}

/** Format a schedule value for display. */
export function formatSchedule(schedule: string | null | undefined): string {
  if (!schedule) return '';
  const slots = parseScheduleSlots(schedule);
  if (slots.length === 0) return schedule;
  return slots.map((s) => `${s.day} ${s.start}–${s.end}`).join(', ');
}

export const ROOMS = [
  'Room 101',
  'Room 102',
  'Room 103',
  'Room 104',
  'Room 105',
  'Room 106',
  'Room 201',
  'Room 202',
  'Room 203',
  'Room 204',
  'Room 205',
  'Room 206',
  'Science Lab',
  'Computer Lab',
  'Library',
  'Audio-Visual Room',
  'Home Economics Room',
  'Music Room',
  'Art Room',
  'Gymnasium',
];

/**
 * Parse a schedule string like "MWF 08:00 - 09:00" into start/end minutes from midnight.
 * Returns null if unparseable.
 */
export function parseScheduleTime(schedule: string): { start: number; end: number } | null {
  const match = schedule.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const start = parseInt(match[1]) * 60 + parseInt(match[2]);
  const end = parseInt(match[3]) * 60 + parseInt(match[4]);
  return { start, end };
}

/**
 * Returns true if two time ranges overlap.
 * [a.start, a.end) overlaps [b.start, b.end) when a.start < b.end && b.start < a.end
 */
export function timesOverlap(
  a: { start: number; end: number },
  b: { start: number; end: number }
): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Latest a class may end (CRF: room availability limited to 5 PM). */
export const LATEST_END = '17:00';

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

export function slotTimeError(s: { start: string; end: string }): string | null {
  if (!/^\d{1,2}:\d{2}$/.test(s.start ?? '') || !/^\d{1,2}:\d{2}$/.test(s.end ?? '')) return 'Invalid time';
  if (toMinutes(s.end) <= toMinutes(s.start)) return 'End time must be after start time';
  if (toMinutes(s.end) > toMinutes(LATEST_END)) return 'Classes must end by 5:00 PM';
  return null;
}

export const EARLIEST_START = '06:00';
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Selectable times ("HH:MM") in 15-minute steps up to LATEST_END. With `after`, only
 * times later than it (for the end-time list). Start list ends 15 min before LATEST_END.
 */
export function timeOptions(after?: string, step = 15): string[] {
  const from = after ? toMinutes(after) + step : toMinutes(EARLIEST_START);
  const to = toMinutes(LATEST_END) - (after ? 0 : step);
  const out: string[] = [];
  for (let m = from; m <= to; m += step) out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  return out;
}

/** "17:00" → "5:00 PM" */
export function formatTime12(t: string): string {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${pad(m || 0)} ${h < 12 ? 'AM' : 'PM'}`;
}

/**
 * First room or teacher double-booking for these slots, as a message for the admin,
 * or null. Same school year only; back-to-back slots (9:00 end / 9:00 start) are fine.
 */
export function findScheduleClash(
  mine: { day: string; start: string; end: string }[],
  others: { id: string; class_name: string; room: string | null; teacher_id: string | null; school_year: string; schedule: string | null }[],
  opts: { room?: string | null; teacherId?: string | null; schoolYear: string; excludeId?: string }
): string | null {
  const sy = normalizeSchoolYear(opts.schoolYear);
  for (const other of others) {
    if (other.id === opts.excludeId || normalizeSchoolYear(other.school_year) !== sy) continue;
    const sameRoom = !!opts.room && other.room === opts.room;
    const sameTeacher = !!opts.teacherId && other.teacher_id === opts.teacherId;
    if (!sameRoom && !sameTeacher) continue;
    for (const theirs of parseScheduleSlots(other.schedule)) {
      for (const m of mine) {
        if (m.day !== theirs.day) continue;
        const overlap =
          toMinutes(m.start) < toMinutes(theirs.end) && toMinutes(theirs.start) < toMinutes(m.end);
        if (!overlap) continue;
        const when = `${DAY_LABELS[theirs.day] ?? theirs.day} ${formatTime12(theirs.start)}–${formatTime12(theirs.end)}`;
        return sameRoom
          ? `${opts.room} is already used by "${other.class_name}" on ${when}.`
          : `This teacher already has "${other.class_name}" on ${when}.`;
      }
    }
  }
  return null;
}

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

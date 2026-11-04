import { describe, expect, it } from 'vitest';
import { DAY_LABELS, parseScheduleSlots } from '../lib/rooms';

describe('schedule slots', () => {
  it('admin slot format maps to full day names', () => {
    const s = parseScheduleSlots(JSON.stringify([{ day: 'Th', start: '08:00', end: '09:00' }]));
    expect(DAY_LABELS[s[0].day]).toBe('Thursday');
    expect(s[0].start).toBe('08:00');
  });
});

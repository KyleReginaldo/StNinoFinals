import { describe, expect, it } from 'vitest';
import { DAY_LABELS, parseScheduleSlots, slotTimeError } from '../lib/rooms';

describe('schedule slots', () => {
  it('admin slot format maps to full day names', () => {
    const s = parseScheduleSlots(JSON.stringify([{ day: 'Th', start: '08:00', end: '09:00' }]));
    expect(DAY_LABELS[s[0].day]).toBe('Thursday');
    expect(s[0].start).toBe('08:00');
  });
});

describe('slotTimeError', () => {
  it('allows classes ending exactly at 5 PM', () => {
    expect(slotTimeError({ start: '08:00', end: '17:00' })).toBeNull();
  });
  it('rejects classes ending after 5 PM', () => {
    expect(slotTimeError({ start: '16:00', end: '17:01' })).toBe('Classes must end by 5:00 PM');
  });
  it('rejects end at or before start', () => {
    expect(slotTimeError({ start: '09:00', end: '09:00' })).toBe('End time must be after start time');
    expect(slotTimeError({ start: '10:00', end: '9:30' })).toBe('End time must be after start time');
  });
  it('rejects malformed times instead of letting NaN pass', () => {
    expect(slotTimeError({ start: 'abc', end: '10:00' })).toBe('Invalid time');
    expect(slotTimeError({ start: '08:00', end: '' })).toBe('Invalid time');
  });
});

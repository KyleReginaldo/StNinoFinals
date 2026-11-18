import { describe, expect, it } from 'vitest';
import { DAY_LABELS, ROOM_MAX_CAPACITY, findScheduleClash, roomCapacityError, formatTime12, parseScheduleSlots, slotTimeError, timeOptions } from '../lib/rooms';

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

describe('timeOptions', () => {
  it('start times: 15-minute steps from 6:00 AM, last start 4:45 PM, nothing later', () => {
    const opts = timeOptions();
    expect(opts[0]).toBe('06:00');
    expect(opts[1]).toBe('06:15');
    expect(opts[opts.length - 1]).toBe('16:45');
    expect(opts).not.toContain('18:00');
  });
  it('end times stop at 5:00 PM', () => {
    expect(timeOptions('08:00').at(-1)).toBe('17:00');
  });
  it('end options start after the chosen start time', () => {
    const ends = timeOptions('16:30');
    expect(ends).toEqual(['16:45', '17:00']);
  });
  it('formats as 12-hour time', () => {
    expect(formatTime12('08:00')).toBe('8:00 AM');
    expect(formatTime12('12:30')).toBe('12:30 PM');
    expect(formatTime12('17:00')).toBe('5:00 PM');
  });
});

describe('findScheduleClash', () => {
  const others = [
    { id: 'a', class_name: 'Math 7', room: 'Room 101', teacher_id: 't1', school_year: '2026-2027', schedule: JSON.stringify([{ day: 'M', start: '08:00', end: '09:00' }]) },
    { id: 'b', class_name: 'Science 7', room: 'Room 202', teacher_id: 't2', school_year: '2025-2026', schedule: JSON.stringify([{ day: 'T', start: '10:00', end: '11:00' }]) },
  ];
  const mine = [{ day: 'M', start: '08:30', end: '09:30' }];
  it('flags a room already booked at that time', () => {
    expect(findScheduleClash(mine, others, { room: 'Room 101', teacherId: 't9', schoolYear: '2026-2027' }))
      .toBe('Room 101 is already used by "Math 7" on Monday 8:00 AM–9:00 AM.');
  });
  it('flags a teacher already teaching at that time', () => {
    expect(findScheduleClash(mine, others, { room: 'Room 303', teacherId: 't1', schoolYear: '2026-2027' }))
      .toBe('This teacher already has "Math 7" on Monday 8:00 AM–9:00 AM.');
  });
  it('ignores back-to-back slots, other days, other school years, and the subject being edited', () => {
    expect(findScheduleClash([{ day: 'M', start: '09:00', end: '10:00' }], others, { room: 'Room 101', teacherId: 't1', schoolYear: '2026-2027' })).toBeNull();
    expect(findScheduleClash([{ day: 'T', start: '10:00', end: '11:00' }], others, { room: 'Room 202', teacherId: 't2', schoolYear: '2026-2027' })).toBeNull();
    expect(findScheduleClash(mine, others, { room: 'Room 101', teacherId: 't1', schoolYear: '2026-2027', excludeId: 'a' })).toBeNull();
  });
});

describe('roomCapacityError', () => {
  it('max capacity is 60', () => {
    expect(ROOM_MAX_CAPACITY).toBe(60);
  });
  it('accepts blank, and 1 to 60', () => {
    expect(roomCapacityError('', null)).toBeNull();
    expect(roomCapacityError(null, null)).toBeNull();
    expect(roomCapacityError(1, null)).toBeNull();
    expect(roomCapacityError('60', null)).toBeNull();
  });
  it('rejects more than 60, zero, negatives, decimals and non-numbers', () => {
    const msg = 'Room capacity must be a whole number from 1 to 60.';
    expect(roomCapacityError(61, null)).toBe(msg);
    expect(roomCapacityError('300', null)).toBe(msg);
    expect(roomCapacityError(0, null)).toBe(msg);
    expect(roomCapacityError(-5, null)).toBe(msg);
    expect(roomCapacityError('12.5', null)).toBe(msg);
    expect(roomCapacityError('abc', null)).toBe(msg);
  });
  it('an unchanged old value (e.g. Gymnasium 300) does not block editing the room', () => {
    expect(roomCapacityError(300, 300)).toBeNull();
    expect(roomCapacityError('300', 300)).toBeNull();
    expect(roomCapacityError(301, 300)).toBe('Room capacity must be a whole number from 1 to 60.');
  });
});

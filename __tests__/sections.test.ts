import { describe, expect, it } from 'vitest';
import { groupSectionNames } from '../lib/sections';

describe('groupSectionNames', () => {
  it('groups section names by grade, deduped and sorted', () => {
    expect(
      groupSectionNames([
        { name: 'Rizal', grade_level: 'Grade 1' },
        { name: 'Bonifacio', grade_level: 'Grade 1' },
        { name: 'Rizal', grade_level: 'Grade 1' }, // same name, other strand
        { name: 'Sampaguita', grade_level: 'Kinder' },
      ])
    ).toEqual({ 'Grade 1': ['Bonifacio', 'Rizal'], Kinder: ['Sampaguita'] });
  });
});

import { SECTION_MAX_CAPACITY, capacityError, fullSectionError, newSectionCapacityError } from '../lib/sections';

describe('section capacity rules', () => {
  it('capacity must be a whole number of at least 1 and not below current enrollment', () => {
    expect(capacityError(40, 35)).toBeNull();
    expect(capacityError(35, 35)).toBeNull();
    expect(capacityError(30, 35)).toBe('This section already has 35 students. Capacity can’t be lower than that.');
    expect(capacityError(0, 0)).toBe('Section capacity must be a whole number from 1 to 60.');
    expect(capacityError(12.5, 0)).toBe('Section capacity must be a whole number from 1 to 60.');
  });
  it('full section message only when no seat is left', () => {
    expect(fullSectionError('Rizal', 44, 45)).toBeNull();
    expect(fullSectionError('Rizal', 45, 45)).toBe('Section "Rizal" is full (45/45). Raise its capacity in Sections or choose another section.');
  });
});

describe('section capacity maximum (60)', () => {
  it('capacityError rejects anything above 60', () => {
    expect(SECTION_MAX_CAPACITY).toBe(60);
    expect(capacityError(60, 10)).toBeNull();
    expect(capacityError(61, 10)).toBe('Section capacity must be a whole number from 1 to 60.');
    expect(capacityError(10032132133211, 10)).toBe('Section capacity must be a whole number from 1 to 60.');
  });
  it('a new section: blank is fine (defaults to 45); otherwise 1 to 60', () => {
    expect(newSectionCapacityError('')).toBeNull();
    expect(newSectionCapacityError('45')).toBeNull();
    expect(newSectionCapacityError('60')).toBeNull();
    for (const bad of ['0', '-3', '61', '10032132133211', '12.5', 'abc', '1e5'])
      expect(newSectionCapacityError(bad)).toBe('Section capacity must be a whole number from 1 to 60.');
  });
});

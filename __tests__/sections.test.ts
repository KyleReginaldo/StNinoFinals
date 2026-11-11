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

import { capacityError, fullSectionError } from '../lib/sections';

describe('section capacity rules', () => {
  it('capacity must be a whole number of at least 1 and not below current enrollment', () => {
    expect(capacityError(40, 35)).toBeNull();
    expect(capacityError(35, 35)).toBeNull();
    expect(capacityError(30, 35)).toBe('This section already has 35 students. Capacity can’t be lower than that.');
    expect(capacityError(0, 0)).toBe('Capacity must be a whole number of at least 1.');
    expect(capacityError(12.5, 0)).toBe('Capacity must be a whole number of at least 1.');
  });
  it('full section message only when no seat is left', () => {
    expect(fullSectionError('Rizal', 44, 45)).toBeNull();
    expect(fullSectionError('Rizal', 45, 45)).toBe('Section "Rizal" is full (45/45). Raise its capacity in Sections or choose another section.');
  });
});

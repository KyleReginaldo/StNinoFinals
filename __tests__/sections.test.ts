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

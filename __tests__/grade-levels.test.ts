import { describe, expect, it } from 'vitest';
import { GRADE_LEVELS, normalizeGradeLevel } from '../lib/grade-levels';

describe('grade levels', () => {
  it('Kinder first, then Grade 1-12', () => {
    expect(GRADE_LEVELS[0]).toBe('Kinder');
    expect(GRADE_LEVELS).toHaveLength(13);
    expect(GRADE_LEVELS[12]).toBe('Grade 12');
  });

  it('normalizes stored variants to canonical values', () => {
    expect(normalizeGradeLevel('kindergarten')).toBe('Kinder');
    expect(normalizeGradeLevel('KINDER')).toBe('Kinder');
    expect(normalizeGradeLevel('grade1')).toBe('Grade 1');
    expect(normalizeGradeLevel(' Grade 12 ')).toBe('Grade 12');
    expect(normalizeGradeLevel('')).toBeNull();
    expect(normalizeGradeLevel(null)).toBeNull();
    expect(normalizeGradeLevel('College')).toBe('College'); // unknown passes through
  });
});

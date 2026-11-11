import { describe, expect, it } from 'vitest';
import { summarizeGrades } from '../lib/grades';

describe('summarizeGrades', () => {
  const grades = [
    { subject: 'Math', grade: '90', quarter: 1, school_year: '2025-2026' },
    { subject: 'Math', grade: '85', quarter: 2, school_year: '2025-2026' },
    { subject: 'English', grade: '88', quarter: 1, school_year: '2025-2026' },
    { subject: 'Math', grade: '70', quarter: 1, school_year: '2024-2025' }, // other year
  ];
  it('one row per subject for the school year, quarters + average of what exists', () => {
    expect(summarizeGrades(grades, '2025-2026')).toEqual([
      { subject: 'English', quarters: { 1: 88 }, average: 88 },
      { subject: 'Math', quarters: { 1: 90, 2: 85 }, average: 87.5 },
    ]);
  });
  it('empty when that year has no grades', () => {
    expect(summarizeGrades(grades, '2023-2024')).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { PASSING_GRADE, defaultSchoolYear, gradeAverage, gradeLevelForYear, reportRows, summarizeGrades } from '../lib/grades';

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

const G = [
  { subject: 'Math', grade: '90', quarter: 1, school_year: '2025-2026' },
  { subject: 'Math', grade: '80', quarter: 2, school_year: '2025-2026' },
  { subject: 'English', grade: '70', quarter: 1, school_year: '2025-2026' },
  { subject: 'Math', grade: '95', quarter: 1, school_year: '2026-2027' },
];

describe('gradeAverage', () => {
  it('mean to one decimal; null when there is nothing numeric', () => {
    expect(gradeAverage(['90', '85'])).toBe(87.5);
    expect(gradeAverage([90, 85, 84])).toBe(86.3);
    expect(gradeAverage([])).toBeNull();
    expect(gradeAverage(['abc'])).toBeNull();
  });
});

describe('defaultSchoolYear', () => {
  it('the current year when it has grades, otherwise the latest year that does', () => {
    expect(defaultSchoolYear(['2025-2026', '2026-2027'], '2026-2027')).toBe('2026-2027');
    expect(defaultSchoolYear(['2024-2025', '2025-2026'], '2026-2027')).toBe('2025-2026');
    expect(defaultSchoolYear([], '2026-2027')).toBe('');
  });
});

describe('reportRows', () => {
  it('whole year: one row per subject with its average and remarks (passing is 75)', () => {
    expect(PASSING_GRADE).toBe(75);
    expect(reportRows(G, '2025-2026', 'all')).toEqual([
      { subject: 'English', grade: 70, remarks: 'FAILED' },
      { subject: 'Math', grade: 85, remarks: 'PASSED' },
    ]);
  });
  it('one quarter: only subjects graded in that quarter, that quarter\'s grade', () => {
    expect(reportRows(G, '2025-2026', 2)).toEqual([{ subject: 'Math', grade: 80, remarks: 'PASSED' }]);
  });
  it('exactly 75 passes, 74 fails; other school years are not mixed in', () => {
    const rows = reportRows([{ subject: 'A', grade: '75', quarter: 1, school_year: '2025-2026' }, { subject: 'B', grade: '74', quarter: 1, school_year: '2025-2026' }], '2025-2026', 1);
    expect(rows.map((r) => r.remarks)).toEqual(['PASSED', 'FAILED']);
    expect(reportRows(G, '2026-2027', 'all')).toEqual([{ subject: 'Math', grade: 95, remarks: 'PASSED' }]);
  });
});

describe('gradeLevelForYear', () => {
  const history = [
    { school_year: '2026-2027', grade_level: 'grade7', status: 'pending' },
    { school_year: '2025-2026', grade_level: 'Grade 6', status: 'approved' },
    { school_year: '2024-2025', grade_level: 'Grade 5', status: 'rejected' },
  ];
  it('the grade of the approved enrollment for that school year', () => {
    expect(gradeLevelForYear(history, '2025-2026')).toBe('Grade 6');
  });
  it('null when that year has no approved enrollment', () => {
    expect(gradeLevelForYear(history, '2026-2027')).toBeNull();
    expect(gradeLevelForYear(history, '2024-2025')).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { findGradeColumns, parseCsv } from '../lib/csv';

describe('findGradeColumns', () => {
  it('reads the plain two-column layout', () => {
    expect(findGradeColumns(parseCsv('1001,90\n1002,85'))).toEqual({ start: 0, numberCol: 0, gradeCol: 1 });
  });

  it('skips an unrecognized header row', () => {
    expect(findGradeColumns(parseCsv('id,score\n1001,90'))).toEqual({ start: 1, numberCol: 0, gradeCol: 1 });
  });

  it('reads the teacher export layout with title rows', () => {
    const csv = [
      'STO. NIÑO DE PRAGA ACADEMY',
      'STUDENT GRADES',
      'Class: Math 7',
      'Generated: October 13, 2026',
      'Student Number,Student Name,Grade,Status',
      '1001,"Cruz, Juan",90,pending',
    ].join('\n');
    expect(findGradeColumns(parseCsv(csv))).toEqual({ start: 5, numberCol: 0, gradeCol: 2 });
  });
});

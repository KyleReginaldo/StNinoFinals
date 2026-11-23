import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findGradeColumns, parseCsv, rowsFromXlsx } from '../lib/csv';

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

  it('reads an LRN header (exports since student number became LRN)', () => {
    expect(findGradeColumns(parseCsv('Student Name,LRN,Grade\nJuan,123456789012,90'))).toEqual({ start: 1, numberCol: 1, gradeCol: 2 });
  });
});

describe('findGradeColumns: grading-sheet headers (e.g. TOTAL GRADE)', () => {
  const sheet = (header: string[], ...data: string[][]) => [header, ...data];

  it.each(['TOTAL GRADE', 'Total Grade', 'FINAL GRADE', 'Final Rating', 'Final', 'Total', 'Overall Grade', 'Quarterly Grade', 'Grade'])(
    'finds the grade column headed "%s"',
    (label) => {
      const rows = sheet(['LRN', 'Student Name', 'Quiz Avg', label, 'Status'], ['123456789012', 'Juan', '88', '90', 'x']);
      expect(findGradeColumns(rows)).toEqual({ start: 1, numberCol: 0, gradeCol: 3 });
    }
  );

  it('does not mistake other columns for the grade', () => {
    const rows = sheet(['LRN', 'Grade Level', 'Quiz Avg', 'Exam (25%)', 'TOTAL GRADE'], ['123456789012', 'Grade 7', '88', '90', '89']);
    expect(findGradeColumns(rows).gradeCol).toBe(4);
  });

  it('prefers the total/final column over a plain "Grade" column when a sheet has both', () => {
    const rows = sheet(['LRN', 'Grade', 'TOTAL GRADE'], ['123456789012', 'Grade 7', '89']);
    expect(findGradeColumns(rows).gradeCol).toBe(2);
  });

  it('skips a second header row (group header above, column names below)', () => {
    const rows = [
      ['STUDENT GRADING SHEET'],
      ['LRN', 'Student Name', 'QUIZZES (25%)', 'QUIZZES (25%)', 'TOTAL GRADE', 'Status'],
      ['LRN', 'Student Name', 'Quiz 1', 'Quiz Avg', 'TOTAL GRADE', 'Status'],
      ['142', 'Amber', '87', '80', '85', 'Not submitted'],
    ];
    const { start, numberCol, gradeCol } = findGradeColumns(rows);
    expect(rows.slice(start).map((r) => [r[numberCol], r[gradeCol]])).toEqual([['142', '85']]);
  });

  it('works when LRN and TOTAL GRADE are on different header rows', () => {
    const rows = [
      ['LRN', 'Student Name', 'Scores', '', 'Result'],
      ['', '', 'Quiz Avg', 'Exam', 'TOTAL GRADE'],
      ['142', 'Amber', '80', '83', '85'],
    ];
    expect(findGradeColumns(rows)).toEqual({ start: 2, numberCol: 0, gradeCol: 4 });
  });
});

describe('more header names', () => {
  it.each([
    ['Student ID', 'Grade'], ['ID Number', 'Final Average'], ['Learner Reference Number', 'Grade (Q2)'], ['LRN No.', 'Q2 Grade'],
    ['Student No.', 'Quarter Grade'], ['Student Number', 'Rating'], ['LRN', 'General Average'],
  ])('reads %s + %s', (num, grade) => {
    const rows = [[num, 'Student Name', 'Quiz Avg', grade], ['123456789012', 'Juan', '80', '88']];
    expect(findGradeColumns(rows)).toEqual({ start: 1, numberCol: 0, gradeCol: 3 });
  });
});

describe('rowsFromXlsx with several sheets', () => {
  it('uses the sheet that has the grade columns, not just the first one', async () => {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    wb.addWorksheet('Instructions').getRow(1).values = ['Fill in the Grades tab'];
    wb.addWorksheet('Grades').getRows(1, 2)!.forEach((row, i) => (row.values = i === 0 ? ['LRN', 'Student Name', 'Grade'] : ['1001', 'Cruz', '90']));
    const rows = await rowsFromXlsx((await wb.xlsx.writeBuffer()) as ArrayBuffer);
    expect(rows).toEqual([['LRN', 'Student Name', 'Grade'], ['1001', 'Cruz', '90']]);
  });

  it('falls back to the first non-empty sheet when no sheet has recognizable headers', async () => {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    wb.addWorksheet('Empty');
    wb.addWorksheet('Data').getRow(1).values = ['id', 'score'];
    const rows = await rowsFromXlsx((await wb.xlsx.writeBuffer()) as ArrayBuffer);
    expect(rows).toEqual([['id', 'score']]);
  });
});

// The sample the client uses to demo grading imports (migrations/Elementary_Statistics_Sample_Grading_Sheet.xlsx)
const SAMPLE = 'migrations/Elementary_Statistics_Sample_Grading_Sheet.xlsx';
describe.skipIf(!existsSync(SAMPLE))('Elementary Statistics sample grading sheet', () => {
  it('imports every student row with the TOTAL GRADE column and no header leftovers', async () => {
    const data = readFileSync(SAMPLE);
    const rows = await rowsFromXlsx(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer);
    const { start, numberCol, gradeCol } = findGradeColumns(rows);

    expect(rows[gradeCol === -1 ? 0 : start - 1][gradeCol]).toBe('TOTAL GRADE');
    const students = rows.slice(start);
    expect(students).toHaveLength(66);
    expect(students[0].slice(0, 2)).toEqual(['000000000000', 'John Doe']);
    expect(students[0][gradeCol]).toBe('87');
    expect(students.find((r) => r[numberCol] === '142')?.[gradeCol]).toBe('85');
    // nothing but whole-number grades was read (not names, quiz averages, or the sub-header row)
    expect(students.every((r) => /^\d{2,3}$/.test(r[gradeCol]))).toBe(true);
    expect(students.some((r) => r[numberCol] === 'LRN')).toBe(false);
  });
});

describe('rowsFromXlsx', () => {
  it('reads the teacher Excel export layout back into grade rows', async () => {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Report');
    // Same shape as lib/export-excel.ts: merged title rows, spacer, header, data
    ['STO. NIÑO DE PRAGA ACADEMY', 'STUDENT GRADES', 'Class: Math 7', 'Generated: October 13, 2026'].forEach((t, i) => {
      ws.mergeCells(i + 1, 1, i + 1, 4);
      ws.getCell(i + 1, 1).value = t;
    });
    ws.getRow(6).values = ['Student Number', 'Student Name', 'Grade', 'Status'];
    ws.getRow(7).values = ['1001', 'Cruz, Juan', '90', 'pending'];
    ws.getRow(8).values = ['1002', 'Reyes, Ana', 85, 'Not submitted'];

    const buffer = await wb.xlsx.writeBuffer();
    const rows = await rowsFromXlsx(buffer as ArrayBuffer);
    const { start, numberCol, gradeCol } = findGradeColumns(rows);

    expect(rows.slice(start).map((r) => [r[numberCol], r[gradeCol]])).toEqual([
      ['1001', '90'],
      ['1002', '85'],
    ]);
  });
});

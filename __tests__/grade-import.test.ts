import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { rowsFromXlsx } from '../lib/csv';
import { planGradeImport } from '../lib/grade-import';
import { lrnKey } from '../lib/lrn';

const roster = [
  { id: 1, name: 'Aaron Caccam', studentId: '611', grade: '74', status: 'approved' },
  { id: 2, name: 'Rejected Kid', studentId: '222', grade: '70', status: 'rejected' },
  { id: 3, name: 'Pending Kid', studentId: '333', grade: '80', status: 'pending' },
  { id: 4, name: 'New Kid', studentId: '444', grade: '', status: null },
  { id: 5, name: 'Same Kid', studentId: '555', grade: '90', status: 'approved' },
  { id: 6, name: 'No LRN Kid', studentId: '', grade: '', status: null },
];
const file = (...data: string[][]) => [['LRN', 'Student Name', 'Grade', 'Status'], ...data];

describe('lrnKey', () => {
  it('ignores leading zeros and spaces so 000000000611 matches 611', () => {
    expect(lrnKey('000000000611')).toBe(lrnKey(' 611 '));
    expect(lrnKey('000000000000')).toBe('0');
    expect(lrnKey('AB-12')).toBe('AB-12');
    expect(lrnKey('')).toBe('');
  });
});

describe('planGradeImport', () => {
  it('new, changed (pending/rejected) and unchanged rows', () => {
    const plan = planGradeImport(
      file(['444', 'New Kid', '88', ''], ['222', 'Rejected Kid', '75', 'rejected'], ['333', 'Pending Kid', '80', 'x']),
      roster
    );
    expect(plan.found).toBe(true);
    expect(plan.updates).toEqual([
      { id: 4, grade: '88', before: '' },
      { id: 2, grade: '75', before: '70' },
      { id: 3, grade: '80', before: '80' }, // same value: still listed, shown as "no change"
    ]);
  });

  it('a changed value on an APPROVED grade is reported as locked, not silently skipped', () => {
    const plan = planGradeImport(file(['611', 'Aaron Caccam', '90', 'approved'], ['555', 'Same Kid', '90', 'approved']), roster);
    expect(plan.updates).toEqual([]);
    expect(plan.locked).toEqual([{ studentId: '611', name: 'Aaron Caccam', current: '74', file: '90' }]);
  });

  it('an approved row with a blank or identical file grade is not worth mentioning', () => {
    const plan = planGradeImport(file(['611', 'Aaron Caccam', '', ''], ['555', 'Same Kid', '90.0', '']), roster);
    expect(plan.locked).toEqual([]);
  });

  it('students not in the class are listed; bad grades are listed; rows without LRN are skipped', () => {
    const plan = planGradeImport(file(['999', 'Stranger', '85', ''], ['444', 'New Kid', '101', ''], ['333', 'Pending Kid', '85.5', ''], ['', 'No LRN Kid', '88', '']), roster);
    expect(plan.unmatched).toEqual(['999']);
    expect(plan.outOfRange).toEqual(['444 (101)', '333 (85.5)']);
    expect(plan.updates).toEqual([]);
  });

  it('a blank grade is not an error: it is counted separately ("no grade yet in the file")', () => {
    const plan = planGradeImport(file(['444', 'New Kid', '', 'Not submitted'], ['333', 'Pending Kid', '  ', '']), roster);
    expect(plan.blank).toBe(2);
    expect(plan.outOfRange).toEqual([]);
    expect(plan.updates).toEqual([]);
  });

  it('matches an LRN written with leading zeros', () => {
    expect(planGradeImport(file(['000000000444', 'New Kid', '88', '']), roster).updates).toEqual([{ id: 4, grade: '88', before: '' }]);
  });

  it('a file with no LRN/grade pairs is reported as unreadable, with the columns it saw', () => {
    const plan = planGradeImport([['Notes about the class'], ['Name', 'Score', 'Remarks'], ['Juan', 'great', 'ok']], roster);
    expect(plan.found).toBe(false);
    expect(plan.seenColumns).toEqual(['Name', 'Score', 'Remarks']);
    expect(plan.updates).toEqual([]);
  });
});

// The teacher's real Chemistry export (migrations/Chemistry_grades.xlsx): 25 rows, 9 already approved
const CHEM = 'migrations/Chemistry_grades.xlsx';
describe.skipIf(!existsSync(CHEM))('Chemistry_grades.xlsx', () => {
  it('reads all 25 students, and reports the approved grade that the file tries to change', async () => {
    const data = readFileSync(CHEM);
    const rows = await rowsFromXlsx(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer);
    const sheet = rows.filter((r) => /^\d+$/.test((r[0] ?? '').trim()));
    expect(sheet).toHaveLength(25);
    const caccam = sheet.find((r) => r[0] === '611')!;
    const plan = planGradeImport(rows, [{ id: 'a', name: 'Aaron James Caccam', studentId: '611', grade: '74', status: 'approved' }]);
    expect(caccam[2]).toBe('90');
    expect(plan.locked).toEqual([{ studentId: '611', name: 'Aaron James Caccam', current: '74', file: '90' }]);
  });
});

import { findGradeColumns } from './csv';
import { lrnKey } from './lrn';

export interface RosterRow<Id extends string | number = string | number> {
  id: Id;
  name: string;
  studentId: string; // LRN / student number
  grade: string;
  status: string | null;
}

export interface GradeImportPlan<Id extends string | number = string | number> {
  /** Grades to put in the table (a value identical to the current one is included: "no change"). */
  updates: { id: Id; grade: string; before: string }[];
  /** LRNs in the file that are not in this class. */
  unmatched: string[];
  /** "LRN (value)" for grades that are not a whole number 0-100. */
  outOfRange: string[];
  /** Students in the file with no grade entered yet (nothing to import; not an error). */
  blank: number;
  /** Approved grades the file wants to change. Approved grades are final: only the admin can reopen them. */
  locked: { studentId: string; name: string; current: string; file: string }[];
  /** false = no LRN + grade rows could be read at all (an unrecognized layout). */
  found: boolean;
  /** The columns of the first header-like row, to show when the file can't be read. */
  seenColumns: string[];
}

/** Decides what an uploaded grades sheet would do to a class's table, without changing anything. */
export function planGradeImport<Id extends string | number>(rows: string[][], roster: RosterRow<Id>[]): GradeImportPlan<Id> {
  const { start, numberCol, gradeCol } = findGradeColumns(rows);
  const plan: GradeImportPlan<Id> = { updates: [], unmatched: [], outOfRange: [], blank: 0, locked: [], found: false, seenColumns: [] };

  plan.found = rows.slice(start).some((r) => /^\d+$/.test((r[numberCol] ?? '').trim()));
  if (!plan.found) {
    const header = rows.slice(0, 10).find((r) => r.filter((c) => c.trim()).length >= 2);
    plan.seenColumns = (header ?? []).map((c) => c.trim()).filter(Boolean);
    return plan;
  }

  const byLrn = new Map(roster.filter((r) => r.studentId).map((r) => [lrnKey(r.studentId), r]));
  for (let i = start; i < rows.length; i++) {
    const lrn = (rows[i][numberCol] ?? '').trim();
    const gradeStr = (rows[i][gradeCol] ?? '').trim();
    if (!lrn) continue;

    const student = byLrn.get(lrnKey(lrn));
    if (!student) {
      if (/^\d+$/.test(lrn)) plan.unmatched.push(lrn); // ignore footer text such as "Prepared by"
      continue;
    }
    if (student.status === 'approved') {
      if (gradeStr !== '' && Number.isFinite(Number(gradeStr)) && Number(gradeStr) !== Number(student.grade)) {
        plan.locked.push({ studentId: student.studentId, name: student.name, current: student.grade, file: gradeStr });
      }
      continue;
    }
    if (gradeStr === '') {
      plan.blank++;
      continue;
    }
    const numeric = Number(gradeStr);
    if (!Number.isInteger(numeric) || numeric < 0 || numeric > 100) {
      plan.outOfRange.push(`${lrn} (${gradeStr})`);
      continue;
    }
    plan.updates.push({ id: student.id, grade: numeric.toString(), before: student.grade });
  }
  return plan;
}

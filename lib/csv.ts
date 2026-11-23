// Minimal CSV parser — handles quoted fields with embedded commas, good enough
// for simple two-column "student number, grade" sheets.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.some((c) => c.trim() !== '')) rows.push(row);
  }
  return rows;
}

// Header labels, best first. A sheet that has both "TOTAL GRADE" and a plain "Grade" column
// wants the total; an LRN column beats a generic "ID".
const NUMBER_HEADERS = [
  /^(lrn|learner'?s?\s*reference\s*(no\.?|number))(\s*(no\.?|number))?$/,
  /^student\s*(no\.?|number|#|id)$/,
  /^id(\s*(no\.?|number))?$/,
];
const GRADE_HEADERS = [
  /^(total|final|overall)\s*(grade|rating|average)$/,
  /^(final|total)$/,
  /^(quarterly|quarter|q[1-4]|[1-4](st|nd|rd|th)\s*quarter)?\s*(grade|rating)(\s*\(?\s*(q[1-4]|quarter\s*[1-4])\s*\)?)?$/,
  /^(general\s*)?(average|avg)$/,
];

const normalizeHeader = (cell: string) => cell.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[:*]+$/, '');

function bestHeader(cells: string[], patterns: RegExp[]): { col: number; rank: number } | null {
  for (let rank = 0; rank < patterns.length; rank++) {
    const col = cells.findIndex((c) => patterns[rank].test(c));
    if (col !== -1) return { col, rank };
  }
  return null;
}

// Finds the student-number and grade columns from the header row(s). Accepts the plain
// "student number, grade" layout, our own export (title rows, then "LRN, Student Name,
// Grade, Status"), and a teacher's own grading sheet: other names such as "Total Grade",
// "Final Grade" or "Grade (Q2)", and a header that takes two rows (group names above,
// column names below). Returns null when no header is recognized.
export function detectGradeHeader(rows: string[][]): { start: number; numberCol: number; gradeCol: number } | null {
  let number: { row: number; col: number; rank: number } | null = null;
  let grade: { row: number; col: number; rank: number } | null = null;
  let headerStart = -1;

  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    // The header block is at most two rows: stop looking once it has started and ended
    if (headerStart !== -1 && r > headerStart + 1) break;
    const cells = rows[r].map(normalizeHeader);
    const n = bestHeader(cells, NUMBER_HEADERS);
    const g = bestHeader(cells, GRADE_HEADERS);
    if (!n && !g) continue;
    if (headerStart === -1) headerStart = r;
    if (n && (!number || n.rank < number.rank)) number = { row: r, ...n };
    if (g && (!grade || g.rank < grade.rank)) grade = { row: r, ...g };
  }

  if (!number || !grade) return null;
  let start = Math.max(number.row, grade.row) + 1;
  // Skip a second header row that repeats the student-number heading (merged group header)
  while (start < rows.length && NUMBER_HEADERS.some((p) => p.test(normalizeHeader(rows[start][number!.col] ?? '')))) start++;
  return { start, numberCol: number.col, gradeCol: grade.col };
}

export function findGradeColumns(rows: string[][]): { start: number; numberCol: number; gradeCol: number } {
  const found = detectGradeHeader(rows);
  if (found) return found;
  // No recognizable header: column A = student number, column B = grade,
  // skipping a first row whose cell A isn't a plausible student number
  const first = /^\d+$/.test((rows[0]?.[0] || '').trim()) ? 0 : 1;
  return { start: first, numberCol: 0, gradeCol: 1 };
}

// Reads an uploaded grades sheet into rows: .xlsx (e.g. the teacher's own
// Excel export, read with the exceljs the export already uses) or CSV.
export async function readSheetFile(file: File): Promise<string[][]> {
  if (/\.xlsx$/i.test(file.name)) return rowsFromXlsx(await file.arrayBuffer());
  return parseCsv(await file.text());
}

// Rows of displayed cell text from the workbook's grades sheet: the first sheet with
// recognizable grade columns (a workbook may start with an instructions/summary tab),
// otherwise the first sheet that has anything in it. Blank rows are dropped.
export async function rowsFromXlsx(data: ArrayBuffer): Promise<string[][]> {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(data);
  const sheets = workbook.worksheets.map((sheet) => {
    const rows: string[][] = [];
    sheet.eachRow((row) => {
      const cells: string[] = [];
      row.eachCell({ includeEmpty: true }, (cell, col) => {
        cells[col - 1] = cell.text ?? '';
      });
      const filled = Array.from(cells, (c) => c ?? '');
      if (filled.some((c) => c.trim() !== '')) rows.push(filled);
    });
    return rows;
  });
  return sheets.find((rows) => detectGradeHeader(rows)) ?? sheets.find((rows) => rows.length > 0) ?? [];
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportDropdown } from '@/components/ui/export-dropdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/format-date';
import {
  defaultSchoolYear,
  gradeAverage,
  gradeLevelForYear,
  PASSING_GRADE,
  reportRows,
  summarizeGrades,
} from '@/lib/grades';
import { useRefresh } from '@/lib/refresh-context';
import { useAlert } from '@/lib/use-alert';
import { ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useStudentAuth } from '../hooks/useStudentAuth';
import { useActiveSchoolYear, useApprovedGrades, useEnrollmentHistory } from '../hooks/useStudentRecords';

const passing = (g: number) => g >= PASSING_GRADE;

export default function ReportsPage() {
  const { student, isLoading } = useStudentAuth();
  const { refreshKey } = useRefresh();
  const { showAlert } = useAlert();
  const studentId = student?.id ? String(student.id) : undefined;
  const grades = useApprovedGrades(studentId, refreshKey);
  const history = useEnrollmentHistory(studentId);
  const activeYear = useActiveSchoolYear();

  const [pickedYear, setPickedYear] = useState<string | null>(null);
  const [coverage, setCoverage] = useState<string>('all'); // what the downloaded certificate covers

  const years = useMemo(
    () => [...new Set((grades ?? []).map((g) => g.school_year).filter(Boolean) as string[])].sort().reverse(),
    [grades]
  );
  const year = pickedYear ?? defaultSchoolYear(years, activeYear);

  const card = useMemo(() => summarizeGrades(grades ?? [], year), [grades, year]);
  const finals = card.map((r) => r.average).filter((a): a is number => a !== null);
  const generalAverage = gradeAverage(finals);

  const name = useMemo(() => {
    if (!student) return '';
    const s = student as any;
    return [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(' ').trim() || student.email;
  }, [student]);
  // Grade level of THAT school year (a past report must not say the student's current grade)
  const gradeLevel = gradeLevelForYear(history, year) ?? (year === activeYear ? student?.grade_level ?? null : null);

  const quarterNumber = coverage === 'all' ? 'all' : Number(coverage);
  const rows = useMemo(() => reportRows(grades ?? [], year, quarterNumber as number | 'all'), [grades, year, quarterNumber]);
  const coverageLabel = coverage === 'all' ? 'Whole school year' : `Quarter ${coverage}`;
  const certAverage = gradeAverage(rows.map((r) => r.grade));
  const certAverageRounded = certAverage === null ? null : Math.round(certAverage);
  const verdict = (avg: number | null) =>
    avg === null ? '' : coverage === 'all' ? (avg >= PASSING_GRADE ? 'PROMOTED' : 'RETAINED') : avg >= PASSING_GRADE ? 'PASSED' : 'FAILED';

  const generateExcel = useCallback(async () => {
    if (!student || rows.length === 0) {
      showAlert({ message: 'There are no approved grades to download for these choices.', type: 'warning' });
      return;
    }
    const { downloadExcel } = await import('@/lib/export-excel');
    await downloadExcel(`Report_Card_${name.replace(/\s+/g, '_')}_${year}`, {
      title: [
        'STO. NIÑO DE PRAGA ACADEMY OF LA PAZ HOMES II, INC.',
        'CERTIFICATE OF GRADES',
        `Student: ${name.toUpperCase()}${gradeLevel ? `  |  ${gradeLevel}` : ''}`,
        `${coverageLabel} | School Year: ${year}`,
        `Generated: ${formatDate(new Date())}`,
      ],
      columns: ['Subject', coverage === 'all' ? 'Final Grade' : 'Quarterly Grade', 'Remarks'],
      colWidths: [40, 20, 20],
      rows: rows.map((r) => [r.subject, r.grade, r.remarks]),
      totalRow: ['General Average', certAverageRounded ?? 'N/A', verdict(certAverage)],
      headerColor: 'red',
    });
  }, [student, rows, name, year, gradeLevel, coverage, coverageLabel, certAverage, certAverageRounded, showAlert]);

  const generatePDF = useCallback(async () => {
    if (!student || rows.length === 0) {
      showAlert({ message: 'There are no approved grades to download for these choices.', type: 'warning' });
      return;
    }
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('STO. NIÑO DE PRAGA ACADEMY', 105, 18, { align: 'center' });
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.text('OF LA PAZ HOMES II, INC.', 105, 24, { align: 'center' });
      doc.text('La Paz Homes II/Karlaville Parkhomes, Trece', 105, 28, { align: 'center' });
      doc.setFontSize(16); doc.setFont('helvetica', 'bold');
      doc.text('CERTIFICATE OF GRADES', 105, 45, { align: 'center' });

      doc.setFontSize(12); doc.setFont('helvetica', 'normal');
      doc.text(`This is to certify that ${name.toUpperCase()}${gradeLevel ? ` of ${gradeLevel}` : ''}`, 105, 60, { align: 'center' });
      doc.text(`has the following grades for ${coverageLabel.toLowerCase()}, School Year ${year}.`, 105, 66, { align: 'center' });

      const body: (string | number)[][] = rows.map((r) => [r.subject, r.grade, r.remarks]);
      body.push([coverage === 'all' ? 'General Average' : 'General Average for the quarter', certAverageRounded ?? 'N/A', verdict(certAverage)]);
      autoTable(doc, {
        startY: 80,
        head: [['SUBJECT', coverage === 'all' ? 'FINAL GRADE' : 'QUARTERLY GRADE', 'REMARKS']],
        body,
        theme: 'grid',
        headStyles: { fillColor: [77, 17, 22], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { fontSize: 9, textColor: [0, 0, 0] },
        columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 40, halign: 'center' }, 2: { cellWidth: 50, halign: 'center' } },
        margin: { left: 10, right: 10 },
      });

      const finalY = ((doc as any).lastAutoTable?.finalY ?? 200) + 15;
      doc.setFontSize(10); doc.setFont('helvetica', 'italic');
      doc.text('This certification is issued upon the request of the aforementioned student', 105, finalY, { align: 'center' });
      doc.text('for EDUCATIONAL ASSISTANCE and for the stated purpose only.', 105, finalY + 6, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(`Issued this ${formatDate(new Date())} at SNDPA-LPH, Trece Martires City, Cavite.`, 105, finalY + 15, { align: 'center' });
      const signatureY = finalY + 35;
      doc.text('MRS. CORAZON R. ULEP', 50, signatureY);
      doc.text('School Registrar', 50, signatureY + 5);
      doc.text('COL GILMAR N GALICIA PA(Res) ME', 150, signatureY);
      doc.text('Principal / Administrator', 150, signatureY + 5);
      doc.setFontSize(8); doc.setFont('helvetica', 'italic');
      doc.text('Should there be a need to verify this document? Please call (046) 443-33-67 Office of the Registrar', 105, 270, { align: 'center' });
      doc.text('NOT VALID WITHOUT SCHOOL SEAL', 105, 275, { align: 'center' });
      doc.save(`Certificate_of_Grades_${name.replace(/\s+/g, '_')}_${year}.pdf`);
    } catch (error: any) {
      showAlert({ message: `We could not create the PDF: ${error?.message || 'unknown error'}. Please try again.`, type: 'error' });
    }
  }, [student, rows, name, year, gradeLevel, coverage, coverageLabel, certAverage, certAverageRounded, showAlert]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-800 border-t-transparent" />
      </div>
    );
  }
  if (!student) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-sm text-gray-500 mt-0.5">Your report card, one school year at a time.</p>
        </div>
        {rows.length > 0 && <ExportDropdown onPDF={generatePDF} onExcel={generateExcel} size="sm" />}
      </div>

      {grades === null ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-800 border-t-transparent mx-auto" />
        </div>
      ) : years.length === 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden />
            <p className="text-gray-600 font-medium">No report card yet</p>
            <p className="text-sm text-gray-400 mt-1">Your report card appears here once your grades are approved.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
              School year
              <Select value={year} onValueChange={setPickedYear}>
                <SelectTrigger className="w-44 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>S.Y. {y}{y === activeYear ? ' (current)' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
              Download covers
              <Select value={coverage} onValueChange={setCoverage}>
                <SelectTrigger className="w-44 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Whole school year</SelectItem>
                  {[1, 2, 3, 4].map((q) => (
                    <SelectItem key={q} value={String(q)}>Quarter {q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base">Report card · S.Y. {year}</CardTitle>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm pt-1">
                <div><dt className="inline text-gray-500">Student: </dt><dd className="inline font-medium text-gray-900">{name}</dd></div>
                <div><dt className="inline text-gray-500">LRN: </dt><dd className="inline font-medium text-gray-900">{(student as any).student_number || '—'}</dd></div>
                <div><dt className="inline text-gray-500">Grade level: </dt><dd className="inline font-medium text-gray-900">{gradeLevel ?? '—'}</dd></div>
              </dl>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs text-gray-500">
                    <tr>
                      <th className="px-4 py-2 font-medium">Subject</th>
                      {[1, 2, 3, 4].map((q) => (
                        <th key={q} className="px-3 py-2 font-medium text-center">Q{q}</th>
                      ))}
                      <th className="px-3 py-2 font-medium text-center">Final</th>
                      <th className="px-4 py-2 font-medium text-right">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {card.map((r) => (
                      <tr key={r.subject}>
                        <td className="px-4 py-2.5 text-gray-900">{r.subject}</td>
                        {([1, 2, 3, 4] as const).map((q) => (
                          <td key={q} className="px-3 py-2.5 text-center tabular-nums text-gray-700">{r.quarters[q] ?? '—'}</td>
                        ))}
                        <td className={`px-3 py-2.5 text-center tabular-nums font-semibold ${r.average !== null && !passing(r.average) ? 'text-red-700' : 'text-gray-900'}`}>
                          {r.average ?? '—'}
                        </td>
                        <td className={`px-4 py-2.5 text-right text-xs font-medium ${r.average !== null && !passing(r.average) ? 'text-red-700' : 'text-gray-600'}`}>
                          {r.average === null ? '—' : passing(r.average) ? 'Passed' : 'Failed'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-gray-900" colSpan={5}>General average</td>
                      <td className={`px-3 py-2.5 text-center tabular-nums font-bold ${generalAverage !== null && !passing(generalAverage) ? 'text-red-700' : 'text-gray-900'}`}>
                        {generalAverage ?? '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700">
                        {generalAverage === null ? '' : passing(generalAverage) ? 'Promoted' : 'Retained'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-gray-500">
            Only approved grades are shown. Need the individual quarter grades with dates? See{' '}
            <Link href="/student/grades" className="text-red-800 underline underline-offset-2">Grades</Link>.
          </p>
        </>
      )}
    </div>
  );
}

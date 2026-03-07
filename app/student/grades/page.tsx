'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAlert } from '@/lib/use-alert';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, GraduationCap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStudentAuth } from '../hooks/useStudentAuth';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

type GradeStatus = 'pending' | 'approved' | 'rejected' | null;

interface GradeItem {
  id: string;
  subject: string;
  grade: string;
  status: GradeStatus;
  lastUpdated: string;
}

interface EnrollmentInfo {
  status: string;
  academicYear: string;
  semester?: string;
  gradeLevel?: string;
  strand?: string;
}

interface GradesData {
  grades: GradeItem[];
  enrollment?: EnrollmentInfo;
}

function getLetterGrade(numeric: number) {
  if (numeric >= 90) return { letter: 'A', color: 'text-green-700' };
  if (numeric >= 85) return { letter: 'B+', color: 'text-green-600' };
  if (numeric >= 80) return { letter: 'B', color: 'text-blue-700' };
  if (numeric >= 75) return { letter: 'C', color: 'text-blue-600' };
  return { letter: 'F', color: 'text-red-700' };
}

export default function GradesPage() {
  const { student, isLoading } = useStudentAuth();
  const { showAlert } = useAlert();
  const [gradesData, setGradesData] = useState<GradesData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const displayName = useMemo(() => {
    if (!student) return 'Student';
    if (student.first_name && student.last_name) {
      return `${student.first_name} ${student.last_name}`;
    }
    return student.email?.split('@')[0] || 'Student';
  }, [student]);

  const fetchGradesData = useCallback(async () => {
    if (!student) return;
    setDataLoading(true);
    try {
      const [dashboardRes, gradesRes] = await Promise.all([
        fetch('/api/student/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: student.id, email: student.email }),
        }),
        fetch(`/api/parent/student-grades?student_id=${student.id}`),
      ]);

      const dashboardPayload = await dashboardRes.json().catch(() => ({}));
      const gradesPayload = await gradesRes.json().catch(() => ({}));

      const grades: GradeItem[] =
        gradesPayload?.success && gradesPayload?.grades?.length > 0
          ? gradesPayload.grades.map((g: any, index: number) => ({
              id: g.id || String(index + 1),
              subject: g.subject,
              grade: String(g.grade),
              status: g.status ?? null,
              lastUpdated: g.lastUpdated || new Date().toISOString(),
            }))
          : (dashboardPayload?.data?.grades || []).map(
              (g: any, index: number) => ({
                id: String(index + 1),
                subject: g.subject,
                grade: String(g.grade),
                status: null,
                lastUpdated: g.lastUpdated || new Date().toISOString(),
              })
            );

      setGradesData({
        grades,
        enrollment: dashboardPayload?.data?.enrollment,
      });
    } catch (error) {
      console.error('Grades fetch error:', error);
    } finally {
      setDataLoading(false);
    }
  }, [student, displayName]);

  useEffect(() => {
    if (student) fetchGradesData();
  }, [student, fetchGradesData]);

  // Students only see approved grades
  const gradeItems = (gradesData?.grades || []).filter(
    (g) => g.status === 'approved'
  );
  const enrollmentInfo = gradesData?.enrollment;

  const generalAverage =
    gradeItems.length > 0
      ? (
          gradeItems.reduce((sum, g) => sum + parseFloat(g.grade), 0) /
          gradeItems.length
        ).toFixed(1)
      : null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const generateGradesPDF = useCallback(async () => {
    if (!student) {
      showAlert({
        message: 'Please log in to download your certificate.',
        type: 'warning',
      });
      return;
    }
    // Only allow PDF if there are approved grades
    const approvedItems = gradeItems.filter((g) => g.status === 'approved');
    if (approvedItems.length === 0) {
      showAlert({
        message: 'No approved grades available to download yet.',
        type: 'warning',
      });
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('STO. NIÑO DE PRAGA ACADEMY', 105, 18, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OF LA PAZ HOMES II, INC.', 105, 24, { align: 'center' });
      doc.text('La Paz Homes II/Karlaville Parkhomes, Trece', 105, 28, {
        align: 'center',
      });

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('CERTIFICATE OF GRADES', 105, 45, { align: 'center' });

      const studentName =
        `${student.first_name || ''} ${(student as any).middle_name || ''} ${student.last_name || ''}`.trim() ||
        displayName;
      const gradeLevel =
        student.grade_level || enrollmentInfo?.gradeLevel || 'N/A';
      const academicYear = enrollmentInfo?.academicYear || '2024-2025';
      const semester = enrollmentInfo?.semester || 'SECOND SEMESTER';

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `This is to certify that ${studentName.toUpperCase()} of Grade ${gradeLevel}`,
        105,
        60,
        { align: 'center' }
      );
      doc.text(
        `for the ${semester} of ACADEMIC YEAR ${academicYear}.`,
        105,
        66,
        { align: 'center' }
      );

      const tableData = approvedItems.map((grade) => {
        const num = parseFloat(grade.grade);
        return [
          grade.subject || 'N/A',
          grade.grade,
          !isNaN(num) && num >= 75 ? 'PASSED' : 'FAILED',
        ];
      });

      const numericAvg =
        approvedItems.length > 0
          ? (
              approvedItems.reduce((s, g) => s + parseFloat(g.grade), 0) /
              approvedItems.length
            ).toFixed(0)
          : 'N/A';
      const actionTaken =
        numericAvg !== 'N/A' && parseFloat(numericAvg) >= 75
          ? 'PROMOTED'
          : 'RETAINED';
      tableData.push([
        'General Average for the semester',
        numericAvg,
        actionTaken,
      ]);

      if (typeof (doc as any).autoTable === 'function') {
        (doc as any).autoTable({
          startY: 80,
          head: [['SUBJECT', 'SEM FINAL GRADE', 'ACTION TAKEN']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [220, 220, 220],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 10,
          },
          bodyStyles: { fontSize: 9, textColor: [0, 0, 0] },
          columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 40, halign: 'center' },
            2: { cellWidth: 50, halign: 'center' },
          },
          margin: { left: 10, right: 10 },
        });
      }

      let finalY = 200;
      if (doc.lastAutoTable?.finalY) finalY = doc.lastAutoTable.finalY + 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(
        'This certification is issued upon the request of the aforementioned student',
        105,
        finalY,
        { align: 'center' }
      );
      doc.text(
        'for EDUCATIONAL ASSISTANCE and for the stated purpose only.',
        105,
        finalY + 6,
        { align: 'center' }
      );

      const dateStr = new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Issued this ${dateStr} at SNDPA-LPH, Trece Martires City, Cavite.`,
        105,
        finalY + 15,
        { align: 'center' }
      );

      const signatureY = finalY + 35;
      doc.setFontSize(10);
      doc.text('MRS. CORAZON R. ULEP', 50, signatureY);
      doc.text('School Registrar', 50, signatureY + 5);
      doc.text('COL GILMAR N GALICIA PA(Res) ME', 150, signatureY);
      doc.text('Principal / Administrator', 150, signatureY + 5);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        'Should there be a need to verify this document? Please call (046) 443-33-67 Office of the Registrar',
        105,
        270,
        { align: 'center' }
      );
      doc.text('NOT VALID WITHOUT SCHOOL SEAL', 105, 275, { align: 'center' });

      doc.save(
        `Certificate_of_Grades_${studentName.replace(/\s+/g, '_')}_${academicYear}.pdf`
      );
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      showAlert({
        message: `Failed to generate PDF: ${error?.message || 'Unknown error'}.`,
        type: 'error',
      });
    }
  }, [student, gradeItems, enrollmentInfo, displayName, showAlert]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-800 border-t-transparent" />
      </div>
    );
  }

  if (!student) return null;

  const hasApproved = gradeItems.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Grades & Reports</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Your academic performance for the current semester
          </p>
        </div>
        <Button
          onClick={generateGradesPDF}
          className="bg-red-800 hover:bg-red-700 text-white"
          disabled={!hasApproved}
          title={
            !hasApproved
              ? 'PDF is available once grades are approved'
              : 'Download Certificate of Grades'
          }
        >
          <Download className="w-4 h-4 mr-2" />
          Download Certificate
        </Button>
      </div>

      {/* Summary cards — only shown when there are grades */}
      {gradeItems.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Subjects
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {gradeItems.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                General Average
              </p>
              <p
                className={`text-3xl font-bold mt-1 ${generalAverage ? (parseFloat(generalAverage) >= 75 ? 'text-green-700' : 'text-red-700') : 'text-gray-400'}`}
              >
                {generalAverage ?? '—'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grades list */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle>Current Grades</CardTitle>
          <CardDescription>
            Your grades for the current semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dataLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-800 border-t-transparent mx-auto" />
              <p className="text-gray-500 mt-3 text-sm">Loading grades...</p>
            </div>
          ) : gradeItems.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                aria-hidden
              />
              <p className="text-gray-600 font-medium">
                No grades released yet
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Your grades will appear here once they have been finalized by
                your school.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {gradeItems.map((grade) => {
                const num = parseFloat(grade.grade);
                const letterInfo = !isNaN(num) ? getLetterGrade(num) : null;
                const isPassing = !isNaN(num) && num >= 75;

                return (
                  <div
                    key={grade.id}
                    className="flex items-center justify-between py-4 px-1"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {grade.subject}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Updated {formatDate(grade.lastUpdated)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                      <div className="text-right">
                        <span
                          className={`text-2xl font-bold ${isPassing ? 'text-green-700' : 'text-red-700'}`}
                        >
                          {grade.grade}
                        </span>
                        {letterInfo && (
                          <span
                            className={`block text-xs font-semibold ${letterInfo.color}`}
                          >
                            {letterInfo.letter}
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-2 h-10 rounded-full ${isPassing ? 'bg-green-400' : 'bg-red-400'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {!hasApproved && (
        <p className="text-center text-xs text-gray-400">
          Certificate download will be available once grades are finalized.
        </p>
      )}
    </div>
  );
}

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

interface GradeItem {
  id: string;
  subject: string;
  grade: string;
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
      console.log('🔍 Fetching grades for student:', {
        id: student.id,
        email: student.email,
        name: displayName,
      });

      // Fetch from dashboard API
      const dashboardResponse = await fetch('/api/student/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          email: student.email,
        }),
      });

      const dashboardPayload = await dashboardResponse.json().catch(() => ({}));
      console.log('📊 Dashboard API response:', {
        success: dashboardPayload?.success,
        gradesCount: dashboardPayload?.data?.grades?.length || 0,
        grades: dashboardPayload?.data?.grades,
      });

      // Also fetch directly from grades table for more accurate data
      const gradesResponse = await fetch(
        `/api/parent/student-grades?student_id=${student.id}`
      );
      const gradesPayload = await gradesResponse.json().catch(() => ({}));
      console.log('📚 Direct grades API response:', {
        success: gradesPayload?.success,
        gradesCount: gradesPayload?.grades?.length || 0,
        grades: gradesPayload?.grades,
      });

      // Use direct grades data if available, otherwise fallback to dashboard
      const gradesData =
        gradesPayload?.success && gradesPayload?.grades?.length > 0
          ? gradesPayload.grades.map((g: any, index: number) => ({
              id: g.id || String(index + 1),
              subject: g.subject,
              grade: String(g.grade),
              lastUpdated: g.lastUpdated || new Date().toISOString(),
            }))
          : dashboardPayload?.data?.grades || [];

      console.log('✅ Final grades data:', {
        count: gradesData.length,
        source:
          gradesPayload?.success && gradesPayload?.grades?.length > 0
            ? 'REAL DATABASE'
            : 'FALLBACK/DUMMY',
        data: gradesData,
      });

      setGradesData({
        grades: gradesData,
        enrollment: dashboardPayload?.data?.enrollment,
      });
    } catch (error) {
      console.error('❌ Grades fetch error:', error);
    } finally {
      setDataLoading(false);
    }
  }, [student, displayName]);

  useEffect(() => {
    if (student) {
      fetchGradesData();
    }
  }, [student, fetchGradesData]);

  const gradeItems = gradesData?.grades || [];
  const enrollmentInfo = gradesData?.enrollment;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
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

    if (gradeItems.length === 0) {
      showAlert({
        message: 'No grades available to download.',
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

      // School information - centered
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('STO. NIÑO DE PRAGA ACADEMY', 105, 18, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OF LA PAZ HOMES II, INC.', 105, 24, { align: 'center' });
      doc.text('La Paz Homes II/Karlaville Parkhomes, Trece', 105, 28, {
        align: 'center',
      });

      // Certificate title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('CERTIFICATE OF GRADES', 105, 45, { align: 'center' });

      // Student information
      const studentName =
        `${student.first_name || ''} ${student.middle_name || ''} ${student.last_name || ''}`.trim() ||
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

      // Grades table
      const tableData = gradeItems.map((grade) => {
        const gradeValue = grade.grade || '0';
        const numericGrade = parseFloat(gradeValue);
        return [
          grade.subject || 'N/A',
          gradeValue,
          !isNaN(numericGrade) && numericGrade >= 75 ? 'PASSED' : 'FAILED',
        ];
      });

      // Calculate general average
      const numericGrades = gradeItems
        .map((g) => {
          const gradeValue = g.grade || '0';
          return parseFloat(gradeValue);
        })
        .filter((g) => !isNaN(g));

      const generalAverage =
        numericGrades.length > 0
          ? (
              numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length
            ).toFixed(0)
          : 'N/A';
      const actionTaken =
        generalAverage !== 'N/A' && parseFloat(generalAverage) >= 75
          ? 'PROMOTED'
          : 'RETAINED';

      // Add general average row
      tableData.push([
        'General Average for the semester',
        generalAverage,
        actionTaken,
      ]);

      // Create table using autoTable
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
          bodyStyles: {
            fontSize: 9,
            textColor: [0, 0, 0],
          },
          columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 40, halign: 'center' },
            2: { cellWidth: 50, halign: 'center' },
          },
          margin: { left: 10, right: 10 },
        });
      }

      // Certification text
      let finalY = 200;
      if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
        finalY = doc.lastAutoTable.finalY + 15;
      }

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

      // Date and location
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('en-US', {
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

      // Signatures section
      const signatureY = finalY + 35;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Left signature
      doc.text('MRS. CORAZON R. ULEP', 50, signatureY);
      doc.text('School Registrar', 50, signatureY + 5);

      // Right signature
      doc.text('COL GILMAR N GALICIA PA(Res) ME', 150, signatureY);
      doc.text('Principal / Administrator', 150, signatureY + 5);

      // Footer note
      const footerY = 270;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        'Should there be a need to verify this document? Please call (046) 443-33-67 Office of the Registrar',
        105,
        footerY,
        { align: 'center' }
      );
      doc.text('NOT VALID WITHOUT SCHOOL SEAL', 105, footerY + 5, {
        align: 'center',
      });

      // Save PDF
      const fileName = `Certificate_of_Grades_${studentName.replace(/\s+/g, '_')}_${academicYear}.pdf`;
      doc.save(fileName);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-red-800">Loading...</div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Grades & Reports</h2>
        <Button
          onClick={generateGradesPDF}
          className="bg-red-800 hover:bg-red-700 text-white"
          disabled={gradeItems.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Certificate (PDF)
        </Button>
      </div>

      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle>Current Grades</CardTitle>
          <CardDescription>
            Your grades for the current semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gradeItems.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                aria-hidden
              />
              <p className="text-gray-600">
                {dataLoading ? 'Fetching grades...' : 'No grades available.'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Grades will be loaded from the database.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {gradeItems.map((grade) => (
                <div
                  key={grade.id}
                  className="flex items-center justify-between border border-gray-100 rounded-lg p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">{grade.subject}</p>
                    <p className="text-sm text-gray-500">
                      Updated {formatDate(grade.lastUpdated)}
                    </p>
                  </div>
                  <div className="text-xl font-semibold text-gray-900">
                    {grade.grade}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

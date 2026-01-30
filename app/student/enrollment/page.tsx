'use client';

import { Badge } from '@/components/ui/badge';
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
import { Download, GraduationCap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStudentAuth } from '../hooks/useStudentAuth';

interface EnrollmentInfo {
  status: string;
  academicYear: string;
  semester?: string;
  gradeLevel?: string;
  strand?: string;
}

interface SubjectTeacher {
  id: string;
  subject: string;
  teacher: string;
}

interface EnrollmentData {
  enrollment: EnrollmentInfo;
  subjects: SubjectTeacher[];
}

export default function EnrollmentPage() {
  const { student, isLoading } = useStudentAuth();
  const { showAlert } = useAlert();
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(
    null
  );
  const [dataLoading, setDataLoading] = useState(false);

  const displayName = useMemo(() => {
    if (!student) return 'Student';
    if (student.first_name && student.last_name) {
      return `${student.first_name} ${student.last_name}`;
    }
    return student.email?.split('@')[0] || 'Student';
  }, [student]);

  const fetchEnrollmentData = useCallback(async () => {
    if (!student) return;

    setDataLoading(true);
    try {
      const response = await fetch('/api/student/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          email: student.email,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (response.ok && payload?.success && payload?.data) {
        setEnrollmentData({
          enrollment: payload.data.enrollment || {},
          subjects: payload.data.subjects || [],
        });
      }
    } catch (error) {
      console.error('Enrollment fetch error:', error);
    } finally {
      setDataLoading(false);
    }
  }, [student]);

  useEffect(() => {
    if (student) {
      fetchEnrollmentData();
    }
  }, [student, fetchEnrollmentData]);

  const enrollmentInfo = enrollmentData?.enrollment;
  const subjects = enrollmentData?.subjects || [];

  const generateCertificationPDF = useCallback(async () => {
    if (!student) {
      showAlert({
        message: 'Please log in to download your certification.',
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

      // School header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('STO. NIÑO DE PRAGA ACADEMY', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OF LA PAZ HOMES II, INC.', 105, 26, { align: 'center' });
      doc.text('La Paz Homes II/Karlaville Parkhomes, Trece', 105, 30, {
        align: 'center',
      });

      // Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('CERTIFICATION OF ENROLLMENT', 105, 45, { align: 'center' });

      // Student information
      const studentName =
        `${student.first_name || ''} ${student.last_name || ''}`.trim() ||
        displayName;
      const gradeLevel =
        student.grade_level || enrollmentInfo?.gradeLevel || 'N/A';
      const academicYear = enrollmentInfo?.academicYear || '2024-2025';
      const semester = enrollmentInfo?.semester || 'SECOND SEMESTER';

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `This is to certify that ${studentName.toUpperCase()}`,
        105,
        65,
        {
          align: 'center',
        }
      );
      doc.text(
        `is officially enrolled as a student of Grade ${gradeLevel}`,
        105,
        72,
        {
          align: 'center',
        }
      );
      doc.text(
        `for the ${semester} of Academic Year ${academicYear}.`,
        105,
        79,
        {
          align: 'center',
        }
      );

      // Subjects table
      if (subjects.length > 0) {
        let yPos = 95;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Enrolled Subjects:', 20, yPos);

        yPos += 8;
        doc.setFontSize(10);
        doc.text('SUBJECT', 25, yPos);
        doc.text('TEACHER', 120, yPos);

        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        subjects.forEach((subject) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(subject.subject, 25, yPos);
          doc.text(subject.teacher, 120, yPos);
          yPos += 6;
        });
      }

      // Certification text
      const finalY = subjects.length > 0 ? 160 : 100;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(
        'This certification is issued upon the request of the student',
        105,
        finalY,
        { align: 'center' }
      );
      doc.text('for whatever legal purpose it may serve.', 105, finalY + 6, {
        align: 'center',
      });

      // Date
      const currentDate = new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Issued this ${currentDate} at SNDPA-LPH, Trece Martires City.`,
        105,
        finalY + 15,
        {
          align: 'center',
        }
      );

      // Signatures
      const signatureY = finalY + 35;
      doc.text('MRS. CORAZON R. ULEP', 50, signatureY);
      doc.text('School Registrar', 50, signatureY + 5);

      doc.text('COL GILMAR N GALICIA PA(Res) ME', 150, signatureY);
      doc.text('Principal / Administrator', 150, signatureY + 5);

      // Save PDF
      const fileName = `Enrollment_Certificate_${studentName.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      showAlert({
        message: `Failed to generate PDF: ${error?.message || 'Unknown error'}.`,
        type: 'error',
      });
    }
  }, [student, enrollmentInfo, subjects, displayName, showAlert]);

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
        <h2 className="text-2xl font-bold text-gray-900">Enrollment</h2>
        <Button
          onClick={generateCertificationPDF}
          className="bg-red-800 hover:bg-red-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Certification (PDF)
        </Button>
      </div>

      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle>Enrollment Status</CardTitle>
          <CardDescription>
            Your current enrollment status and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <h4 className="font-medium text-green-800">
                  Enrollment Status
                </h4>
                <p className="text-sm text-green-600">
                  {enrollmentInfo?.status ||
                    (student.grade_level
                      ? `Currently enrolled - Grade ${student.grade_level}`
                      : 'Enrollment status will be loaded from the database')}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800">Academic Year</h4>
                <p className="text-sm text-gray-600">
                  {enrollmentInfo?.academicYear ||
                    'Academic year information will be loaded from the database.'}
                </p>
              </div>

              {enrollmentInfo?.semester && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800">Semester</h4>
                  <p className="text-sm text-gray-600">
                    {enrollmentInfo.semester}
                  </p>
                </div>
              )}

              {enrollmentInfo?.strand && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800">Strand</h4>
                  <p className="text-sm text-gray-600">
                    {enrollmentInfo.strand}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle>Subjects and Teachers</CardTitle>
          <CardDescription>
            Your enrolled subjects and assigned teachers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                aria-hidden
              />
              <p className="text-gray-600">
                {dataLoading
                  ? 'Loading subjects...'
                  : 'No subjects assigned yet.'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Subject and teacher information will be loaded from the
                database.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">
                      {subject.subject}
                    </h5>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Teacher:</span>{' '}
                      {subject.teacher}
                    </p>
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

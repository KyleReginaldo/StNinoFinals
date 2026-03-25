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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabaseClient';
import { useAlert } from '@/lib/use-alert';
import jsPDF from 'jspdf';
import {
  AlertCircle,
  BookOpen,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  Hash,
  Layers,
  Send,
  Upload,
  User2,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStudentAuth } from '../hooks/useStudentAuth';

const CURRENT_SCHOOL_YEAR = '2025-2026';

const GRADE_LEVELS = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
];

const SHS_STRANDS = [
  'STEM',
  'ABM',
  'HUMSS',
  'GAS',
  'TVL',
  'Sports',
  'Arts & Design',
];

interface StudentInfo {
  name: string;
  studentNumber: string | null;
  gradeLevel: string | null;
  section: string | null;
  enrollmentDate: string | null;
  status: string | null;
}

interface EnrollmentInfo {
  schoolYear: string | null;
  semester: string | null;
  isEnrolled: boolean;
}

interface ClassInfo {
  id: string;
  className: string;
  classCode: string | null;
  gradeLevel: string | null;
  section: string | null;
  semester: string | null;
  schoolYear: string | null;
  room: string | null;
  schedule: string | null;
  isActive: boolean | null;
  teacher: string;
}

interface EnrollmentData {
  student: StudentInfo;
  enrollment: EnrollmentInfo;
  classes: ClassInfo[];
}

interface EnrollmentRequest {
  id: string;
  student_id: string;
  grade_level: string;
  strand: string | null;
  school_year: string;
  semester: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  assigned_class_id: string | null;
  created_at: string;
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-red-700" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5">
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

export default function EnrollmentPage() {
  const { student, isLoading } = useStudentAuth();
  const { showAlert } = useAlert();

  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(
    null
  );
  const [enrollmentRequest, setEnrollmentRequest] =
    useState<EnrollmentRequest | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [enrollmentHistory, setEnrollmentHistory] = useState<
    EnrollmentRequest[]
  >([]);

  const [gradeLevel, setGradeLevel] = useState('');
  const [strand, setStrand] = useState('');
  const [semester, setSemester] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [previousGradesFile, setPreviousGradesFile] = useState<File | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = useMemo(() => {
    if (!student) return 'Student';
    if (student.first_name && student.last_name) {
      return `${student.first_name} ${student.last_name}`;
    }
    return student.email?.split('@')[0] || 'Student';
  }, [student]);

  const isSHS = gradeLevel === 'Grade 11' || gradeLevel === 'Grade 12';

  const fetchData = useCallback(async () => {
    if (!student) return;
    setDataLoading(true);
    try {
      const [enrollmentRes, requestRes, historyRes] = await Promise.all([
        fetch(`/api/student/enrollment?studentId=${student.id}`),
        fetch(`/api/student/enrollment-request?studentId=${student.id}`),
        fetch(`/api/student/enrollment-history?studentId=${student.id}`),
      ]);
      const [enrollmentPayload, requestPayload, historyPayload] =
        await Promise.all([
          enrollmentRes.json().catch(() => ({})),
          requestRes.json().catch(() => ({})),
          historyRes.json().catch(() => ({})),
        ]);
      if (
        enrollmentRes.ok &&
        enrollmentPayload?.success &&
        enrollmentPayload?.data
      ) {
        setEnrollmentData(enrollmentPayload.data);
      }
      if (requestRes.ok && requestPayload?.success) {
        setEnrollmentRequest(requestPayload.data ?? null);
      }
      if (historyRes.ok && historyPayload?.success) {
        setEnrollmentHistory(historyPayload.data ?? []);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setDataLoading(false);
    }
  }, [student]);

  useEffect(() => {
    if (student) fetchData();
  }, [student, fetchData]);

  const handleSubmitRequest = useCallback(async () => {
    if (!student) return;
    if (!gradeLevel || !semester) {
      showAlert({
        message: 'Please fill in all required fields.',
        type: 'warning',
      });
      return;
    }
    if (isSHS && !strand) {
      showAlert({
        message: 'Please select a strand for Senior High School.',
        type: 'warning',
      });
      return;
    }
    setSubmitting(true);
    try {
      let previousGradesUrl = null;

      if (previousGradesFile) {
        // Only upload if a file was selected.
        const fileExt = previousGradesFile.name.split('.').pop();
        const fileName = `${student.id}_${Date.now()}.${fileExt}`;
        const filePath = `enrollment/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('documents')
          .upload(filePath, previousGradesFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          showAlert({
            message: 'Failed to upload document.',
            type: 'error',
          });
          setSubmitting(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        previousGradesUrl = publicUrlData.publicUrl;
      }

      const res = await fetch('/api/student/enrollment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          gradeLevel,
          strand: isSHS ? strand : null,
          schoolYear: CURRENT_SCHOOL_YEAR,
          semester: Number(semester),
          previousGradesUrl,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        showAlert({
          message: payload?.error || 'Failed to submit request.',
          type: 'error',
        });
        return;
      }
      showAlert({
        message: 'Enrollment request submitted successfully!',
        type: 'success',
      });
      setGradeLevel('');
      setStrand('');
      setSemester('');
      setAdditionalNotes('');
      setPreviousGradesFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchData();
    } catch {
      showAlert({
        message: 'Something went wrong. Please try again.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    student,
    gradeLevel,
    strand,
    semester,
    isSHS,
    previousGradesFile,
    showAlert,
    fetchData,
  ]);

  const info = enrollmentData?.student;
  const enrollment = enrollmentData?.enrollment;
  const classes = enrollmentData?.classes || [];

  const generateCertificationPDF = useCallback(async () => {
    if (!student || !enrollment?.isEnrolled || classes.length === 0) {
      showAlert({
        message: 'No enrollment data available to generate certificate.',
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
      doc.text('STO. NIÑO DE PRAGA ACADEMY', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OF LA PAZ HOMES II, INC.', 105, 26, { align: 'center' });
      doc.text('La Paz Homes II/Karlaville Parkhomes, Trece', 105, 30, {
        align: 'center',
      });
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('CERTIFICATION OF ENROLLMENT', 105, 45, { align: 'center' });
      const studentName = info?.name || displayName;
      const gradeStr = info?.gradeLevel || student.grade_level || 'N/A';
      const academicYear = enrollment?.schoolYear || CURRENT_SCHOOL_YEAR;
      const semStr = enrollment?.semester || '';
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `This is to certify that ${studentName.toUpperCase()}`,
        105,
        65,
        { align: 'center' }
      );
      doc.text(
        `is officially enrolled as a student of Grade ${gradeStr}`,
        105,
        72,
        { align: 'center' }
      );
      doc.text(`for the ${semStr} of Academic Year ${academicYear}.`, 105, 79, {
        align: 'center',
      });
      if (classes.length > 0) {
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
        classes.forEach((cls) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(cls.className, 25, yPos);
          doc.text(cls.teacher, 120, yPos);
          yPos += 6;
        });
      }
      const finalY = classes.length > 0 ? 160 : 100;
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
        { align: 'center' }
      );
      const signatureY = finalY + 35;
      doc.text('MRS. CORAZON R. ULEP', 50, signatureY);
      doc.text('School Registrar', 50, signatureY + 5);
      doc.text('COL GILMAR N GALICIA PA(Res) ME', 150, signatureY);
      doc.text('Principal / Administrator', 150, signatureY + 5);
      doc.save(
        `Enrollment_Certificate_${studentName.replace(/\s+/g, '_')}.pdf`
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      showAlert({ message: `Failed to generate PDF: ${msg}`, type: 'error' });
    }
  }, [student, enrollment, classes, info, displayName, showAlert]);

  const generateHistoryPDF = useCallback(() => {
    if (!enrollmentHistory || enrollmentHistory.length === 0) {
      showAlert({
        message: 'No enrollment history available.',
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
      doc.text('STO. NIÑO DE PRAGA ACADEMY', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text('ENROLLMENT HISTORY', 105, 30, { align: 'center' });

      const studentName = info?.name || displayName;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Student: ${studentName.toUpperCase()}`, 20, 45);

      let yPos = 55;
      doc.setFont('helvetica', 'bold');
      doc.text('Date Applied', 20, yPos);
      doc.text('Grade', 60, yPos);
      doc.text('School Year', 100, yPos);
      doc.text('Status', 150, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'normal');

      enrollmentHistory.forEach((req) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const dateStr = new Date(req.created_at).toLocaleDateString();
        doc.text(dateStr, 20, yPos);
        doc.text(req.grade_level, 60, yPos);
        doc.text(`${req.school_year} (Sem ${req.semester})`, 100, yPos);
        doc.text(req.status.toUpperCase(), 150, yPos);
        yPos += 8;
      });

      doc.save(`Enrollment_History_${studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error('Error generating PDF:', e);
      showAlert({ message: 'Failed to generate history.', type: 'error' });
    }
  }, [enrollmentHistory, displayName, info, showAlert]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-red-800">Loading...</div>
      </div>
    );
  }

  if (!student) return null;

  const isEnrolled = enrollment?.isEnrolled ?? false;
  const reqStatus = enrollmentRequest?.status;

  // ─── ENROLLED ─────────────────────────────────────────────────────────────
  if (isEnrolled) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enrollment</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Your current enrollment information and subjects
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={generateHistoryPDF}
              disabled={dataLoading}
              variant="outline"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Download History
            </Button>
            <Button
              onClick={generateCertificationPDF}
              disabled={dataLoading}
              className="bg-red-800 hover:bg-red-700 text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Download COE
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-700" />
            <div>
              <p className="font-semibold text-green-800">Currently Enrolled</p>
              <p className="text-sm text-green-600">
                {enrollment?.semester ?? ''}
                {enrollment?.semester && enrollment?.schoolYear ? ' · ' : ''}
                A.Y. {enrollment?.schoolYear ?? ''}
              </p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Active
          </Badge>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User2 className="w-4 h-4 text-red-700" />
              Student Information
            </CardTitle>
            <CardDescription>
              Your personal and academic details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <InfoCard
                icon={User2}
                label="Full Name"
                value={info?.name || displayName}
              />
              <InfoCard
                icon={Hash}
                label="Student Number"
                value={info?.studentNumber}
              />
              <InfoCard
                icon={GraduationCap}
                label="Grade Level"
                value={
                  info?.gradeLevel
                    ? `Grade ${info.gradeLevel}`
                    : student.grade_level
                      ? `Grade ${student.grade_level}`
                      : null
                }
              />
              <InfoCard icon={Layers} label="Section" value={info?.section} />
              <InfoCard
                icon={Calendar}
                label="Academic Year"
                value={enrollment?.schoolYear}
              />
              <InfoCard
                icon={CalendarDays}
                label="Semester"
                value={enrollment?.semester}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-red-700" />
              Enrolled Classes
              {classes.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {classes.length} {classes.length === 1 ? 'class' : 'classes'}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Your subjects and assigned teachers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-14">
                <GraduationCap className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No classes found</p>
                <p className="text-sm text-gray-400 mt-1">
                  You are not enrolled in any classes yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className={`p-4 rounded-xl border transition-colors hover:bg-gray-50 ${cls.isActive ? 'border-gray-200' : 'border-gray-100 opacity-70'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h5 className="font-semibold text-gray-900 text-sm leading-snug">
                        {cls.className}
                      </h5>
                      {cls.classCode && (
                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md flex-shrink-0">
                          {cls.classCode}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <User2 className="w-3.5 h-3.5 text-gray-400" />
                        <span>{cls.teacher}</span>
                      </div>
                      {cls.room && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>Room {cls.room}</span>
                        </div>
                      )}
                      {cls.schedule && (
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                          <span>{cls.schedule}</span>
                        </div>
                      )}
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

  // ─── PENDING ──────────────────────────────────────────────────────────────
  if (reqStatus === 'pending') {
    return (
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enrollment</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Track your enrollment status
            </p>
          </div>
          <Button
            onClick={generateHistoryPDF}
            disabled={dataLoading}
            variant="outline"
            className="shrink-0"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Download History
          </Button>
        </div>
        <div className="flex items-start gap-4 p-5 rounded-xl bg-amber-50 border border-amber-200">
          <Clock className="w-7 h-7 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-lg">
              Application Under Review
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Your enrollment request has been submitted and is currently being
              reviewed by the administration. You will be notified once a
              decision has been made.
            </p>
          </div>
        </div>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-red-700" />
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoCard
                icon={GraduationCap}
                label="Grade Level"
                value={enrollmentRequest?.grade_level}
              />
              <InfoCard
                icon={Layers}
                label="Strand"
                value={enrollmentRequest?.strand || 'N/A'}
              />
              <InfoCard
                icon={Calendar}
                label="School Year"
                value={enrollmentRequest?.school_year}
              />
              <InfoCard
                icon={CalendarDays}
                label="Semester"
                value={
                  enrollmentRequest?.semester === 1
                    ? '1st Semester'
                    : '2nd Semester'
                }
              />
              <InfoCard
                icon={Hash}
                label="Submitted On"
                value={
                  enrollmentRequest?.created_at
                    ? new Date(enrollmentRequest.created_at).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )
                    : null
                }
              />
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                    Status
                  </p>
                  <p className="text-sm font-semibold text-amber-800 mt-0.5">
                    Pending Review
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── REJECTED ─────────────────────────────────────────────────────────────
  if (reqStatus === 'rejected') {
    return (
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enrollment</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Submit a new enrollment application
            </p>
          </div>
          <Button
            onClick={generateHistoryPDF}
            disabled={dataLoading}
            variant="outline"
            className="shrink-0"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Download History
          </Button>
        </div>
        <div className="flex items-start gap-4 p-5 rounded-xl bg-red-50 border border-red-200">
          <XCircle className="w-7 h-7 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-lg">
              Application Not Approved
            </p>
            <p className="text-sm text-red-700 mt-1">
              Your previous enrollment request was not approved. Review the
              feedback below and submit a new application.
            </p>
            {enrollmentRequest?.admin_notes && (
              <div className="mt-3 p-3 bg-red-100 rounded-lg">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">
                  Admin Feedback
                </p>
                <p className="text-sm text-red-800">
                  {enrollmentRequest.admin_notes}
                </p>
              </div>
            )}
          </div>
        </div>
        <EnrollmentForm
          gradeLevel={gradeLevel}
          setGradeLevel={setGradeLevel}
          strand={strand}
          setStrand={setStrand}
          semester={semester}
          setSemester={setSemester}
          additionalNotes={additionalNotes}
          setAdditionalNotes={setAdditionalNotes}
          isSHS={isSHS}
          submitting={submitting}
          onSubmit={handleSubmitRequest}
          title="Submit New Application"
          description="Fill in the details for your new enrollment request."
          fileInputRef={fileInputRef}
          setPreviousGradesFile={setPreviousGradesFile}
        />
      </div>
    );
  }

  // ─── NO REQUEST (default) ─────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enrollment</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Submit an enrollment application for the upcoming school year
          </p>
        </div>
        <Button
          onClick={generateHistoryPDF}
          disabled={dataLoading}
          variant="outline"
          className="shrink-0"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Download History
        </Button>
      </div>
      <div className="flex items-start gap-4 p-5 rounded-xl bg-blue-50 border border-blue-200">
        <AlertCircle className="w-7 h-7 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-800 text-lg">
            Not Yet Enrolled
          </p>
          <p className="text-sm text-blue-700 mt-1">
            You are not currently enrolled. Fill out the form below to submit an
            enrollment request for A.Y. {CURRENT_SCHOOL_YEAR}. The
            administration will review and assign you to a class.
          </p>
        </div>
      </div>
      <EnrollmentForm
        gradeLevel={gradeLevel}
        setGradeLevel={setGradeLevel}
        strand={strand}
        setStrand={setStrand}
        semester={semester}
        setSemester={setSemester}
        additionalNotes={additionalNotes}
        setAdditionalNotes={setAdditionalNotes}
        isSHS={isSHS}
        submitting={submitting}
        onSubmit={handleSubmitRequest}
        title="Enrollment Application"
        description={`Apply for enrollment in A.Y. ${CURRENT_SCHOOL_YEAR}.`}
        fileInputRef={fileInputRef}
        setPreviousGradesFile={setPreviousGradesFile}
      />
    </div>
  );
}

// ─── EnrollmentForm sub-component ─────────────────────────────────────────────
function EnrollmentForm({
  gradeLevel,
  setGradeLevel,
  strand,
  setStrand,
  semester,
  setSemester,
  additionalNotes,
  setAdditionalNotes,
  isSHS,
  submitting,
  onSubmit,
  title,
  description,
  fileInputRef,
  setPreviousGradesFile,
}: {
  gradeLevel: string;
  setGradeLevel: (v: string) => void;
  strand: string;
  setStrand: (v: string) => void;
  semester: string;
  setSemester: (v: string) => void;
  additionalNotes: string;
  setAdditionalNotes: (v: string) => void;
  isSHS: boolean;
  submitting: boolean;
  onSubmit: () => void;
  title: string;
  description: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setPreviousGradesFile: (file: File | null) => void;
}) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Send className="w-4 h-4 text-red-700" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="gradeLevel">
              Grade Level <span className="text-red-600">*</span>
            </Label>
            <Select value={gradeLevel} onValueChange={setGradeLevel}>
              <SelectTrigger id="gradeLevel">
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_LEVELS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="semester">
              Semester <span className="text-red-600">*</span>
            </Label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger id="semester">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1st Semester</SelectItem>
                <SelectItem value="2">2nd Semester</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isSHS && (
          <div className="space-y-1.5">
            <Label htmlFor="strand">
              Strand <span className="text-red-600">*</span>
            </Label>
            <Select value={strand} onValueChange={setStrand}>
              <SelectTrigger id="strand">
                <SelectValue placeholder="Select strand (SHS only)" />
              </SelectTrigger>
              <SelectContent>
                {SHS_STRANDS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="previousGrades">
            Previous Grades (PDF, Image, etc.){' '}
            <span className="text-gray-500 font-normal text-xs">
              (optional)
            </span>
          </Label>
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              id="previousGrades"
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setPreviousGradesFile(e.target.files[0]);
                } else {
                  setPreviousGradesFile(null);
                }
              }}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              accept=".pdf,.png,.jpg,.jpeg"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Additional Notes (optional)</Label>
          <Textarea
            id="notes"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Any additional information for the administration..."
            className="min-h-[80px] resize-none"
          />
        </div>

        <div className="pt-1">
          <p className="text-xs text-gray-500 mb-3">
            School Year:{' '}
            <span className="font-semibold text-gray-700">
              {CURRENT_SCHOOL_YEAR}
            </span>
          </p>
          <Button
            onClick={onSubmit}
            disabled={
              submitting || !gradeLevel || !semester || (isSHS && !strand)
            }
            className="w-full bg-red-800 hover:bg-red-700 text-white"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Submit Enrollment Request
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

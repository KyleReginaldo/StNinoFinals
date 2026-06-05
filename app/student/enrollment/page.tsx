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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getEnrollmentSchoolYear } from '@/lib/school-year';
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

const CURRENT_SCHOOL_YEAR = getEnrollmentSchoolYear();

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
  const [coeDialogOpen, setCoeDialogOpen]     = useState(false);
  const [coePurposeType, setCoePurposeType]   = useState('general');
  const [coeDetails, setCoeDetails]           = useState('');
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

  const generateCertificationPDF = useCallback(async (purpose: string) => {
    if (!student || !enrollment?.isEnrolled) {
      showAlert({
        message: 'No enrollment data available to generate certificate.',
        type: 'warning',
      });
      return;
    }

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageW    = 210;
      const margin   = 20;
      const contentW = pageW - margin * 2; // 170mm

      // ── 1. Logo ────────────────────────────────────────────────────────────
      const logoX = 10;
      const logoY = 8;
      const logoW = 20;
      const logoH = 20;
      try {
        const res  = await fetch('/logo.png');
        const blob = await res.blob();
        const b64  = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror  = reject;
          reader.readAsDataURL(blob);
        });
        doc.addImage(b64, 'PNG', logoX, logoY, logoW, logoH);
      } catch {
        // logo unavailable – skip silently
      }

      // ── 2. School header ───────────────────────────────────────────────────
      // School name: left-aligned flush to the logo, matching the website header
      const nameX   = logoX + logoW + 4;          // 42mm — 4mm gap after logo
      const subCx   = (nameX + pageW - margin) / 2; // center of remaining area

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('STO. NIÑO DE PRAGA ACADEMY OF LA PAZ HOMES II, INC.', nameX, 16);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('La Paz Homes II/Karlaville Parkhomes, Trece Martires City', subCx, 21, { align: 'center' });
      doc.text('(046) 443-3367 / 09171560082',                              subCx, 25, { align: 'center' });
      doc.text('sto.ninodepragaacademyLPH@gmail.com',                       subCx, 29, { align: 'center' });

      // ── 3. Double horizontal rule ──────────────────────────────────────────
      doc.setLineWidth(1.0);
      doc.line(margin, 35, pageW - margin, 35);

      // ── 4. Italic tagline ──────────────────────────────────────────────────
      doc.setFontSize(10);
      doc.setFont('times', 'italic');
      doc.text(
        '"The Home of Multi-Talented Children and Dedicated Teachers"',
        pageW / 2, 43, { align: 'center' }
      );

      // ── 5. Date (right-aligned) ────────────────────────────────────────────
      const now       = new Date();
      const day       = now.getDate();
      const monthName = now.toLocaleDateString('en-US', { month: 'long' });
      const year      = now.getFullYear();

      const ordinal = (n: number) => {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`${monthName} ${day}, ${year}`, pageW - margin, 54, { align: 'right' });

      // ── 6. Title — Times bold, no letter-spacing ───────────────────────────
      doc.setFontSize(22);
      doc.setFont('times', 'bold');
      doc.text('CERTIFICATION', pageW / 2, 73, { align: 'center' });

      // ── 7. Mixed-bold + justified paragraph helper ─────────────────────────
      type Seg  = { text: string; bold?: boolean };
      type Word = { w: string; bold: boolean };

      doc.setFontSize(12);

      const getW = (text: string, bold: boolean): number => {
        doc.setFont('times', bold ? 'bold' : 'normal');
        doc.setFontSize(12);
        return doc.getTextWidth(text);
      };
      const spaceW = getW(' ', false);

      // Renders segments with first-line indent, full justification, mixed bold.
      const renderPara = (
        segs: Seg[],
        x: number,
        y0: number,
        maxW: number,
        lh: number,
        firstIndent = 0,
      ): number => {
        // tokenise into words preserving bold flag
        const words: Word[] = [];
        for (const seg of segs) {
          seg.text.split(' ').forEach(t => {
            if (t) words.push({ w: t, bold: !!seg.bold });
          });
        }

        // layout into lines
        const lines: Word[][] = [];
        let cur: Word[]  = [];
        let curW = 0;

        for (const word of words) {
          const lineMax = lines.length === 0 ? maxW - firstIndent : maxW;
          const wW  = getW(word.w, word.bold);
          const addW = cur.length > 0 ? spaceW + wW : wW;

          if (cur.length > 0 && curW + addW > lineMax + 0.5) {
            lines.push(cur);
            cur  = [word];
            curW = wW;
          } else {
            cur.push(word);
            curW += addW;
          }
        }
        if (cur.length > 0) lines.push(cur);

        // render with full justification (last line left-aligned)
        let y = y0;
        for (let li = 0; li < lines.length; li++) {
          const line    = lines[li];
          const isLast  = li === lines.length - 1;
          const lineX   = li === 0 ? x + firstIndent : x;
          const lineMax = li === 0 ? maxW - firstIndent : maxW;

          if (isLast || line.length === 1) {
            let cx = lineX;
            for (let i = 0; i < line.length; i++) {
              doc.setFont('times', line[i].bold ? 'bold' : 'normal');
              doc.text(line[i].w, cx, y);
              cx += getW(line[i].w, line[i].bold) + (i < line.length - 1 ? spaceW : 0);
            }
          } else {
            const totalW = line.reduce((s, wd) => s + getW(wd.w, wd.bold), 0);
            const gap    = (lineMax - totalW) / (line.length - 1);
            let cx = lineX;
            for (let i = 0; i < line.length; i++) {
              doc.setFont('times', line[i].bold ? 'bold' : 'normal');
              doc.text(line[i].w, cx, y);
              cx += getW(line[i].w, line[i].bold) + (i < line.length - 1 ? gap : 0);
            }
          }
          y += lh;
        }
        return y;
      };

      // ── 8. Student / grade data ────────────────────────────────────────────
      const studentName  = (info?.name || displayName).toUpperCase();
      const gradeRaw     = info?.gradeLevel || student.grade_level || '';
      const gradeNum     = parseInt(String(gradeRaw).replace(/\D/g, ''));
      const academicYear = enrollment?.schoolYear || CURRENT_SCHOOL_YEAR;

      const gradeWordMap: Record<number, string> = {
        1: 'One',   2: 'Two',    3: 'Three', 4: 'Four',  5: 'Five',
        6: 'Six',   7: 'Seven',  8: 'Eight', 9: 'Nine',  10: 'Ten',
        11: 'Eleven', 12: 'Twelve',
      };
      const gradeLabel = gradeWordMap[gradeNum] ?? String(gradeRaw);

      const strandMap: Record<string, string> = {
        STEM:            'Science, Technology, Engineering and Mathematics (STEM)',
        ABM:             'Accounting Business and Management (ABM)',
        HUMSS:           'Humanities and Social Sciences (HUMSS)',
        GAS:             'General Academic Strand (GAS)',
        TVL:             'Technical-Vocational-Livelihood (TVL)',
        Sports:          'Sports Track',
        'Arts & Design': 'Arts and Design Track',
      };

      const isSHS      = gradeNum === 11 || gradeNum === 12;
      const strandCode = enrollmentRequest?.strand ?? null;
      const fullStrand = strandCode ? (strandMap[strandCode] ?? strandCode) : null;

      // ── 9. Body paragraphs ─────────────────────────────────────────────────
      const lh     = 7;   // line height in mm
      const indent = 10;  // first-line paragraph indent in mm
      let y = 85;

      // Para 1 — enrollment fact (student name, grade, strand, year in bold)
      const p1: Seg[] = isSHS && fullStrand
        ? [
            { text: 'This is to certify that ' },
            { text: studentName, bold: true },
            { text: ' is officially enrolled in this institution as ' },
            { text: `Grade ${gradeLabel}`, bold: true },
            { text: ' under ' },
            { text: `${fullStrand} Strand`, bold: true },
            { text: ' for ' },
            { text: `Academic Year ${academicYear}`, bold: true },
            { text: '.' },
          ]
        : [
            { text: 'This is to certify that ' },
            { text: studentName, bold: true },
            { text: ' is officially enrolled in this institution as a ' },
            { text: `Grade ${gradeLabel}`, bold: true },
            { text: ' student for ' },
            { text: `Academic Year ${academicYear}`, bold: true },
            { text: '.' },
          ];

      y = renderPara(p1, margin, y, contentW, lh, indent);
      y += 5;

      // Para 2 — purpose clause
      const isGeneral = purpose === 'whatever legal purpose it may serve';
      const p2: Seg[] = isGeneral
        ? [
            { text: 'This certification is issued upon the request of the aforementioned student for ' },
            { text: purpose, bold: true },
            { text: '.' },
          ]
        : [
            { text: 'This certification is issued upon the request of the aforementioned student for ' },
            { text: purpose, bold: true },
            { text: '. This certification is issued for the stated purpose only.' },
          ];
      y = renderPara(p2, margin, y, contentW, lh, indent);
      y += 5;

      // Para 3 — issuance line (centered, single line)
      doc.setFont('times', 'normal');
      doc.setFontSize(12);
      doc.text(
        `Issued this ${day} ${ordinal(day)} day of ${monthName} ${year} at SNDPA-LPH, Trece Martires City, Cavite.`,
        pageW / 2, y, { align: 'center' }
      );
      y += lh + 22;

      // ── 10. Signature block (right-aligned) ───────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('COL GILMAR N GALICIA PA (Res) MBA,MPM', pageW - margin, y,     { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.text('Principal / Administrator',              pageW - margin, y + 6, { align: 'right' });
      y += 20;

      // ── 11. Verification note ──────────────────────────────────────────────
      doc.setFont('times', 'italic');
      doc.setFontSize(9);
      doc.text('Note:  Should there be a need to verify this document?',  pageW - margin, y,     { align: 'right' });
      doc.text('Please call (046) 443-33-67 Office of the Principal',     pageW - margin, y + 5, { align: 'right' });

      // ── 12. NOT VALID WITHOUT SCHOOL SEAL ─────────────────────────────────
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('NOT VALID',   margin, 265);
      doc.setFont('helvetica', 'bold');
      doc.text('WITHOUT',     margin, 270);
      doc.setFont('helvetica', 'normal');
      doc.text('SCHOOL SEAL', margin, 275);

      doc.save(`COE_${studentName.replace(/\s+/g, '_')}.pdf`);

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      showAlert({ message: `Failed to generate PDF: ${msg}`, type: 'error' });
    }
  }, [student, enrollment, info, displayName, enrollmentRequest, showAlert]);

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
        doc.text(`${req.school_year} (Q${req.semester})`, 100, yPos);
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
              onClick={() => setCoeDialogOpen(true)}
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
                label="Quarter"
                value={enrollment?.semester ? `Quarter ${enrollment.semester}` : undefined}
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

        {/* COE purpose dialog */}
        <Dialog open={coeDialogOpen} onOpenChange={setCoeDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Certificate of Enrollment</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Purpose</Label>
                <Select
                  value={coePurposeType}
                  onValueChange={(v) => { setCoePurposeType(v); setCoeDetails(''); }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General / Whatever legal purpose</SelectItem>
                    <SelectItem value="entrance">Entrance Examination</SelectItem>
                    <SelectItem value="scholarship">Scholarship Application</SelectItem>
                    <SelectItem value="employment">Employment Purposes</SelectItem>
                    <SelectItem value="other">Other (specify)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {coePurposeType !== 'general' && (
                <div className="space-y-1.5">
                  <Label>
                    {coePurposeType === 'entrance'    ? 'School / Institution' :
                     coePurposeType === 'other'       ? 'Specify purpose' :
                     'Additional details (optional)'}
                  </Label>
                  <Input
                    placeholder={
                      coePurposeType === 'entrance'    ? 'e.g. Cavite State University – Main Campus' :
                      coePurposeType === 'scholarship' ? 'e.g. CHED Scholarship Program' :
                      coePurposeType === 'employment'  ? 'e.g. ABC Company' :
                      'Describe the purpose…'
                    }
                    value={coeDetails}
                    onChange={(e) => setCoeDetails(e.target.value)}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCoeDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-800 hover:bg-red-700 text-white"
                disabled={coePurposeType === 'other' && !coeDetails.trim()}
                onClick={() => {
                  const purposeBase: Record<string, string> = {
                    general:    'whatever legal purpose it may serve',
                    entrance:   'Entrance Examination',
                    scholarship:'Scholarship Application',
                    employment: 'Employment Purposes',
                  };
                  const base    = coePurposeType === 'other' ? '' : purposeBase[coePurposeType];
                  const details = coeDetails.trim();
                  const purpose = coePurposeType === 'other'
                    ? details
                    : coePurposeType === 'entrance' && details
                      ? `${base} Slated for ${details}`
                      : details ? `${base} ${details}` : base;
                  setCoeDialogOpen(false);
                  generateCertificationPDF(purpose);
                }}
              >
                Generate PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                label="Quarter"
                value={
                  enrollmentRequest?.semester
                    ? `Quarter ${enrollmentRequest.semester}`
                    : undefined
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
            <Label htmlFor="gradeLevel" required>Grade Level</Label>
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
            <Label htmlFor="semester" required>Quarter</Label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger id="semester">
                <SelectValue placeholder="Select quarter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Quarter 1</SelectItem>
                <SelectItem value="2">Quarter 2</SelectItem>
                <SelectItem value="3">Quarter 3</SelectItem>
                <SelectItem value="4">Quarter 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isSHS && (
          <div className="space-y-1.5">
            <Label htmlFor="strand" required>Strand</Label>
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

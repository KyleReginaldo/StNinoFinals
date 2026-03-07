'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAlert } from '@/lib/use-alert';
import { useConfirm } from '@/lib/use-confirm';
import {
  CheckCircle2,
  Clock,
  Download,
  GraduationCap,
  Save,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface Teacher {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  subject?: string;
  subjects?: string;
  specialization?: string;
  [key: string]: any;
}

type GradeStatus = 'pending' | 'approved' | 'rejected' | null;

interface GradeRow {
  id: number;
  name: string;
  studentId: string;
  grade: string;
  status: GradeStatus;
  gradeId: string | null;
  reviewedAt: string | null;
}

const STATUS_CONFIG = {
  approved: {
    label: 'Approved',
    rowClass: 'bg-green-50',
    badgeClass: 'bg-green-100 text-green-800 border-green-300',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  rejected: {
    label: 'Rejected',
    rowClass: 'bg-red-50',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  pending: {
    label: 'Pending',
    rowClass: 'bg-amber-50',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
};

export default function TeacherGrades() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [gradesData, setGradesData] = useState<GradeRow[]>([]);
  const [isSavingGrades, setIsSavingGrades] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const statusSummary = useMemo(() => {
    return gradesData.reduce(
      (acc, s) => {
        if (s.status === 'approved') acc.approved++;
        else if (s.status === 'rejected') acc.rejected++;
        else if (s.status === 'pending') acc.pending++;
        else if (s.grade) acc.unsaved++;
        return acc;
      },
      { approved: 0, rejected: 0, pending: 0, unsaved: 0 }
    );
  }, [gradesData]);

  // Update grade value — only if not approved
  const updateGrade = (studentId: number, value: string) => {
    setGradesData((prev) =>
      prev.map((student) =>
        student.id === studentId && student.status !== 'approved'
          ? { ...student, grade: value }
          : student
      )
    );
  };

  // Check if teacher is logged in
  useEffect(() => {
    const storedTeacher = localStorage.getItem('teacher');
    if (!storedTeacher) {
      router.push('/teacher/login');
      return;
    }
    try {
      const teacherData = JSON.parse(storedTeacher);
      setTeacher(teacherData);
    } catch (error) {
      console.error('Error parsing stored teacher data:', error);
      localStorage.removeItem('teacher');
      router.push('/teacher/login');
    }
  }, [router]);

  useEffect(() => {
    if (teacher && teacher.id) fetchTeacherClasses();
  }, [teacher]);

  useEffect(() => {
    if (teacher && teacher.id && selectedClassId) {
      setGradesData([]);
      fetchGradesData();
    }
  }, [teacher, selectedClassId]);

  const fetchTeacherClasses = async () => {
    if (!teacher || !teacher.id) return;
    try {
      const response = await fetch(
        `/api/teacher/classes?teacherId=${teacher.id}`
      );
      const data = await response.json();
      if (data.success && data.classes) {
        setTeacherClasses(data.classes);
        if (data.classes.length > 0 && !selectedClassId) {
          setSelectedClassId(data.classes[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
    }
  };

  const fetchGradesData = async () => {
    if (!teacher || !teacher.id || !selectedClassId) return;
    const subject = teacherClasses.find(
      (c) => c.id === selectedClassId
    )?.class_name;
    if (!subject) return;
    setIsLoadingData(true);
    try {
      const response = await fetch(
        `/api/teacher/grades?teacherId=${teacher.id}&classId=${selectedClassId}&subject=${encodeURIComponent(subject)}`
      );
      const data = await response.json();
      if (data.success && data.data) {
        setGradesData(data.data);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSaveGrades = async () => {
    if (!teacher || !teacher.id) {
      showAlert({ message: 'Teacher information not found', type: 'error' });
      return;
    }

    // Only submit grades that are NOT approved
    const submittable = gradesData.filter(
      (s) => s.status !== 'approved' && s.grade && parseFloat(s.grade) > 0
    );

    if (submittable.length === 0) {
      showAlert({
        message: 'No new or updated grades to submit.',
        type: 'warning',
      });
      return;
    }

    setIsSavingGrades(true);
    try {
      const results = await Promise.all(
        submittable.map(async (student) => {
          try {
            const res = await fetch('/api/grades', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentId: student.id,
                subject:
                  teacherClasses.find((c) => c.id === selectedClassId)
                    ?.class_name || '',
                grade: parseFloat(student.grade),
                teacherId: teacher.id,
                classId: selectedClassId,
              }),
            });
            return await res.json();
          } catch {
            return { success: false };
          }
        })
      );

      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        showAlert({
          message: `${failed.length} grade(s) failed to save.`,
          type: 'warning',
        });
      } else {
        showAlert({
          message: 'Grades submitted for admin approval!',
          type: 'success',
        });
        // Refresh so status badges update to "pending"
        await fetchGradesData();
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      showAlert({
        message: 'Error saving grades. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSavingGrades(false);
    }
  };

  const handleExportToCSV = () => {
    if (!teacher || gradesData.length === 0) {
      showAlert({ message: 'No grades data to export.', type: 'warning' });
      return;
    }
    const selectedClass = teacherClasses.find((c) => c.id === selectedClassId);
    const className = selectedClass ? selectedClass.class_name : 'Class';
    const headers = ['Student Number', 'Student Name', 'Grade', 'Status'];
    const rows = gradesData.map((s) => [
      s.studentId || '',
      s.name || '',
      s.grade || '',
      s.status || 'Not submitted',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `${className}_grades.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert({ message: 'Grades exported successfully!', type: 'success' });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-800">
            Student Grades Management
          </CardTitle>
          <CardDescription>
            View and update student grades for your classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teacher ? (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <Label htmlFor="class-select" className="text-sm font-medium">
                    Class:
                  </Label>
                  <Select
                    value={selectedClassId}
                    onValueChange={setSelectedClassId}
                  >
                    <SelectTrigger id="class-select" className="w-64">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherClasses.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.class_name} - {classItem.grade_level || ''}{' '}
                          {classItem.section || ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedClassId && (
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-gray-500">Subject:</span>
                    <span className="text-sm font-medium">
                      {teacherClasses.find((c) => c.id === selectedClassId)
                        ?.class_name || '—'}
                    </span>
                  </div>
                )}
              </div>

              {isLoadingData ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-800 border-t-transparent mx-auto" />
                  <p className="mt-3 text-gray-600">Loading grades data...</p>
                </div>
              ) : gradesData.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    No students enrolled in this class
                  </p>
                  <p className="text-sm text-gray-500">
                    Students must be enrolled through the admin panel
                  </p>
                </div>
              ) : (
                <>
                  {/* Status Summary Banner */}
                  {(statusSummary.approved > 0 ||
                    statusSummary.rejected > 0 ||
                    statusSummary.pending > 0) && (
                    <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg border text-sm">
                      {statusSummary.approved > 0 && (
                        <span className="flex items-center gap-1.5 text-green-700 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          {statusSummary.approved} Approved
                        </span>
                      )}
                      {statusSummary.pending > 0 && (
                        <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                          <Clock className="w-4 h-4" />
                          {statusSummary.pending} Pending review
                        </span>
                      )}
                      {statusSummary.rejected > 0 && (
                        <span className="flex items-center gap-1.5 text-red-700 font-medium">
                          <XCircle className="w-4 h-4" />
                          {statusSummary.rejected} Rejected — update and
                          resubmit
                        </span>
                      )}
                    </div>
                  )}

                  {/* Grades Table */}
                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-red-800 hover:bg-red-800">
                          <TableHead className="text-white font-bold">
                            Student Name
                          </TableHead>
                          <TableHead className="text-white font-bold">
                            Student No.
                          </TableHead>
                          <TableHead className="text-white font-bold text-center">
                            Grade
                          </TableHead>
                          <TableHead className="text-white font-bold text-center">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gradesData.map((student) => {
                          const cfg = student.status
                            ? STATUS_CONFIG[student.status]
                            : null;
                          const isApproved = student.status === 'approved';
                          return (
                            <TableRow
                              key={student.id}
                              className={
                                cfg ? cfg.rowClass : 'hover:bg-gray-50'
                              }
                            >
                              <TableCell className="font-medium">
                                {student.name}
                              </TableCell>
                              <TableCell>{student.studentId}</TableCell>
                              <TableCell className="p-0">
                                {isApproved ? (
                                  <div className="flex items-center justify-center h-10 px-3 text-green-800 font-semibold">
                                    {student.grade}
                                  </div>
                                ) : (
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={student.grade}
                                    onChange={(e) =>
                                      updateGrade(student.id, e.target.value)
                                    }
                                    className={`border-0 rounded-none text-center focus:ring-2 focus:ring-red-500 h-10 ${
                                      student.status === 'rejected'
                                        ? 'bg-red-50 text-red-900 focus:ring-red-500'
                                        : student.status === 'pending'
                                          ? 'bg-amber-50 text-amber-900 focus:ring-amber-500'
                                          : ''
                                    }`}
                                    placeholder="Enter grade"
                                  />
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {cfg ? (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.badgeClass}`}
                                  >
                                    {cfg.icon}
                                    {cfg.label}
                                    {student.reviewedAt && isApproved && (
                                      <span className="ml-1 text-gray-500 font-normal">
                                        {new Date(
                                          student.reviewedAt
                                        ).toLocaleDateString()}
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    —
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-green-100 inline-block border border-green-300" />
                      Approved — read-only, finalized by admin
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-100 inline-block border border-amber-300" />
                      Pending — awaiting admin review
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-red-100 inline-block border border-red-300" />
                      Rejected — update and resubmit
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={handleExportToCSV}
                      variant="outline"
                      className="border-red-800 text-red-800 hover:bg-red-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export to CSV
                    </Button>
                    <Button
                      onClick={handleSaveGrades}
                      disabled={isSavingGrades}
                      className="bg-red-800 hover:bg-red-900"
                    >
                      {isSavingGrades ? (
                        <>
                          <Save className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Submit Grades
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Please log in to manage grades.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
import { Download, GraduationCap, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

export default function TeacherGrades() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [gradesData, setGradesData] = useState<any[]>([]);
  const [isSavingGrades, setIsSavingGrades] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  // Update grade value
  const updateGrade = (studentId: number, value: string) => {
    setGradesData((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, grade: value } : student
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

  // Fetch teacher's classes
  useEffect(() => {
    if (teacher && teacher.id) {
      fetchTeacherClasses();
    }
  }, [teacher]);

  // Fetch real grades data
  useEffect(() => {
    if (teacher && teacher.id && selectedClassId) {
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
        // Auto-select first class if available
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

    setIsLoadingData(true);
    try {
      const teacherSubject =
        teacher.subject ||
        teacher.subjects ||
        teacher.specialization ||
        'General';

      // Fetch detailed grades from teacher API
      const response = await fetch(
        `/api/teacher/grades?teacherId=${teacher.id}&classId=${selectedClassId}&subject=${encodeURIComponent(teacherSubject)}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setGradesData(data.data);

        // Also fetch final grades for each student from grades API
        const studentIds = data.data.map((student: any) => student.id);
        const gradePromises = studentIds.map(async (studentId: number) => {
          try {
            const gradeResponse = await fetch(
              `/api/grades?studentId=${studentId}`
            );
            const gradeData = await gradeResponse.json();

            if (gradeData.success && gradeData.grades) {
              // Find the grade for this subject
              const subjectGrade = gradeData.grades.find(
                (g: any) => g.subject === teacherSubject
              );
              return { studentId, finalGrade: subjectGrade?.grade };
            }
            return { studentId, finalGrade: null };
          } catch (error) {
            console.error(
              `Error fetching grade for student ${studentId}:`,
              error
            );
            return { studentId, finalGrade: null };
          }
        });

        const savedGrades = await Promise.all(gradePromises);
        console.log('Loaded saved final grades:', savedGrades);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Save grades
  const handleSaveGrades = async () => {
    if (!teacher || !teacher.id) {
      showAlert({ message: 'Teacher information not found', type: 'error' });
      return;
    }

    setIsSavingGrades(true);
    try {
      const teacherSubject =
        teacher.subject ||
        teacher.subjects ||
        teacher.specialization ||
        'General';

      // Save grades to student grades API
      const gradePromises = gradesData.map(async (student) => {
        const gradeValue = parseFloat(student.grade);
        if (!gradeValue || gradeValue <= 0)
          return { success: true, skipped: true }; // Skip if no grade

        try {
          console.log('Saving grade for student:', {
            studentId: student.id,
            subject: teacherSubject,
            grade: gradeValue,
          });

          const response = await fetch('/api/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentId: student.id,
              subject: teacherSubject,
              grade: gradeValue,
            }),
          });

          const result = await response.json();
          console.log('Save result:', result);
          return result;
        } catch (error) {
          console.error(`Error saving grade for student ${student.id}:`, error);
          return { success: false };
        }
      });

      const gradeResults = await Promise.all(gradePromises);
      const failedGrades = gradeResults.filter((r) => !r.success && !r.skipped);

      if (failedGrades.length > 0) {
        showAlert({
          message: `${failedGrades.length} grade(s) failed to save`,
          type: 'warning',
        });
      } else {
        showAlert({
          message: 'All grades saved successfully!',
          type: 'success',
        });
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

  // Export grades to CSV
  const handleExportToCSV = () => {
    if (!teacher || gradesData.length === 0) {
      showAlert({ message: 'No grades data to export.', type: 'warning' });
      return;
    }

    const teacherSubject = teacher.subject || teacher.subjects || 'Mathematics';
    const selectedClass = teacherClasses.find((c) => c.id === selectedClassId);
    const className = selectedClass ? selectedClass.class_name : 'Class';

    // Create CSV header
    const headers = ['Student Number', 'Student Name', 'Grade'];

    // Create CSV rows
    const rows = gradesData.map((student) => {
      return [student.studentId || '', student.name || '', student.grade || ''];
    });

    // Combine header and rows
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${className}_grades.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAlert({
      message: 'Grades exported successfully!',
      type: 'success',
    });
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
              {/* Filters and Actions */}
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
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    Subject:{' '}
                    {teacher.subject ||
                      teacher.subjects ||
                      teacher.specialization ||
                      'N/A'}
                  </Badge>
                </div>
              </div>

              {isLoadingData ? (
                <div className="text-center py-12">
                  <div className="text-xl font-bold text-red-800">
                    Loading grades data...
                  </div>
                </div>
              ) : gradesData.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    No students enrolled in this class
                  </p>
                  <p className="text-sm text-gray-500">
                    Students must be enrolled in this class through the admin
                    panel
                  </p>
                </div>
              ) : (
                <>
                  {/* Grades Table */}
                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-red-800 text-white">
                          <TableHead className="text-white font-bold">
                            Student Name
                          </TableHead>
                          <TableHead className="text-white font-bold">
                            Student No.
                          </TableHead>
                          <TableHead className="text-white font-bold text-center">
                            Grade
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gradesData.map((student) => (
                          <TableRow
                            key={student.id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="font-medium">
                              {student.name}
                            </TableCell>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell className="p-0">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={student.grade}
                                onChange={(e) =>
                                  updateGrade(student.id, e.target.value)
                                }
                                className="border-0 rounded-none text-center focus:ring-2 focus:ring-red-500 h-10"
                                placeholder="Enter grade"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Save and Export Buttons */}
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
                          Save Grades
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

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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BookOpen, Download, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  grade_level: string | null;
  section: string | null;
}

interface ClassItem {
  id: string;
  class_code: string;
  class_name: string;
  grade_level: string | null;
  section: string | null;
  school_year: string;
  semester: string;
  room: string | null;
  schedule: string | null;
  students: Student[];
  student_count: number;
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingClass, setViewingClass] = useState<ClassItem | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const stored = localStorage.getItem('teacher');
        if (!stored) return;
        const teacher = JSON.parse(stored);
        const res = await fetch(`/api/teacher/classes?teacherId=${teacher.id}`);
        const data = await res.json();
        if (data.success) {
          setClasses(data.classes || []);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleExportCSV = (classItem: ClassItem) => {
    if (!classItem.students.length) return;
    const header = 'Student Number,Last Name,First Name,Grade Level,Section';
    const rows = classItem.students.map(
      (s) => `${s.student_number},${s.last_name},${s.first_name},${s.grade_level || ''},${s.section || ''}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${classItem.class_name}_students.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-800 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Classes</h2>
        <p className="text-gray-600 mt-1">
          View your assigned classes and enrolled students
        </p>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No classes assigned yet</p>
              <p className="text-sm mt-1">Contact the admin to get assigned to classes.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card
              key={classItem.id}
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-red-800"
              onClick={() => setViewingClass(classItem)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-red-800 text-lg">
                      {classItem.class_name}
                    </CardTitle>
                    <CardDescription>{classItem.class_code}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {classItem.student_count} student{classItem.student_count !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Grade & Section</span>
                  <span className="font-medium">
                    {classItem.grade_level || 'N/A'} - {classItem.section || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">School Year</span>
                  <span className="font-medium">{classItem.school_year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Semester</span>
                  <span className="font-medium">Semester {classItem.semester}</span>
                </div>
                {classItem.room && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Room</span>
                    <span className="font-medium">{classItem.room}</span>
                  </div>
                )}
                {classItem.schedule && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Schedule</span>
                    <span className="font-medium">{classItem.schedule}</span>
                  </div>
                )}
                <div className="pt-2">
                  <Button size="sm" className="w-full bg-red-800 hover:bg-red-700">
                    <Users className="w-4 h-4 mr-2" />
                    View Students
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student List Dialog */}
      <Dialog open={!!viewingClass} onOpenChange={(open) => !open && setViewingClass(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-red-800">
              {viewingClass?.class_name}
            </DialogTitle>
            <DialogDescription>
              {viewingClass?.grade_level} - {viewingClass?.section} | {viewingClass?.student_count} student{viewingClass?.student_count !== 1 ? 's' : ''} enrolled
            </DialogDescription>
          </DialogHeader>

          {viewingClass?.students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students enrolled in this class.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Student Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Section</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingClass?.students.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{student.student_number}</TableCell>
                      <TableCell className="font-medium">{student.last_name}, {student.first_name}</TableCell>
                      <TableCell>{student.grade_level || '-'}</TableCell>
                      <TableCell>{student.section || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => viewingClass && handleExportCSV(viewingClass)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

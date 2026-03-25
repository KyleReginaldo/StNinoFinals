'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { useAlert } from '@/lib/use-alert';
import { useConfirm } from '@/lib/use-confirm';
import { BookOpen, Download, Edit, Plus, Search, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Class {
  id: string;
  class_code: string;
  class_name: string;
  grade_level: string | null;
  section: string | null;
  school_year: string;
  semester: string;
  teacher_id: string | null;
  teacher_name?: string | null;
  room: string | null;
  schedule: string | null;
  description: string | null;
  is_active: boolean;
  students?: any[];
  teacher?: any;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  grade_level: string | null;
  section: string | null;
}

export default function ClassesManagementPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    class_code: '',
    class_name: '',
    grade_level: '',
    section: '',
    school_year: '',
    semester: '',
    teacher_id: '',
    room: '',
    schedule: '',
    description: '',
  });

  const [showStudentsDialog, setShowStudentsDialog] = useState(false);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [viewingClass, setViewingClass] = useState<Class | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [sectionsByGrade, setSectionsByGrade] = useState<
    Record<string, string[]>
  >({});

  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  // Fetch sections from admin settings
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch('/api/admin/settings/sections');
        const data = await res.json();
        if (data.success && data.sections) {
          setSectionsByGrade(data.sections);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };
    fetchSections();
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/admin/classes');
      const data = await response.json();
      if (data.success) {
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      showAlert({ message: 'Failed to load classes', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers');
      const data = await response.json();
      if (data.success) {
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students/all');
      const data = await response.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleOpenDialog = (classItem?: Class) => {
    if (classItem) {
      setEditingClass(classItem);
      setFormData({
        class_code: classItem.class_code,
        class_name: classItem.class_name,
        grade_level: classItem.grade_level || '',
        section: classItem.section || '',
        school_year: classItem.school_year,
        semester: classItem.semester,
        teacher_id: classItem.teacher_id || '',
        room: classItem.room || '',
        schedule: classItem.schedule || '',
        description: classItem.description || '',
      });
      // Fetch class details to get student IDs
      fetchClassDetails(classItem.id);
    } else {
      setEditingClass(null);
      setFormData({
        class_code: '',
        class_name: '',
        grade_level: '',
        section: '',
        school_year: new Date().getFullYear().toString(),
        semester: '1',
        teacher_id: '',
        room: '',
        schedule: '',
        description: '',
      });
      setSelectedStudentIds([]);
    }
    setStudentSearch('');
    setShowDialog(true);
  };

  const fetchClassDetails = async (classId: string) => {
    try {
      const response = await fetch(`/api/admin/classes?classId=${classId}`);
      const data = await response.json();
      if (data.success && data.class) {
        setSelectedStudentIds(data.class.students?.map((s: any) => s.id) || []);
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.class_code ||
      !formData.class_name ||
      !formData.school_year ||
      !formData.semester
    ) {
      showAlert({
        message: 'Please fill in all required fields',
        type: 'error',
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        student_ids: selectedStudentIds,
        id: editingClass?.id,
      };

      const url = '/api/admin/classes';
      const method = editingClass ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        showAlert({
          message: editingClass
            ? 'Class updated successfully'
            : 'Class created successfully',
          type: 'success',
        });
        setShowDialog(false);
        fetchClasses();
      } else {
        showAlert({ message: data.error || 'Operation failed', type: 'error' });
      }
    } catch (error) {
      console.error('Error saving class:', error);
      showAlert({ message: 'Failed to save class', type: 'error' });
    }
  };

  const handleViewStudents = async (classItem: Class) => {
    setViewingClass(classItem);
    setLoadingStudents(true);
    setShowStudentsDialog(true);
    try {
      const response = await fetch(
        `/api/admin/classes?classId=${classItem.id}`
      );
      const result = await response.json();
      if (result.success && result.class?.students) {
        setClassStudents(result.class.students);
      } else {
        setClassStudents([]);
      }
    } catch (error) {
      console.error('Error fetching class students:', error);
      setClassStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleExportCSV = () => {
    if (!viewingClass || classStudents.length === 0) return;
    const header = 'Student Number,First Name,Last Name,Grade Level,Section';
    const rows = classStudents.map(
      (s) =>
        `${s.student_number},${s.first_name},${s.last_name},${s.grade_level || ''},${s.section || ''}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${viewingClass.class_name}_students.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (classItem: Class) => {
    const confirmed = await showConfirm({
      title: 'Delete Class',
      message: `Are you sure you want to delete "${classItem.class_name}"? This will remove all student enrollments.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/classes?classId=${classItem.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        showAlert({ message: 'Class deleted successfully', type: 'success' });
        fetchClasses();
      } else {
        showAlert({
          message: data.error || 'Failed to delete class',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      showAlert({ message: 'Failed to delete class', type: 'error' });
    }
  };

  const [studentSearch, setStudentSearch] = useState('');

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Filter students by the class's grade level, then by search
  const filteredStudents = useMemo(() => {
    let list = students;

    if (formData.grade_level) {
      list = list.filter(
        (s) =>
          s.grade_level &&
          s.grade_level.trim().toLowerCase() ===
            formData.grade_level.trim().toLowerCase()
      );
    }

    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      list = list.filter(
        (s) =>
          s.first_name?.toLowerCase().includes(q) ||
          s.last_name?.toLowerCase().includes(q) ||
          s.student_number?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [students, formData.grade_level, studentSearch]);

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Classes Management
              </CardTitle>
              <CardDescription>
                Create and manage classes, assign teachers and students
              </CardDescription>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-red-800 hover:bg-red-900"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading classes...</div>
          ) : classes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No classes found. Click "Add Class" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Code</TableHead>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Grade/Section</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>School Year</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell className="font-medium">
                      {classItem.class_code}
                    </TableCell>
                    <TableCell>{classItem.class_name}</TableCell>
                    <TableCell>
                      {classItem.grade_level && classItem.section
                        ? `${classItem.grade_level} - ${classItem.section}`
                        : classItem.grade_level || classItem.section || '-'}
                    </TableCell>
                    <TableCell>
                      {classItem.teacher_name || 'Not assigned'}
                    </TableCell>
                    <TableCell>{classItem.school_year}</TableCell>
                    <TableCell>Semester {classItem.semester}</TableCell>
                    <TableCell>{classItem.room || '-'}</TableCell>
                    <TableCell>
                      {classItem.is_active ? (
                        <span className="text-green-600 font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="text-gray-500">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewStudents(classItem)}
                          title="View Students"
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(classItem)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(classItem)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClass ? 'Edit Class' : 'Create New Class'}
            </DialogTitle>
            <DialogDescription>
              {editingClass
                ? 'Update class information and enrollment'
                : 'Fill in the details to create a new class'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class_code">
                  Class Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="class_code"
                  value={formData.class_code}
                  onChange={(e) =>
                    setFormData({ ...formData, class_code: e.target.value })
                  }
                  placeholder="e.g., MATH101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_name">
                  Class Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="class_name"
                  value={formData.class_name}
                  onChange={(e) =>
                    setFormData({ ...formData, class_name: e.target.value })
                  }
                  placeholder="e.g., Mathematics"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade_level">Grade Level</Label>
                <Select
                  value={formData.grade_level}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      grade_level: value,
                      section: '',
                    })
                  }
                >
                  <SelectTrigger id="grade_level">
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kinder">Kinder</SelectItem>
                    <SelectItem value="Grade 1">Grade 1</SelectItem>
                    <SelectItem value="Grade 2">Grade 2</SelectItem>
                    <SelectItem value="Grade 3">Grade 3</SelectItem>
                    <SelectItem value="Grade 4">Grade 4</SelectItem>
                    <SelectItem value="Grade 5">Grade 5</SelectItem>
                    <SelectItem value="Grade 6">Grade 6</SelectItem>
                    <SelectItem value="Grade 7">Grade 7</SelectItem>
                    <SelectItem value="Grade 8">Grade 8</SelectItem>
                    <SelectItem value="Grade 9">Grade 9</SelectItem>
                    <SelectItem value="Grade 10">Grade 10</SelectItem>
                    <SelectItem value="Grade 11">Grade 11</SelectItem>
                    <SelectItem value="Grade 12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) =>
                    setFormData({ ...formData, section: value })
                  }
                >
                  <SelectTrigger id="section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {(sectionsByGrade[formData.grade_level] || []).map(
                      (sec) => (
                        <SelectItem key={sec} value={sec}>
                          {sec}
                        </SelectItem>
                      )
                    )}
                    {(!sectionsByGrade[formData.grade_level] ||
                      sectionsByGrade[formData.grade_level].length === 0) && (
                      <SelectItem value="__none" disabled>
                        No sections for this grade
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school_year">
                  School Year <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="school_year"
                  value={formData.school_year}
                  onChange={(e) =>
                    setFormData({ ...formData, school_year: e.target.value })
                  }
                  placeholder="e.g., 2024-2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">
                  Semester <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) =>
                    setFormData({ ...formData, semester: value })
                  }
                >
                  <SelectTrigger id="semester">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher_id">Assign Teacher</Label>
                <Select
                  value={formData.teacher_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, teacher_id: value })
                  }
                >
                  <SelectTrigger id="teacher_id">
                    <SelectValue placeholder="No teacher assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) =>
                    setFormData({ ...formData, room: e.target.value })
                  }
                  placeholder="e.g., Room 101"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  id="schedule-days"
                  value={formData.schedule.split(' ')[0] || ''}
                  onChange={(e) => {
                    const days = e.target.value;
                    const timeRange =
                      formData.schedule.split(' ').slice(1).join(' ') || '';
                    setFormData({
                      ...formData,
                      schedule: `${days} ${timeRange}`.trim(),
                    });
                  }}
                  placeholder="e.g., MWF"
                />
                <Input
                  id="schedule-start"
                  type="time"
                  value={formData.schedule.match(/(\d{1,2}:\d{2})/)?.[1] || ''}
                  onChange={(e) => {
                    const days = formData.schedule.split(' ')[0] || '';
                    const endTime =
                      formData.schedule.match(/- (\d{1,2}:\d{2})/)?.[1] || '';
                    const startTime = e.target.value;
                    const timeStr = endTime
                      ? `${startTime} - ${endTime}`
                      : startTime;
                    setFormData({
                      ...formData,
                      schedule: `${days} ${timeStr}`.trim(),
                    });
                  }}
                  placeholder="Start time"
                />
                <Input
                  id="schedule-end"
                  type="time"
                  value={
                    formData.schedule.match(/- (\d{1,2}:\d{2})/)?.[1] || ''
                  }
                  onChange={(e) => {
                    const days = formData.schedule.split(' ')[0] || '';
                    const startTime =
                      formData.schedule.match(/(\d{1,2}:\d{2})/)?.[1] || '';
                    const endTime = e.target.value;
                    const timeStr =
                      startTime && endTime
                        ? `${startTime} - ${endTime}`
                        : startTime || endTime;
                    setFormData({
                      ...formData,
                      schedule: `${days} ${timeStr}`.trim(),
                    });
                  }}
                  placeholder="End time"
                />
              </div>
              <p className="text-xs text-gray-500">
                Days (e.g., MWF, TTh), Start time, End time
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Class description or notes"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Enroll Students
                {formData.grade_level && (
                  <span className="text-xs font-normal text-gray-500">
                    — showing {formData.grade_level} students
                  </span>
                )}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search students by name or number..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                {!formData.grade_level ? (
                  <p className="text-sm text-amber-600">
                    Select a grade level first to see matching students.
                  </p>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No students found for {formData.grade_level}
                    {studentSearch.trim() ? ` matching "${studentSearch}"` : ''}.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredStudents.map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {student.first_name} {student.last_name} (
                          {student.student_number || 'No ID'})
                          {student.section && (
                            <span className="text-gray-500 ml-2">
                              — {student.section}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {selectedStudentIds.length} student(s) selected
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-red-800 hover:bg-red-900"
            >
              {editingClass ? 'Update Class' : 'Create Class'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Students Dialog */}
      <Dialog open={showStudentsDialog} onOpenChange={setShowStudentsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-800">
              Class List: {viewingClass?.class_name}
            </DialogTitle>
            <DialogDescription>
              {viewingClass?.grade_level} - {viewingClass?.section} |{' '}
              {classStudents.length} student(s) enrolled
            </DialogDescription>
          </DialogHeader>
          {loadingStudents ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-800 border-t-transparent"></div>
            </div>
          ) : classStudents.length === 0 ? (
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
                  {classStudents.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {student.student_number}
                      </TableCell>
                      <TableCell>
                        {student.last_name}, {student.first_name}
                      </TableCell>
                      <TableCell>{student.grade_level || '-'}</TableCell>
                      <TableCell>{student.section || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={handleExportCSV}>
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

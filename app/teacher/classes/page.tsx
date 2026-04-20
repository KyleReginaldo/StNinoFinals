'use client';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/data-table/Pagination';
import { SortHeader } from '@/components/ui/data-table/SortHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTableControls } from '@/hooks/use-table-controls';
import { BookOpen, Download, Search, Users } from 'lucide-react';
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
  quarter: string;
  room: string | null;
  schedule: string | null;
  students: Student[];
  student_count: number;
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingClass, setViewingClass] = useState<ClassItem | null>(null);

  const studentTc = useTableControls(viewingClass?.students ?? [], {
    searchFields: ['last_name', 'first_name', 'student_number'],
    defaultSort: { key: 'last_name', dir: 'asc' },
    pageSize: 25,
  });

  // Reset student table state when the class changes
  useEffect(() => {
    studentTc.clearFilters();
    studentTc.setPage(1);
  }, [viewingClass?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const stored = localStorage.getItem('teacher');
        if (!stored) return;
        const teacher = JSON.parse(stored);
        const res = await fetch(`/api/teacher/classes?teacherId=${teacher.id}`);
        const data = await res.json();
        if (data.success) setClasses(data.classes || []);
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
    const rows = classItem.students.map(s =>
      `${s.student_number},${s.last_name},${s.first_name},${s.grade_level || ''},${s.section || ''}`
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Classes</h2>
        <p className="text-sm text-gray-500 mt-0.5">View your assigned classes and enrolled students</p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 flex flex-col items-center justify-center text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-base font-semibold text-gray-700">No classes assigned yet</p>
          <p className="text-sm text-gray-500 mt-1">Contact the admin to get assigned to classes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map(classItem => (
            <div
              key={classItem.id}
              className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setViewingClass(classItem)}
            >
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{classItem.class_name}</h3>
                    <p className="font-mono text-[12px] text-gray-500 mt-0.5">{classItem.class_code}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
                    {classItem.student_count} student{classItem.student_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="px-5 pb-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Grade &amp; Section</span>
                  <span className="font-medium text-gray-900">
                    {classItem.grade_level || <span className="text-gray-300">—</span>}
                    {classItem.section ? ` — ${classItem.section}` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">School Year</span>
                  <span className="font-medium text-gray-900">{classItem.school_year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quarter</span>
                  <span className="font-medium text-gray-900">Quarter {classItem.quarter}</span>
                </div>
                {classItem.room && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Room</span>
                    <span className="font-medium text-gray-900">{classItem.room}</span>
                  </div>
                )}
                {classItem.schedule && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Schedule</span>
                    <span className="font-medium text-gray-900">{classItem.schedule}</span>
                  </div>
                )}
                <div className="pt-2">
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                    <Users className="w-4 h-4" />
                    View Students
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student List Dialog */}
      <Dialog open={!!viewingClass} onOpenChange={open => !open && setViewingClass(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>{viewingClass?.class_name}</DialogTitle>
            <DialogDescription>
              {viewingClass?.grade_level}
              {viewingClass?.section ? ` — ${viewingClass.section}` : ''}
              {' · '}
              {viewingClass?.student_count} student{viewingClass?.student_count !== 1 ? 's' : ''} enrolled
            </DialogDescription>
          </DialogHeader>

          {viewingClass && viewingClass.students.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No students enrolled in this class.</div>
          ) : (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
                  placeholder="Search by name or student number..."
                  value={studentTc.search}
                  onChange={e => studentTc.setSearch(e.target.value)}
                />
              </div>

              {/* Table */}
              <div className="rounded-xl border border-gray-200 overflow-hidden overflow-y-auto flex-1">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-10">#</th>
                      <SortHeader label="Student No."  sortKey="student_number" currentSort={studentTc.sort} onSort={studentTc.toggleSort} />
                      <SortHeader label="Name"         sortKey="last_name"      currentSort={studentTc.sort} onSort={studentTc.toggleSort} />
                      <SortHeader label="Grade"        sortKey="grade_level"    currentSort={studentTc.sort} onSort={studentTc.toggleSort} />
                      <SortHeader label="Section"      sortKey="section"        currentSort={studentTc.sort} onSort={studentTc.toggleSort} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {studentTc.rows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">No students match your search.</td>
                      </tr>
                    ) : (
                      studentTc.rows.map((student, index) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs text-gray-400 tabular-nums">
                            {(studentTc.page - 1) * studentTc.pageSize + index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-[12px] text-gray-500">
                              {student.student_number || <span className="text-gray-300">—</span>}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {student.last_name}, {student.first_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {student.grade_level || <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {student.section || <span className="text-gray-300">—</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  {studentTc.pageCount > 1 && (
                    <Pagination
                      page={studentTc.page}
                      pageCount={studentTc.pageCount}
                      totalCount={studentTc.totalCount}
                      filteredCount={studentTc.filteredCount}
                      pageSize={studentTc.pageSize}
                      onPageChange={studentTc.setPage}
                      onPageSizeChange={studentTc.setPageSize}
                    />
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => viewingClass && handleExportCSV(viewingClass)}>
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

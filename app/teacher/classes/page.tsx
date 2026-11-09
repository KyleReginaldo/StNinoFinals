'use client';

const DAY_LABELS: Record<string, string> = { M: 'Mon', T: 'Tue', W: 'Wed', Th: 'Thu', F: 'Fri' };
const DAY_ORDER = ['M', 'T', 'W', 'Th', 'F'];

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

function formatSchedule(raw: string | null): string {
  if (!raw) return '';
  try {
    const entries: { day: string; start: string; end: string }[] = JSON.parse(raw);
    // Group days that share the same start/end time
    const groups = new Map<string, string[]>();
    for (const e of entries) {
      const key = `${e.start}|${e.end}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e.day);
    }
    return Array.from(groups.entries())
      .map(([key, days]) => {
        const [start, end] = key.split('|');
        const sorted = [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
        const dayStr = sorted.map(d => DAY_LABELS[d] ?? d).join(', ');
        return `${dayStr}  ${formatTime(start)}–${formatTime(end)}`;
      })
      .join('\n');
  } catch {
    return raw;
  }
}

/** Weekday strip (class days highlighted) + time(s): which days a subject meets, at a glance. */
function ScheduleCell({ raw }: { raw: string | null }) {
  const slots = parseScheduleSlots(raw);
  if (!slots.length) return <span className="text-gray-300">—</span>;
  const days = new Set(slots.map(s => s.day));
  const times = [...new Set(slots.map(s => `${formatTime(s.start)}–${formatTime(s.end)}`))];
  return (
    <div className="space-y-1">
      <div className="flex gap-0.5" aria-label={`Meets ${DAY_ORDER.filter(d => days.has(d)).map(d => DAY_LABELS[d]).join(', ')}`}>
        {DAY_ORDER.map(d => (
          <span
            key={d}
            className={`w-6 h-5 grid place-items-center rounded text-[10px] font-semibold ${
              days.has(d) ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-300'
            }`}
          >
            {d}
          </span>
        ))}
      </div>
      <div className="text-xs text-gray-600 whitespace-pre-line">
        {times.length === 1 ? times[0] : formatSchedule(raw)}
      </div>
    </div>
  );
}

import { Pagination } from '@/components/ui/data-table/Pagination';
import { SortHeader } from '@/components/ui/data-table/SortHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExportDropdown } from '@/components/ui/export-dropdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTableControls } from '@/hooks/use-table-controls';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BookOpen, Search, Users, X } from 'lucide-react';
import { useRefresh } from '@/lib/refresh-context';
import { parseScheduleSlots } from '@/lib/rooms';
import { formatDate } from '@/lib/format-date';
import { useEffect, useMemo, useState } from 'react';

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
  const { refreshKey } = useRefresh();

  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterQuarter, setFilterQuarter] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  const gradeOptions = useMemo(() =>
    [...new Set(classes.map(c => c.grade_level).filter(Boolean))].sort() as string[],
  [classes]);

  const yearOptions = useMemo(() =>
    [...new Set(classes.map(c => c.school_year).filter(Boolean))].sort().reverse() as string[],
  [classes]);

  const filteredClasses = useMemo(() => {
    const q = search.toLowerCase();
    return classes.filter(c => {
      if (q && !c.class_name.toLowerCase().includes(q) && !c.class_code.toLowerCase().includes(q)) return false;
      if (filterGrade !== 'all' && c.grade_level !== filterGrade) return false;
      if (filterQuarter !== 'all' && c.quarter !== filterQuarter) return false;
      if (filterYear !== 'all' && c.school_year !== filterYear) return false;
      return true;
    });
  }, [classes, search, filterGrade, filterQuarter, filterYear]);

  const hasFilters = search || filterGrade !== 'all' || filterQuarter !== 'all' || filterYear !== 'all';

  const clearFilters = () => {
    setSearch('');
    setFilterGrade('all');
    setFilterQuarter('all');
    setFilterYear('all');
  };

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
  }, [refreshKey]);

  const handleExportExcel = async (classItem: ClassItem) => {
    if (!classItem.students.length) return;
    const { downloadExcel } = await import('@/lib/export-excel');
    const generated = formatDate(new Date());
    await downloadExcel(`${classItem.class_name}_students`, {
      title: [
        'STO. NIÑO DE PRAGA ACADEMY OF LA PAZ HOMES II, INC.',
        'CLASS LIST',
        `Class: ${classItem.class_name}${classItem.grade_level ? `  |  ${classItem.grade_level}${classItem.section ? ` — ${classItem.section}` : ''}` : ''}`,
        `Generated: ${generated}`,
      ],
      columns: ['#', 'LRN', 'Last Name', 'First Name', 'Grade Level', 'Section'],
      colWidths: [8, 20, 30, 30, 18, 18],
      rows: classItem.students.map((s, i) => [i + 1, s.student_number, s.last_name, s.first_name, s.grade_level || '', s.section || '']),
      headerColor: 'blue',
    });
  };

  const handleExportPDF = (classItem: ClassItem) => {
    if (!classItem.students.length) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const generated = formatDate(new Date());

    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('STO. NIÑO DE PRAGA ACADEMY', 105, 15, { align: 'center' });
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text('OF LA PAZ HOMES II, INC.', 105, 21, { align: 'center' });
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('CLASS LIST', 105, 30, { align: 'center' });
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`${classItem.class_name}${classItem.grade_level ? `  |  ${classItem.grade_level}${classItem.section ? ` — ${classItem.section}` : ''}` : ''}`, 105, 37, { align: 'center' });
    doc.text(`Generated: ${generated}`, 105, 42, { align: 'center' });

    autoTable(doc, {
      startY: 48,
      head: [['#', 'LRN', 'Last Name', 'First Name', 'Grade Level', 'Section']],
      body: classItem.students.map((s, i) => [i + 1, s.student_number, s.last_name, s.first_name, s.grade_level || '—', s.section || '—']),
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { halign: 'center', cellWidth: 10 } },
      margin: { left: 15, right: 15 },
    });

    doc.save(`${classItem.class_name}_students.pdf`);
  };

  const classRows = () =>
    filteredClasses.map(c => [
      c.class_name,
      c.class_code,
      c.grade_level || '',
      c.section || '',
      formatSchedule(c.schedule).replace(/\n/g, '; '),
      c.room || '',
      `Q${c.quarter}`,
      c.school_year,
      c.student_count,
    ]);
  const CLASS_COLUMNS = ['Subject', 'Code', 'Grade', 'Section', 'Schedule', 'Room', 'Quarter', 'School Year', 'Students'];

  const handleExportClassesExcel = async () => {
    const { downloadExcel } = await import('@/lib/export-excel');
    await downloadExcel('my_classes', {
      title: ['STO. NIÑO DE PRAGA ACADEMY OF LA PAZ HOMES II, INC.', 'MY CLASSES', `Generated: ${formatDate(new Date())}`],
      columns: CLASS_COLUMNS,
      colWidths: [28, 14, 12, 16, 30, 12, 10, 14, 10],
      rows: classRows(),
      headerColor: 'blue',
    });
  };

  const handleExportClassesPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('STO. NIÑO DE PRAGA ACADEMY', 148, 15, { align: 'center' });
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text('OF LA PAZ HOMES II, INC.', 148, 21, { align: 'center' });
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('MY CLASSES', 148, 30, { align: 'center' });
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${formatDate(new Date())}`, 148, 36, { align: 'center' });
    autoTable(doc, {
      startY: 42,
      head: [CLASS_COLUMNS],
      body: classRows(),
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 12, right: 12 },
    });
    doc.save('my_classes.pdf');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Classes</h2>
          <p className="text-sm text-gray-500 mt-0.5">Your assigned subjects. Select a row to see its students.</p>
        </div>
        {classes.length > 0 && (
          <ExportDropdown
            onPDF={handleExportClassesPDF}
            onExcel={handleExportClassesExcel}
            disabled={filteredClasses.length === 0}
            size="sm"
          />
        )}
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 flex flex-col items-center justify-center text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-base font-semibold text-gray-700">No classes assigned yet</p>
          <p className="text-sm text-gray-500 mt-1">Ask the admin to assign you to a subject.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
                placeholder="Search subject or code"
                aria-label="Search subject or code"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="h-8 text-xs w-36 border-gray-200" aria-label="Grade level">
                <SelectValue placeholder="Grade Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All grades</SelectItem>
                {gradeOptions.map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterQuarter} onValueChange={setFilterQuarter}>
              <SelectTrigger className="h-8 text-xs w-32 border-gray-200" aria-label="Quarter">
                <SelectValue placeholder="Quarter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All quarters</SelectItem>
                {['1','2','3','4'].map(q => (
                  <SelectItem key={q} value={q}>Quarter {q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="h-8 text-xs w-36 border-gray-200" aria-label="School year">
                <SelectValue placeholder="School Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {yearOptions.map(y => (
                  <SelectItem key={y} value={y}>S.Y. {y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <span className="ml-auto text-xs text-gray-400 tabular-nums">
              {filteredClasses.length} of {classes.length}
            </span>
          </div>

          {filteredClasses.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm font-medium text-gray-700">No subjects match these filters.</p>
              <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-900 mt-1 underline underline-offset-2">
                Clear filters
              </button>
            </div>
          ) : (
            <>
            {/* Phones: the same rows stacked, no sideways scrolling */}
            <ul className="md:hidden divide-y divide-gray-100">
              {filteredClasses.map(classItem => (
                <li key={classItem.id}>
                  <button
                    onClick={() => setViewingClass(classItem)}
                    className="w-full text-left px-4 py-3 space-y-2 hover:bg-gray-50 focus-visible:outline-none focus-visible:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-gray-900">{classItem.class_name}</div>
                        <div className="text-xs text-gray-500">
                          {[classItem.grade_level, classItem.section, classItem.room].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-gray-900 tabular-nums">{classItem.student_count}</div>
                        <div className="text-[11px] text-gray-500">students</div>
                      </div>
                    </div>
                    <ScheduleCell raw={classItem.schedule} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-2.5">Subject</th>
                    <th className="px-4 py-2.5">Grade &amp; Section</th>
                    <th className="px-4 py-2.5">Schedule</th>
                    <th className="px-4 py-2.5">Room</th>
                    <th className="px-4 py-2.5">Term</th>
                    <th className="px-4 py-2.5 text-right">Students</th>
                    <th className="px-4 py-2.5"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClasses.map(classItem => (
                    <tr
                      key={classItem.id}
                      onClick={() => setViewingClass(classItem)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{classItem.class_name}</div>
                        <div className="text-xs text-gray-500">{classItem.class_code}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {classItem.grade_level || <span className="text-gray-300">—</span>}
                        {classItem.section && <div className="text-xs text-gray-500">{classItem.section}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <ScheduleCell raw={classItem.schedule} />
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {classItem.room || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        Q{classItem.quarter}
                        <div className="text-xs text-gray-500">S.Y. {classItem.school_year}</div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-gray-900">
                        {classItem.student_count}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={e => { e.stopPropagation(); setViewingClass(classItem); }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-gray-700 border border-gray-200 hover:bg-white hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
                        >
                          <Users className="w-3.5 h-3.5" />
                          Students
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
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
                  placeholder="Search by name or LRN..."
                  value={studentTc.search}
                  onChange={e => studentTc.setSearch(e.target.value)}
                />
              </div>

              {/* Table */}
              <div className="rounded-xl border border-gray-200 overflow-hidden overflow-y-auto flex-1">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[660px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-10">#</th>
                      <SortHeader label="LRN"  sortKey="student_number" currentSort={studentTc.sort} onSort={studentTc.toggleSort} />
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
                {viewingClass && (
                  <ExportDropdown
                    onPDF={() => handleExportPDF(viewingClass)}
                    onExcel={() => handleExportExcel(viewingClass)}
                    size="sm"
                  />
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

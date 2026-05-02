'use client';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/data-table/Pagination';
import { SortHeader } from '@/components/ui/data-table/SortHeader';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTableControls } from '@/hooks/use-table-controls';
import { CalendarDays, Download, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AttendanceRecord {
  id: string;
  scan_time: string;
  status: string;
  student_name: string;
  student_number: string;
  grade_level: string;
  section: string;
}

const today = new Date().toISOString().split('T')[0];
const thirtyDaysAgo = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
})();

export default function TeacherAttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState('all');
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (section !== 'all') params.set('section', section);
      const res = await fetch(`/api/teacher/attendance?${params}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
        if (data.sections?.length) setSections(data.sections);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('teacher');
    if (!stored) { router.push('/login?role=teacher'); return; }
    fetchAttendance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tc = useTableControls(records, {
    searchFields: ['student_name', 'student_number', 'section'],
    defaultSort: { key: 'scan_time', dir: 'desc' },
    pageSize: 25,
  });

  const handleExportCSV = () => {
    const rows = [
      ['Date', 'Time', 'Student Name', 'Student No.', 'Grade Level', 'Section', 'Status'],
      ...tc.rows.map((r) => {
        const dt = new Date(r.scan_time);
        return [
          dt.toLocaleDateString('en-PH'),
          dt.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
          r.student_name,
          r.student_number || '',
          r.grade_level || '',
          r.section || '',
          r.status,
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${startDate}_to_${endDate}${section !== 'all' ? `_${section}` : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-gray-700" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Attendance Log</h2>
            <p className="text-sm text-gray-500 mt-0.5">View and export student attendance by section</p>
          </div>
        </div>
        <Button onClick={handleExportCSV} variant="outline" size="sm" disabled={tc.rows.length === 0}>
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <p className="text-xs font-medium text-gray-500 mb-1.5">Section</p>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Sections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">From</p>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-sm w-36" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">To</p>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 text-sm w-36" />
          </div>
          <Button onClick={fetchAttendance} disabled={loading} className="h-9 bg-gray-900 hover:bg-gray-800 text-white text-sm">
            {loading ? 'Loading...' : 'Apply'}
          </Button>
        </div>
      </div>

      {/* Search + table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Search by name, number…"
              value={tc.search}
              onChange={(e) => tc.setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <span className="text-xs text-gray-400">{tc.filteredCount} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <SortHeader label="Date & Time" sortKey="scan_time" currentSort={tc.sort} onSort={tc.toggleSort} />
                <SortHeader label="Student Name" sortKey="student_name" currentSort={tc.sort} onSort={tc.toggleSort} />
                <SortHeader label="Student No." sortKey="student_number" currentSort={tc.sort} onSort={tc.toggleSort} className="hidden sm:table-cell" />
                <SortHeader label="Grade Level" sortKey="grade_level" currentSort={tc.sort} onSort={tc.toggleSort} className="hidden md:table-cell" />
                <SortHeader label="Section" sortKey="section" currentSort={tc.sort} onSort={tc.toggleSort} />
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">Loading…</td>
                </tr>
              ) : tc.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No attendance records found.</td>
                </tr>
              ) : (
                tc.rows.map((r) => {
                  const dt = new Date(r.scan_time);
                  const isPresent = r.status?.toLowerCase() === 'present';
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">
                        <span className="font-medium">{dt.toLocaleDateString('en-PH')}</span>
                        <span className="text-gray-400 ml-2 text-xs">
                          {dt.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-900 capitalize">{r.student_name.toLowerCase()}</td>
                      <td className="px-4 py-2.5 text-gray-500 hidden sm:table-cell">{r.student_number || '—'}</td>
                      <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell">{r.grade_level || '—'}</td>
                      <td className="px-4 py-2.5 text-gray-500">{r.section || '—'}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          isPresent ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {tc.pageCount > 1 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination
              page={tc.page}
              pageCount={tc.pageCount}
              totalCount={tc.totalCount}
              filteredCount={tc.filteredCount}
              pageSize={tc.pageSize}
              onPageChange={tc.setPage}
              onPageSizeChange={tc.setPageSize}
            />
          </div>
        )}
      </div>
    </div>
  );
}

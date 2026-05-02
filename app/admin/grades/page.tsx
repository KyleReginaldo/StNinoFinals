'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAlert } from '@/lib/use-alert';
import { useConfirm } from '@/lib/use-confirm';
import {
  CheckCircle,
  CheckCircle2,
  Download,
  GraduationCap,
  Search,
  XCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

type GradeStatus = 'pending' | 'approved' | 'rejected';

interface GradeEntry {
  id: string;
  grade: number;
  subject: string;
  status: GradeStatus;
  created_at: string | null;
  updated_at: string | null;
  reviewed_at: string | null;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    student_number: string;
  } | null;
  teacher: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  reviewer: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

interface SubjectGroup {
  key: string;
  subject: string;
  teacher: GradeEntry['teacher'];
  entries: GradeEntry[];
  pendingCount: number;
}

type FilterTab = 'all' | GradeStatus;

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50' },
  approved: { label: 'Approved', dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
  rejected: { label: 'Rejected', dot: 'bg-red-500',   text: 'text-red-700',   bg: 'bg-red-50'   },
};

export default function AdminGradesPage() {
  const { admin } = useAuth();
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [reviewingGrade, setReviewingGrade] = useState<GradeEntry | null>(null);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/grades');
      const result = await response.json();
      if (result.success) {
        setGrades(result.data || []);
      } else {
        showAlert({ message: result.error || 'Failed to load grades.', type: 'error' });
      }
    } catch {
      showAlert({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  const counts = useMemo(() => ({
    total:    grades.length,
    pending:  grades.filter(g => g.status === 'pending').length,
    approved: grades.filter(g => g.status === 'approved').length,
    rejected: grades.filter(g => g.status === 'rejected').length,
  }), [grades]);

  const filteredGrades = useMemo(() => {
    return grades.filter(g => {
      const matchesTab = activeTab === 'all' || g.status === activeTab;
      const q = searchTerm.toLowerCase();
      const studentName = `${g.student?.first_name ?? ''} ${g.student?.last_name ?? ''}`.toLowerCase();
      const teacherName = `${g.teacher?.first_name ?? ''} ${g.teacher?.last_name ?? ''}`.toLowerCase();
      const matchesSearch =
        !q ||
        studentName.includes(q) ||
        teacherName.includes(q) ||
        g.subject.toLowerCase().includes(q) ||
        (g.student?.student_number ?? '').toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [grades, activeTab, searchTerm]);

  const subjectGroups = useMemo(() => {
    const map = new Map<string, SubjectGroup>();
    for (const g of filteredGrades) {
      const key = `${g.subject}__${g.teacher?.id || 'unknown'}`;
      if (!map.has(key)) {
        map.set(key, { key, subject: g.subject, teacher: g.teacher, entries: [], pendingCount: 0 });
      }
      const group = map.get(key)!;
      group.entries.push(g);
      if (g.status === 'pending') group.pendingCount++;
    }
    return Array.from(map.values()).sort((a, b) => b.pendingCount - a.pendingCount);
  }, [filteredGrades]);

  const selectedGroup = useMemo(
    () => subjectGroups.find(g => g.key === selectedGroupKey) || null,
    [subjectGroups, selectedGroupKey]
  );

  useEffect(() => {
    if (subjectGroups.length > 0 && !selectedGroup) {
      setSelectedGroupKey(subjectGroups[0].key);
    }
  }, [subjectGroups, selectedGroup]);

  const handleReview = async (grade: GradeEntry, status: 'approved' | 'rejected') => {
    const studentName = grade.student
      ? `${grade.student.first_name} ${grade.student.last_name}`
      : 'this student';
    const confirmed = await showConfirm({
      title: `${status === 'approved' ? 'Approve' : 'Reject'} Grade`,
      message: `Are you sure you want to ${status === 'approved' ? 'approve' : 'reject'} the ${grade.subject} grade (${grade.grade}) for ${studentName}?`,
    });
    if (!confirmed) return;

    setProcessingId(grade.id);
    try {
      const response = await fetch('/api/admin/grades', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: grade.id, status, reviewedBy: admin?.id ?? null }),
      });
      const result = await response.json();
      if (result.success) {
        showAlert({ message: `Grade ${status === 'approved' ? 'approved' : 'rejected'} successfully.`, type: 'success' });
        fetchGrades();
      } else {
        showAlert({ message: result.error || `Failed to ${status} grade.`, type: 'error' });
      }
    } catch {
      showAlert({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleBatchApprove = async (group: SubjectGroup) => {
    const pendingIds = group.entries.filter(e => e.status === 'pending').map(e => e.id);
    if (pendingIds.length === 0) return;
    const confirmed = await showConfirm({
      title: pendingIds.length === 1 ? 'Approve Grade' : 'Approve All Grades',
      message: pendingIds.length === 1
        ? `Are you sure you want to approve the pending grade for ${group.subject}?`
        : `Are you sure you want to approve all ${pendingIds.length} pending grades for ${group.subject}?`,
    });
    if (!confirmed) return;

    setBatchProcessing(true);
    try {
      const response = await fetch('/api/admin/grades', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: pendingIds, status: 'approved', reviewedBy: admin?.id ?? null }),
      });
      const result = await response.json();
      if (result.success) {
        showAlert({ message: `${result.count || pendingIds.length} grades approved successfully.`, type: 'success' });
        fetchGrades();
      } else {
        showAlert({ message: result.error || 'Failed to batch approve grades.', type: 'error' });
      }
    } catch {
      showAlert({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setBatchProcessing(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Student', 'Student No.', 'Subject', 'Teacher', 'Grade', 'Status', 'Submitted'];
    const rows = filteredGrades.map(g => [
      g.student ? `${g.student.first_name} ${g.student.last_name}` : 'N/A',
      g.student?.student_number || 'N/A',
      g.subject,
      g.teacher ? `${g.teacher.first_name} ${g.teacher.last_name}` : 'N/A',
      g.grade,
      g.status,
      g.created_at ? new Date(g.created_at).toLocaleDateString('en-PH') : '',
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `grade-approvals-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFontSize(16);
    doc.text('Sto. Niño de Praga Academy', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Grade Approvals Report', 105, 23, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-PH')}`, 105, 30, { align: 'center' });
    const tableData = filteredGrades.map(g => [
      g.student ? `${g.student.first_name} ${g.student.last_name}` : 'N/A',
      g.student?.student_number || 'N/A',
      g.subject,
      g.teacher ? `${g.teacher.first_name} ${g.teacher.last_name}` : 'N/A',
      g.grade,
      g.status.charAt(0).toUpperCase() + g.status.slice(1),
    ]);
    autoTable(doc, {
      startY: 36,
      head: [['Student', 'Student No.', 'Subject', 'Teacher', 'Grade', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [153, 27, 27], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      columnStyles: { 4: { halign: 'center' }, 5: { halign: 'center' } },
    });
    doc.save(`grade-approvals-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-gray-700" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Grade Approvals</h2>
            <p className="text-sm text-gray-500 mt-0.5">Review and approve grades submitted by faculty</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm" disabled={filteredGrades.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            CSV
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm" disabled={filteredGrades.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            PDF
          </Button>
        </div>
      </div>

      {/* Stat Cards — clickable filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: 'Total',    value: counts.total,    tab: 'all'      as FilterTab, accent: 'border-gray-200' },
          { label: 'Pending',  value: counts.pending,  tab: 'pending'  as FilterTab, accent: 'border-amber-300' },
          { label: 'Approved', value: counts.approved, tab: 'approved' as FilterTab, accent: 'border-green-300' },
          { label: 'Rejected', value: counts.rejected, tab: 'rejected' as FilterTab, accent: 'border-red-300'   },
        ] as const).map(s => (
          <button
            key={s.tab}
            onClick={() => setActiveTab(s.tab)}
            className={`text-left bg-white rounded-xl border-2 shadow-sm p-4 transition-all hover:shadow-md ${
              activeTab === s.tab ? `${s.accent} ring-1 ring-inset ring-gray-900/5` : 'border-gray-200'
            }`}
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${
              activeTab === s.tab
                ? s.tab === 'pending'  ? 'text-amber-600'
                : s.tab === 'approved' ? 'text-green-600'
                : s.tab === 'rejected' ? 'text-red-600'
                : 'text-gray-900'
                : 'text-gray-900'
            }`}>
              {s.value}
            </p>
          </button>
        ))}
      </div>

      {/* Search toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
            placeholder="Search by student, teacher, or subject..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent" />
        </div>
      ) : filteredGrades.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 flex flex-col items-center text-center">
          <GraduationCap className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-base font-semibold text-gray-600">No grades found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm || activeTab !== 'all' ? 'Try adjusting your search or filter.' : 'No grades have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="flex gap-5">
          {/* Left Panel: Subject Groups */}
          <div className="w-64 flex-shrink-0 space-y-1.5 max-h-[calc(100vh-360px)] overflow-y-auto pr-0.5">
            {subjectGroups.map(group => {
              const isSelected = selectedGroupKey === group.key;
              return (
                <button
                  key={group.key}
                  onClick={() => setSelectedGroupKey(group.key)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-gray-900 border-gray-900 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold text-sm leading-tight truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {group.subject}
                      </p>
                      <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
                        {group.teacher
                          ? `${group.teacher.first_name} ${group.teacher.last_name}`
                          : <span className="italic">No teacher</span>}
                      </p>
                      <p className={`text-xs mt-1.5 ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>
                        {group.entries.length} student{group.entries.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {group.pendingCount > 0 && (
                      <span className={`text-xs font-semibold rounded-full px-2 py-0.5 shrink-0 ${
                        isSelected ? 'bg-amber-400 text-amber-900' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {group.pendingCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Panel: Student Grades */}
          <div className="flex-1 min-w-0">
            {selectedGroup ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Panel header */}
                <div className="px-5 py-3.5 flex items-center justify-between border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-900">{selectedGroup.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedGroup.teacher
                        ? `${selectedGroup.teacher.first_name} ${selectedGroup.teacher.last_name}`
                        : <span className="text-gray-300">No teacher assigned</span>}
                      <span className="mx-1.5 text-gray-300">·</span>
                      {selectedGroup.entries.length} student{selectedGroup.entries.length !== 1 ? 's' : ''}
                      {selectedGroup.pendingCount > 0 && (
                        <>
                          <span className="mx-1.5 text-gray-300">·</span>
                          <span className="text-amber-600 font-medium">{selectedGroup.pendingCount} pending</span>
                        </>
                      )}
                    </p>
                  </div>
                  {selectedGroup.pendingCount > 0 && (
                    <Button
                      onClick={() => handleBatchApprove(selectedGroup)}
                      disabled={batchProcessing}
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-700 shrink-0"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      {batchProcessing
                        ? 'Approving...'
                        : selectedGroup.pendingCount === 1
                          ? 'Approve'
                          : `Approve All (${selectedGroup.pendingCount})`}
                    </Button>
                  )}
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Student</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Student No.</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Grade</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Submitted</th>
                      <th className="px-4 py-2.5 pr-5 w-20" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedGroup.entries.map(entry => {
                      const cfg = STATUS_CONFIG[entry.status];
                      const isPassing = entry.grade >= 75;
                      return (
                        <tr
                          key={entry.id}
                          className="hover:bg-gray-50 group cursor-pointer"
                          onClick={() => setReviewingGrade(entry)}
                        >
                          <td className="px-5 py-3 text-sm font-medium text-gray-900">
                            {entry.student
                              ? `${entry.student.last_name}, ${entry.student.first_name}`
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-[12px] text-gray-500">
                              {entry.student?.student_number ?? <span className="text-gray-300">—</span>}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold tabular-nums ${isPassing ? 'text-gray-900' : 'text-red-600'}`}>
                              {entry.grade}
                            </span>
                            {!isPassing && (
                              <span className="ml-1.5 text-[10px] font-medium text-red-400">FAIL</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              <span className="text-xs text-gray-600">{cfg.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {entry.created_at
                              ? new Date(entry.created_at).toLocaleDateString('en-PH')
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3 pr-5 text-right">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400">
                              {entry.status === 'pending' ? 'Review →' : 'View →'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="px-5 py-2.5 border-t border-gray-100">
                  <span className="text-[11px] text-gray-400">
                    {selectedGroup.entries.length} student{selectedGroup.entries.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 flex items-center justify-center text-gray-400 text-sm">
                Select a subject from the left to view grades
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewingGrade} onOpenChange={open => !open && setReviewingGrade(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Grade Review</DialogTitle>
          </DialogHeader>
          {reviewingGrade && (() => {
            const cfg = STATUS_CONFIG[reviewingGrade.status];
            const isPassing = reviewingGrade.grade >= 75;
            return (
              <div className="space-y-4">
                {/* Grade highlight */}
                <div className={`rounded-xl p-5 text-center ${isPassing ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`text-5xl font-bold tabular-nums ${isPassing ? 'text-green-700' : 'text-red-600'}`}>
                    {reviewingGrade.grade}
                  </p>
                  <p className={`text-sm font-semibold mt-1 ${isPassing ? 'text-green-600' : 'text-red-500'}`}>
                    {isPassing ? 'Passing' : 'Failing'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{reviewingGrade.subject}</p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Student</p>
                    <p className="text-gray-900 font-medium">
                      {reviewingGrade.student
                        ? `${reviewingGrade.student.first_name} ${reviewingGrade.student.last_name}`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Student No.</p>
                    <p className="font-mono text-gray-900">{reviewingGrade.student?.student_number ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Teacher</p>
                    <p className="text-gray-900">
                      {reviewingGrade.teacher
                        ? `${reviewingGrade.teacher.first_name} ${reviewingGrade.teacher.last_name}`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Submitted</p>
                    <p className="text-gray-900">
                      {reviewingGrade.created_at
                        ? new Date(reviewingGrade.created_at).toLocaleDateString('en-PH')
                        : '—'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
          <DialogFooter className="gap-2 sm:gap-2">
            {reviewingGrade?.status === 'pending' ? (
              <>
                <Button
                  onClick={async () => {
                    await handleReview(reviewingGrade, 'rejected');
                    setReviewingGrade(null);
                  }}
                  disabled={processingId === reviewingGrade.id}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Reject
                </Button>
                <Button
                  onClick={async () => {
                    await handleReview(reviewingGrade, 'approved');
                    setReviewingGrade(null);
                  }}
                  disabled={processingId === reviewingGrade.id}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Approve
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setReviewingGrade(null)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
  CheckCircle,
  CheckCircle2,
  Download,
  Eye,
  GraduationCap,
  Search,
  XCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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

const STATUS_TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const getStatusBadge = (status: GradeStatus) => {
  if (status === 'pending') {
    return (
      <Badge
        variant="outline"
        className="bg-yellow-50 text-yellow-700 border-yellow-300"
      >
        Pending
      </Badge>
    );
  }
  if (status === 'approved') {
    return (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 border-green-300"
      >
        Approved
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
      Rejected
    </Badge>
  );
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
        showAlert({
          message: result.error || 'Failed to load grades.',
          type: 'error',
        });
      }
    } catch {
      showAlert({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const matchesTab = activeTab === 'all' || g.status === activeTab;
      const search = searchTerm.toLowerCase();
      const studentName =
        `${g.student?.first_name ?? ''} ${g.student?.last_name ?? ''}`.toLowerCase();
      const teacherName =
        `${g.teacher?.first_name ?? ''} ${g.teacher?.last_name ?? ''}`.toLowerCase();
      const matchesSearch =
        !search ||
        studentName.includes(search) ||
        teacherName.includes(search) ||
        g.subject.toLowerCase().includes(search) ||
        (g.student?.student_number ?? '').toLowerCase().includes(search);
      return matchesTab && matchesSearch;
    });
  }, [grades, activeTab, searchTerm]);

  const pendingCount = useMemo(
    () => grades.filter((g) => g.status === 'pending').length,
    [grades]
  );

  // Group grades by subject + teacher
  const subjectGroups = useMemo(() => {
    const map = new Map<string, SubjectGroup>();
    for (const g of filteredGrades) {
      const key = `${g.subject}__${g.teacher?.id || 'unknown'}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          subject: g.subject,
          teacher: g.teacher,
          entries: [],
          pendingCount: 0,
        });
      }
      const group = map.get(key)!;
      group.entries.push(g);
      if (g.status === 'pending') group.pendingCount++;
    }
    return Array.from(map.values()).sort((a, b) => b.pendingCount - a.pendingCount);
  }, [filteredGrades]);

  const selectedGroup = useMemo(
    () => subjectGroups.find((g) => g.key === selectedGroupKey) || null,
    [subjectGroups, selectedGroupKey]
  );

  // Auto-select first group
  useEffect(() => {
    if (subjectGroups.length > 0 && !selectedGroup) {
      setSelectedGroupKey(subjectGroups[0].key);
    }
  }, [subjectGroups, selectedGroup]);

  const handleReview = async (
    grade: GradeEntry,
    status: 'approved' | 'rejected'
  ) => {
    const studentName = grade.student
      ? `${grade.student.first_name} ${grade.student.last_name}`
      : 'this student';
    const action = status === 'approved' ? 'approve' : 'reject';

    const confirmed = await showConfirm({
      title: `${status === 'approved' ? 'Approve' : 'Reject'} Grade`,
      message: `Are you sure you want to ${action} the ${grade.subject} grade (${grade.grade}) for ${studentName}?`,
    });
    if (!confirmed) return;

    setProcessingId(grade.id);
    try {
      const response = await fetch('/api/admin/grades', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: grade.id,
          status,
          reviewedBy: admin?.id ?? null,
        }),
      });
      const result = await response.json();

      if (result.success) {
        showAlert({
          message: `Grade ${status === 'approved' ? 'approved' : 'rejected'} successfully.`,
          type: 'success',
        });
        fetchGrades();
      } else {
        showAlert({
          message: result.error || `Failed to ${action} grade.`,
          type: 'error',
        });
      }
    } catch {
      showAlert({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleBatchApprove = async (group: SubjectGroup) => {
    const pendingIds = group.entries
      .filter((e) => e.status === 'pending')
      .map((e) => e.id);

    if (pendingIds.length === 0) return;

    const confirmed = await showConfirm({
      title: 'Batch Approve Grades',
      message: `Are you sure you want to approve all ${pendingIds.length} pending grades for ${group.subject}?`,
    });
    if (!confirmed) return;

    setBatchProcessing(true);
    try {
      const response = await fetch('/api/admin/grades', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: pendingIds,
          status: 'approved',
          reviewedBy: admin?.id ?? null,
        }),
      });
      const result = await response.json();

      if (result.success) {
        showAlert({
          message: `${result.count || pendingIds.length} grades approved successfully.`,
          type: 'success',
        });
        fetchGrades();
      } else {
        showAlert({
          message: result.error || 'Failed to batch approve grades.',
          type: 'error',
        });
      }
    } catch {
      showAlert({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setBatchProcessing(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Student', 'Student No.', 'Subject', 'Teacher', 'Grade', 'Status', 'Submitted'];
    const rows = filteredGrades.map((g) => [
      g.student ? `${g.student.first_name} ${g.student.last_name}` : 'N/A',
      g.student?.student_number || 'N/A',
      g.subject,
      g.teacher ? `${g.teacher.first_name} ${g.teacher.last_name}` : 'N/A',
      g.grade,
      g.status,
      g.created_at ? new Date(g.created_at).toLocaleDateString('en-PH') : '',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
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

    const tableData = filteredGrades.map((g) => [
      g.student ? `${g.student.first_name} ${g.student.last_name}` : 'N/A',
      g.student?.student_number || 'N/A',
      g.subject,
      g.teacher ? `${g.teacher.first_name} ${g.teacher.last_name}` : 'N/A',
      g.grade,
      g.status.charAt(0).toUpperCase() + g.status.slice(1),
    ]);

    (doc as any).autoTable({
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
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <GraduationCap className="w-10 h-10 text-red-800" />
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Grade Approvals</h2>
          <p className="text-gray-600">
            Review and approve grades submitted by faculty
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-sm px-3 py-1">
              {pendingCount} pending
            </Badge>
          )}
          <Button onClick={handleExportCSV} variant="outline" size="sm" disabled={filteredGrades.length === 0}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm" disabled={filteredGrades.length === 0}>
            <Download className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'bg-red-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              {tab.value === 'pending' && pendingCount > 0 && (
                <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs rounded-full px-1.5 py-0.5">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by student, teacher, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-800 border-t-transparent" />
        </div>
      ) : filteredGrades.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No grades found</div>
      ) : (
        /* Two-panel layout: Subject groups (left) + Student grades (right) */
        <div className="flex gap-6">
          {/* Left Panel: Subject Groups */}
          <div className="w-80 flex-shrink-0 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
            {subjectGroups.map((group) => (
              <button
                key={group.key}
                onClick={() => setSelectedGroupKey(group.key)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedGroupKey === group.key
                    ? 'bg-red-50 border-red-300 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {group.subject}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {group.teacher
                        ? `${group.teacher.first_name} ${group.teacher.last_name}`
                        : 'No teacher'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {group.entries.length} student{group.entries.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {group.pendingCount > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs flex-shrink-0">
                      {group.pendingCount} pending
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Right Panel: Students in Selected Group */}
          <div className="flex-1 min-w-0">
            {selectedGroup ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-red-800">
                        {selectedGroup.subject}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Teacher:{' '}
                        {selectedGroup.teacher
                          ? `${selectedGroup.teacher.first_name} ${selectedGroup.teacher.last_name}`
                          : '—'}
                        {' · '}
                        {selectedGroup.entries.length} student{selectedGroup.entries.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {selectedGroup.pendingCount > 0 && (
                      <Button
                        onClick={() => handleBatchApprove(selectedGroup)}
                        disabled={batchProcessing}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {batchProcessing
                          ? 'Processing...'
                          : `Approve All (${selectedGroup.pendingCount})`}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Student No.</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedGroup.entries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {entry.student
                              ? `${entry.student.first_name} ${entry.student.last_name}`
                              : '—'}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {entry.student?.student_number ?? '—'}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-gray-800">
                              {entry.grade}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(entry.status)}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {entry.created_at
                              ? new Date(entry.created_at).toLocaleDateString(
                                  'en-PH'
                                )
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReviewingGrade(entry)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {entry.status === 'pending' ? 'Review' : 'View'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a subject group to view grades
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog
        open={!!reviewingGrade}
        onOpenChange={(open) => !open && setReviewingGrade(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-800">Grade Review</DialogTitle>
          </DialogHeader>
          {reviewingGrade && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Student</p>
                  <p className="text-gray-900">
                    {reviewingGrade.student
                      ? `${reviewingGrade.student.first_name} ${reviewingGrade.student.last_name}`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Student No.</p>
                  <p className="text-gray-900">
                    {reviewingGrade.student?.student_number ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Subject</p>
                  <p className="text-gray-900">{reviewingGrade.subject}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Grade</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reviewingGrade.grade}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Teacher</p>
                  <p className="text-gray-900">
                    {reviewingGrade.teacher
                      ? `${reviewingGrade.teacher.first_name} ${reviewingGrade.teacher.last_name}`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Submitted</p>
                  <p className="text-gray-900">
                    {reviewingGrade.created_at
                      ? new Date(
                          reviewingGrade.created_at
                        ).toLocaleDateString('en-PH')
                      : '—'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 font-medium">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(reviewingGrade.status)}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            {reviewingGrade?.status === 'pending' ? (
              <>
                <Button
                  onClick={async () => {
                    await handleReview(reviewingGrade, 'rejected');
                    setReviewingGrade(null);
                  }}
                  disabled={processingId === reviewingGrade.id}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 mr-1" />
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
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setReviewingGrade(null)}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

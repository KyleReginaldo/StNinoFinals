'use client';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/data-table/Pagination';
import { SortHeader } from '@/components/ui/data-table/SortHeader';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTableControls } from '@/hooks/use-table-controls';
import { useAlert } from '@/lib/use-alert';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  GraduationCap,
  Layers,
  Search,
  User2,
  X,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface StudentInfo {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface EnrollmentRequest {
  id: string;
  student_id: string;
  grade_level: string;
  strand: string | null;
  school_year: string;
  quarter: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  assigned_class_id: string | null;
  created_at: string;
  previous_grades_url: string | null;
  student: StudentInfo | null;
}

type FlatEnrollment = EnrollmentRequest & { studentName: string };

interface ClassOption {
  id: string;
  class_name: string;
  grade_level: string | null;
  section: string | null;
}

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  dot: 'bg-amber-400' },
  approved: { label: 'Approved', dot: 'bg-green-500'  },
  rejected: { label: 'Rejected', dot: 'bg-red-500'    },
};

function getStudentName(req: EnrollmentRequest) {
  if (!req.student) return req.student_id;
  const { first_name, last_name, email } = req.student;
  if (first_name && last_name) return `${first_name} ${last_name}`;
  return email ?? req.student_id;
}

export default function AdminEnrollmentPage() {
  const { showAlert } = useAlert();

  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<EnrollmentRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [assignedClassId, setAssignedClassId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/enrollment-requests');
      const payload = await res.json().catch(() => ({}));
      if (res.ok && payload?.success) setRequests(payload.data ?? []);
    } catch (e) {
      console.error('Failed to fetch enrollment requests', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/classes');
      const payload = await res.json().catch(() => ({}));
      if (res.ok && payload?.success) setClasses(payload.classes ?? []);
    } catch (e) {
      console.error('Failed to fetch classes', e);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchClasses();
  }, [fetchRequests, fetchClasses]);

  const openModal = (req: EnrollmentRequest) => {
    setSelectedRequest(req);
    setAssignedClassId(req.assigned_class_id ?? '');
    setAdminNotes(req.admin_notes ?? '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
    setAssignedClassId('');
    setAdminNotes('');
  };

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    if (decision === 'approved' && !assignedClassId) {
      showAlert({ message: 'Please select a class to assign before approving.', type: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/enrollment-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          status: decision,
          classId: decision === 'approved' ? assignedClassId : undefined,
          adminNotes: adminNotes || undefined,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        showAlert({ message: payload?.error || 'Action failed.', type: 'error' });
        return;
      }
      showAlert({
        message: decision === 'approved' ? 'Student enrolled and approved!' : 'Request rejected.',
        type: decision === 'approved' ? 'success' : 'info',
      });
      closeModal();
      fetchRequests();
    } catch {
      showAlert({ message: 'Something went wrong.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const flatRequests: FlatEnrollment[] = requests.map((r) => ({
    ...r,
    studentName: getStudentName(r),
  }));

  const gradeOptions = [...new Set(requests.map((r) => r.grade_level))].sort();

  const tc = useTableControls(flatRequests, {
    searchFields: ['studentName', 'grade_level'],
    defaultSort: { key: 'created_at', dir: 'desc' },
    pageSize: 25,
  });

  const counts = {
    all:      requests.length,
    pending:  requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  const relevantClasses = selectedRequest
    ? classes.filter(
        (c) =>
          c.grade_level &&
          c.grade_level.trim().toLowerCase() === selectedRequest.grade_level.trim().toLowerCase()
      )
    : [];

  const hasFilters = !!tc.search || !!tc.filters['status'] || !!tc.filters['grade_level'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Enrollment Requests</h2>
        <p className="text-sm text-gray-500 mt-0.5">Review and process student enrollment applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(
          [
            { key: 'all',      label: 'Total',    icon: ClipboardList, colorClass: 'text-gray-600 bg-gray-100'   },
            { key: 'pending',  label: 'Pending',  icon: Clock,         colorClass: 'text-amber-700 bg-amber-100' },
            { key: 'approved', label: 'Approved', icon: CheckCircle2,  colorClass: 'text-green-700 bg-green-100' },
            { key: 'rejected', label: 'Rejected', icon: XCircle,       colorClass: 'text-red-700 bg-red-100'    },
          ] as const
        ).map(({ key, label, icon: Icon, colorClass }) => (
          <div key={key} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{counts[key]}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="px-4 py-3 flex flex-wrap items-center gap-2 border-b border-gray-100">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-gray-50"
              placeholder="Search student..."
              value={tc.search}
              onChange={(e) => tc.setSearch(e.target.value)}
            />
          </div>
          <select
            value={tc.filters['status'] ?? ''}
            onChange={(e) => tc.setFilter('status', e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={tc.filters['grade_level'] ?? ''}
            onChange={(e) => tc.setFilter('grade_level', e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            <option value="">All Grades</option>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {hasFilters && (
            <button
              onClick={() => { tc.clearFilters(); tc.setSearch(''); }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <SortHeader label="Student"   sortKey="studentName"  currentSort={tc.sort} onSort={tc.toggleSort} className="pl-4" />
              <SortHeader label="Grade"     sortKey="grade_level"  currentSort={tc.sort} onSort={tc.toggleSort} />
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Strand</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">School Year</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Quarter</th>
              <SortHeader label="Submitted" sortKey="created_at"   currentSort={tc.sort} onSort={tc.toggleSort} />
              <SortHeader label="Status"    sortKey="status"       currentSort={tc.sort} onSort={tc.toggleSort} />
              <th className="px-4 py-2.5 w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : tc.rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-14 text-gray-400">
                  <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  No enrollment requests found.
                </td>
              </tr>
            ) : (
              tc.rows.map((req) => {
                const cfg = STATUS_CONFIG[req.status];
                return (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50 group cursor-pointer"
                    onClick={() => openModal(req)}
                  >
                    <td className="px-4 py-3 pl-4">
                      <p className="text-sm font-medium text-gray-900">{req.studentName}</p>
                      {req.student?.email && (
                        <p className="text-xs text-gray-400">{req.student.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{req.grade_level}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {req.strand ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{req.school_year}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Q{req.quarter}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(req.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span className="text-xs text-gray-600">{cfg.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 pr-4 text-right">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400">
                        Review →
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <Pagination
          page={tc.page}
          onPageChange={tc.setPage}
          pageCount={tc.pageCount}
          totalCount={tc.totalCount}
          filteredCount={tc.filteredCount}
          pageSize={tc.pageSize}
          onPageSizeChange={tc.setPageSize}
        />
      </div>

      {/* Review Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-red-700" />
              Review Enrollment Request
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-2">
                  <User2 className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-gray-900">{getStudentName(selectedRequest)}</span>
                </div>
                {selectedRequest.student?.email && (
                  <p className="text-sm text-gray-500 pl-6">{selectedRequest.student.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Grade:</span>
                  <span className="font-medium text-gray-900">{selectedRequest.grade_level}</span>
                </div>
                {selectedRequest.strand && (
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Strand:</span>
                    <span className="font-medium text-gray-900">{selectedRequest.strand}</span>
                  </div>
                )}
                <div className="text-gray-600">
                  School Year:{' '}
                  <span className="font-medium text-gray-900">{selectedRequest.school_year}</span>
                </div>
                <div className="text-gray-600">
                  Quarter:{' '}
                  <span className="font-medium text-gray-900">Quarter {selectedRequest.quarter}</span>
                </div>
              </div>

              {selectedRequest.previous_grades_url && (
                <div className="text-sm">
                  <span className="text-gray-600 block mb-1">Previous Grades:</span>
                  <a
                    href={selectedRequest.previous_grades_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline truncate block"
                  >
                    View Document
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Current status:</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selectedRequest.status].dot}`} />
                  <span className="text-xs text-gray-700">{STATUS_CONFIG[selectedRequest.status].label}</span>
                </span>
              </div>

              {selectedRequest.status !== 'approved' && (
                <div className="space-y-1.5">
                  <Label htmlFor="classAssign">
                    Assign to Class{' '}
                    <span className="text-red-600 text-xs">(required for approval)</span>
                  </Label>
                  {relevantClasses.length > 0 ? (
                    <Select value={assignedClassId} onValueChange={setAssignedClassId}>
                      <SelectTrigger id="classAssign">
                        <SelectValue placeholder="Select a class..." />
                      </SelectTrigger>
                      <SelectContent>
                        {relevantClasses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.class_name}{c.section ? ` — ${c.section}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                      No classes found for {selectedRequest.grade_level}.{' '}
                      <a href="/admin/classes" className="underline font-medium hover:text-amber-800">
                        Create a class
                      </a>{' '}
                      for this grade level first.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="adminNotes">Admin Notes (optional)</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes or reason for decision..."
                  className="min-h-[70px] resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 flex-row justify-end">
            <Button variant="outline" onClick={closeModal} disabled={submitting}>
              {selectedRequest?.status === 'rejected' ? 'Close' : 'Cancel'}
            </Button>
            {selectedRequest?.status === 'approved' && (
              <Button
                variant="outline"
                onClick={() => handleDecision('rejected')}
                disabled={submitting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Reject
              </Button>
            )}
            {selectedRequest?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleDecision('rejected')}
                  disabled={submitting}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Reject Form
                </Button>
                <Button
                  onClick={() => handleDecision('approved')}
                  disabled={submitting || !assignedClassId}
                  className="bg-green-700 hover:bg-green-600 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Approve & Enroll
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

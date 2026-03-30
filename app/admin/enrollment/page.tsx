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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAlert } from '@/lib/use-alert';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  GraduationCap,
  Layers,
  User2,
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
  semester: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  assigned_class_id: string | null;
  created_at: string;
  previous_grades_url: string | null;
  student: StudentInfo | null;
}

interface ClassOption {
  id: string;
  class_name: string;
  grade_level: string | null;
  section: string | null;
}

type TabValue = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
};

export default function AdminEnrollmentPage() {
  const { showAlert } = useAlert();

  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('pending');

  const [selectedRequest, setSelectedRequest] =
    useState<EnrollmentRequest | null>(null);
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
      if (res.ok && payload?.success) {
        setRequests(payload.data ?? []);
      }
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
      if (res.ok && payload?.success) {
        setClasses(payload.classes ?? []);
      }
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
      showAlert({
        message: 'Please select a class to assign before approving.',
        type: 'warning',
      });
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
        showAlert({
          message: payload?.error || 'Action failed.',
          type: 'error',
        });
        return;
      }
      showAlert({
        message:
          decision === 'approved'
            ? 'Student enrolled and approved!'
            : 'Request rejected.',
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

  const studentName = (req: EnrollmentRequest) => {
    if (!req.student) return req.student_id;
    const { first_name, last_name, email } = req.student;
    if (first_name && last_name) return `${first_name} ${last_name}`;
    return email ?? req.student_id;
  };

  const filteredRequests =
    activeTab === 'all'
      ? requests
      : requests.filter((r) => r.status === activeTab);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  // Filter classes by the selected request's grade level
  const relevantClasses = selectedRequest
    ? classes.filter(
        (c) =>
          c.grade_level &&
          c.grade_level.trim().toLowerCase() ===
            selectedRequest.grade_level.trim().toLowerCase()
      )
    : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Enrollment Requests
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Review and process student enrollment applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(
          [
            {
              key: 'all',
              label: 'Total',
              icon: ClipboardList,
              colorClass: 'text-gray-600 bg-gray-100',
            },
            {
              key: 'pending',
              label: 'Pending',
              icon: Clock,
              colorClass: 'text-amber-700 bg-amber-100',
            },
            {
              key: 'approved',
              label: 'Approved',
              icon: CheckCircle2,
              colorClass: 'text-green-700 bg-green-100',
            },
            {
              key: 'rejected',
              label: 'Rejected',
              icon: XCircle,
              colorClass: 'text-red-700 bg-red-100',
            },
          ] as const
        ).map(({ key, label, icon: Icon, colorClass }) => (
          <Card key={key} className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {counts[key]}
                </span>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClass}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs + Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
          >
            <TabsList className="bg-gray-100">
              <TabsTrigger value="pending">
                Pending ({counts.pending})
              </TabsTrigger>
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({counts.approved})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({counts.rejected})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Student</TableHead>
                <TableHead>Grade Level</TableHead>
                <TableHead>Strand</TableHead>
                <TableHead>School Year</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-14 text-gray-500"
                  >
                    <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    No {activeTab === 'all' ? '' : activeTab} requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => {
                  const cfg = STATUS_CONFIG[req.status];
                  return (
                    <TableRow key={req.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {studentName(req)}
                          </p>
                          {req.student?.email && (
                            <p className="text-xs text-gray-500">
                              {req.student.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {req.grade_level}
                      </TableCell>
                      <TableCell className="text-sm">
                        {req.strand || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {req.school_year}
                      </TableCell>
                      <TableCell className="text-sm">
                        {req.semester === 1 ? '1st' : '2nd'} Sem
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(req.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${cfg.color}`}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openModal(req)}
                          className="h-7 text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-red-700" />
              Review Enrollment Request
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Student info */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-2">
                  <User2 className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-gray-900">
                    {studentName(selectedRequest)}
                  </span>
                </div>
                {selectedRequest.student?.email && (
                  <p className="text-sm text-gray-500 pl-6">
                    {selectedRequest.student.email}
                  </p>
                )}
              </div>

              {/* Request details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Grade:</span>
                  <span className="font-medium text-gray-900">
                    {selectedRequest.grade_level}
                  </span>
                </div>
                {selectedRequest.strand && (
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Strand:</span>
                    <span className="font-medium text-gray-900">
                      {selectedRequest.strand}
                    </span>
                  </div>
                )}
                <div className="text-gray-600">
                  School Year:{' '}
                  <span className="font-medium text-gray-900">
                    {selectedRequest.school_year}
                  </span>
                </div>
                <div className="text-gray-600">
                  Semester:{' '}
                  <span className="font-medium text-gray-900">
                    {selectedRequest.semester === 1 ? '1st' : '2nd'} Semester
                  </span>
                </div>
              </div>

              {selectedRequest.previous_grades_url && (
                <div className="text-sm">
                  <span className="text-gray-600 block mb-1">
                    Previous Grades:
                  </span>
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

              {/* Current status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Current status:</span>
                <Badge
                  className={`text-xs ${STATUS_CONFIG[selectedRequest.status].color}`}
                >
                  {STATUS_CONFIG[selectedRequest.status].label}
                </Badge>
              </div>

              {/* Class assignment */}
              {selectedRequest.status !== 'approved' && (
                <div className="space-y-1.5">
                  <Label htmlFor="classAssign">
                    Assign to Class{' '}
                    <span className="text-red-600 text-xs">
                      (required for approval)
                    </span>
                  </Label>
                  {relevantClasses.length > 0 ? (
                    <Select
                      value={assignedClassId}
                      onValueChange={setAssignedClassId}
                    >
                      <SelectTrigger id="classAssign">
                        <SelectValue placeholder="Select a class..." />
                      </SelectTrigger>
                      <SelectContent>
                        {relevantClasses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.class_name}
                            {c.section ? ` — ${c.section}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                      No classes found for {selectedRequest.grade_level}.{' '}
                      <a
                        href="/admin/classes"
                        className="underline font-medium hover:text-amber-800"
                      >
                        Create a class
                      </a>{' '}
                      for this grade level first.
                    </p>
                  )}
                </div>
              )}

              {/* Admin notes */}
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
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={submitting}
            >
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

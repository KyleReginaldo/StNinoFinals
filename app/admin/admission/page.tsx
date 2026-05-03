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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Database } from '@/database.types';
import { useTableControls } from '@/hooks/use-table-controls';
import { useAlert } from '@/lib/use-alert';
import {
  CheckCircle,
  Mail,
  Phone,
  Search,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type Admission = Database['public']['Tables']['admissions']['Row'];
type FlatAdmission = Admission & { normalizedStatus: string };

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  pending:  { label: 'Pending',  dot: 'bg-amber-400' },
  approved: { label: 'Approved', dot: 'bg-green-500'  },
  rejected: { label: 'Rejected', dot: 'bg-red-500'    },
};

const AdmissionPage = () => {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingAdmissionId, setRejectingAdmissionId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { showAlert } = useAlert();

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admissions?page=1&limit=1000');
      const result = await response.json();
      if (result.success) setAdmissions(result.data || []);
    } catch (error) {
      console.error('Error fetching admissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const flatAdmissions: FlatAdmission[] = admissions.map((a) => ({
    ...a,
    normalizedStatus: a.status ?? 'pending',
  }));

  const gradeOptions = [
    ...new Set(admissions.map((a) => a.intended_grade_level).filter(Boolean)),
  ].sort() as string[];

  const tc = useTableControls(flatAdmissions, {
    searchFields: ['first_name', 'last_name', 'email_address', 'parent_name'],
    defaultSort: { key: 'created_at', dir: 'desc' },
    pageSize: 25,
  });

  const handleViewDetails = (admission: Admission) => {
    setSelectedAdmission(admission);
    setDialogOpen(true);
  };

  const handleApprove = async (admissionId: number, currentStatus?: string | null) => {
    const isOverride = currentStatus === 'rejected';
    const message = isOverride
      ? 'This admission was previously rejected. Approving will create (or reactivate) a student account and send credentials via email. Continue?'
      : 'Are you sure you want to approve this admission? This will create a student account and send credentials via email.';
    if (!confirm(message)) return;

    setProcessingId(admissionId);
    try {
      const response = await fetch('/api/admissions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionId, action: 'approve' }),
      });
      const result = await response.json();
      if (result.success) {
        showAlert({ message: 'Admission approved! Student account created and email sent.', type: 'success' });
        fetchAdmissions();
        setDialogOpen(false);
      } else {
        showAlert({ message: result.error || 'Failed to approve admission', type: 'error' });
      }
    } catch (error) {
      console.error('Approval error:', error);
      showAlert({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (admissionId: number) => {
    setRejectingAdmissionId(admissionId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectingAdmissionId) return;
    setProcessingId(rejectingAdmissionId);
    try {
      const response = await fetch('/api/admissions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionId: rejectingAdmissionId,
          action: 'reject',
          rejection_reason: rejectionReason,
        }),
      });
      const result = await response.json();
      if (result.success) {
        showAlert({ message: 'Admission rejected.', type: 'success' });
        fetchAdmissions();
        setDialogOpen(false);
        setRejectDialogOpen(false);
      } else {
        showAlert({ message: result.error || 'Failed to reject admission', type: 'error' });
      }
    } catch (error) {
      console.error('Rejection error:', error);
      showAlert({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const hasFilters =
    !!tc.search ||
    !!tc.filters['normalizedStatus'] ||
    !!tc.filters['intended_grade_level'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admission Inquiries</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          View and manage admission applications from prospective students
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="px-4 py-3 flex flex-wrap items-center gap-2 border-b border-gray-100">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-gray-50"
              placeholder="Search name, email, parent..."
              value={tc.search}
              onChange={(e) => tc.setSearch(e.target.value)}
            />
          </div>
          <select
            value={tc.filters['normalizedStatus'] ?? ''}
            onChange={(e) => tc.setFilter('normalizedStatus', e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={tc.filters['intended_grade_level'] ?? ''}
            onChange={(e) => tc.setFilter('intended_grade_level', e.target.value)}
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
              <SortHeader label="Name"      sortKey="last_name"            currentSort={tc.sort} onSort={tc.toggleSort} className="pl-4" />
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Parent / Guardian</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Email</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Phone</th>
              <SortHeader label="Grade"     sortKey="intended_grade_level" currentSort={tc.sort} onSort={tc.toggleSort} />
              <SortHeader label="Status"    sortKey="normalizedStatus"     currentSort={tc.sort} onSort={tc.toggleSort} />
              <SortHeader label="Submitted" sortKey="created_at"           currentSort={tc.sort} onSort={tc.toggleSort} />
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
                  <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  No admission inquiries found.
                </td>
              </tr>
            ) : (
              tc.rows.map((admission) => {
                const cfg = STATUS_CONFIG[admission.normalizedStatus] ?? STATUS_CONFIG['pending'];
                return (
                  <tr
                    key={admission.id}
                    className="hover:bg-gray-50 group cursor-pointer"
                    onClick={() => handleViewDetails(admission)}
                  >
                    <td className="px-4 py-3 pl-4">
                      <p className="text-sm font-medium text-gray-900">
                        {admission.first_name}{' '}
                        {admission.middle_initial ? `${admission.middle_initial}. ` : ''}
                        {admission.last_name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{admission.parent_name}</td>
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={`mailto:${admission.email_address}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Mail className="w-3 h-3 shrink-0" />
                        {admission.email_address}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={`tel:${admission.phone_number}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Phone className="w-3 h-3 shrink-0" />
                        {admission.phone_number}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {admission.intended_grade_level ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span className="text-xs text-gray-600">{cfg.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(admission.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 pr-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer">
                        View →
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

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-xl">Admission Inquiry Details</DialogTitle>
            <DialogDescription>Complete information about this admission inquiry</DialogDescription>
          </DialogHeader>
          {selectedAdmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Student Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium">
                        {selectedAdmission.first_name}{' '}
                        {selectedAdmission.middle_initial ? `${selectedAdmission.middle_initial}. ` : ''}
                        {selectedAdmission.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Intended Grade</p>
                      <p className="font-medium">{selectedAdmission.intended_grade_level}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Previous School</p>
                      <p className="font-medium">{selectedAdmission.previous_school || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Parent/Guardian Name</p>
                      <p className="font-medium">{selectedAdmission.parent_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <a href={`mailto:${selectedAdmission.email_address}`} className="text-blue-600 hover:underline font-medium">
                        {selectedAdmission.email_address}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <a href={`tel:${selectedAdmission.phone_number}`} className="text-blue-600 hover:underline font-medium">
                        {selectedAdmission.phone_number}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {selectedAdmission.additional_message && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Additional Message</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedAdmission.additional_message}</p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500">
                  Submitted on {new Date(selectedAdmission.created_at).toLocaleString()}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  {(() => {
                    const cfg = STATUS_CONFIG[selectedAdmission.status ?? 'pending'] ?? STATUS_CONFIG['pending'];
                    return (
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span className="text-xs text-gray-700">{cfg.label}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="flex gap-3">
                {selectedAdmission.status !== 'approved' && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedAdmission.id, selectedAdmission.status)}
                    disabled={processingId === selectedAdmission.id}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processingId === selectedAdmission.id
                      ? 'Processing...'
                      : selectedAdmission.status === 'rejected'
                        ? 'Override: Approve'
                        : 'Approve & Create Account'}
                  </Button>
                )}
                {selectedAdmission.status !== 'rejected' && (
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => openRejectDialog(selectedAdmission.id)}
                    disabled={processingId === selectedAdmission.id}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {processingId === selectedAdmission.id
                      ? 'Processing...'
                      : selectedAdmission.status === 'approved'
                        ? 'Override: Reject'
                        : 'Reject'}
                  </Button>
                )}
                <Button
                  className={`${!selectedAdmission.status || selectedAdmission.status === 'pending' ? '' : 'flex-1'} bg-blue-600 hover:bg-blue-700`}
                  onClick={() =>
                    window.open(
                      `mailto:${selectedAdmission.email_address}?subject=Re: Admission Inquiry for ${selectedAdmission.first_name} ${selectedAdmission.last_name}`
                    )
                  }
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-800">Reject Admission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this admission. This will be sent to the applicant via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason" required>Reason for Rejection</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingId === rejectingAdmissionId}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {processingId === rejectingAdmissionId ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdmissionPage;

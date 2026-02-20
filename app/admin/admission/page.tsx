'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Database } from '@/database.types';
import { useAlert } from '@/lib/use-alert';
import {
  CheckCircle,
  Eye,
  Mail,
  Phone,
  Search,
  User,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type Admission = Database['public']['Tables']['admissions']['Row'];

const AdmissionPage = () => {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { showAlert } = useAlert();

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admissions?page=${page}&limit=10`);
      const result = await response.json();

      if (result.success) {
        setAdmissions(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching admissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, [page]);

  const filteredAdmissions = admissions.filter(
    (admission) =>
      admission.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.email_address
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      admission.parent_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (admission: Admission) => {
    setSelectedAdmission(admission);
    setDialogOpen(true);
  };

  const handleApprove = async (admissionId: number) => {
    if (
      !confirm(
        'Are you sure you want to approve this admission? This will create a student account and send credentials via email.'
      )
    ) {
      return;
    }

    setProcessingId(admissionId);
    try {
      const response = await fetch('/api/admissions/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admissionId,
          action: 'approve',
        }),
      });

      const result = await response.json();

      if (result.success) {
        showAlert({
          message:
            'Admission approved! Student account created and email sent.',
          type: 'success',
        });
        fetchAdmissions(); // Refresh the list
        setDialogOpen(false);
      } else {
        showAlert({
          message: result.error || 'Failed to approve admission',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Approval error:', error);
      showAlert({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (admissionId: number) => {
    if (!confirm('Are you sure you want to reject this admission?')) {
      return;
    }

    setProcessingId(admissionId);
    try {
      const response = await fetch('/api/admissions/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admissionId,
          action: 'reject',
        }),
      });

      const result = await response.json();

      if (result.success) {
        showAlert({ message: 'Admission rejected.', type: 'success' });
        fetchAdmissions(); // Refresh the list
        setDialogOpen(false);
      } else {
        showAlert({
          message: result.error || 'Failed to reject admission',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Rejection error:', error);
      showAlert({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status || status === 'pending') {
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
          className="bg-green-50 text-green-700 border-green-300"
        >
          Approved
        </Badge>
      );
    }
    if (status === 'rejected') {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-300"
        >
          Rejected
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Admission Inquiries
        </h2>
        <p className="text-gray-600">
          View and manage admission applications from prospective students
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-red-800">All Admission Inquiries</span>
            <Badge variant="secondary" className="text-sm">
              {filteredAdmissions.length} Total
            </Badge>
          </CardTitle>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or parent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-800 border-t-transparent"></div>
            </div>
          ) : filteredAdmissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No admission inquiries found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Parent/Guardian</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="flex justify-end">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmissions.map((admission) => (
                    <TableRow key={admission.id}>
                      <TableCell className="font-medium">
                        {admission.first_name} {admission.last_name}
                      </TableCell>
                      <TableCell>{admission.parent_name}</TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${admission.email_address}`}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3" />
                          {admission.email_address}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`tel:${admission.phone_number}`}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          {admission.phone_number}
                        </a>
                      </TableCell>
                      <TableCell>
                        {admission.intended_grade_level ? (
                          <Badge variant="outline">
                            {admission.intended_grade_level}
                          </Badge>
                        ) : (
                          <p className="text-gray-500">N/A</p>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(admission.status)}</TableCell>
                      <TableCell>
                        {new Date(admission.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(admission)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {(!admission.status ||
                            admission.status === 'pending') && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApprove(admission.id)}
                                disabled={processingId === admission.id}
                                className="text-green-600 hover:text-green-800 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReject(admission.id)}
                                disabled={processingId === admission.id}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-800 text-2xl">
              Admission Inquiry Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this admission inquiry
            </DialogDescription>
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
                        {selectedAdmission.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Intended Grade</p>
                      <Badge variant="outline">
                        {selectedAdmission.intended_grade_level}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Previous School</p>
                      <p className="font-medium">
                        {selectedAdmission.previous_school || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">
                        Parent/Guardian Name
                      </p>
                      <p className="font-medium">
                        {selectedAdmission.parent_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <a
                        href={`mailto:${selectedAdmission.email_address}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {selectedAdmission.email_address}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <a
                        href={`tel:${selectedAdmission.phone_number}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {selectedAdmission.phone_number}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {selectedAdmission.additional_message && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Additional Message
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                      {selectedAdmission.additional_message}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500">
                  Submitted on{' '}
                  {new Date(selectedAdmission.created_at).toLocaleString()}
                </p>
                <div className="mt-2">
                  Status: {getStatusBadge(selectedAdmission.status)}
                </div>
              </div>

              <div className="flex gap-3">
                {(!selectedAdmission.status ||
                  selectedAdmission.status === 'pending') && (
                  <>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedAdmission.id)}
                      disabled={processingId === selectedAdmission.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {processingId === selectedAdmission.id
                        ? 'Processing...'
                        : 'Approve & Create Account'}
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => handleReject(selectedAdmission.id)}
                      disabled={processingId === selectedAdmission.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {processingId === selectedAdmission.id
                        ? 'Processing...'
                        : 'Reject'}
                    </Button>
                  </>
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
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdmissionPage;

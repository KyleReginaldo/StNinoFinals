'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { CheckCircle, GraduationCap, Search, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
        className="bg-green-50 text-green-700 border-green-300"
      >
        Approved
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const fetchGrades = async () => {
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
  };

  useEffect(() => {
    fetchGrades();
  }, []);

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
        {pendingCount > 0 && (
          <Badge className="ml-auto bg-yellow-100 text-yellow-800 border-yellow-300 text-sm px-3 py-1">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-red-800">All Submitted Grades</span>
            <Badge variant="secondary" className="text-sm">
              {filteredGrades.length} shown
            </Badge>
          </CardTitle>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-2">
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

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by student, teacher, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-800 border-t-transparent" />
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No grades found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student No.</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.student
                        ? `${entry.student.first_name} ${entry.student.last_name}`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {entry.student?.student_number ?? '—'}
                    </TableCell>
                    <TableCell>{entry.subject}</TableCell>
                    <TableCell>
                      {entry.teacher
                        ? `${entry.teacher.first_name} ${entry.teacher.last_name}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-800">
                        {entry.grade}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {entry.created_at
                        ? new Date(entry.created_at).toLocaleDateString('en-PH')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        {entry.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReview(entry, 'approved')}
                              disabled={processingId === entry.id}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReview(entry, 'rejected')}
                              disabled={processingId === entry.id}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {entry.status !== 'pending' && (
                          <span className="text-xs text-gray-400 pr-2">
                            {entry.reviewed_at
                              ? `Reviewed ${new Date(entry.reviewed_at).toLocaleDateString('en-PH')}`
                              : 'Reviewed'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  ChevronRight,
  FileText,
  GraduationCap,
  RefreshCcw,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStudentAuth } from '../hooks/useStudentAuth';

interface DashboardStats {
  gpa: number | null;
  attendanceRate: number | null;
  activeCourses: number | null;
  pendingTasks: number | null;
}

interface AssignmentSummary {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
}

interface CourseProgress {
  id: string;
  subject: string;
  instructor?: string;
  completion: number;
}

interface DashboardData {
  stats: DashboardStats;
  assignments: AssignmentSummary[];
  courseProgress: CourseProgress[];
}

export default function StudentDashboardPage() {
  const { student, isLoading } = useStudentAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const displayName = useMemo(() => {
    if (!student) return 'Student';
    if (student.first_name && student.last_name) {
      return `${student.first_name} ${student.last_name}`;
    }
    return student.email?.split('@')[0] || 'Student';
  }, [student]);

  const fetchDashboardData = useCallback(async () => {
    if (!student) return;

    setDashboardLoading(true);
    setDashboardError(null);

    try {
      const response = await fetch('/api/student/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          email: student.email,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload?.success) {
        setDashboardData(payload?.data ?? null);
        setDashboardError(payload?.error || 'Failed to load dashboard data.');
      } else {
        setDashboardData(payload.data);
      }
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      setDashboardError('Network error. Please check your connection.');
    } finally {
      setDashboardLoading(false);
    }
  }, [student]);

  useEffect(() => {
    if (student) {
      fetchDashboardData();
    }
  }, [student, fetchDashboardData]);

  const computedStats = useMemo<DashboardStats>(
    () => ({
      gpa: dashboardData?.stats?.gpa ?? student?.gpa ?? null,
      attendanceRate: dashboardData?.stats?.attendanceRate ?? null,
      activeCourses:
        dashboardData?.stats?.activeCourses ?? student?.active_courses ?? null,
      pendingTasks:
        dashboardData?.stats?.pendingTasks ?? student?.pending_tasks ?? null,
    }),
    [dashboardData, student]
  );

  const assignments = useMemo(
    () => dashboardData?.assignments ?? [],
    [dashboardData]
  );
  const courseProgress = useMemo(
    () => dashboardData?.courseProgress ?? [],
    [dashboardData]
  );

  const statCards = [
    {
      label: 'Current GPA',
      value: computedStats.gpa !== null ? computedStats.gpa.toFixed(2) : '—',
      helper:
        computedStats.gpa !== null ? 'Registrar confirmed' : 'Awaiting data',
    },
    {
      label: 'Attendance Rate',
      value:
        computedStats.attendanceRate !== null
          ? `${computedStats.attendanceRate.toFixed(0)}%`
          : '—',
      helper:
        computedStats.attendanceRate !== null ? 'Last 30 days' : 'Data pending',
    },
    {
      label: 'Active Courses',
      value:
        computedStats.activeCourses !== null
          ? String(computedStats.activeCourses)
          : '—',
      helper:
        computedStats.activeCourses !== null
          ? 'Enrolled this term'
          : 'Loading...',
    },
    {
      label: 'Pending Tasks',
      value:
        computedStats.pendingTasks !== null
          ? String(computedStats.pendingTasks)
          : '—',
      helper: computedStats.pendingTasks !== null ? 'Due soon' : 'Syncing...',
    },
  ];

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-red-800">Loading...</div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back, {displayName}!
          </h2>
          <p className="text-gray-600">
            Here&apos;s your academic overview for today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dashboardError && (
            <Badge
              variant="outline"
              className="text-red-700 border-red-200 bg-red-50"
            >
              Sync issue
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={dashboardLoading}
            className="flex items-center gap-2"
          >
            <RefreshCcw
              className={`w-4 h-4 ${dashboardLoading ? 'animate-spin' : ''}`}
            />
            Refresh data
          </Button>
        </div>
      </div>

      {dashboardError && (
        <div className="flex items-start space-x-3 bg-red-50 border border-red-100 text-sm text-red-800 p-4 rounded-md">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <div>
            <p className="font-semibold">
              We couldn&apos;t refresh your dashboard.
            </p>
            <p>{dashboardError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-white border border-gray-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {stat.label}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <ChevronRight className="w-3 h-3 mr-1" />
                {stat.helper}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Recent Assignments
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Your latest assignments and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-12">
                <FileText
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  aria-hidden
                />
                <p className="text-gray-600">
                  {dashboardLoading
                    ? 'Loading assignments...'
                    : 'No assignments available.'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Assignments will load automatically once published.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between border border-gray-100 rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {assignment.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {assignment.subject} · Due{' '}
                        {formatDate(assignment.dueDate)}
                      </p>
                    </div>
                    <Badge
                      className={`${
                        assignment.status === 'completed'
                          ? 'bg-green-50 text-green-700'
                          : assignment.status === 'overdue'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      {assignment.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Course Progress
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Your progress in current subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courseProgress.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  aria-hidden
                />
                <p className="text-gray-600">
                  {dashboardLoading
                    ? 'Syncing progress...'
                    : 'No course progress data available.'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Course progress will be loaded from the database.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {courseProgress.map((course) => (
                  <div key={course.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <p className="font-medium text-gray-900">
                        {course.subject}
                      </p>
                      <span className="text-gray-600">
                        {course.completion}%
                      </span>
                    </div>
                    {course.instructor && (
                      <p className="text-xs text-gray-500 mb-2">
                        Instructor: {course.instructor}
                      </p>
                    )}
                    <Progress value={course.completion} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

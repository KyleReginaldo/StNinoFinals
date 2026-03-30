'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Activity,
  DollarSign,
  FileText,
  Bell,
  GraduationCap,
  Printer,
  Radio,
  RotateCcw,
  Settings,
  Shield,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAdminData } from './hooks/useAdminData';
import { useAuth } from './hooks/useAuth';

interface ChartData {
  weeklyAttendance: { day: string; present: number; absent: number }[];
  gradeApprovals: { name: string; value: number; fill: string }[];
}

export default function AdminPage() {
  const { admin, loading } = useAuth();
  const { stats: baseStats, loadingStats, fetchStats } = useAdminData(admin);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [dateRange, setDateRange] = useState<
    { from?: Date; to?: Date } | undefined
  >({
    from: new Date(),
    to: new Date(),
  });
  const [filteredStats, setFilteredStats] = useState<any>(null);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string | null>(null);
  const [gradeStudents, setGradeStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [adminAnnouncements, setAdminAnnouncements] = useState<any[]>([]);
  const stats = filteredStats || baseStats;

  const toIso = (d: Date) => d.toISOString().split('T')[0];

  const fetchAllData = (range?: { from?: Date; to?: Date }) => {
    const params = new URLSearchParams();
    if (range?.from) params.set('startDate', toIso(range.from));
    if (range?.to) params.set('endDate', toIso(range.to));
    const qs = params.toString();

    fetch(`/api/admin/chart-data?${qs}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setChartData(res.data);
      })
      .catch(console.error);

    fetch(`/api/admin/stats?${qs}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) setFilteredStats(res.data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (!admin) return;
    fetchAllData(dateRange);
    fetch('/api/announcements?role=admin')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setAdminAnnouncements(res.data || []);
      })
      .catch(console.error);
  }, [admin]);

  const handleDateRangeChange = (
    range: { from?: Date; to?: Date } | undefined
  ) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      fetchAllData(range);
    }
  };

  const handleResetToToday = () => {
    const today = { from: new Date(), to: new Date() };
    setDateRange(today);
    setFilteredStats(null);
    fetchAllData(today);
  };

  const handleBarClick = async (gradeLevel: string) => {
    setSelectedGradeLevel(gradeLevel);
    setLoadingStudents(true);
    try {
      const res = await fetch('/api/admin/students');
      const result = await res.json();
      if (result.success) {
        const students = (result.students || result.data || []).filter(
          (s: any) => s.grade_level === gradeLevel
        );
        setGradeStudents(students);
      }
    } catch {
      setGradeStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handlePrintStudentList = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const cap = (str: string) =>
      str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
    const rows = gradeStudents
      .map(
        (s: any, i: number) =>
          `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb">${i + 1}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:500">${cap(s.first_name || '')} ${cap(s.last_name || '')}</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${s.student_number || s.student_id || '—'}</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${s.section || '—'}</td></tr>`
      )
      .join('');
    printWindow.document.write(`
      <html><head><title>${selectedGradeLevel} - Student List</title>
      <style>body{font-family:Arial,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}th{background:#991b1b;color:white;padding:8px;text-align:left;border:1px solid #ddd}h2{color:#991b1b}</style>
      </head><body>
      <h2>Sto. Ni\u00f1o de Praga Academy</h2>
      <h3>${selectedGradeLevel} - Student List (${gradeStudents.length} students)</h3>
      <table><thead><tr><th>#</th><th>Name</th><th>Student No.</th><th>Section</th></tr></thead><tbody>${rows}</tbody></table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h2>
        <p className="text-gray-600">
          Welcome back, {admin.first_name || 'Admin'}! Here's an overview of
          your school.
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
        <div className="w-full sm:w-auto">
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            placeholder="Select date range"
          />
        </div>
        <Button onClick={handleResetToToday} variant="outline" size="sm">
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Today
        </Button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-red-50 to-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              Total Students
            </CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <Users className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">
              {loadingStats ? '...' : stats.totalStudents.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">All grade levels</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total Teachers
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {loadingStats ? '...' : stats.totalTeachers.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">Active faculty</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              Total Parents
            </CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <UserCog className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {loadingStats ? '...' : stats.totalParents}
            </div>
            <p className="text-xs text-gray-600 mt-1">Active guardians</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Attendance Rate
            </CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {loadingStats ? '...' : `${stats.attendanceRate}%`}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {filteredStats ? 'Filtered attendance' : "Today's attendance"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              System Status
            </CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Active</div>
            <p className="text-xs text-gray-600 mt-1">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/students"
          className="group block p-6 bg-white border-2 border-red-200 rounded-lg hover:border-red-400 hover:shadow-lg transition-all"
        >
          <Users className="w-8 h-8 text-red-600 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-xl mb-2 text-gray-900">
            Manage Students
          </h3>
          <p className="text-sm text-gray-600">View and edit student records</p>
        </Link>

        <Link
          href="/admin/teachers"
          className="group block p-6 bg-white border-2 border-red-200 rounded-lg hover:border-red-400 hover:shadow-lg transition-all"
        >
          <Shield className="w-8 h-8 text-red-600 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-xl mb-2 text-gray-900">
            Manage Teachers
          </h3>
          <p className="text-sm text-gray-600">
            View and edit teacher accounts
          </p>
        </Link>

        <Link
          href="/admin/live-attendance"
          className="group block p-6 bg-white border-2 border-red-200 rounded-lg hover:border-red-400 hover:shadow-lg transition-all"
        >
          <Radio className="w-8 h-8 text-red-600 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-xl mb-2 text-gray-900">
            Live Attendance
          </h3>
          <p className="text-sm text-gray-600">Real-time attendance tracking</p>
        </Link>
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <UserCheck className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New teacher registered
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {loadingStats ? '...' : stats.totalStudents} students
                    attended today
                  </p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-full">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Monthly report generated
                  </p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Database Status
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Connected
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  RFID System
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Email Service
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Last Backup
                </span>
                <span className="text-sm text-gray-600">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Weekly Attendance Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!chartData ? (
              <div className="flex items-center justify-center h-56">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-800 border-t-transparent" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData.weeklyAttendance}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="present"
                    name="Present"
                    fill="#16a34a"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="absent"
                    name="Absent"
                    fill="#fca5a5"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Grade Approvals Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Grade Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!chartData ? (
              <div className="flex items-center justify-center h-56">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-800 border-t-transparent" />
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={chartData.gradeApprovals}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.gradeApprovals.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {chartData.gradeApprovals.map((entry) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-1 text-xs"
                    >
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{ backgroundColor: entry.fill }}
                      />
                      <span className="text-gray-600">{entry.name}</span>
                      <span className="font-semibold text-gray-900">
                        {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Announcements */}
      {adminAnnouncements.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adminAnnouncements.slice(0, 5).map((a: any) => (
                <div key={a.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{a.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {a.published_at
                          ? new Date(a.published_at).toLocaleDateString('en-PH')
                          : ''}
                        {a.target_audience && a.target_audience !== 'all'
                          ? ` · ${a.target_audience}`
                          : ''}
                      </p>
                    </div>
                    {a.priority === 'high' && (
                      <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 flex-shrink-0">
                        High
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Level Population Bar Chart */}
      <Card className="mt-6 mb-6">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Grade Level Population
          </CardTitle>
          <p className="text-sm text-gray-500">Click a bar to view the student list</p>
        </CardHeader>
        <CardContent>
          {stats.gradeDistribution &&
          Object.keys(stats.gradeDistribution).length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(200, Object.keys(stats.gradeDistribution).length * 40)}>
              <BarChart
                layout="vertical"
                data={Object.entries(stats.gradeDistribution)
                  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
                  .map(([grade, count]) => ({ grade, count }))}
                margin={{ top: 4, right: 24, left: 16, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="grade"
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#991b1b"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  onClick={(data: any) => {
                    if (data?.grade) handleBarClick(data.grade);
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No student data available</p>
          )}
        </CardContent>
      </Card>

      {/* Student List Dialog */}
      <Dialog open={!!selectedGradeLevel} onOpenChange={(open) => !open && setSelectedGradeLevel(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0 [&>button]:text-white [&>button]:hover:text-white/80">
          {/* Header with school branding */}
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white px-6 py-5 rounded-t-lg">
            <p className="text-xs uppercase tracking-wider text-red-200 mb-1">Sto. Niño de Praga Academy</p>
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-bold">
                {selectedGradeLevel}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-red-100">
                {gradeStudents.length} student{gradeStudents.length !== 1 ? 's' : ''} enrolled
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintStudentList}
                disabled={gradeStudents.length === 0}
                className="border-white/30 text-white hover:bg-white/10 bg-transparent text-xs"
              >
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                Print List
              </Button>
            </div>
          </div>

          <div className="px-6 py-4">
            {loadingStudents ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-800 border-t-transparent" />
              </div>
            ) : gradeStudents.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No students found</p>
            ) : (
              <div className="space-y-2">
                {gradeStudents.map((s: any, i: number) => {
                  const capitalize = (str: string) =>
                    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
                  const name = `${capitalize(s.first_name || '')} ${capitalize(s.last_name || '')}`.trim();
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{name || '—'}</p>
                        <p className="text-xs text-gray-500">
                          {s.student_number || s.student_id || 'No Student No.'}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {s.section ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200">
                            {s.section}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No section</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

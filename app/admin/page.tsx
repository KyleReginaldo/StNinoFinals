'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  DollarSign,
  FileText,
  GraduationCap,
  Radio,
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
  const { stats, loadingStats } = useAdminData(admin);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    if (!admin) return;
    fetch('/api/admin/chart-data')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setChartData(res.data);
      })
      .catch(console.error);
  }, [admin]);

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
            <p className="text-xs text-gray-600 mt-1">Today's attendance</p>
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

      {/* User Distribution Bar Chart */}
      <Card className="mt-6 mb-6">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              layout="vertical"
              data={[
                {
                  name: 'Students',
                  count: stats.totalStudents,
                  fill: '#991b1b',
                },
                {
                  name: 'Teachers',
                  count: stats.totalTeachers,
                  fill: '#1d4ed8',
                },
                {
                  name: 'Parents',
                  count: (stats as any).totalParents ?? 0,
                  fill: '#c2410c',
                },
              ]}
              margin={{ top: 4, right: 24, left: 16, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 13 }}
                width={70}
              />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {[
                  { fill: '#991b1b' },
                  { fill: '#1d4ed8' },
                  { fill: '#c2410c' },
                ].map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

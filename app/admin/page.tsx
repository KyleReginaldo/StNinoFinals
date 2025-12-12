"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabaseClient"
import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { DashboardTab } from "./components/DashboardTab"
import { StudentManagementTab } from "./components/StudentManagementTab"
import { TeacherManagementTab } from "./components/TeacherManagementTab"
import { useAdminData } from "./hooks/useAdminData"
import type { Admin } from "./types"

export default function AdminPage() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const {
    stats,
    students,
    teachers,
    attendanceData,
    settingsForm,
    loadingStats,
    loadingStudents,
    loadingTeachers,
    attendanceLoading,
    attendanceError,
    settingsLoading,
    setStudents,
    setTeachers,
    setSettingsForm,
    fetchStats,
    fetchStudents,
    fetchTeachers,
    fetchAttendance,
  } = useAdminData(admin)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()

        if (error) {
          console.error("Auth error:", error)
          window.location.href = "/"
          return
        }

        if (!data.user) {
          window.location.href = "/"
          return
        }

        const { data: adminData, error: adminError } = await supabase
          .from("users")
          .select("*")
          .eq("email", data.user.email || "")
          .eq("role", "admin")
          .single()

        if (adminError || !adminData) {
          console.error("Admin check error:", adminError)
          window.location.href = "/"
          return
        }

        setAdmin(adminData as Admin)
      } catch (error) {
        console.error("Unexpected error:", error)
        window.location.href = "/"
      }
    }

    checkAdmin()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Logout error:", error)
        alert("Error signing out. Please try again.")
        setIsLoggingOut(false)
        return
      }
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
      alert("Error signing out. Please try again.")
      setIsLoggingOut(false)
    }
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-800 border-t-transparent"></div>
          <p className="mt-4 text-red-800 font-medium">Loading Admin Portal...</p>
        </div>
      </div>
    )
  }

  const adminName = admin.first_name && admin.last_name 
    ? `${admin.first_name} ${admin.last_name}`
    : admin.name || admin.email.split("@")[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-800 to-red-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/logo.png"
                alt="Sto. Niño Logo"
                width={50}
                height={50}
                className="rounded-full bg-white p-1"
              />
              <div>
                <h1 className="text-2xl font-bold">Admin Portal</h1>
                <p className="text-red-100 text-sm">Sto. Niño de Praga Academy</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-medium">{adminName}</p>
                <Badge variant="secondary" className="bg-red-900 text-white hover:bg-red-900">
                  Administrator
                </Badge>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-white text-red-800 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid bg-white border border-red-200">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="teachers" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Teachers</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Pages</span>
            </TabsTrigger>
          </TabsList>

          <DashboardTab stats={stats} loadingStats={loadingStats} />

          <StudentManagementTab
            students={students}
            loadingStudents={loadingStudents}
            onStudentAdded={fetchStudents}
            onStudentUpdated={setStudents}
          />

          <TeacherManagementTab
            teachers={teachers}
            loadingTeachers={loadingTeachers}
            onTeacherAdded={fetchTeachers}
            onTeacherUpdated={setTeachers}
          />

          {/* Attendance Tab - Placeholder for now */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-800">Attendance Management</CardTitle>
                <CardDescription>Track and manage student and teacher attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Attendance management coming soon</p>
                  <p className="text-sm mt-2">View detailed attendance reports and live tracking</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab - Placeholder */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-800">Reports & Analytics</CardTitle>
                <CardDescription>Generate and view various reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Reports section coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Placeholder */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-800">System Settings</CardTitle>
                <CardDescription>Configure system preferences and options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Settings coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-800">Quick Access</CardTitle>
                <CardDescription>Access various admin management pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link
                    href="/admin/students"
                    className="block p-6 bg-white border-2 border-red-200 rounded-lg hover:border-red-400 transition-colors"
                  >
                    <Users className="w-8 h-8 text-red-600 mb-3" />
                    <h3 className="font-semibold text-lg mb-1">Student Management</h3>
                    <p className="text-sm text-gray-600">Manage student records and profiles</p>
                  </Link>

                  <Link
                    href="/admin/attendance-reports"
                    className="block p-6 bg-white border-2 border-red-200 rounded-lg hover:border-red-400 transition-colors"
                  >
                    <FileText className="w-8 h-8 text-red-600 mb-3" />
                    <h3 className="font-semibold text-lg mb-1">Attendance Reports</h3>
                    <p className="text-sm text-gray-600">View detailed attendance analytics</p>
                  </Link>

                  <Link
                    href="/admin/live-attendance"
                    className="block p-6 bg-white border-2 border-red-200 rounded-lg hover:border-red-400 transition-colors"
                  >
                    <Calendar className="w-8 h-8 text-red-600 mb-3" />
                    <h3 className="font-semibold text-lg mb-1">Live Attendance</h3>
                    <p className="text-sm text-gray-600">Real-time attendance tracking</p>
                  </Link>

                  <Link
                    href="/admin/teacher-attendance"
                    className="block p-6 bg-white border-2 border-red-200 rounded-lg hover:border-red-400 transition-colors"
                  >
                    <Shield className="w-8 h-8 text-red-600 mb-3" />
                    <h3 className="font-semibold text-lg mb-1">Teacher Attendance</h3>
                    <p className="text-sm text-gray-600">Track teacher attendance records</p>
                  </Link>

                  <Link
                    href="/admin/settings"
                    className="block p-6 bg-white border-2 border-red-200 rounded-lg hover:border-red-400 transition-colors"
                  >
                    <Settings className="w-8 h-8 text-red-600 mb-3" />
                    <h3 className="font-semibold text-lg mb-1">System Settings</h3>
                    <p className="text-sm text-gray-600">Configure system preferences</p>
                  </Link>

                  <Link
                    href="/admin/rfid-display"
                    className="block p-6 bg-white border-2 border-red-200 rounded-lg hover:border-red-400 transition-colors"
                  >
                    <Home className="w-8 h-8 text-red-600 mb-3" />
                    <h3 className="font-semibold text-lg mb-1">RFID Display</h3>
                    <p className="text-sm text-gray-600">Monitor RFID scans in real-time</p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

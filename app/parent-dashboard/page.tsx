'use client';

import { PasswordChangeWrapper } from '@/components/PasswordChangeWrapper';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useAlert } from '@/lib/use-alert';
import { useConfirm } from '@/lib/use-confirm';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Eye,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  User,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ParentDashboard } from './components/ParentDashboard';

interface Child {
  id: string | number;
  name: string;
  student_id?: string;
  grade_level?: string;
  section?: string;
  email?: string;
  photo?: string;
}

export default function ParentDashboardPage() {
  const router = useRouter();
  const [parent, setParent] = useState<any>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [studentNumber, setStudentNumber] = useState('');
  const [relationshipType, setRelationshipType] = useState('parent');
  const [addError, setAddError] = useState('');
  const [viewingChild, setViewingChild] = useState<Child | null>(null);
  const [enrollmentRequests, setEnrollmentRequests] = useState<any[]>([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollingChild, setEnrollingChild] = useState<string>('');
  const [enrollGradeLevel, setEnrollGradeLevel] = useState('');
  const [enrollStrand, setEnrollStrand] = useState('');
  const [enrollSemester, setEnrollSemester] = useState('1');
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  // Dashboard data states
  const [childStats, setChildStats] = useState<{ [childId: string]: any }>({});
  const [childGrades, setChildGrades] = useState<{ [childId: string]: any[] }>(
    {}
  );
  const [childAttendance, setChildAttendance] = useState<{
    [childId: string]: any[];
  }>({});
  const [announcements, setAnnouncements] = useState<{
    [childId: string]: any[];
  }>({});

  // Function to fetch children from database
  const fetchChildren = async (parentId: string) => {
    try {
      const response = await fetch(
        `/api/parent/children?parent_id=${parentId}`
      );
      const data = await response.json();

      if (data.success && data.children) {
        setChildren(data.children);
        localStorage.setItem('parentChildren', JSON.stringify(data.children));
        // Fetch real dashboard data for all children
        await fetchDashboardDataForChildren(data.children);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  // Function to fetch dashboard data for all children
  const fetchDashboardDataForChildren = async (childrenList: Child[]) => {
    setDataLoading(true);
    const stats: any = {};
    const grades: any = {};
    const attendance: any = {};
    const announcements_data: any = {};

    // Fetch data for each child
    await Promise.all(
      childrenList.map(async (child: Child) => {
        const childId = String(child.id);

        try {
          // Fetch stats
          const statsResponse = await fetch(
            `/api/parent/student-stats?student_id=${childId}`
          );
          const statsData = await statsResponse.json();
          if (statsData.success) {
            stats[childId] = statsData.stats;
          } else {
            // Fallback to default stats
            stats[childId] = {
              gpa: 0,
              attendanceRate: 0,
              behaviorScore: 0,
              pendingTasks: 0,
            };
          }
        } catch (error) {
          console.error(`Error fetching stats for child ${childId}:`, error);
          stats[childId] = {
            gpa: 0,
            attendanceRate: 0,
            behaviorScore: 0,
            pendingTasks: 0,
          };
        }

        try {
          // Fetch grades
          const gradesResponse = await fetch(
            `/api/parent/student-grades?student_id=${childId}`
          );
          const gradesData = await gradesResponse.json();
          if (gradesData.success) {
            grades[childId] = gradesData.grades;
          } else {
            grades[childId] = [];
          }
        } catch (error) {
          console.error(`Error fetching grades for child ${childId}:`, error);
          grades[childId] = [];
        }

        try {
          // Fetch attendance (last 7 days)
          const attendanceResponse = await fetch(
            `/api/parent/student-attendance?student_id=${childId}&days=7`
          );
          const attendanceData = await attendanceResponse.json();
          if (attendanceData.success) {
            attendance[childId] = attendanceData.attendance;
          } else {
            attendance[childId] = [];
          }
        } catch (error) {
          console.error(
            `Error fetching attendance for child ${childId}:`,
            error
          );
          attendance[childId] = [];
        }

        try {
          // Fetch announcements
          const announcementsResponse = await fetch(
            `/api/parent/announcements?student_id=${childId}`
          );
          const announcementsData = await announcementsResponse.json();
          if (announcementsData.success) {
            announcements_data[childId] = announcementsData.announcements;
          } else {
            announcements_data[childId] = [];
          }
        } catch (error) {
          console.error(
            `Error fetching announcements for child ${childId}:`,
            error
          );
          announcements_data[childId] = [];
        }
      })
    );

    setChildStats(stats);
    setChildGrades(grades);
    setChildAttendance(attendance);
    setAnnouncements(announcements_data);
    setDataLoading(false);
  };

  useEffect(() => {
    // Check if parent is logged in
    const parentData = localStorage.getItem('parent');
    const childrenData = localStorage.getItem('parentChildren');

    if (!parentData) {
      router.push('/login?role=parent');
      return;
    }

    try {
      const parsedParent = JSON.parse(parentData);
      setParent(parsedParent);

      if (childrenData) {
        const parsedChildren = JSON.parse(childrenData);
        setChildren(parsedChildren);
        // Fetch real dashboard data instead of initializing with mock data
        fetchDashboardDataForChildren(parsedChildren);
      }

      // Fetch latest children data from database
      if (parsedParent.id) {
        fetchChildren(parsedParent.id);
      }
    } catch (error) {
      console.error('Error parsing parent data:', error);
      router.push('/login?role=parent');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      message: 'Are you sure you want to log out?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (confirmed) {
      localStorage.removeItem('parent');
      localStorage.removeItem('parentChildren');
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  };

  const handleAddChild = async () => {
    if (!studentNumber.trim()) {
      setAddError('Please enter a student number');
      return;
    }

    setIsAddingChild(true);
    setAddError('');

    try {
      const response = await fetch('/api/parent/link-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parent_id: parent.id,
          student_number: studentNumber.trim(),
          relationship_type: relationshipType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setAddError(data.error || 'Failed to add student');
        return;
      }

      // Add the new student to the children list
      const newChild = {
        id: data.student.id,
        name: data.student.name,
        student_id: data.student.student_number,
        grade_level: data.student.grade_level,
        section: data.student.section,
        email: data.student.email,
      };

      const updatedChildren = [...children, newChild];
      setChildren(updatedChildren);
      localStorage.setItem('parentChildren', JSON.stringify(updatedChildren));

      // Reset form
      setStudentNumber('');
      setRelationshipType('parent');
      setShowAddDialog(false);

      // Refresh children list from database
      if (parent.id) {
        await fetchChildren(parent.id);
      }

      showAlert({ message: 'Student added successfully!', type: 'success' });
    } catch (error) {
      console.error('Error adding student:', error);
      setAddError('Failed to add student. Please try again.');
    } finally {
      setIsAddingChild(false);
    }
  };

  const currentSchoolYear = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 5 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  })();

  const fetchEnrollmentRequests = async () => {
    if (!parent?.id) return;
    setEnrollmentLoading(true);
    try {
      const res = await fetch(`/api/parent/enrollment-request?parentId=${parent.id}`);
      const data = await res.json();
      if (data.success) setEnrollmentRequests(data.data || []);
    } catch (err) {
      console.error('Error fetching enrollment requests:', err);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleEnrollSubmit = async () => {
    if (!enrollingChild || !enrollGradeLevel || !enrollSemester) {
      showAlert({ message: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    const needsStrand = enrollGradeLevel.includes('11') || enrollGradeLevel.includes('12');
    if (needsStrand && !enrollStrand) {
      showAlert({ message: 'Please select a strand for Senior High School.', type: 'error' });
      return;
    }

    setEnrollSubmitting(true);
    try {
      const res = await fetch('/api/parent/enrollment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: parent.id,
          studentId: enrollingChild,
          gradeLevel: enrollGradeLevel,
          strand: needsStrand ? enrollStrand : null,
          schoolYear: currentSchoolYear,
          semester: enrollSemester,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showAlert({ message: 'Enrollment request submitted successfully!', type: 'success' });
        setEnrollingChild('');
        setEnrollGradeLevel('');
        setEnrollStrand('');
        setEnrollSemester('1');
        fetchEnrollmentRequests();
      } else {
        showAlert({ message: data.error || 'Failed to submit enrollment request.', type: 'error' });
      }
    } catch {
      showAlert({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setEnrollSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading guardian dashboard...</p>
        </div>
      </div>
    );
  }

  if (!parent || children.length === 0) {
    return (
      <PasswordChangeWrapper userId={parent?.id}>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-md border-b-4 border-red-800">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Image
                    src="/logo.png"
                    alt="Sto Niño de Praga Academy Logo"
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-red-800">
                      Guardian Dashboard
                    </h1>
                    <p className="text-sm text-gray-600">
                      Sto Niño de Praga Academy
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="border-red-800 text-red-800 hover:bg-red-800 hover:text-white bg-transparent"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Home
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-red-800 text-red-800 hover:bg-red-800 hover:text-white bg-transparent"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-16">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-red-800">
                  No Children Linked
                </CardTitle>
                <CardDescription>
                  You don't have any children linked to your account yet. Please
                  add your child to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-red-800 hover:bg-red-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Your Child
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Your Student</DialogTitle>
                      <DialogDescription>
                        Enter the student number to link them to your account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="studentNumber">Student Number</Label>
                        <Input
                          id="studentNumber"
                          placeholder="e.g., SNPA-2024-001"
                          value={studentNumber}
                          onChange={(e) => setStudentNumber(e.target.value)}
                          disabled={isAddingChild}
                        />
                      </div>
                      <div>
                        <Label htmlFor="relationship">Relationship</Label>
                        <Select
                          value={relationshipType}
                          onValueChange={setRelationshipType}
                          disabled={isAddingChild}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="guardian">Guardian</SelectItem>
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="father">Father</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {addError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                          {addError}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAddChild}
                          disabled={isAddingChild}
                          className="flex-1 bg-red-800 hover:bg-red-700"
                        >
                          {isAddingChild ? 'Adding...' : 'Add Student'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddDialog(false);
                            setStudentNumber('');
                            setAddError('');
                          }}
                          disabled={isAddingChild}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </PasswordChangeWrapper>
    );
  }

  return (
    <PasswordChangeWrapper userId={parent?.id}>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md border-b-4 border-red-800 flex-shrink-0">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Image
                  src="/logo.png"
                  alt="Sto Niño de Praga Academy Logo"
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div>
                  <h1 className="text-xl font-bold text-red-800">
                    Guardian Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">
                    Sto Niño de Praga Academy
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white bg-transparent"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Your Student</DialogTitle>
                      <DialogDescription>
                        Enter the student number to link them to your account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="studentNumber">Student Number</Label>
                        <Input
                          id="studentNumber"
                          placeholder="e.g., SNPA-2024-001"
                          value={studentNumber}
                          onChange={(e) => setStudentNumber(e.target.value)}
                          disabled={isAddingChild}
                        />
                      </div>
                      <div>
                        <Label htmlFor="relationship">Relationship</Label>
                        <Select
                          value={relationshipType}
                          onValueChange={setRelationshipType}
                          disabled={isAddingChild}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="guardian">Guardian</SelectItem>
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="father">Father</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {addError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                          {addError}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAddChild}
                          disabled={isAddingChild}
                          className="flex-1 bg-red-800 hover:bg-red-700"
                        >
                          {isAddingChild ? 'Adding...' : 'Add Student'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddDialog(false);
                            setStudentNumber('');
                            setAddError('');
                          }}
                          disabled={isAddingChild}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="text-right hidden md:block">
                  <p className="font-medium text-red-800">
                    {parent.name || parent.email || 'Parent/Guardian'}
                  </p>
                  <p className="text-sm text-gray-600">Guardian</p>
                </div>
                <Link href="/">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-800 text-red-800 hover:bg-red-800 hover:text-white bg-transparent"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Home</span>
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="md:hidden border-red-800 text-red-800 hover:bg-red-800 hover:text-white bg-transparent"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="hidden md:flex w-64 flex-shrink-0 bg-gray-900 flex-col overflow-y-auto">
            <nav className="flex-1 p-4 pt-8 space-y-1">
              {[
                { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { key: 'children', label: 'My Students', icon: User },
                { key: 'enrollment', label: 'Enrollment', icon: GraduationCap },
                { key: 'attendance', label: 'Attendance', icon: Clock },
                { key: 'schedule', label: 'Schedule', icon: Calendar },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActiveTab(item.key);
                      if (item.key === 'enrollment') fetchEnrollmentRequests();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-red-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
              <div className="p-4 border-t border-gray-800">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </Button>
              </div>
            </nav>
          </aside>

          {/* Mobile bottom nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div className="flex justify-around py-2">
              {[
                { key: 'dashboard', label: 'Home', icon: LayoutDashboard },
                { key: 'children', label: 'Students', icon: User },
                { key: 'enrollment', label: 'Enroll', icon: GraduationCap },
                { key: 'attendance', label: 'Attendance', icon: Clock },
                { key: 'schedule', label: 'Schedule', icon: Calendar },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`flex flex-col items-center gap-1 px-2 py-1 text-xs ${
                      isActive ? 'text-red-800 font-semibold' : 'text-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto pb-20 md:pb-8">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome, {parent.name || parent.email || 'Parent/Guardian'}!
                  </h2>
                  <p className="text-gray-600">
                    Monitor your children's academic progress and school
                    activities.
                  </p>
                </div>

                {/* Data Loading Indicator */}
                {dataLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto mb-3"></div>
                    <p className="text-gray-600">Loading dashboard data...</p>
                  </div>
                )}

                {/* Integrated Guardian Dashboard Component */}
                {!dataLoading && (
                  <ParentDashboard
                    children={children}
                    childStats={childStats}
                    childGrades={childGrades}
                    childAttendance={childAttendance}
                    announcements={announcements}
                  />
                )}
              </div>
            )}

            {/* My Students */}
            {activeTab === 'children' && (
              <div className="space-y-6">
                {viewingChild ? (
                  /* ── Full Student Portal View ── */
                  <div>
                    <Button
                      variant="ghost"
                      onClick={() => setViewingChild(null)}
                      className="mb-4 text-gray-600 hover:text-gray-900 -ml-2"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Back to Students
                    </Button>

                    {/* Student Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {viewingChild.photo ||
                          viewingChild.name?.charAt(0) ||
                          'S'}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {viewingChild.name}
                        </h2>
                        <p className="text-gray-500">
                          {viewingChild.grade_level || 'N/A'} -{' '}
                          {viewingChild.section || 'N/A'} |{' '}
                          {viewingChild.student_id || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Grades Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-red-800">Grades</CardTitle>
                          <CardDescription>
                            Academic performance by subject
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {(childGrades[String(viewingChild.id)] || []).length >
                          0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b bg-gray-50">
                                    <th className="text-left py-2.5 px-3 text-gray-600 font-semibold">
                                      Subject
                                    </th>
                                    <th className="text-center py-2.5 px-3 text-gray-600 font-semibold">
                                      Quarter
                                    </th>
                                    <th className="text-center py-2.5 px-3 text-gray-600 font-semibold">
                                      Grade
                                    </th>
                                    <th className="text-center py-2.5 px-3 text-gray-600 font-semibold">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(
                                    childGrades[String(viewingChild.id)] || []
                                  ).map((g: any, idx: number) => (
                                    <tr
                                      key={idx}
                                      className="border-b last:border-0 hover:bg-gray-50"
                                    >
                                      <td className="py-2.5 px-3 font-medium">
                                        {g.subject}
                                      </td>
                                      <td className="text-center py-2.5 px-3 text-gray-500">
                                        Q{g.quarter || '-'}
                                      </td>
                                      <td className="text-center py-2.5 px-3">
                                        <span
                                          className={`font-bold ${Number(g.grade) >= 75 ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                          {g.grade}
                                        </span>
                                      </td>
                                      <td className="text-center py-2.5 px-3">
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full ${g.status === 'approved' ? 'bg-green-100 text-green-700' : g.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}
                                        >
                                          {g.status || 'N/A'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-400">
                              <p>No grades available yet.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Attendance Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-red-800">
                            Attendance
                          </CardTitle>
                          <CardDescription>
                            Recent attendance records
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {(childAttendance[String(viewingChild.id)] || [])
                            .length > 0 ? (
                            <div className="space-y-0">
                              {(
                                childAttendance[String(viewingChild.id)] || []
                              ).map((a: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between py-2.5 px-3 border-b last:border-0 hover:bg-gray-50"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">
                                      {new Date(
                                        a.scan_time || a.date
                                      ).toLocaleDateString('en-PH', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {a.scan_time
                                        ? new Date(
                                            a.scan_time
                                          ).toLocaleTimeString('en-PH', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })
                                        : ''}
                                    </p>
                                  </div>
                                  <span
                                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                      a.scan_type === 'timein' ||
                                      a.status === 'present'
                                        ? 'bg-green-100 text-green-700'
                                        : a.scan_type === 'timeout'
                                          ? 'bg-blue-100 text-blue-700'
                                          : a.status === 'absent'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-orange-100 text-orange-700'
                                    }`}
                                  >
                                    {a.scan_type === 'timein'
                                      ? 'Time In'
                                      : a.scan_type === 'timeout'
                                        ? 'Time Out'
                                        : a.status || 'N/A'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-400">
                              <p>No attendance records yet.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  /* ── Student List ── */
                  <>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        My Students
                      </h2>
                      <p className="text-gray-600">
                        Select a student to view their grades and attendance.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {children.map((child) => (
                        <Card
                          key={child.id}
                          className="border-red-200 hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => setViewingChild(child)}
                        >
                          <CardHeader>
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {child.photo || child.name?.charAt(0) || 'S'}
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-red-800">
                                  {child.name}
                                </CardTitle>
                                <CardDescription>
                                  {child.grade_level || 'N/A'} -{' '}
                                  {child.section || 'N/A'}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                  Student ID
                                </span>
                                <span className="font-medium">
                                  {child.student_id || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Email</span>
                                <span className="font-medium text-xs">
                                  {child.email || 'N/A'}
                                </span>
                              </div>
                              <div className="pt-2">
                                <Button
                                  className="w-full bg-red-800 hover:bg-red-700"
                                  size="sm"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Portal
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Enrollment */}
            {activeTab === 'enrollment' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Enrollment
                  </h2>
                  <p className="text-gray-600">
                    Submit enrollment requests for your children.
                  </p>
                </div>

                {/* Enrollment Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-800">New Enrollment Request</CardTitle>
                    <CardDescription>
                      Select a child and fill in the enrollment details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Select Child *</Label>
                        <Select value={enrollingChild} onValueChange={setEnrollingChild}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a student" />
                          </SelectTrigger>
                          <SelectContent>
                            {children.map((child) => (
                              <SelectItem key={String(child.id)} value={String(child.id)}>
                                {child.name} ({child.student_id || 'N/A'})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Grade Level *</Label>
                        <Select value={enrollGradeLevel} onValueChange={(v) => { setEnrollGradeLevel(v); setEnrollStrand(''); }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade level" />
                          </SelectTrigger>
                          <SelectContent>
                            {['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'].map((g) => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Semester *</Label>
                        <Select value={enrollSemester} onValueChange={setEnrollSemester}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1st Semester</SelectItem>
                            <SelectItem value="2">2nd Semester</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(enrollGradeLevel.includes('11') || enrollGradeLevel.includes('12')) && (
                        <div className="space-y-2">
                          <Label>Strand *</Label>
                          <Select value={enrollStrand} onValueChange={setEnrollStrand}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select strand" />
                            </SelectTrigger>
                            <SelectContent>
                              {['STEM','ABM','HUMSS','GAS','TVL','Sports','Arts & Design'].map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>School Year</Label>
                        <Input value={currentSchoolYear} disabled />
                      </div>
                    </div>

                    <Button
                      className="mt-6 bg-red-800 hover:bg-red-700"
                      onClick={handleEnrollSubmit}
                      disabled={enrollSubmitting}
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      {enrollSubmitting ? 'Submitting...' : 'Submit Enrollment Request'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Enrollment Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-800">Enrollment History</CardTitle>
                    <CardDescription>
                      Status of submitted enrollment requests.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {enrollmentLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800"></div>
                      </div>
                    ) : enrollmentRequests.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <GraduationCap className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No enrollment requests yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {enrollmentRequests.map((req: any) => {
                          const child = children.find((c) => String(c.id) === String(req.student_id));
                          return (
                            <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {child?.name || 'Unknown Student'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {req.grade_level}{req.strand ? ` - ${req.strand}` : ''} | {req.school_year} | Sem {req.semester}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Submitted: {new Date(req.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  req.status === 'approved'
                                    ? 'bg-green-50 text-green-700 border-green-300'
                                    : req.status === 'rejected'
                                      ? 'bg-red-50 text-red-700 border-red-300'
                                      : 'bg-yellow-50 text-yellow-700 border-yellow-300'
                                }
                              >
                                {req.status?.charAt(0).toUpperCase() + req.status?.slice(1) || 'Pending'}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Attendance */}
            {activeTab === 'attendance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Attendance Records
                  </h2>
                  <p className="text-gray-600">
                    View detailed attendance information for each child.
                  </p>
                </div>

                <div className="space-y-6">
                  {children.map((child) => {
                    const childId = String(child.id);
                    const attendanceData = childAttendance[childId] || [];
                    const stats = childStats[childId];

                    return (
                      <Card key={child.id}>
                        <CardHeader>
                          <CardTitle className="text-red-800">
                            {child.name}
                          </CardTitle>
                          <CardDescription>
                            {child.grade_level || 'N/A'} -{' '}
                            {child.section || 'N/A'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {stats && (
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium">
                                    Overall Attendance Rate
                                  </span>
                                  <span className="text-sm font-bold text-red-800">
                                    {stats.attendanceRate.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div
                                    className="bg-red-600 h-3 rounded-full transition-all"
                                    style={{
                                      width: `${stats.attendanceRate}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            {attendanceData.length > 0 ? (
                              <div className="text-sm text-gray-500">
                                Last 7 days:{' '}
                                {
                                  attendanceData.filter(
                                    (a: any) => a.status === 'present'
                                  ).length
                                }{' '}
                                present,{' '}
                                {
                                  attendanceData.filter(
                                    (a: any) => a.status === 'late'
                                  ).length
                                }{' '}
                                late,{' '}
                                {
                                  attendanceData.filter(
                                    (a: any) => a.status === 'absent'
                                  ).length
                                }{' '}
                                absent
                              </div>
                            ) : (
                              <div className="text-center py-6 text-gray-500">
                                <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                <p>No attendance records available</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Schedule / Subjects */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Subjects
                  </h2>
                  <p className="text-gray-600">
                    View your children's enrolled subjects.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {children.map((child) => {
                    const childId = String(child.id);
                    const grades = childGrades[childId] || [];
                    const subjects = [
                      ...new Set(grades.map((g: any) => g.subject)),
                    ].sort();

                    return (
                      <Card key={child.id}>
                        <CardHeader>
                          <CardTitle className="text-red-800">
                            {child.name}'s Subjects
                          </CardTitle>
                          <CardDescription>
                            {child.grade_level || 'N/A'} -{' '}
                            {child.section || 'N/A'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {subjects.length > 0 ? (
                            <ul className="space-y-2">
                              {subjects.map((subject: string) => (
                                <li
                                  key={subject}
                                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                >
                                  <GraduationCap className="w-4 h-4 text-red-800 flex-shrink-0" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {subject}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                              <p>No subjects found.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </PasswordChangeWrapper>
  );
}

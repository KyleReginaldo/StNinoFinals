'use client';

import { PasswordChangeWrapper } from '@/components/PasswordChangeWrapper';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/lib/supabaseClient';
import { useConfirm } from '@/lib/use-confirm';
import {
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StudentSidebarContent } from './components/StudentSidebar';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/student/dashboard',
  },
  {
    id: 'enrollment',
    label: 'Enrollment',
    icon: FileText,
    href: '/student/enrollment',
  },
  // {
  //   id: 'schedule',
  //   label: 'Schedule Calendar',
  //   icon: Calendar,
  //   href: '/student/schedule',
  // },
  {
    id: 'grades',
    label: 'Grades & Reports',
    icon: GraduationCap,
    href: '/student/grades',
  },
  { id: 'profile', label: 'Profile', icon: User, href: '/student/profile' },
] as const;

interface Student {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  student_number?: string;
  [key: string]: any;
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    if (!storedStudent) {
      // Only redirect if not on the main student page
      if (pathname !== '/student') {
        router.replace('/login');
      }
      setIsLoading(false);
      return;
    }

    try {
      const studentData = JSON.parse(storedStudent);
      setStudent(studentData);
    } catch (error) {
      console.error('Error parsing student data:', error);
      localStorage.removeItem('student');
      router.replace('/login');
    }
    setIsLoading(false);
  }, [pathname, router]);
  const { showConfirm } = useConfirm();

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      message: 'Are you sure you want to log out?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (confirmed) {
      // Clear state first
      setStudent(null);
      localStorage.removeItem('student');
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  };

  // If on login page, show children without layout
  if (pathname === '/student') {
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-red-800">Loading...</div>
      </div>
    );
  }

  // If no student and not on login page, children will handle redirect
  if (!student) {
    return <>{children}</>;
  }

  console.log('[Student Layout] Student data:', student);
  console.log(
    '[Student Layout] Student ID:',
    student.id,
    'Type:',
    typeof student.id
  );

  return (
    <PasswordChangeWrapper userId={String(student.id)}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-gray-900 border-r border-gray-700">
            <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700 bg-gray-950">
              <h1 className="text-xl font-bold text-white">Student Portal</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              <StudentSidebarContent
                student={student}
                navItems={NAV_ITEMS}
                currentPath={pathname}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex items-center justify-center h-16 px-4 bg-gray-950">
                  <h1 className="text-xl font-bold text-white">
                    Student Portal
                  </h1>
                </div>
                <StudentSidebarContent
                  student={student}
                  navItems={NAV_ITEMS}
                  currentPath={pathname}
                  onLogout={handleLogout}
                />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold text-red-800">Student Portal</h1>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </PasswordChangeWrapper>
  );
}

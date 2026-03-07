'use client';

import { PasswordChangeWrapper } from '@/components/PasswordChangeWrapper';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/lib/supabaseClient';
import { useConfirm } from '@/lib/use-confirm';
import { Home, LogOut, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TeacherSidebarContent from './components/TeacherSidebar';

interface Teacher {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  subject?: string;
  subjects?: string;
  [key: string]: any;
}

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { showConfirm } = useConfirm();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLoginPage = pathname === '/teacher/login' || pathname === '/login';

  // Check if teacher is logged in
  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    const storedTeacher = localStorage.getItem('teacher');
    if (storedTeacher) {
      try {
        const teacherData = JSON.parse(storedTeacher);
        setTeacher(teacherData);
      } catch (error) {
        console.error('Error parsing stored teacher data:', error);
        localStorage.removeItem('teacher');
        router.push('/login?role=teacher');
      }
    } else {
      router.push('/login?role=teacher');
    }
    setIsLoading(false);
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      message: 'Are you sure you want to log out?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (confirmed) {
      setTeacher(null);
      localStorage.removeItem('teacher');
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  };

  // Login page doesn't need the wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold text-red-800">Loading...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render (will redirect)
  if (!teacher) {
    return null;
  }

  return (
    <PasswordChangeWrapper userId={teacher.id}>
      <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
        {/* Header */}
        <header className="bg-white shadow-md border-b-4 border-red-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Mobile Menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="md:hidden"
                      aria-label="Toggle menu"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64">
                    <TeacherSidebarContent />
                  </SheetContent>
                </Sheet>

                <Image
                  src="/logo.png"
                  alt="Sto Niño de Praga Academy Logo"
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-red-800">
                    Teacher Portal
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 hidden sm:block">
                    Sto Niño de Praga Academy
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-4">
                <Link href="/" className="hidden sm:inline-block">
                  <Button
                    variant="outline"
                    className="border-red-800 text-red-800 hover:bg-red-800 hover:text-white"
                  >
                    <Home className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Home</span>
                  </Button>
                </Link>
                <div className="text-right hidden md:block">
                  <p className="font-medium text-red-800 text-sm">
                    {teacher.name ||
                      (teacher.first_name && teacher.last_name
                        ? `${teacher.first_name} ${teacher.last_name}`
                        : teacher.email)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {teacher.subjects || teacher.subject || 'Teacher'}
                  </p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-800 text-red-800 hover:bg-red-800 hover:text-white"
                >
                  <LogOut className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Log Out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 bg-gray-900 overflow-y-auto flex-shrink-0 border-r border-gray-700">
            <TeacherSidebarContent />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </PasswordChangeWrapper>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/lib/supabaseClient';
import { useConfirm } from '@/lib/use-confirm';
import { Home, LogOut, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TeacherSidebarContent from './TeacherSidebar';

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

interface TeacherWrapperProps {
  children: (teacher: Teacher) => React.ReactNode;
}

export default function TeacherWrapper({ children }: TeacherWrapperProps) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showConfirm } = useConfirm();

  // Check if teacher is logged in on component mount
  useEffect(() => {
    const storedTeacher = localStorage.getItem('teacher');
    if (storedTeacher) {
      try {
        const teacherData = JSON.parse(storedTeacher);
        setTeacher(teacherData);
      } catch (error) {
        console.error('Error parsing stored teacher data:', error);
        localStorage.removeItem('teacher');
        router.push('/teacher/login');
      }
    } else {
      router.push('/teacher/login');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      message: 'Are you sure you want to log out?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (confirmed) {
      await supabase.auth.signOut();
      localStorage.removeItem('teacher');
      setTeacher(null);
      router.push('/');
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
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
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white min-h-screen border-r border-gray-200">
          <TeacherSidebarContent />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6">{children(teacher)}</main>
      </div>
    </div>
  );
}

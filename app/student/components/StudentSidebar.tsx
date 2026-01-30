'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface Student {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  student_number?: string;
  [key: string]: any;
}

interface StudentSidebarContentProps {
  student: Student;
  navItems: readonly NavItem[];
  currentPath: string;
  onLogout: () => void;
}

export function StudentSidebarContent({
  student,
  navItems,
  currentPath,
  onLogout,
}: StudentSidebarContentProps) {
  const studentName =
    student.first_name && student.last_name
      ? `${student.first_name} ${student.last_name}`
      : student.email;

  return (
    <div className="flex flex-col h-full">
      {/* Student Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-900 truncate">
          {studentName}
        </div>
        {student.student_number && (
          <div className="text-xs text-gray-500">
            ID: {student.student_number}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 px-4 py-4 space-y-1"
        role="navigation"
        aria-label="Student sections"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.href ||
            (item.href !== '/student/dashboard' &&
              currentPath.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center px-3 py-2.5 text-sm rounded-md transition-colors ${
                isActive
                  ? 'bg-red-50 text-red-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4 h-4 mr-3" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}

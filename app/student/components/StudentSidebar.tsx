'use client';

import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';
import Image from 'next/image';
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

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
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

  const avatarLetters = initials(studentName);

  return (
    <div className="flex flex-col h-full bg-[#111827] overflow-hidden">

      {/* Branding */}
      <Link href="/" className="flex items-center gap-3 px-4 py-5 border-b border-white/5 flex-shrink-0 hover:bg-white/5 transition-colors">
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white/10">
          <Image
            src="/logo.png"
            alt="Logo"
            width={36}
            height={36}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate leading-tight">
            St. Niño de Praga
          </p>
          <p className="text-[10px] text-gray-500 leading-none mt-0.5">
            Student Portal
          </p>
        </div>
      </Link>

      {/* Nav */}
      <nav
        className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5"
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
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={cn(
                  'group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                  isActive
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200',
                )}
              >
                {isActive && (
                  <span className="absolute left-0 w-0.5 h-5 bg-blue-400 rounded-full" />
                )}
                <Icon
                  className={cn(
                    'w-4 h-4 flex-shrink-0',
                    isActive
                      ? 'text-white'
                      : 'text-gray-500 group-hover:text-gray-300',
                  )}
                />
                <span className="flex-1 truncate">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer: name + logout */}
      <div className="px-3 py-3 border-t border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-700/50 flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-blue-200">{avatarLetters}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-300 truncate">{studentName}</p>
            <p className="text-[10px] text-gray-600 leading-none mt-0.5">
              {student.student_number ? `#${student.student_number}` : 'Student'}
            </p>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';
import {
  BarChart3,
  BookOpen,
  Calendar,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

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

function SidebarItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <Link href={item.href}>
      <span className={cn(
        'group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
        active ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200',
      )}>
        {active && <span className="absolute left-0 w-0.5 h-5 bg-amber-400 rounded-full" />}
        <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300')} />
        <span className="flex-1 truncate">{item.label}</span>
      </span>
    </Link>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600 select-none">
      {label}
    </p>
  );
}

const SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Teaching',
    items: [
      { label: 'My Classes',    href: '/teacher/classes',    icon: BookOpen      },
      { label: 'Manage Grades', href: '/teacher/grades',     icon: GraduationCap },
      { label: 'Attendance',    href: '/teacher/attendance', icon: CalendarDays  },
      { label: 'Reports',       href: '/teacher/reports',    icon: BarChart3     },
    ],
  },
  {
    label: 'Personal',
    items: [
      { label: 'Calendar',   href: '/teacher/calendar', icon: Calendar },
      { label: 'My Account', href: '/teacher/account',  icon: User     },
    ],
  },
];

interface TeacherSidebarContentProps {
  teacher?: Teacher | null;
  onLogout?: () => void;
}

export default function TeacherSidebarContent({ teacher, onLogout }: TeacherSidebarContentProps) {
  const pathname = usePathname();

  const teacherName = teacher
    ? (teacher.first_name && teacher.last_name
        ? `${teacher.first_name} ${teacher.last_name}`
        : teacher.name || teacher.email?.split('@')[0] || 'Teacher')
    : 'Teacher';

  const avatarLetters = teacherName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex flex-col h-full bg-[#111827] overflow-hidden">

      {/* Branding */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white/10">
          <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-cover w-full h-full" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate leading-tight">St. Niño de Praga</p>
          <p className="text-[10px] text-gray-500 leading-none mt-0.5">Teacher Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 relative">
        {SECTIONS.map((section, i) => (
          <div key={i}>
            {section.label && <SectionLabel label={section.label} />}
            {section.items.map((item) => (
              <SidebarItem key={item.href} item={item} pathname={pathname} />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer: name + logout */}
      <div className="px-3 py-3 border-t border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-700/40 flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-amber-300">{avatarLetters}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-300 truncate">{teacherName}</p>
            <p className="text-[10px] text-gray-600 leading-none mt-0.5">
              {teacher?.subjects || teacher?.subject || 'Teacher'}
            </p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

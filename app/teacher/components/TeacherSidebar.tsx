'use client';

import {
  BookOpen,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TeacherSidebarContent() {
  const pathname = usePathname();

  const navItems = [
    { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/teacher/account', label: 'My Account', icon: User },
    { href: '/teacher/calendar', label: 'Calendar', icon: Calendar },
    { href: '/teacher/classes', label: 'My Classes', icon: BookOpen },
    { href: '/teacher/grades', label: 'Manage Grades', icon: GraduationCap },
    // { href: '/teacher/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-gray-900 w-full min-h-screen">
      <nav className="mt-6">
        <div className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
                    isActive
                      ? 'bg-gray-700 text-white font-medium'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

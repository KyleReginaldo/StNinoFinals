'use client';

import { cn } from '@/lib/utils';
import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  ClipboardList,
  DoorOpen,
  GraduationCap,
  Layers,
  LayoutDashboard,
  List,
  LogOut,
  MessageSquare,
  Settings,
  User,
  UserRound,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/admin/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

/* ── Types ─────────────────────────────────────────────────── */
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  exact?: boolean;
}
interface NavGroup {
  label?: string;
  items: NavItem[];
  nested?: {
    label: string;
    icon: React.ElementType;
    children: NavItem[];
  };
}

/* ── Nav Item ───────────────────────────────────────────────── */
function SidebarItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/');
  return (
    <Link href={item.href}>
      <span className={cn(
        'group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
        active
          ? 'bg-white/10 text-white font-medium'
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200',
      )}>
        {active && <span className="absolute left-0 w-0.5 h-5 bg-red-500 rounded-full" />}
        <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300')} />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </span>
    </Link>
  );
}

/* ── Nested Group ───────────────────────────────────────────── */
function NestedGroup({ group, pathname }: { group: NavGroup['nested'] & {}; pathname: string }) {
  const hasActive = group.children.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'));
  const [open, setOpen] = useState<boolean>(hasActive || true);

  return (
    <div>
      <button
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
          hasActive ? 'text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200',
        )}
      >
        <group.icon className={cn('w-4 h-4 flex-shrink-0', hasActive ? 'text-white' : 'text-gray-500')} />
        <span className="flex-1 text-left truncate">{group.label}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-gray-500 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-0.5 ml-3 pl-3 border-l border-white/10 space-y-0.5">
          {group.children.map((child) => (
            <SidebarItem key={child.href} item={child} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Section Label ──────────────────────────────────────────── */
function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600 select-none">
      {label}
    </p>
  );
}

/* ── Sidebar Content ────────────────────────────────────────── */
export const AdminSidebarContent = () => {
  const pathname = usePathname();
  const { admin } = useAuth();
  const [pendingCounts, setPendingCounts] = useState({ admissions: 0, enrollments: 0, grades: 0 });
  const [loggingOut, setLoggingOut] = useState(false);

  const adminName = admin
    ? (admin.first_name && admin.last_name
        ? `${admin.first_name} ${admin.last_name}`
        : admin.name || admin.email?.split('@')[0] || 'Admin')
    : 'Admin';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      localStorage.removeItem('admin');
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch {
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/admin/pending-counts');
        const data = await res.json();
        if (data.success) setPendingCounts(data.counts);
      } catch {}
    };
    fetch_();
    const iv = setInterval(fetch_, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#111827] overflow-hidden">

      {/* ── Branding ──────────────────────────────────────────── */}
      <Link href="/" className="flex items-center gap-3 px-4 py-5 border-b border-white/5 flex-shrink-0 hover:bg-white/5 transition-colors">
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white/10">
          <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-cover w-full h-full" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate leading-tight">St. Niño de Praga</p>
          <p className="text-[10px] text-gray-500 leading-none mt-0.5">Admin Portal</p>
        </div>
      </Link>

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 relative">

        {/* Overview */}
        <SidebarItem item={{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true }} pathname={pathname} />

        {/* People */}
        <SectionLabel label="People" />
        <NestedGroup
          group={{
            label: 'User Management',
            icon: Users,
            children: [
              { label: 'Students', href: '/admin/students', icon: User },
              { label: 'Teachers', href: '/admin/teachers', icon: UserRound },
              { label: 'Parents',  href: '/admin/parents',  icon: UserRound },
            ],
          }}
          pathname={pathname}
        />
        <SidebarItem item={{ label: 'Admissions', href: '/admin/admission', icon: List, badge: pendingCounts.admissions }} pathname={pathname} />

        {/* Academics */}
        <SectionLabel label="Academics" />
        <SidebarItem item={{ label: 'Class List',       href: '/admin/class-list',  icon: Layers        }} pathname={pathname} />
        <SidebarItem item={{ label: 'Classes',          href: '/admin/classes',     icon: BookOpen      }} pathname={pathname} />
        <SidebarItem item={{ label: 'Sections',         href: '/admin/sections',    icon: Layers        }} pathname={pathname} />
        <SidebarItem item={{ label: 'Rooms',             href: '/admin/rooms',       icon: DoorOpen      }} pathname={pathname} />
        <SidebarItem item={{ label: 'Grade Approvals',  href: '/admin/grades',      icon: GraduationCap, badge: pendingCounts.grades }} pathname={pathname} />
        <SidebarItem item={{ label: 'Enrollment',       href: '/admin/enrollment',  icon: ClipboardList, badge: pendingCounts.enrollments }} pathname={pathname} />

        {/* Monitoring */}
        <SectionLabel label="Monitoring" />
        <SidebarItem item={{ label: 'Attendance', href: '/admin/attendance', icon: Calendar }} pathname={pathname} />
        <NestedGroup
          group={{
            label: 'Reports & Analytics',
            icon: BarChart3,
            children: [
              { label: 'Overview',           href: '/admin/reports',            icon: BarChart3 },
              { label: 'Population Report',  href: '/admin/reports/population', icon: Users     },
            ],
          }}
          pathname={pathname}
        />

        {/* System */}
        <SectionLabel label="System" />
        <SidebarItem item={{ label: 'Announcements', href: '/admin/announcements', icon: Bell           }} pathname={pathname} />
        <SidebarItem item={{ label: 'SMS Tester',    href: '/admin/test-sms',      icon: MessageSquare  }} pathname={pathname} />
        <SidebarItem item={{ label: 'Settings',      href: '/admin/settings',      icon: Settings       }} pathname={pathname} />
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="px-3 py-3 border-t border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-red-800/60 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-red-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-300 truncate">{adminName}</p>
            <p className="text-[10px] text-gray-600 leading-none mt-0.5">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Logout"
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminSidebar = () => (
  <div className="hidden md:block w-56 h-full flex-shrink-0">
    <AdminSidebarContent />
  </div>
);

export default AdminSidebar;

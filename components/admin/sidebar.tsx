import {
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  Layers,
  LayoutDashboard,
  List,
  MessageSquare,
  Settings,
  User,
  UserRound,
  Users,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Item from './Item';
import NestedItem from './NestedItem';

export const AdminSidebarContent = () => {
  const pathname = usePathname();
  const [pendingCounts, setPendingCounts] = useState({
    admissions: 0,
    enrollments: 0,
    grades: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/admin/pending-counts');
        const data = await res.json();
        if (data.success) setPendingCounts(data.counts);
      } catch {}
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 w-full h-full overflow-y-auto p-6 pt-10">
      <ul className="flex flex-col gap-10 text-white font-regular">
        <Item
          label="Dashboard"
          isSelected={pathname === '/admin'}
          link="/admin"
          icon={LayoutDashboard}
        />
        <NestedItem
          label="User Management"
          icon={Users}
          children={[
            {
              label: 'Students',
              isSelected: pathname === '/admin/students',
              link: '/admin/students',
              icon: User,
            },
            {
              label: 'Teachers',
              isSelected: pathname === '/admin/teachers',
              link: '/admin/teachers',
              icon: UserRound,
            },
            {
              label: 'Parents',
              isSelected: pathname === '/admin/parents',
              link: '/admin/parents',
              icon: UserRound,
            },
          ]}
        />
        <Item
          label="Admissions"
          isSelected={pathname === '/admin/admission'}
          link="/admin/admission"
          icon={List}
          badge={pendingCounts.admissions}
        />
        <Item
          label="Class List"
          isSelected={pathname === '/admin/class-list'}
          link="/admin/class-list"
          icon={Layers}
        />
        <Item
          label="Classes"
          isSelected={pathname === '/admin/classes'}
          link="/admin/classes"
          icon={BookOpen}
        />
        <Item
          label="Sections"
          isSelected={pathname === '/admin/sections'}
          link="/admin/sections"
          icon={Layers}
        />
        <Item
          label="Grade Approvals"
          isSelected={pathname === '/admin/grades'}
          link="/admin/grades"
          icon={GraduationCap}
          badge={pendingCounts.grades}
        />
        <Item
          label="Enrollment"
          isSelected={pathname === '/admin/enrollment'}
          link="/admin/enrollment"
          icon={ClipboardList}
          badge={pendingCounts.enrollments}
        />
        <Item
          label="Attendance"
          isSelected={pathname.startsWith('/admin/attendance')}
          link="/admin/attendance"
          icon={Calendar}
        />
        <Item
          label="Reports & Analytics"
          isSelected={pathname === '/admin/reports'}
          link="/admin/reports"
          icon={BarChart3}
        />
        <Item
          label="SMS Tester"
          isSelected={pathname === '/admin/test-sms'}
          link="/admin/test-sms"
          icon={MessageSquare}
        />
        <Item
          label="Settings"
          isSelected={pathname === '/admin/settings'}
          link="/admin/settings"
          icon={Settings}
        />
      </ul>
    </div>
  );
};

const AdminSidebar = () => {
  return (
    <>
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:block w-64 h-full flex-shrink-0">
        <AdminSidebarContent />
      </div>
    </>
  );
};

export default AdminSidebar;

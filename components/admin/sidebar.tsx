import {
  BookOpen,
  Calendar,
  CalendarDays,
  CalendarRange,
  LayoutDashboard,
  List,
  MessageSquare,
  Monitor,
  Proportions,
  Radio,
  Settings,
  User,
  UserRound,
  Users,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Item from './Item';
import NestedItem from './NestedItem';

export const AdminSidebarContent = () => {
  const pathname = usePathname();
  return (
    <div className="bg-[#7A0C0C] w-full h-full overflow-y-auto p-6 pt-10">
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
        />
        <Item
          label="Classes"
          isSelected={pathname === '/admin/classes'}
          link="/admin/classes"
          icon={BookOpen}
        />
        <Item
          label="Attendance"
          isSelected={pathname === '/admin/attendance'}
          link="/admin/attendance"
          icon={Calendar}
        />
        <Item
          label="Live Attendance"
          isSelected={pathname === '/admin/live-attendance'}
          link="/admin/live-attendance"
          icon={Radio}
        />
        <Item
          label="Student Attendance"
          isSelected={pathname === '/admin/attendance-reports'}
          link="/admin/attendance-reports"
          icon={CalendarDays}
        />
        <Item
          label="Teacher Attendance"
          isSelected={pathname === '/admin/teacher-attendance'}
          link="/admin/teacher-attendance"
          icon={CalendarRange}
        />
        <Item
          label="Reports and Analytics"
          isSelected={pathname === '/admin/reports'}
          link="/admin/reports"
          icon={Proportions}
        />
        <Item
          label="RFID Display"
          isSelected={pathname === '/admin/rfid-display'}
          link="/admin/rfid-display"
          icon={Monitor}
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

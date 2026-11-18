'use client';

import { PortalSidebar, type PortalNavSection } from '@/components/portal-sidebar';
import type { ComponentType } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
  requiresAcademicRecord?: boolean;
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
  /** enrolled or has grades on record; null while loading — nothing is locked until we know */
  hasAcademicRecord?: boolean | null;
}

export function StudentSidebarContent({
  student,
  navItems,
  currentPath,
  onLogout,
  hasAcademicRecord = null,
}: StudentSidebarContentProps) {
  const studentName =
    student.first_name && student.last_name
      ? `${student.first_name} ${student.last_name}`
      : student.email;

  const sections: PortalNavSection[] = [
    {
      entries: navItems.map((item) => ({
        item: {
          label: item.label,
          href: item.href,
          icon: item.icon,
          exact: item.href === '/student/dashboard',
          disabled: !!item.requiresAcademicRecord && hasAcademicRecord === false,
          disabledHint: 'Available once you are enrolled or have grades on record',
        },
      })),
    },
  ];

  return (
    <PortalSidebar
      portalLabel="Student Portal"
      accent="red"
      sections={sections}
      pathname={currentPath}
      userName={studentName}
      userSubtitle={student.student_number ? `#${student.student_number}` : 'Student'}
      onLogout={onLogout}
    />
  );
}

'use client';

import { PortalSidebar, type PortalNavSection } from '@/components/portal-sidebar';
import type { ComponentType } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
  requiresEnrollment?: boolean;
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
  /** null while loading — nothing is locked until we know */
  isEnrolled?: boolean | null;
}

export function StudentSidebarContent({
  student,
  navItems,
  currentPath,
  onLogout,
  isEnrolled = null,
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
          disabled: !!item.requiresEnrollment && isEnrolled === false,
          disabledHint: 'Available once you are enrolled',
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

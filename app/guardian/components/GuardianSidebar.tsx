'use client';

import { FileText, GraduationCap, LayoutDashboard, User } from 'lucide-react';

interface GuardianSidebarContentProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export function GuardianSidebarContent({
  activeNav,
  setActiveNav,
}: GuardianSidebarContentProps) {
  return (
    <div className="bg-white w-full min-h-screen">
      <nav className="mt-6">
        <div className="px-4 space-y-1">
          <button
            onClick={() => setActiveNav('dashboard')}
            className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
              activeNav === 'dashboard'
                ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveNav('enrollment')}
            className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
              activeNav === 'enrollment'
                ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4 mr-3" />
            Enrollment
          </button>

          {/* <button
            onClick={() => setActiveNav('schedule')}
            className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
              activeNav === 'schedule'
                ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4 mr-3" />
            Schedule Calendar
          </button> */}

          <button
            onClick={() => setActiveNav('grades')}
            className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
              activeNav === 'grades'
                ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <GraduationCap className="w-4 h-4 mr-3" />
            Grades & Reports
          </button>

          <button
            onClick={() => setActiveNav('profile')}
            className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
              activeNav === 'profile'
                ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <User className="w-4 h-4 mr-3" />
            Profile
          </button>
        </div>
      </nav>
    </div>
  );
}

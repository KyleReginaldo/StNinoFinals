'use client';

import { GraduationCap, Hash, Layers, Mail, Phone, User } from 'lucide-react';
import { useMemo } from 'react';
import { useStudentAuth } from '../hooks/useStudentAuth';

function Field({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { student, isLoading } = useStudentAuth();

  const displayName = useMemo(() => {
    if (!student) return 'Student';
    if (student.first_name && student.last_name)
      return `${student.first_name} ${student.last_name}`;
    return student.email?.split('@')[0] || 'Student';
  }, [student]);

  const avatarLetters = useMemo(() => {
    return displayName
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [displayName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  if (!student) return null;

  const gradeSection = [student.grade_level, student.section].filter(Boolean).join(' — ');

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">

      {/* Avatar + Name */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-blue-700/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-blue-700">{avatarLetters}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 capitalize">{displayName.toLowerCase()}</h2>
          {(student.student_id || student.student_number) && (
            <p className="text-sm text-gray-400 mt-0.5">
              #{student.student_id || student.student_number}
            </p>
          )}
          {gradeSection && (
            <span className="inline-flex items-center mt-1.5 text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
              {gradeSection}
            </span>
          )}
        </div>
      </div>

      {/* Info Fields */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Personal Information</p>
          <p className="text-xs text-gray-400 mt-0.5">Your student profile and contact details</p>
        </div>
        <div className="px-5 divide-y divide-gray-100">
          <Field icon={User}         label="Full Name"       value={displayName} />
          <Field icon={Hash}         label="Student Number"  value={student.student_id || student.student_number} />
          <Field icon={GraduationCap} label="Grade Level"   value={student.grade_level} />
          <Field icon={Layers}       label="Section"         value={student.section} />
          <Field icon={Mail}         label="Email"           value={student.email} />
          <Field icon={Phone}        label="Contact Number"  value={student.phone || student.contact_number} />
        </div>
      </div>
    </div>
  );
}

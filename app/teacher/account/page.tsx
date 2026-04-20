'use client';

import { BookOpen, Hash, Mail, MapPin, Phone, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface Teacher {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  subject?: string;
  subjects?: string;
  teacher_id?: string;
  department?: string;
  phone?: string;
  contact_number?: string;
  address?: string;
  [key: string]: any;
}

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

export default function TeacherAccount() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('teacher');
    if (!stored) { router.push('/login?role=teacher'); return; }
    try {
      setTeacher(JSON.parse(stored));
    } catch {
      localStorage.removeItem('teacher');
      router.push('/login?role=teacher');
    }
  }, [router]);

  const displayName = useMemo(() => {
    if (!teacher) return 'Teacher';
    if (teacher.first_name && teacher.last_name)
      return `${teacher.first_name} ${teacher.last_name}`;
    return teacher.name || teacher.email?.split('@')[0] || 'Teacher';
  }, [teacher]);

  const avatarLetters = displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (!teacher) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Avatar + Name */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-amber-700/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-amber-700">{avatarLetters}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 capitalize">{displayName.toLowerCase()}</h2>
          {teacher.teacher_id && (
            <p className="text-sm text-gray-400 mt-0.5">#{teacher.teacher_id}</p>
          )}
          {(teacher.subjects || teacher.subject) && (
            <span className="inline-flex items-center mt-1.5 text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
              {teacher.subjects || teacher.subject}
            </span>
          )}
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Personal Information</p>
        </div>
        <div className="px-5 divide-y divide-gray-100">
          <Field icon={User}     label="Full Name"   value={displayName} />
          <Field icon={Hash}     label="Teacher ID"  value={teacher.teacher_id} />
          <Field icon={Mail}     label="Email"       value={teacher.email} />
          <Field icon={Phone}    label="Contact"     value={teacher.phone || teacher.contact_number} />
          <Field icon={MapPin}   label="Address"     value={teacher.address} />
        </div>
      </div>

      {/* Teaching Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Teaching Information</p>
        </div>
        <div className="px-5 divide-y divide-gray-100">
          <Field icon={BookOpen} label="Subject(s)"  value={teacher.subjects || teacher.subject} />
          <Field icon={Hash}     label="Department"  value={teacher.department} />
        </div>
      </div>
    </div>
  );
}

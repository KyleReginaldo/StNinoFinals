'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { useMemo } from 'react';
import { useStudentAuth } from '../hooks/useStudentAuth';

export default function ProfilePage() {
  const { student, isLoading } = useStudentAuth();

  const displayName = useMemo(() => {
    if (!student) return 'Student';
    if (student.first_name && student.last_name) {
      return `${student.first_name} ${student.last_name}`;
    }
    return student.email?.split('@')[0] || 'Student';
  }, [student]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-red-800">Loading...</div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Student Profile</h2>

      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Your student profile and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <p className="text-gray-900">{displayName}</p>
            </div>

            {student.first_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <p className="text-gray-900">{student.first_name}</p>
              </div>
            )}

            {student.last_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <p className="text-gray-900">{student.last_name}</p>
              </div>
            )}

            {student.student_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <p className="text-gray-900">{student.student_id}</p>
              </div>
            )}

            {student.grade_level && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level
                </label>
                <p className="text-gray-900">{student.grade_level}</p>
              </div>
            )}

            {student.section && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <p className="text-gray-900">{student.section}</p>
              </div>
            )}

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 mr-1" aria-hidden />
                Email
              </label>
              <p className="text-gray-900 break-words">{student.email}</p>
            </div>

            {(student.phone || student.contact_number) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <p className="text-gray-900">
                  {student.phone || student.contact_number}
                </p>
              </div>
            )}

            {student.address && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <p className="text-gray-900">{student.address}</p>
              </div>
            )}

            {/* Display any additional fields that might be in the student object */}
            {Object.entries(student)
              .filter(([key]) =>
                [
                  'id',
                  'email',
                  'Password',
                  'password',
                  'name',
                  'first_name',
                  'last_name',
                  'student_id',
                  'grade_level',
                  'section',
                  'phone',
                  'contact_number',
                  'address',
                  'gpa',
                  'attendance_rate',
                  'active_courses',
                  'pending_tasks',
                  'middle_name',
                  'birth_date',
                  'gender',
                  'first_login',
                ].every((reserved) => reserved !== key)
              )
              .map(
                ([key, value]) =>
                  value && (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <p className="text-gray-900">{String(value)}</p>
                    </div>
                  )
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

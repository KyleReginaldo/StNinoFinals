'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BookOpen, Mail, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

export default function TeacherAccount() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  // Check if teacher is logged in
  useEffect(() => {
    const storedTeacher = localStorage.getItem('teacher');
    if (!storedTeacher) {
      router.push('/teacher/login');
      return;
    }

    try {
      const teacherData = JSON.parse(storedTeacher);
      setTeacher(teacherData);
    } catch (error) {
      console.error('Error parsing stored teacher data:', error);
      localStorage.removeItem('teacher');
      router.push('/teacher/login');
    }
  }, [router]);

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-red-800">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-800">My Account Information</CardTitle>
          <CardDescription>
            View your account details and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg text-red-800 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-600">Full Name</Label>
                    <p className="font-medium text-red-800">
                      {teacher.name ||
                        (teacher.first_name && teacher.last_name
                          ? `${teacher.first_name} ${teacher.last_name}`
                          : 'Not provided')}
                    </p>
                  </div>
                  {teacher.first_name && (
                    <div>
                      <Label className="text-gray-600">First Name</Label>
                      <p className="font-medium">{teacher.first_name}</p>
                    </div>
                  )}
                  {teacher.last_name && (
                    <div>
                      <Label className="text-gray-600">Last Name</Label>
                      <p className="font-medium">{teacher.last_name}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-600 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </Label>
                    <p className="font-medium">{teacher.email}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg text-red-800 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Teaching Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-600">Subject(s)</Label>
                    <p className="font-medium text-red-800">
                      {teacher.subjects || teacher.subject || 'Not assigned'}
                    </p>
                  </div>
                  {teacher.teacher_id && (
                    <div>
                      <Label className="text-gray-600">Teacher ID</Label>
                      <p className="font-medium">{teacher.teacher_id}</p>
                    </div>
                  )}
                  {teacher.department && (
                    <div>
                      <Label className="text-gray-600">Department</Label>
                      <p className="font-medium">{teacher.department}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            {(teacher.phone || teacher.address || teacher.contact_number) && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg text-red-800">
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacher.phone && (
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p className="font-medium">{teacher.phone}</p>
                    </div>
                  )}
                  {teacher.contact_number && (
                    <div>
                      <Label className="text-gray-600">Contact Number</Label>
                      <p className="font-medium">{teacher.contact_number}</p>
                    </div>
                  )}
                  {teacher.address && (
                    <div className="md:col-span-2">
                      <Label className="text-gray-600">Address</Label>
                      <p className="font-medium">{teacher.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Display all other fields */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-800">
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(teacher)
                    .filter(
                      ([key]) =>
                        ![
                          'id',
                          'email',
                          'password',
                          'name',
                          'first_name',
                          'last_name',
                          'subjects',
                          'subject',
                          'teacher_id',
                          'department',
                          'phone',
                          'contact_number',
                          'address',
                        ].includes(key)
                    )
                    .map(
                      ([key, value]) =>
                        value && (
                          <div key={key}>
                            <Label className="text-gray-600 capitalize">
                              {key.replace(/_/g, ' ')}
                            </Label>
                            <p className="font-medium">{String(value)}</p>
                          </div>
                        )
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

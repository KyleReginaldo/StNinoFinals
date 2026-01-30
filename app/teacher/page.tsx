'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpen, Calendar, Clock, GraduationCap } from 'lucide-react';
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
  [key: string]: any;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [teacherStats, setTeacherStats] = useState<any>(null);

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

  // Fetch teacher stats
  useEffect(() => {
    if (teacher && teacher.id) {
      fetchTeacherStats();
    }
  }, [teacher]);

  const fetchTeacherStats = async () => {
    if (!teacher || !teacher.id) return;

    try {
      const response = await fetch(
        `/api/teacher/stats?teacherId=${teacher.id}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setTeacherStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
    }
  };

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-red-800">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-800">
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl text-red-800">
              {teacherStats?.totalStudents || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Across all your classes</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-2">
            <CardDescription>Classes Today</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {teacherStats?.classesToday || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-2">
            <CardDescription>Journal Entries</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {teacherStats?.journalEntries || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Total entries recorded</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <CardHeader className="pb-2">
            <CardDescription>Pending Grades</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {teacherStats?.pendingGrades || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Awaiting submission</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      {teacherStats?.todaySchedule && teacherStats.todaySchedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Your classes scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teacherStats.todaySchedule.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-red-800">
                        {item.timeStart}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.timeEnd}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{item.subject}</div>
                      <div className="text-sm text-gray-600">
                        {item.section} • {item.room}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements */}
      {teacherStats?.announcements && teacherStats.announcements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-800">Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teacherStats.announcements.map((announcement: any) => (
                <div key={announcement.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-800">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {announcement.content}
                      </p>
                    </div>
                    {announcement.priority && (
                      <Badge
                        variant={
                          announcement.priority === 'high'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {announcement.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-800">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push('/teacher/grades')}
              className="bg-red-800 hover:bg-red-700 h-auto py-4"
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Manage Grades
            </Button>
            <Button
              onClick={() => router.push('/teacher/journal')}
              variant="outline"
              className="border-red-800 text-red-800 hover:bg-red-50 h-auto py-4"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Add Journal Entry
            </Button>
            <Button
              onClick={() => router.push('/teacher/calendar')}
              variant="outline"
              className="border-red-800 text-red-800 hover:bg-red-50 h-auto py-4"
            >
              <Calendar className="w-5 h-5 mr-2" />
              View Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

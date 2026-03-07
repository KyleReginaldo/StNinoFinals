'use client';

import { LiveAttendanceTab } from '@/components/admin/attendance/LiveAttendanceTab';
import { RfidDisplayTab } from '@/components/admin/attendance/RfidDisplayTab';
import { StudentAttendanceTab } from '@/components/admin/attendance/StudentAttendanceTab';
import { TeacherAttendanceTab } from '@/components/admin/attendance/TeacherAttendanceTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Radio, UserCheck, Users } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const VALID_TABS = ['live', 'rfid', 'student', 'teacher'] as const;
type TabValue = (typeof VALID_TABS)[number];

function AttendancePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawTab = searchParams.get('tab') ?? 'live';
  const activeTab: TabValue = (VALID_TABS as readonly string[]).includes(rawTab)
    ? (rawTab as TabValue)
    : 'live';

  const handleTabChange = (value: string) => {
    router.replace(`/admin/attendance?tab=${value}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-red-800">Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and report student &amp; teacher attendance
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6 bg-white border border-gray-200 shadow-sm h-auto p-1 flex flex-wrap gap-1">
            <TabsTrigger
              value="live"
              className="flex items-center gap-2 data-[state=active]:bg-red-800 data-[state=active]:text-white"
            >
              <Radio className="w-4 h-4" />
              Live Attendance
            </TabsTrigger>
            <TabsTrigger
              value="rfid"
              className="flex items-center gap-2 data-[state=active]:bg-red-800 data-[state=active]:text-white"
            >
              <Monitor className="w-4 h-4" />
              RFID Display
            </TabsTrigger>
            <TabsTrigger
              value="student"
              className="flex items-center gap-2 data-[state=active]:bg-red-800 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              Student Reports
            </TabsTrigger>
            <TabsTrigger
              value="teacher"
              className="flex items-center gap-2 data-[state=active]:bg-red-800 data-[state=active]:text-white"
            >
              <UserCheck className="w-4 h-4" />
              Teacher Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            <LiveAttendanceTab />
          </TabsContent>

          <TabsContent value="rfid">
            <RfidDisplayTab />
          </TabsContent>

          <TabsContent value="student">
            <StudentAttendanceTab />
          </TabsContent>

          <TabsContent value="teacher">
            <TeacherAttendanceTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-800 border-t-transparent"></div>
            <p className="mt-4 text-red-800 font-medium">
              Loading Attendance...
            </p>
          </div>
        </div>
      }
    >
      <AttendancePageContent />
    </Suspense>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Download, RefreshCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';

interface Student {
  studentId: string;
  studentName: string;
  gradeLevel: string;
  section: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
  dailyAttendance: Record<string, string>;
  records: any[];
}

interface AttendanceReportsData {
  general: {
    totalStudents: number;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalDays: number;
    presentPercentage: number;
    absentPercentage: number;
  };
  students: Student[];
  selectedStudent: Student | null;
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    gradeLevels: string[];
    sections: string[];
  };
}

export function StudentAttendanceTab() {
  const [data, setData] = useState<AttendanceReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(
    undefined
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [gradeLevel, setGradeLevel] = useState<string>('all');
  const [section, setSection] = useState<string>('all');

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setDateRange({ from: start, to: end });
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) {
        const year = dateRange.from.getFullYear();
        const month = String(dateRange.from.getMonth() + 1).padStart(2, '0');
        const day = String(dateRange.from.getDate()).padStart(2, '0');
        params.append('startDate', `${year}-${month}-${day}`);
      }
      if (dateRange?.to) {
        const year = dateRange.to.getFullYear();
        const month = String(dateRange.to.getMonth() + 1).padStart(2, '0');
        const day = String(dateRange.to.getDate()).padStart(2, '0');
        params.append('endDate', `${year}-${month}-${day}`);
      }
      if (selectedStudentId) params.append('studentId', selectedStudentId);
      if (gradeLevel && gradeLevel !== 'all')
        params.append('gradeLevel', gradeLevel);
      if (section && section !== 'all') params.append('section', section);

      const response = await fetch(
        `/api/admin/attendance-reports?${params.toString()}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        setError(null);
        if (!selectedStudentId && result.data.students.length > 0) {
          setSelectedStudentId(result.data.students[0].studentId);
        }
      } else {
        setError(result.error || 'Failed to fetch attendance data');
        setData(null);
      }
    } catch (error: any) {
      setError(
        error?.message || 'An error occurred while fetching attendance data'
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchData();
    }
  }, [dateRange, selectedStudentId, gradeLevel, section]);

  const selectedStudent = useMemo(() => {
    if (!data || !selectedStudentId) return null;
    return (
      data.students.find((s) => s.studentId === selectedStudentId) ||
      data.selectedStudent
    );
  }, [data, selectedStudentId]);

  const dateColumns = useMemo(() => {
    if (!data) return [];
    const dates: string[] = [];
    const start = new Date(data.dateRange.start);
    const end = new Date(data.dateRange.end);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }
    return dates;
  }, [data]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
    });
  };

  const getAttendanceCodeColor = (code: string) => {
    switch (code) {
      case 'PR':
        return 'bg-green-500 text-white';
      case 'AC':
        return 'bg-red-500 text-white';
      case 'LA':
        return 'bg-yellow-500 text-white';
      case 'EX':
        return 'bg-blue-500 text-white';
      case 'HO':
        return 'bg-gray-400 text-white';
      case 'EA':
        return 'bg-orange-500 text-white';
      case 'DA':
        return 'bg-purple-500 text-white';
      case 'SU':
        return 'bg-red-700 text-white';
      case 'O':
        return 'bg-gray-500 text-white';
      case 'VA':
        return 'bg-blue-400 text-white';
      case 'CR':
        return 'bg-purple-400 text-white';
      case 'D1':
      case 'D2':
      case 'D3':
      case 'D4':
      case 'D5':
      case 'D6':
        return 'bg-indigo-500 text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  const getAttendanceCodeLabel = (code: string) => {
    const codes: Record<string, string> = {
      PR: 'Present',
      AC: 'Absent - Coded',
      LA: 'Late',
      EX: 'Excused',
      HO: 'Holiday',
      EA: 'Early Absent',
      DA: 'Day Absent',
      SU: 'Suspended',
      O: 'Other',
      VA: 'Vacation',
      CR: 'Credit',
      D1: 'Day 1',
      D2: 'Day 2',
      D3: 'Day 3',
      D4: 'Day 4',
      D5: 'Day 5',
      D6: 'Day 6',
    };
    return codes[code] || code;
  };

  const exportToCSV = () => {
    if (!data || !data.students.length) return;
    const headers = [
      '#',
      'Name',
      'Total Days',
      'Present',
      'Absent',
      'Late',
      'Excused',
      '%',
      ...dateColumns.map((d) => formatDate(d)),
    ];
    const rows = [headers];
    data.students.forEach((student, index) => {
      rows.push([
        (index + 1).toString(),
        student.studentName,
        student.totalDays.toString(),
        student.present.toString(),
        student.absent.toString(),
        student.late.toString(),
        student.excused.toString(),
        `${student.percentage}%`,
        ...dateColumns.map((date) => student.dailyAttendance[date] || '-'),
      ]);
    });
    const csvContent = rows
      .map((row) =>
        row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const startDateStr = dateRange?.from
      ? format(dateRange.from, 'yyyy-MM-dd')
      : 'start';
    const endDateStr = dateRange?.to
      ? format(dateRange.to, 'yyyy-MM-dd')
      : 'end';
    link.setAttribute(
      'download',
      `attendance-report-${startDateStr}-to-${endDateStr}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const attendanceBreakdown = useMemo(() => {
    if (!selectedStudent) return null;
    const breakdown: Record<string, number> = {
      PR: 0,
      AC: 0,
      LA: 0,
      EX: 0,
      HO: 0,
      EA: 0,
      DA: 0,
      SU: 0,
      O: 0,
      VA: 0,
      CR: 0,
      D1: 0,
      D2: 0,
      D3: 0,
      D4: 0,
      D5: 0,
      D6: 0,
    };
    Object.values(selectedStudent.dailyAttendance).forEach((code) => {
      if (code in breakdown) breakdown[code]++;
    });
    return breakdown;
  }, [selectedStudent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 animate-spin mx-auto mb-4 text-red-800" />
          <p className="text-gray-600">Loading attendance reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-red-800">
          Student Attendance Reports
        </h2>
        <div className="flex items-center gap-2">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {data && data.students.length > 0 && (
            <Button
              onClick={exportToCSV}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-r from-white to-red-50 rounded-xl shadow-md border-2 border-red-100 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-red-600" />
            Filter Options
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="space-y-2 lg:col-span-2">
            <Label className="text-sm font-semibold text-gray-700">
              Date Range
            </Label>
            <Popover
              open={isDatePickerOpen}
              onOpenChange={(open) => {
                setIsDatePickerOpen(open);
                if (open) setTempDateRange(dateRange);
              }}
              modal={true}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal border-2 border-gray-200 rounded-lg',
                    !dateRange?.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} –{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={tempDateRange?.from || dateRange?.from}
                  selected={tempDateRange}
                  onSelect={setTempDateRange}
                  numberOfMonths={2}
                />
                <div className="p-3 border-t flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setTempDateRange(dateRange);
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      if (tempDateRange?.from && tempDateRange?.to) {
                        setDateRange(tempDateRange);
                        setIsDatePickerOpen(false);
                      }
                    }}
                    disabled={!tempDateRange?.from || !tempDateRange?.to}
                  >
                    Set Date Range
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Grade Level */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Grade Level
            </Label>
            <Select value={gradeLevel} onValueChange={setGradeLevel}>
              <SelectTrigger className="border-2 border-gray-200 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {data?.filters.gradeLevels.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Section
            </Label>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger className="border-2 border-gray-200 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {data?.filters.sections.map((sec) => (
                  <SelectItem key={sec} value={sec}>
                    {sec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-semibold text-red-600">
              Error Loading Attendance Data
            </p>
            <p className="text-sm mt-2 text-red-500">{error}</p>
            <Button onClick={fetchData} variant="outline" className="mt-4">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : !data || data.students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No attendance data available.</p>
            <p className="text-sm text-gray-500 mt-2">
              Students will appear here once they start scanning their RFID
              cards.
            </p>
            {dateRange?.from && dateRange?.to && (
              <p className="text-xs text-gray-400 mt-4">
                Date Range: {format(dateRange.from, 'MMM dd, yyyy')} to{' '}
                {format(dateRange.to, 'MMM dd, yyyy')}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats + Student Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-t-4 border-blue-600 shadow-lg">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        Total Students
                      </div>
                      <div className="text-4xl font-bold text-blue-600">
                        {data.general.totalStudents}
                      </div>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg
                        className="w-8 h-8 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-green-600 shadow-lg">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        Present Rate
                      </div>
                      <div className="text-4xl font-bold text-green-600">
                        {data.general.presentPercentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {data.general.totalPresent} students
                      </div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-red-600 shadow-lg">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        Absent Rate
                      </div>
                      <div className="text-4xl font-bold text-red-600">
                        {data.general.absentPercentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {data.general.totalAbsent} students
                      </div>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <svg
                        className="w-8 h-8 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Student Detail Selector */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Student Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Select Student
                  </Label>
                  <Select
                    value={selectedStudentId}
                    onValueChange={setSelectedStudentId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.students.map((student) => (
                        <SelectItem
                          key={student.studentId}
                          value={student.studentId}
                        >
                          {student.studentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedStudent && (
                  <>
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-600 mb-1">
                          Total Days
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {selectedStudent.totalDays}
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-600 mb-1">
                          Present
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          {selectedStudent.present}
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-600 mb-1">
                          Attendance
                        </div>
                        <div className="text-xl font-bold text-red-600">
                          {selectedStudent.percentage}%
                        </div>
                      </div>
                    </div>

                    {attendanceBreakdown && (
                      <div className="pt-4 border-t">
                        <div className="text-xs font-semibold text-gray-700 mb-3">
                          Breakdown
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {Object.entries(attendanceBreakdown)
                            .filter(([_, count]) => count > 0)
                            .map(([code, count]) => (
                              <div
                                key={code}
                                className="flex items-center justify-between bg-gray-50 rounded px-2 py-1"
                              >
                                <span className="font-medium text-gray-700">
                                  {code}
                                </span>
                                <span className="text-gray-900 font-semibold">
                                  {count}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Students Leaderboard */}
          <Card className="shadow-lg border-t-4 border-red-800">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-red-800 flex items-center gap-2">
                    <span>🏆</span>
                    Top Performing Students
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Students with highest attendance rates
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {data.students
                  .sort((a, b) => b.percentage - a.percentage)
                  .slice(0, 10)
                  .map((student, index) => (
                    <div
                      key={student.studentId}
                      className={`relative p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-yellow-400 shadow-lg'
                          : index === 1
                            ? 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 border-gray-400 shadow-md'
                            : index === 2
                              ? 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border-orange-400 shadow-md'
                              : 'bg-white border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="absolute -top-3 -left-3 z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-lg ring-2 ring-white ${
                            index === 0
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                              : index === 1
                                ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white'
                                : index === 2
                                  ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                                  : 'bg-gradient-to-br from-red-600 to-red-800 text-white'
                          }`}
                        >
                          {index + 1}
                        </div>
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-3 -right-3 text-3xl animate-bounce">
                          {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                        </div>
                      )}
                      <div className="space-y-4 mt-3">
                        <div className="font-bold text-gray-900 text-base text-center min-h-[2.5rem] flex items-center justify-center">
                          <span className="line-clamp-2">
                            {student.studentName}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-3 py-2">
                          <div
                            className={`text-5xl font-bold ${student.percentage >= 90 ? 'text-green-600' : student.percentage >= 70 ? 'text-yellow-600' : 'text-red-600'}`}
                          >
                            {student.percentage}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${student.percentage >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' : student.percentage >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}
                              style={{ width: `${student.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center bg-green-50 border border-green-200 rounded-lg py-2">
                            <div className="text-gray-600 font-medium">
                              Present
                            </div>
                            <div className="font-bold text-green-700 text-base">
                              {student.present}
                            </div>
                          </div>
                          <div className="text-center bg-blue-50 border border-blue-200 rounded-lg py-2">
                            <div className="text-gray-600 font-medium">
                              Total
                            </div>
                            <div className="font-bold text-blue-700 text-base">
                              {student.totalDays}
                            </div>
                          </div>
                        </div>
                        <div className="text-center pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-600">
                            {student.gradeLevel} - {student.section}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Attendance Table */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Daily Attendance Records
              </CardTitle>
              <CardDescription>
                {data.students.length} student
                {data.students.length !== 1 ? 's' : ''} • {dateColumns.length}{' '}
                days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center">Total Days</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">%</TableHead>
                      {dateColumns.map((date) => (
                        <TableHead
                          key={date}
                          className="text-center min-w-[80px]"
                        >
                          {formatDate(date)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.students.map((student, index) => (
                      <TableRow key={student.studentId}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {student.studentName}
                        </TableCell>
                        <TableCell className="text-center">
                          {student.totalDays}
                        </TableCell>
                        <TableCell className="text-center">
                          {student.present}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              student.percentage >= 90
                                ? 'bg-green-500'
                                : student.percentage >= 70
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }
                          >
                            {student.percentage}%
                          </Badge>
                        </TableCell>
                        {dateColumns.map((date) => {
                          const code = student.dailyAttendance[date] || '-';
                          return (
                            <TableCell key={date} className="text-center">
                              {code !== '-' ? (
                                <Badge
                                  className={`${getAttendanceCodeColor(code)} text-xs px-1 py-0`}
                                  title={getAttendanceCodeLabel(code)}
                                >
                                  {code}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

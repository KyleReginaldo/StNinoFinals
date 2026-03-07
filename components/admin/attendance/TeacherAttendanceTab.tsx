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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Download, RefreshCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Teacher {
  teacherId: string;
  teacherName: string;
  subject: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
  dailyAttendance: Record<string, string>;
  records: any[];
}

interface TeacherAttendanceData {
  general: {
    totalTeachers: number;
    totalPresent: number;
    totalAbsent: number;
    totalDays: number;
    presentPercentage: number;
    absentPercentage: number;
  };
  teachers: Teacher[];
  selectedTeacher: Teacher | null;
  dateRange: {
    start: string;
    end: string;
  };
}

export function TeacherAttendanceTab() {
  const [data, setData] = useState<TeacherAttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedTeacherId) params.append('teacherId', selectedTeacherId);

      const response = await fetch(
        `/api/admin/teacher-attendance?${params.toString()}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        if (!selectedTeacherId && result.data.teachers.length > 0) {
          setSelectedTeacherId(result.data.teachers[0].teacherId);
        }
      }
    } catch (error) {
      console.error('Error fetching teacher attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate, selectedTeacherId]);

  const selectedTeacher = useMemo(() => {
    if (!data || !selectedTeacherId) return null;
    return (
      data.teachers.find((t) => t.teacherId === selectedTeacherId) ||
      data.selectedTeacher
    );
  }, [data, selectedTeacherId]);

  const dateRange = useMemo(() => {
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
      case 'HO':
        return 'bg-gray-400 text-white';
      case 'VA':
        return 'bg-blue-400 text-white';
      case 'CR':
        return 'bg-purple-400 text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  const getAttendanceCodeLabel = (code: string) => {
    const codes: Record<string, string> = {
      PR: 'Present',
      AC: 'Absent - Coded',
      LA: 'Late',
      HO: 'Holiday',
      VA: 'Vacation',
      CR: 'Credit',
      EA: 'Early Absent',
      DA: 'Day Absent',
      SU: 'Suspended',
      O: 'Other',
    };
    return codes[code] || code;
  };

  const exportToCSV = () => {
    if (!data || !data.teachers.length) return;
    const dates: string[] = [];
    if (data.dateRange.start && data.dateRange.end) {
      const start = new Date(data.dateRange.start);
      const end = new Date(data.dateRange.end);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().split('T')[0]);
      }
    }
    const headers = [
      '#',
      'Name',
      'Subject',
      'Total Days',
      'Present',
      'Absent',
      'Late',
      '%',
      ...dates.map((d) => formatDate(d)),
    ];
    const rows = [headers];
    data.teachers.forEach((teacher, index) => {
      rows.push([
        (index + 1).toString(),
        teacher.teacherName,
        teacher.subject || 'N/A',
        teacher.totalDays.toString(),
        teacher.present.toString(),
        teacher.absent.toString(),
        teacher.late.toString(),
        `${teacher.percentage}%`,
        ...dates.map((date) => teacher.dailyAttendance[date] || '-'),
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
    link.setAttribute(
      'download',
      `teacher-attendance-report-${startDate}-to-${endDate}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 animate-spin mx-auto mb-4 text-red-800" />
          <p className="text-gray-600">Loading teacher attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-red-800">
          Teacher Attendance Analytics
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="ta-startDate" className="text-sm whitespace-nowrap">
              Start:
            </Label>
            <Input
              id="ta-startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="ta-endDate" className="text-sm whitespace-nowrap">
              End:
            </Label>
            <Input
              id="ta-endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {data && data.teachers.length > 0 && (
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="bg-green-50 hover:bg-green-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {!data || data.teachers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">
              No teacher attendance data available.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Teachers will appear here once they start scanning their RFID
              cards.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* General Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donut Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-red-800">
                  GENERAL ATTENDANCE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {data.general.absentPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Absent</div>
                  </div>
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - data.general.presentPercentage / 100)}`}
                        className="text-green-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {data.general.presentPercentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Present</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {data.general.presentPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Present</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Teacher Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-800">SELECTED TEACHER</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedTeacherId}
                  onValueChange={setSelectedTeacherId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.teachers.map((teacher) => (
                      <SelectItem
                        key={teacher.teacherId}
                        value={teacher.teacherId}
                      >
                        {teacher.teacherName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTeacher && (
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Days:</span>
                      <span className="font-semibold">
                        {selectedTeacher.totalDays}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Present:</span>
                      <span className="font-semibold text-green-600">
                        {selectedTeacher.present}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Absent:</span>
                      <span className="font-semibold text-red-600">
                        {selectedTeacher.absent}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Late:</span>
                      <span className="font-semibold text-yellow-600">
                        {selectedTeacher.late}
                      </span>
                    </div>
                    <div className="mt-4 p-3 bg-orange-100 rounded-lg text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {selectedTeacher.percentage}%
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Attendance Rate
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Selected Teacher Breakdown */}
          {selectedTeacher && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-800">
                  {selectedTeacher.teacherName} - Attendance Breakdown
                </CardTitle>
                <CardDescription>
                  Subject: {selectedTeacher.subject}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    {
                      key: 'PR',
                      label: 'PR (Present)',
                      value: selectedTeacher.present,
                      color: 'green',
                    },
                    {
                      key: 'AC',
                      label: 'AC (Absent)',
                      value: selectedTeacher.absent,
                      color: 'red',
                    },
                    {
                      key: 'LA',
                      label: 'LA (Late)',
                      value: selectedTeacher.late,
                      color: 'yellow',
                    },
                    {
                      key: 'HO',
                      label: 'HO (Holiday)',
                      value: 0,
                      color: 'gray',
                    },
                    {
                      key: 'VA',
                      label: 'VA (Vacation)',
                      value: 0,
                      color: 'gray',
                    },
                    {
                      key: 'CR',
                      label: 'CR (Credit)',
                      value: 0,
                      color: 'gray',
                    },
                  ].map(({ key, label, value, color }) => (
                    <div
                      key={key}
                      className={`text-center p-3 bg-${color}-50 rounded-lg`}
                    >
                      <div className={`text-2xl font-bold text-${color}-600`}>
                        {value}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-800">
                ATTENDANCE PERCENTAGE BY TEACHER
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.teachers.slice(0, 10).map((teacher) => (
                  <div
                    key={teacher.teacherId}
                    className="flex items-center space-x-4"
                  >
                    <div className="w-32 text-sm text-gray-700 truncate">
                      {teacher.teacherName}
                    </div>
                    <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full ${teacher.percentage >= 90 ? 'bg-green-500' : teacher.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'} transition-all duration-500`}
                        style={{ width: `${teacher.percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-900">
                          {teacher.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-800">
                DAILY ATTENDANCE RECORDS
              </CardTitle>
              <CardDescription>
                Showing attendance for {data.teachers.length} teacher
                {data.teachers.length !== 1 ? 's' : ''}
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
                      {dateRange.map((date) => (
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
                    {data.teachers.map((teacher, index) => (
                      <TableRow key={teacher.teacherId}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {teacher.teacherName}
                        </TableCell>
                        <TableCell className="text-center">
                          {teacher.totalDays}
                        </TableCell>
                        <TableCell className="text-center">
                          {teacher.present}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              teacher.percentage >= 90
                                ? 'bg-green-500'
                                : teacher.percentage >= 70
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }
                          >
                            {teacher.percentage}%
                          </Badge>
                        </TableCell>
                        {dateRange.map((date) => {
                          const code = teacher.dailyAttendance[date] || '-';
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

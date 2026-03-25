'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  GraduationCap,
  Layers,
  Printer,
  Search,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  student_number: string;
  gender: string | null;
  email: string | null;
}

interface SectionData {
  section: string;
  students: Student[];
}

interface GradeData {
  grade: string;
  sections: SectionData[];
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-3 px-4"><div className="h-4 w-6 rounded bg-gray-200" /></td>
      <td className="py-3 px-4"><div className="h-8 w-8 rounded-full bg-gray-200" /></td>
      <td className="py-3 px-4"><div className="h-4 w-40 rounded bg-gray-200" /></td>
      <td className="py-3 px-4"><div className="h-4 w-20 rounded bg-gray-200" /></td>
      <td className="py-3 px-4"><div className="h-4 w-14 rounded bg-gray-100" /></td>
      <td className="py-3 px-4"><div className="h-4 w-36 rounded bg-gray-100" /></td>
    </tr>
  );
}

function SkeletonBlock() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-white p-5">
            <div className="h-4 w-20 rounded bg-gray-200 mb-3" />
            <div className="h-7 w-14 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border bg-white overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gray-200" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-3 w-16 rounded bg-gray-100" />
            </div>
          </div>
          <div className="px-5 pb-5">
            <table className="w-full">
              <tbody>
                {[1, 2, 3, 4].map((j) => <SkeletonRow key={j} />)}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function StudentAvatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  const colors = [
    'bg-red-100 text-red-700',
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-amber-100 text-amber-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-teal-100 text-teal-700',
    'bg-indigo-100 text-indigo-700',
  ];
  const colorIndex =
    ((firstName?.charCodeAt(0) ?? 0) + (lastName?.charCodeAt(0) ?? 0)) % colors.length;

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${colors[colorIndex]}`}
    >
      {initials}
    </div>
  );
}

function formatGender(gender: string | null) {
  if (!gender) return '—';
  const g = gender.toLowerCase();
  if (g === 'm' || g === 'male') return 'Male';
  if (g === 'f' || g === 'female') return 'Female';
  return gender;
}

export default function ClassListPage() {
  const [data, setData] = useState<GradeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [collapsedGrades, setCollapsedGrades] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/class-list');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch class list', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleGrade = (grade: string) => {
    setCollapsedGrades((prev) => {
      const next = new Set(prev);
      if (next.has(grade)) next.delete(grade);
      else next.add(grade);
      return next;
    });
  };

  const filteredData = useMemo(() => {
    let result = data;

    if (selectedGrade !== 'all') {
      result = result.filter((g) => g.grade === selectedGrade);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result
        .map((gradeGroup) => ({
          ...gradeGroup,
          sections: gradeGroup.sections
            .map((section) => ({
              ...section,
              students: section.students.filter(
                (s) =>
                  s.first_name.toLowerCase().includes(q) ||
                  s.last_name.toLowerCase().includes(q) ||
                  (s.middle_name && s.middle_name.toLowerCase().includes(q)) ||
                  s.student_number?.toLowerCase().includes(q) ||
                  (s.email && s.email.toLowerCase().includes(q)) ||
                  `${s.last_name}, ${s.first_name}`.toLowerCase().includes(q)
              ),
            }))
            .filter((section) => section.students.length > 0),
        }))
        .filter((gradeGroup) => gradeGroup.sections.length > 0);
    }

    return result;
  }, [data, selectedGrade, search]);

  const stats = useMemo(() => {
    const totalStudents = data.reduce(
      (acc, g) => acc + g.sections.reduce((a, s) => a + s.students.length, 0),
      0
    );
    const totalSections = data.reduce((acc, g) => acc + g.sections.length, 0);
    const totalGrades = data.length;
    return { totalStudents, totalSections, totalGrades };
  }, [data]);

  const filteredStudentCount = useMemo(() => {
    return filteredData.reduce(
      (acc, g) => acc + g.sections.reduce((a, s) => a + s.students.length, 0),
      0
    );
  }, [filteredData]);

  return (
    <div className="p-4 md:p-6 space-y-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class List</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            View all students organized by grade level and section.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="self-start sm:self-auto"
          onClick={() => window.print()}
        >
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>

      {loading ? (
        <SkeletonBlock />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.totalStudents}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-red-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Grade Levels</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.totalGrades}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Sections</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.totalSections}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, student number, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>

          {/* Grade Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGrade('all')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedGrade === 'all'
                  ? 'bg-red-800 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Grades
            </button>
            {data.map((g) => (
              <button
                key={g.grade}
                onClick={() => setSelectedGrade(g.grade)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedGrade === g.grade
                    ? 'bg-red-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {g.grade}
              </button>
            ))}
          </div>

          {/* Results info */}
          {search.trim() && (
            <p className="text-sm text-gray-500">
              Found{' '}
              <span className="font-semibold text-gray-700">{filteredStudentCount}</span>{' '}
              student{filteredStudentCount !== 1 ? 's' : ''} matching &quot;{search}&quot;
            </p>
          )}

          {/* Class List Content */}
          {filteredData.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">No results found</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  {search.trim()
                    ? "Try adjusting your search or filter to find what you're looking for."
                    : 'No active classes or students found.'}
                </p>
                {search.trim() && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearch('');
                      setSelectedGrade('all');
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredData.map((gradeGroup) => {
                const isCollapsed = collapsedGrades.has(gradeGroup.grade);
                const gradeStudentCount = gradeGroup.sections.reduce(
                  (a, s) => a + s.students.length,
                  0
                );

                return (
                  <div
                    key={gradeGroup.grade}
                    className="rounded-xl border bg-white shadow-sm overflow-hidden"
                  >
                    {/* Grade Header */}
                    <button
                      onClick={() => toggleGrade(gradeGroup.grade)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-red-800 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-base font-semibold text-gray-900">
                            {gradeGroup.grade}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {gradeGroup.sections.length} section
                            {gradeGroup.sections.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-red-50 text-red-800 border-red-200 hover:bg-red-50">
                          {gradeStudentCount} student
                          {gradeStudentCount !== 1 ? 's' : ''}
                        </Badge>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            isCollapsed ? '-rotate-90' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Sections - Full Width Tables */}
                    <div
                      className={`transition-all duration-200 ease-in-out ${
                        isCollapsed ? 'max-h-0 overflow-hidden' : 'max-h-[10000px]'
                      }`}
                    >
                      <div className="px-5 pb-5 space-y-5">
                        {gradeGroup.sections.map((sectionGroup) => (
                          <div
                            key={`${gradeGroup.grade}-${sectionGroup.section}`}
                            className="rounded-lg border border-gray-200 overflow-hidden"
                          >
                            {/* Section Header */}
                            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-semibold text-gray-700">
                                  Section {sectionGroup.section}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                {sectionGroup.students.length} student
                                {sectionGroup.students.length !== 1 ? 's' : ''}
                              </span>
                            </div>

                            {/* Student Table - Full Width */}
                            {sectionGroup.students.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b bg-gray-50/50">
                                      <th className="text-left py-2.5 px-5 font-medium text-gray-500 w-12">
                                        #
                                      </th>
                                      <th className="text-left py-2.5 px-3 font-medium text-gray-500 w-12" />
                                      <th className="text-left py-2.5 px-3 font-medium text-gray-500">
                                        Student Name
                                      </th>
                                      <th className="text-left py-2.5 px-3 font-medium text-gray-500">
                                        Student No.
                                      </th>
                                      <th className="text-left py-2.5 px-3 font-medium text-gray-500">
                                        Gender
                                      </th>
                                      <th className="text-left py-2.5 px-3 font-medium text-gray-500">
                                        Email
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sectionGroup.students.map((student, idx) => (
                                      <tr
                                        key={student.id}
                                        className={`border-b last:border-0 transition-colors hover:bg-gray-50 ${
                                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                        }`}
                                      >
                                        <td className="py-3 px-5 text-xs text-gray-400 tabular-nums">
                                          {idx + 1}
                                        </td>
                                        <td className="py-3 px-3">
                                          <StudentAvatar
                                            firstName={student.first_name}
                                            lastName={student.last_name}
                                          />
                                        </td>
                                        <td className="py-3 px-3">
                                          <div>
                                            <p className="font-medium text-gray-900">
                                              {student.last_name}, {student.first_name}
                                              {student.middle_name
                                                ? ` ${student.middle_name.charAt(0)}.`
                                                : ''}
                                            </p>
                                          </div>
                                        </td>
                                        <td className="py-3 px-3 text-gray-600 tabular-nums">
                                          {student.student_number || (
                                            <span className="text-gray-300">—</span>
                                          )}
                                        </td>
                                        <td className="py-3 px-3">
                                          {student.gender ? (
                                            <Badge
                                              variant="secondary"
                                              className={`text-xs font-normal ${
                                                student.gender.toLowerCase() === 'male' ||
                                                student.gender.toLowerCase() === 'm'
                                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                  : 'bg-pink-50 text-pink-700 border-pink-200'
                                              }`}
                                            >
                                              {formatGender(student.gender)}
                                            </Badge>
                                          ) : (
                                            <span className="text-gray-300">—</span>
                                          )}
                                        </td>
                                        <td className="py-3 px-3 text-gray-500 text-xs">
                                          {student.email || (
                                            <span className="text-gray-300">—</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="p-8 text-center text-sm text-gray-400">
                                No students enrolled in this section
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

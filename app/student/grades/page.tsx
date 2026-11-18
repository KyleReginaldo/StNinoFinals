'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/format-date';
import { defaultSchoolYear, gradeAverage, PASSING_GRADE } from '@/lib/grades';
import { useRefresh } from '@/lib/refresh-context';
import { ClipboardList, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useStudentAuth } from '../hooks/useStudentAuth';
import { type ApprovedGrade, useActiveSchoolYear, useApprovedGrades } from '../hooks/useStudentRecords';

const passing = (g: number) => g >= PASSING_GRADE;

export default function GradesPage() {
  const { student, isLoading } = useStudentAuth();
  const { refreshKey } = useRefresh();
  const grades = useApprovedGrades(student?.id ? String(student.id) : undefined, refreshKey);
  const activeYear = useActiveSchoolYear();

  // null = "follow the default" until the student picks something
  const [pickedYear, setPickedYear] = useState<string | null>(null);
  const [quarter, setQuarter] = useState('all');

  const years = useMemo(
    () => [...new Set((grades ?? []).map((g) => g.school_year).filter(Boolean) as string[])].sort().reverse(),
    [grades]
  );
  const year = pickedYear ?? (defaultSchoolYear(years, activeYear) || 'all');
  const inYear = (grades ?? []).filter((g) => year === 'all' || g.school_year === year);
  const quarters = [...new Set(inYear.map((g) => g.quarter).filter((q) => q != null))].sort() as number[];
  const shown = inYear.filter((g) => quarter === 'all' || String(g.quarter) === quarter);

  // school year → quarter → grades, newest year first
  const groups = useMemo(() => {
    const byYear = new Map<string, Map<number | null, ApprovedGrade[]>>();
    for (const g of shown) {
      const y = g.school_year ?? 'Unassigned';
      const q = g.quarter ?? null;
      const quarterMap = byYear.get(y) ?? new Map<number | null, ApprovedGrade[]>();
      quarterMap.set(q, [...(quarterMap.get(q) ?? []), g]);
      byYear.set(y, quarterMap);
    }
    return [...byYear.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [shown]);

  const average = gradeAverage(shown.map((g) => g.grade));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-800 border-t-transparent" />
      </div>
    );
  }
  if (!student) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Grades</h2>
          <p className="text-sm text-gray-500 mt-0.5">Your approved grades, including past school years.</p>
        </div>
        <Link
          href="/student/reports"
          className="inline-flex items-center gap-2 text-sm font-medium text-red-800 hover:text-red-700 hover:underline underline-offset-2"
        >
          <ClipboardList className="w-4 h-4" />
          Report card and downloads
        </Link>
      </div>

      {grades !== null && grades.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
            School year
            <Select value={year} onValueChange={(v) => { setPickedYear(v); setQuarter('all'); }}>
              <SelectTrigger className="w-40 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All school years</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>S.Y. {y}{y === activeYear ? ' (current)' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
            Quarter
            <Select value={quarter} onValueChange={setQuarter}>
              <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All quarters</SelectItem>
                {quarters.map((q) => (
                  <SelectItem key={q} value={String(q)}>Quarter {q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
      )}

      {grades === null ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-800 border-t-transparent mx-auto" />
          <p className="text-gray-500 mt-3 text-sm">Loading grades...</p>
        </div>
      ) : grades.length === 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden />
            <p className="text-gray-600 font-medium">No grades yet</p>
            <p className="text-sm text-gray-400 mt-1">Grades appear here once your teachers submit them and the school approves them.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {shown.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-gray-500">Grades shown</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{shown.length}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-gray-500">Average</p>
                  <p className={`text-3xl font-bold mt-1 ${average !== null && !passing(average) ? 'text-red-700' : 'text-gray-900'}`}>
                    {average ?? '—'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {groups.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">No grades match these choices.</p>
          ) : (
            groups.map(([schoolYear, quarterMap]) => (
              <section key={schoolYear} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  S.Y. {schoolYear}
                  {schoolYear === activeYear && <span className="ml-2 text-xs font-medium text-red-800">Current</span>}
                </h3>
                {[...quarterMap.entries()]
                  .sort(([a], [b]) => (a ?? 99) - (b ?? 99))
                  .map(([q, items]) => {
                    const qAvg = gradeAverage(items.map((g) => g.grade));
                    return (
                      <Card key={q ?? 'none'} className="bg-white border border-gray-200">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{q ? `Quarter ${q}` : 'Quarter not set'}</CardTitle>
                            {qAvg !== null && (
                              <span className={`text-sm font-bold ${passing(qAvg) ? 'text-gray-800' : 'text-red-700'}`}>Average {qAvg}</span>
                            )}
                          </div>
                          <CardDescription>{items.length} subject{items.length !== 1 ? 's' : ''}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="divide-y divide-gray-100">
                            {items.map((g) => {
                              const num = parseFloat(g.grade);
                              return (
                                <div key={g.id} className="flex items-center justify-between py-3 px-1">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{g.subject}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Updated {formatDate(g.lastUpdated)}</p>
                                  </div>
                                  <span className={`ml-4 text-2xl font-bold tabular-nums ${passing(num) ? 'text-gray-900' : 'text-red-700'}`}>{g.grade}</span>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </section>
            ))
          )}
        </>
      )}
    </div>
  );
}

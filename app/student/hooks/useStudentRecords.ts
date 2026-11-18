'use client';

import { getActiveSchoolYear } from '@/lib/school-year';
import { useEffect, useState } from 'react';

export interface ApprovedGrade {
  id: string;
  subject: string;
  grade: string;
  lastUpdated: string;
  quarter: number | null;
  school_year: string | null;
}

/** All of a student's approved grades, every school year (null while loading). */
export function useApprovedGrades(studentId: string | undefined, refreshKey = 0) {
  const [grades, setGrades] = useState<ApprovedGrade[] | null>(null);
  useEffect(() => {
    if (!studentId) return;
    let ignore = false;
    fetch(`/api/parent/student-grades?student_id=${studentId}`)
      .then((r) => r.json())
      .then((d) => !ignore && setGrades(d?.success ? d.grades ?? [] : []))
      .catch(() => !ignore && setGrades([]));
    return () => {
      ignore = true;
    };
  }, [studentId, refreshKey]);
  return grades;
}

/** The school year that is open right now (falls back to the calendar guess if the call fails). */
export function useActiveSchoolYear() {
  const [year, setYear] = useState(getActiveSchoolYear());
  useEffect(() => {
    fetch('/api/active-period')
      .then((r) => r.json())
      .then((d) => d?.success && d.schoolYear && setYear(d.schoolYear))
      .catch(() => {});
  }, []);
  return year;
}

/** Enrollment requests (any status), used to know which grade level a past school year was. */
export function useEnrollmentHistory(studentId: string | undefined) {
  const [history, setHistory] = useState<{ school_year: string; grade_level: string; status: string }[]>([]);
  useEffect(() => {
    if (!studentId) return;
    let ignore = false;
    fetch(`/api/student/enrollment-history?studentId=${studentId}`)
      .then((r) => r.json())
      .then((d) => !ignore && setHistory(d?.success ? d.data ?? [] : []))
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [studentId]);
  return history;
}

/**
 * Philippine school year: starts June, ends April.
 *
 * getActiveSchoolYear()     — for grades, classes, reports, attendance
 *   Jan–May  → (year-1)–year
 *   Jun–Dec  → year–(year+1)
 *
 * getEnrollmentSchoolYear() — for enrollment requests
 *   Jan–Feb  → (year-1)–year   (finishing current SY)
 *   Mar–Dec  → year–(year+1)   (preparing for next SY)
 */

export function getActiveSchoolYear(date: Date = new Date()): string {
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();
  return month >= 6
    ? `${year}-${year + 1}`
    : `${year - 1}-${year}`;
}

export function getEnrollmentSchoolYear(date: Date = new Date()): string {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return month <= 2
    ? `${year - 1}-${year}`
    : `${year}-${year + 1}`;
}

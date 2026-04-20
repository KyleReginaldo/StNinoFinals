# StNinoFinals — Feature Implementation Plan

_Date: 2026-04-17 | Branch: main_

---

## 1. Change "Semester" → "Quarter" (Global Rename)

**Scope:** DB schema + all UI/API references.

**Files affected:**
- `database.types.ts` — update type definitions
- `app/admin/classes/page.tsx` — form field label + value options
- `app/api/teacher/schedule/route.ts` — response field
- `app/api/admin/enrollment-requests/route.ts` — query/insert
- `app/student/enrollment/page.tsx` — display label
- Any other files grep-matching `semester`

**Steps:**
1. Write migration SQL to rename column `classes.semester → classes.quarter` and `enrollment_requests.semester → enrollment_requests.quarter`. Update CHECK constraint to allow values `1 | 2 | 3 | 4`.
2. Regenerate `database.types.ts` from Supabase.
3. Global find-and-replace `semester` → `quarter` in all TypeScript/TSX (preserve intent — e.g. "1st Semester" becomes "1st Quarter").
4. Update dropdown options in class creation form: `[Q1, Q2, Q3, Q4]`.
5. Update enrollment request form and display labels.

---

## 2. ADMIN — Weekly Attendance Date Range

**Current state:** `app/admin/attendance-reports/page.tsx` has a date-range filter and CSV export but no "weekly" shortcut.

**Goal:** Add preset quick-select buttons (This Week, Last Week, custom range) and ensure the date range query in `app/api/admin/attendance-reports/route.ts` correctly handles week boundaries.

**Steps:**
1. Add "This Week" / "Last Week" shortcut buttons above the existing date pickers in `app/admin/attendance-reports/page.tsx`. Use `date-fns` (`startOfWeek`, `endOfWeek`, `subWeeks`) — already in dependencies.
2. Verify the existing API route filters by `attendance_records.scanned_at` between `from` and `to` dates (inclusive). Add time-of-day clamping (`00:00:00` → `23:59:59`) if not already done.
3. No DB changes needed.

---

## 3. ADMIN — Population Report (Downloadable PDF)

**Current state:** No population PDF exists. jsPDF + jspdf-autotable are already installed.

**Goal:** A page/modal that shows student count by grade level (and section), with a "Download PDF" button.

**Files to create/edit:**
- `app/admin/reports/population/page.tsx` _(new)_
- `app/api/admin/reports/population/route.ts` _(new)_

**Steps:**
1. **API route:** Query `enrollment_requests` (status = `approved`) joined with `users` grouped by `grade_level` and filtered by `school_year`. Return counts per grade level and grand total.
2. **Page:** Table showing Grade Level | Male | Female | Total. Filter by Academic Year (dropdown of distinct `school_year` values from `classes`).
3. **PDF export:** Use `jsPDF` + `jspdf-autotable`. Include school name header, academic year, generation date, and the table. Match existing PDF style from `app/student/grades/page.tsx`.
4. Add link to this page from the admin sidebar/nav.

---

## 4. ADMIN — Grade Level Population Filter by Academic Year

**Goal:** On the population report (item 3) AND on `app/admin/students/page.tsx`, add a filter that lets admin view student counts or lists filtered by both grade level and academic year simultaneously.

**Steps:**
1. In population report page (item 3), add a `grade_level` multi-select filter alongside the `school_year` dropdown.
2. In `app/admin/students/page.tsx`, confirm the existing grade level filter also reads `school_year` from enrollment data — if not, add a `school_year` dropdown that re-queries `enrollment_requests` for enrolled students in that year.
3. API route for population report should accept optional `grade_level` query param.

---

## 5. ADMIN — Class Management: No Double-Booking (Room + Time Conflict Detection)

**Current state:** `app/admin/classes/page.tsx` allows free-text room and arbitrary schedule JSON. No conflict detection exists.

**Goal:** Prevent two classes from sharing the same room at overlapping times in the same academic year/quarter.

**Files affected:**
- `app/api/admin/classes/route.ts` — add conflict check on POST/PATCH
- `app/admin/classes/page.tsx` — show conflict error in form

**Steps:**
1. **Conflict check in API (POST + PATCH):**
   - When saving a class, fetch all other active classes with the same `room` and `school_year`.
   - Parse each class's `schedule` JSON. For each day/time slot in the new class, check for time overlap with existing classes.
   - Overlap condition: `newStart < existingEnd && newEnd > existingStart`.
   - Return HTTP 409 with a descriptive message listing conflicting class names if overlap found.
2. **UI error handling:** Display the 409 error message inline in the class form (below the schedule field).
3. Write a helper `checkScheduleConflict(newClass, existingClasses)` in `lib/scheduleUtils.ts` (new file) so the same logic can be reused on the client for real-time feedback.

---

## 6. ADMIN — Dropdown of Available Rooms and Times

**Goal:** Replace free-text room input with a dropdown showing only rooms not already booked at the selected time slot.

**Steps:**
1. Add a `rooms` table in Supabase OR hardcode a list of room names in a config file (`lib/rooms.ts`). Start with config — migrate to DB later if room inventory changes often.
2. In `app/admin/classes/page.tsx`, when the user selects a day + time slot in the schedule builder:
   - Call a new endpoint `GET /api/admin/classes/available-rooms?day=Monday&timeStart=08:00&timeEnd=09:00&school_year=2025-2026&quarter=Q1&exclude_class_id=xxx`
   - This endpoint queries existing classes, parses their schedules, and returns rooms NOT in conflict.
3. Render result as a `<Select>` dropdown. Rooms already taken show as disabled with a tooltip ("Taken by [Class Name]").

---

## 7. ADMISSION — Default Phone Number Format +63

**Current state:** Unknown — need to check admission form fields.
**File to check:** `app/admin/admissions/page.tsx` and any admission form components.

**Goal:** Phone number input fields default to `+63` prefix and validate Philippine mobile format (`+63XXXXXXXXXX`, 10 digits after prefix).

**Steps:**
1. Find all phone/contact number `<input>` fields in the admission flow.
2. Set `defaultValue="+63"` and add a Zod validator: `z.string().regex(/^\+63\d{10}$/, "Enter a valid PH number")`.
3. On the input, use a masked input or prefix display so the `+63` is visually locked (user types the 10 digits only).
4. Apply same pattern to parent/guardian contact fields if present.

---

## 8. STUDENT — Alphanumeric Password Required

**Current state:** Password validation is unknown — check auth/signup flow.
**Files to check:** `app/api/auth/` routes, any student registration form.

**Goal:** Enforce that passwords contain at least one letter AND one number (alphanumeric).

**Steps:**
1. Locate password validation in the student registration/change-password form.
2. Add Zod rule: `z.string().min(8).regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "Password must contain letters and numbers")`.
3. Apply the same regex server-side in the relevant API route.
4. Show inline helper text: _"Password must be at least 8 characters and include a letter and a number."_

---

## 9. STUDENT — Passing/Failing Grade Color Coding

**Current state:** `app/student/grades/page.tsx` shows grades as plain text.

**Goal:** Grades ≥ 75 (passing) highlight in yellow; grades < 75 (failing) highlight in red.

**Steps:**
1. In `app/student/grades/page.tsx`, find the grade cell render logic.
2. Add a helper: 
   ```ts
   function gradeColor(grade: number) {
     if (grade >= 75) return "bg-yellow-100 text-yellow-800";
     return "bg-red-100 text-red-800";
   }
   ```
3. Apply class to the table cell `<td>` or badge displaying the numeric grade.
4. Also apply to the teacher grade submission view (`app/teacher/grades/page.tsx`) and admin grade approval (`app/admin/grades/page.tsx`) for consistency.

---

## 10. STUDENT — Grades History (Quarter × Academic Year)

**Current state:** `app/student/grades/page.tsx` shows approved grades but no quarter/year drill-down.

**Goal:** Student can select Academic Year → then see grades grouped by Quarter (Q1–Q4), with subject, grade, and status per quarter.

**Steps:**
1. **API update:** Modify `app/api/grades/route.ts` (student-side) to return `quarter` and `school_year` fields from the `grades` table.
2. **UI restructure in `app/student/grades/page.tsx`:**
   - Add `school_year` dropdown (distinct years from returned grades).
   - Group grades by `quarter` → tabs or accordion: Q1 | Q2 | Q3 | Q4.
   - Each quarter shows: Subject | Grade (color-coded per item 9) | Status.
   - Show GPA per quarter + cumulative GPA.
3. The existing `quarter` column already exists in the `grades` table (per `add-quarter-class-to-grades.sql`).

---

## 11. TEACHER — Printable Population Report with Graph

**Current state:** Teacher has a dashboard with student count but no printable report.

**Goal:** A "Print / Download PDF" button on the teacher dashboard or a dedicated `/teacher/reports` page that shows:
- List of teacher's classes with student count per class.
- A bar chart (student count by class).
- Downloadable as PDF.

**Files to create/edit:**
- `app/teacher/reports/page.tsx` _(new)_
- `app/api/teacher/reports/route.ts` _(new)_ or extend existing teacher stats endpoint

**Steps:**
1. **API:** For logged-in teacher, query `classes` joined with `class_enrollments` → return `{ class_name, grade_level, section, student_count }[]`.
2. **Page:** Render a `<BarChart>` (Recharts — already installed) with class names on x-axis and student count on y-axis.
3. **PDF export:** Use `jsPDF` — render the table manually + use `html2canvas` on the chart div OR render chart data as a simple bar using jsPDF drawing primitives (avoid extra deps).
4. Include school year filter. Include teacher name + date generated in PDF header.

---

## Implementation Order (Priority)

| # | Feature | Effort | Priority |
|---|---------|--------|----------|
| 1 | Semester → Quarter global rename | Medium | **High** (blocks all quarter-related features) |
| 9 | Grade color coding (yellow/red) | Low | **High** (quick win, visual) |
| 10 | Student grades history by quarter/year | Medium | **High** |
| 2 | Weekly attendance date range shortcut | Low | High |
| 5 | Class double-booking conflict detection | Medium | High |
| 6 | Available rooms dropdown | Medium | Medium |
| 3 | Population report PDF | Medium | Medium |
| 4 | Grade level × academic year filter | Low | Medium |
| 7 | Admission +63 phone default | Low | Medium |
| 8 | Alphanumeric password validation | Low | Medium |
| 11 | Teacher printable population + graph | Medium | Medium |

---

## Database Migrations Required

```sql
-- 1. Rename semester → quarter in classes
ALTER TABLE classes RENAME COLUMN semester TO quarter;

-- 2. Rename semester → quarter in enrollment_requests
ALTER TABLE enrollment_requests RENAME COLUMN semester TO quarter;

-- 3. Update quarter to support Q1-Q4 values (if currently 1-2)
-- Check existing constraint and update as needed
```

---

## Notes

- "once na" under class management is interpreted as: once a room+time is booked, it cannot be double-booked (items 5 & 6 address this).
- All PDF exports should follow the style established in `app/student/grades/page.tsx`.
- Recharts is already available for graphs — no new chart library needed.
- Supabase client is split: `lib/supabaseClient.ts` (browser) and `lib/supabaseAdmin.ts` (server/API routes) — use accordingly.

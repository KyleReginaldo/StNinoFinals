# CRF Client Feedback (Batch 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the bugs and ship the changes clients reported in `CRF.xlsx` (rows 4–25), ordered by risk and dependency.

**Architecture:** Bugs first, then the Kinder/LRN data rules (they touch validation shared by 3 APIs), then guardian/address forms, then pure UI. Each rule that more than one form/API enforces moves into one `lib/` helper with a vitest test; UI-only items are verified in the browser.

**Tech Stack:** Next.js 16 app router, Supabase (`getSupabaseAdmin()`), Tailwind/shadcn, vitest (`npm test`), jsPDF, exceljs.

**Spec:** `CRF.xlsx` (Sheet1). Row numbers below (`#n`) are spreadsheet rows.

## Strategy

| Phase | Items | Why this order |
|---|---|---|
| A. Bugs | #18/#19 sections, #13 calendar | Clients are blocked today; small, isolated fixes |
| B. Data rules | #8 Kinder, #4/#11 LRN | Shared validators; must land before form work that reuses them |
| C. Guardian | #12 tagging confirm, #10/#14/#15 address + required | One migration, one form pass per page |
| D. UI polish | #5, #6, #20, #16, #7, #9, #17 | Independent, low risk, parallelizable |
| Deferred | #22, #23, #24 need client confirmation; #25 needs server auth (separate plan) | Don't build on unconfirmed or unsafe ground |

## Decisions taken (defaults — change before execution if wrong)

1. **LRN stays 12 digits** (#11 says "11 ata" — DepEd LRN is 12; already enforced in d1416e5).
2. **One `Kinder` level**, LRN optional only for `Kinder` (#4). Client mentioned "Kinder 2" — if the school has Kinder 1 / Kinder 2, Task 3's list becomes `['Kinder 1','Kinder 2', ...]` and `lrnRequired` returns false only for `Kinder 1`.
3. **No-LRN student → `student_number = null`.** Approve route already allows it (`app/api/admissions/approve/route.ts:198`); login is by email.
4. **Canonical grade values are `Kinder`, `Grade 1`…`Grade 12`.** The landing form currently stores `kindergarten`/`grade1`, which approval copies into `users.grade_level` unchanged — a latent bug that breaks section lookups. Task 3 normalizes it.

## Global Constraints

- Canonical grade strings: `Kinder`, `Grade 1` … `Grade 12`.
- LRN format: `/^\d{12}$/`.
- Room/class slot latest end time: `17:00`.
- Brand red: CSS `--primary: 0 70% 35%`; PDF/email maroon `#4d1116` → RGB `[77,17,22]`.
- No new dependencies. Migrations go in `migrations/*.sql`, idempotent (`IF NOT EXISTS`).

## Review Focus

1. Section added for the **active** school year shows up in Students add/edit dropdown and Add Subject dropdown without a page reload of a different tab — Task 1.
2. Landing admission for Kinder with **blank LRN** succeeds; Grade 1 with blank LRN is rejected with the same message client and server — Task 4.
3. Existing rows with `grade_level = 'grade1'`/`'kindergarten'` still display and sort correctly after the change — Task 3 backfill + `normalizeGradeLevel` test.
4. Class slot ending at exactly `17:00` is accepted; `17:01` and `end <= start` are rejected by the **server**, not just the input — Task 9.
5. Guardian enters a wrong LRN in the tag dialog → sees "No student found", nothing is saved — Task 5.

---

## Phase A — Bugs

### Task 1: Sections from one source (#18, #19)

Root cause: `app/admin/students/page.tsx:271-285` and `app/admin/classes/page.tsx:120-131` read the frozen `system_settings.gradeSections` blob via `/api/admin/settings/sections`; Admin › Sections writes the `sections` table.

**Files:**
- Modify: `app/admin/students/page.tsx:271-285` (fetch), `:736`, `:1032` (dropdowns)
- Modify: `app/admin/classes/page.tsx:120-131`, `:710`
- Modify: `lib/refresh-context.tsx:18-30`
- Modify: `app/admin/sections/page.tsx` (`FormalSectionsPanel` add handler ~`:640-660`)
- Delete: `TemplateSectionsPanel` (`app/admin/sections/page.tsx:31-200`, never rendered)

**Interfaces:**
- Consumes: `GET /api/admin/sections?schoolYear=Y` → `{ success, sections: {id,name,grade_level,strand,...}[] }`; `getActiveSchoolYear()` from `lib/school-year.ts`.
- Produces: nothing new.

- [ ] **Step 1:** In both pages replace the settings fetch with `/api/admin/sections?schoolYear=${getActiveSchoolYear()}` and group client-side into the existing `sectionsByGrade: Record<string,string[]>` shape (`name` values keyed by `grade_level`), so the dropdown JSX is unchanged.
- [ ] **Step 2:** Add `'sections'` to `WATCHED_TABLES`; add `refreshKey` from the refresh context to the fetch effect deps in both pages.
- [ ] **Step 3:** In `FormalSectionsPanel`'s add handler, show the API error (409 "already exists" includes archived) via the page's existing alert instead of failing silently.
- [ ] **Step 4:** Delete `TemplateSectionsPanel`. If `/api/admin/settings/sections` has no remaining callers (`grep -rn "settings/sections" app`), delete that route too.
- [ ] **Step 5: Verify** — `npm run build` passes; in browser: add section "Test-A" for Grade 1 → Students › edit a Grade 1 student → dropdown lists "Test-A"; re-add "Test-A" → error alert shown.
- [ ] **Step 6: Commit** `fix: student and subject section dropdowns read the sections table`

### Task 2: Teacher calendar shows schedules (#13)

Root cause: `app/api/teacher/schedule/route.ts:55-68` reads `item.timeStart`/`item.start_time` and raw `day: 'M'`; admin saves `{day:'M'|'T'|'W'|'Th'|'F', start, end}`. The page filters on `'Monday'`.

**Files:**
- Modify: `lib/rooms.ts` (add `DAY_LABELS`), `app/admin/classes/page.tsx:41` (import it instead of local const)
- Modify: `app/api/teacher/schedule/route.ts:44-80`
- Modify: `app/teacher/calendar/page.tsx:37` (UTC date), `:89` (clear on failure)
- Test: `__tests__/rooms.test.ts`

**Interfaces:**
- Produces: `export const DAY_LABELS: Record<string,string>` in `lib/rooms.ts` (`M→Monday … F→Friday`).
- Consumes: existing `parseScheduleSlots(schedule): ScheduleSlot[]`.

- [ ] **Step 1: Failing test** `__tests__/rooms.test.ts`:
```ts
import { parseScheduleSlots, DAY_LABELS } from '@/lib/rooms'
it('admin slot format maps to full day names', () => {
  const s = parseScheduleSlots(JSON.stringify([{ day: 'Th', start: '08:00', end: '09:00' }]))
  expect(DAY_LABELS[s[0].day]).toBe('Thursday')
  expect(s[0].start).toBe('08:00')
})
```
- [ ] **Step 2:** `npm test -- rooms` → FAIL (`DAY_LABELS` not exported).
- [ ] **Step 3:** Move `DAY_LABELS` into `lib/rooms.ts`. In the schedule route, replace the array/object branching with `parseScheduleSlots(classInfo.schedule)` and emit `day: DAY_LABELS[slot.day] ?? slot.day, timeStart: slot.start, timeEnd: slot.end`.
- [ ] **Step 4:** Calendar page: initial date `format(new Date(),'yyyy-MM-dd')` (`date-fns`, installed); set schedule to `[]` when fetch fails.
- [ ] **Step 5:** `npm test` → PASS; browser: teacher with a Monday class sees it on a Monday.
- [ ] **Step 6: Commit** `fix: teacher calendar reads the admin schedule format`

## Phase B — Data rules

### Task 3: One grade-level list, with Kinder (#8)

**Files:**
- Create: `lib/grade-levels.ts`
- Modify: `app/student/enrollment/page.tsx:59`, `app/parent-dashboard/page.tsx:1229`, `app/admin/utils/helpers.ts:56`, `app/admin/students/page.tsx:715,1011`, `app/admin/classes/page.tsx:686`, `app/admin/sections/page.tsx:24` — import `GRADE_LEVELS`
- Modify: `app/page.tsx:1139` — option values become canonical strings
- Modify: `app/api/admissions/route.ts` (store), `app/api/admissions/approve/route.ts:214,251` — wrap with `normalizeGradeLevel`
- Create: `migrations/normalize-grade-levels.sql`
- Test: `__tests__/grade-levels.test.ts`

**Interfaces:**
- Produces:
  - `export const GRADE_LEVELS: readonly string[]` — `['Kinder','Grade 1',…,'Grade 12']`
  - `export function normalizeGradeLevel(v: string | null | undefined): string | null`

- [ ] **Step 1: Failing test:**
```ts
expect(GRADE_LEVELS[0]).toBe('Kinder'); expect(GRADE_LEVELS).toHaveLength(13)
expect(normalizeGradeLevel('kindergarten')).toBe('Kinder')
expect(normalizeGradeLevel('grade1')).toBe('Grade 1')
expect(normalizeGradeLevel(' Grade 12 ')).toBe('Grade 12')
expect(normalizeGradeLevel('')).toBeNull()
expect(normalizeGradeLevel('College')).toBe('College') // unknown passes through
```
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement; reuse the kinder/kindergarten matching already in `lib/utils.ts:11`. **Step 4:** Run → PASS.
- [ ] **Step 5:** Replace the 7 hard-coded lists; remove the "Kindergarten" relabel at `app/admin/admission/page.tsx:485`.
- [ ] **Step 6:** Migration: `UPDATE` `admissions.intended_grade_level`, `users.grade_level`, `enrollment_requests.grade_level`, `sections.grade_level` mapping `kindergarten|kinder → Kinder`, `grade(\d+) → Grade \1` (regexp_replace, case-insensitive). Run it in Supabase SQL editor after deploy.
- [ ] **Step 7: Commit** `feat: single grade-level list with Kinder; normalize stored values`

### Task 4: LRN optional for Kinder (#4, #11)

**Files:**
- Create: `lib/lrn.ts`
- Modify: client checks `app/page.tsx:199,1043-1063`, `app/admin/students/page.tsx:327,410,682,979`
- Modify: server checks `app/api/admissions/route.ts:104`, `app/api/admin/students/route.ts:137,157,182,249-250`, `app/api/admin/students/[id]/route.ts:75`, `app/api/parent/link-student/route.ts:13`
- Test: `__tests__/lrn.test.ts`

**Interfaces:**
- Produces:
  - `export const isValidLrn = (v: string) => /^\d{12}$/.test(v)`
  - `export function lrnError(lrn: string | null | undefined, gradeLevel: string | null | undefined): string | null` — `null` if OK; `'LRN is required'` if blank and grade ≠ `Kinder`; `'LRN must be exactly 12 digits'` if non-blank and invalid.

- [ ] **Step 1: Failing test:**
```ts
expect(lrnError('', 'Kinder')).toBeNull()
expect(lrnError('', 'kindergarten')).toBeNull()        // via normalizeGradeLevel
expect(lrnError('', 'Grade 1')).toBe('LRN is required')
expect(lrnError('12345678901', 'Kinder')).toBe('LRN must be exactly 12 digits')
expect(lrnError('123456789012', 'Grade 3')).toBeNull()
```
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5:** Replace all 5 inline regex checks with `lrnError`. Uniqueness query runs only when LRN is non-blank. Admin create stores `student_number: lrn || null, lrn: lrn || null`. Label shows "LRN (optional for Kinder)" when grade is Kinder; HTML `required` bound to `gradeLevel !== 'Kinder'`.
- [ ] **Step 6: Verify** in browser per Review Focus #2. **Commit** `feat: LRN optional for Kinder, shared validator`

## Phase C — Guardian

### Task 5: Confirm child's name before tagging (#12)

**Files:**
- Modify: `app/api/parent/link-student/route.ts` — add `GET`
- Modify: `app/parent-dashboard/page.tsx` dialog ~`:624-660` and `handleAddChild` `:283`; relationship default `:82` → `'guardian'`
- Delete: `app/parent/page.tsx` if nothing links to `/parent` (`grep -rn "'/parent'" app`), else apply the same change

**Interfaces:**
- Produces: `GET /api/parent/link-student?lrn=XXXXXXXXXXXX` → `{ success: true, student: { name: string, grade_level: string } }` | 404 `{ success:false, error:'No student found with this LRN' }` | 400 on `!isValidLrn`. `name` is masked: first name + last-name initial (`"Juan D."`) — privacy.

- [ ] **Step 1:** Implement GET (role=student lookup, mask name). POST also rejects `!isValidLrn`.
- [ ] **Step 2:** Dialog becomes two steps: "Find" → shows "Is this your child? **Juan D.** — Grade 3" with Confirm / Back; Confirm calls existing POST.
- [ ] **Step 3: Verify** Review Focus #5 + happy path. **Commit** `feat: guardian confirms child before tagging`

> Known gap, not fixed here: POST trusts `parent_id` from the body. Fixed by the auth plan (see Deferred).

### Task 6: Guardian address + required guardian fields (#10, #14, #15)

**Files:**
- Create: `migrations/add-guardian-address.sql` — `ALTER TABLE admissions ADD COLUMN IF NOT EXISTS guardian_address text; ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_address text;`
- Modify: `app/page.tsx` guardian block ~`:1271-1330`; `app/api/admissions/route.ts:55-61,77-94`
- Modify: `app/api/admissions/approve/route.ts` user insert ~`:198-216` — copy `guardian_address`
- Modify: `app/admin/students/page.tsx:793,1085` (+ guardian address field), `app/api/admin/students/route.ts`, `[id]/route.ts`
- Modify: `app/admin/parents/page.tsx:180-182,528,553,663,687`, `app/api/admin/parents/route.ts:86` (+ PUT)
- Modify: `database.types.ts` — add the two columns

**Interfaces:**
- Consumes: `AddressFields` (`components/address-fields.tsx`), `AddressParts`, `formatAddress`, `missingAddressFields` (`lib/address.ts`); `AddressSelector` on admin pages (unchanged).

- [ ] **Step 1:** Migration + types.
- [ ] **Step 2:** Landing: under guardian info add checkbox **"I live in the same household as my child"** (default checked). Checked → `guardian_address = formatAddress(permanentAddress)`; unchecked → second `<AddressFields>`. Server requires `parent_name`, `guardian_phone`, and `guardian_address` (via `missingAddressFields` when sent as parts, or non-empty string).
- [ ] **Step 3:** Admin students: guardian phone required (label + client + API); add guardian address (`AddressSelector`, required) with the same "same as student's address" checkbox.
- [ ] **Step 4:** Admin parents: phone and address required on Add **and** Edit, client and API.
- [ ] **Step 5: Verify** submit each form with guardian address blank → blocked with message; checkbox copies student address. **Commit** `feat: required guardian address and contact on all guardian forms`

## Phase D — UI

Independent tasks; verify each in the browser, one commit each.

### Task 7: Surname first on landing (#5)
- Modify `app/page.tsx:921-1000`: order Last Name, First Name, Middle Initial, Suffix. Field state/keys unchanged.

### Task 8: Override-specific emails (#6)
- Modify `lib/services/email-service.ts:567,607`: add optional last param `override = false` to `sendAdmissionApproval`/`sendAdmissionRejection`. When true, approval body opens with: *"After reconsideration, we are pleased to inform you that you are now qualified to enroll at Sto. Niño de Praga Academy. We apologize for any inconvenience caused by the earlier decision."*; rejection: *"After further review, we regret to inform you that your previously approved application has been reconsidered and is not approved at this time."* Subjects get the suffix " (Updated Decision)".
- Modify `app/api/admissions/approve/route.ts:96,245`: pass `wasApproved` / `wasRejected` (already computed at `:46`, `:118`). No client change.

### Task 9: Class slots end by 5 PM (#20)
- Add to `lib/rooms.ts`: `export const LATEST_END = '17:00'` and `export function slotTimeError(s: {start:string,end:string}): string | null` → `'End time must be after start time'` | `'Classes must end by 5:00 PM'` | null.
- Test in `__tests__/rooms.test.ts`: `'08:00'-'17:00'` → null; `'16:00'-'17:01'` → 5 PM error; `'09:00'-'09:00'` → after-start error.
- Use it in `app/admin/classes/page.tsx` `handleSubmit` (`:268`) and in `app/api/admin/classes/route.ts` POST/PUT before `checkRoomConflict` (400). Inputs at `:800-811` get `max="17:00"`.

### Task 10: Add Section as a modal (#16)
- Modify `app/admin/sections/page.tsx:758-816`: inline row → "Add Section" button opening `Dialog` with the same four fields, styled like Add Subject (`app/admin/classes/page.tsx:644-912`: `DialogContent`, header, Cancel/Save footer). Close on success; keep error in dialog.

### Task 11: Student portal red + locked tabs (#7, #9)
- `app/student/components/StudentSidebar.tsx:57`: `accent="red"`.
- Dashboard (`app/student/dashboard/page.tsx`): decorative green → red tokens; keep green only on "Enrolled"/success badges.
- PDFs (`app/student/page.tsx:1321-1328`, `app/student/grades/page.tsx:242-243`, `app/student/enrollment/page.tsx` 448/756): autotable `headStyles: { fillColor: [77,17,22], textColor: 255 }`. (Client said "green in PDFs" — none exists today; this applies the brand red header. Confirm with client which PDF they meant if they still see green.)
- Locked tabs: add `disabled?: boolean` to `PortalNavItem` (`components/portal-sidebar.tsx:12-18`) rendering a non-link item with `aria-disabled` and a "Enroll first" tooltip. `app/student/layout.tsx` fetches `/api/student/enrollment?studentId=` once and disables **Grades & Reports** when `!isEnrolled`; pages also show a top banner "Complete your enrollment to access this page" if visited directly.

### Task 12: Striped tables (#17)
- `app/globals.css`: `tbody tr:nth-child(even) { background-color: hsl(var(--muted) / 0.5); }` in `@layer base`. One rule covers the ~21 raw tables and `components/ui/table.tsx`. Check hover still visible on admin students/enrollment tables.

---

## Deferred (not in this plan)

| Row | Item | Blocker |
|---|---|---|
| #22 | Require section | "Paconfirm kay Jez kung saan." Enrollment approval already requires it; candidates are admin student creation and admission approval. |
| #23 | Export on admin Enrollment | "Pa confirm kay JJ." When confirmed: `ExportDropdown` + `downloadExcel`, same as `app/admin/grades/page.tsx` (~30 lines). |
| #24 | Teacher tables exportable | Attendance, Grades, Classes (student list), Reports already export. Ask which table they mean. |
| #25 | Change log (who/when/IP/what) | **Needs server-side auth first.** No API route verifies the caller; actor IDs come from the client body/localStorage, so a log would record whatever the browser claims. Write a separate plan: verify the Supabase session in a shared `requireUser(req, role)` helper used by all 54 mutating routes, then an `audit_log` table written from that helper. |

**Security note (outside CRF, recommend before go-live):** all `app/api/admin/*` routes, `/api/admissions/approve`, and `/api/parent/link-student` accept unauthenticated requests. That is the same auth plan as #25.

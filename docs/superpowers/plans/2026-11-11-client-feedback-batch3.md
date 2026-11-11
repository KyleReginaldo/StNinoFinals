# Client Feedback Batch 3 — Plan

Branch: `fix/crf-client-feedback` (up to date with `main`). No PRs (user opens them).
Source: client chat, 2026-11-11 (15 items). Numbers below follow the chat order.

## Triage

| # | Client said | Finding | Plan |
|---|---|---|---|
| 1 | Wala pa rin gender/sex sa admission | `admissions` has no gender column; form has no field | Migration `admissions.gender`; required **Sex** (Male/Female) on landing form + API; approval copies to `users.gender` via `normalizeGender` |
| 2 | Bugged pa rin calendar button (Teacher/Student User Mgmt) | (a) my global striped-table CSS also stripes the calendar's week rows; (b) teacher Date of Birth is **pre-filled** with "18 years ago" (UTC) so it gets saved by accident | Scope stripes to data tables only (`table:not([role=grid])`); teacher DOB starts empty (picker still opens around 18 years ago) |
| 3 | Batch enroll shows all students regardless of grade | `eligible-students` API deliberately dropped the grade filter | Filter to the section's grade by default; checkbox "Show other grade levels" for promotions/corrections |
| 4 | Pag-isahin returning and returnee? | Returning = continuing (enrolled here last year); Returnee = stopped schooling and coming back (DepEd *Balik-Aral*). Both exist on landing + guardian forms | **Decision needed** (see below) |
| 5 | Gawing buo terms and policy, red "and" | Checkbox reads "…the **Terms of Service** and **Privacy Policy**…" with "and" grey | One red phrase "Terms of Service and Privacy Policy" |
| 6 | Lagyan instruction sa email | Approval email has credentials but no next steps | "What to do next" steps in the admission approval email (log in → change password → Enrollment tab → submit → wait for approval) |
| 7 | Sa enrollment, kita past grades pag current student | Enrollment page shows no grades | Read-only "Your grades last school year" panel for returning students (reuse student grades API) |
| 8 | Lagyan max capacity sa section | Capacity set only when creating; can't edit; enrollment approval and Add Student don't check it | Edit capacity in Sections (inline); block approval / Add Student when section is full (clear message) |
| 9 | User info edit, required halos lahat | Edit forms leave most fields optional | Required on edit: Students — DOB, gender, phone; Teachers — DOB, gender, phone, department, address; Guardians — already phone + address. UI + API |
| 10 | Ask Praga about process of hiring | Not code | Note for you to ask the client |
| 11 | Ayaw mapindot after create subject / add class | Radix: closing the subject dialog while the success alert opens can leave `pointer-events: none` on `<body>` (existing `setTimeout(0)` workaround isn't enough) | Alert provider waits for the closing dialog, and always clears body pointer-events when the alert closes |
| 12 | Subject Mgmt filter: unassigned students still show | `filteredStudents` keeps "no section" students when a section is chosen | When a section is chosen, show only that section's students |
| 13 | Error: always "Failed to create class" | API hides the database error | Map DB errors to plain messages (duplicate, missing field, etc.) on create/update |
| 14 | Create subject should be disabled if room occupied / teacher time taken | Rooms are greyed in the picker; teacher clashes are only caught on save | Live check in the dialog: disable **Create** + show which slot clashes (room or teacher) |
| 15 | Pwede same subject code and subject name | DB/API reject duplicates (shows as #13's generic error) | Allow duplicates; migration drops the unique constraint on code/name if present |

## Order
1. Bugs that block work: #11, #2, #3, #12, #13
2. Data: #1 (migration), #15 (migration), #8
3. Rules/UI: #14, #9, #5, #6, #7
4. #4 after your decision; #10 is yours

## Migrations (you run in Supabase)
- `add-admission-gender.sql` — `ALTER TABLE admissions ADD COLUMN IF NOT EXISTS gender text`
- `allow-duplicate-subject-codes.sql` — drop unique constraints/indexes on `classes(class_code)` / `(class_name)` if they exist

## Verification
Unit tests for new rules (capacity, error mapping, conflict check, stripe selector is CSS → screenshot). Browser check each screen read-only as before; nothing written to the live DB without asking.

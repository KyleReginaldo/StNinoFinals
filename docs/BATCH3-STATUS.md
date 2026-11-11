# Client Feedback Batch 3 — Status

Branch: `fix/crf-client-feedback` · Updated: 2026-11-11

**14 of 15 items done.** #10 (hiring process) is a question for the client, not code.

Legend: `[ ]` not yet checked by you · `[/]` checked by you · `[x]` not okay.
Every item below was checked by Claude in the browser (view-only, nothing saved) unless noted.

## Before testing: run these in Supabase (SQL editor)

1. `migrations/add-admission-gender.sql` — **required**, or the admission form fails on submit.
2. `migrations/allow-duplicate-subject-codes.sql` — lets two subjects share a code/name (#15).

---

## Done

- [ ] **#1 — Gender/sex on admission** · `7de3d6d`
  - Required **Sex** (Male/Female) on the landing admission form, next to Date of Birth.
  - Shown in Admin › Admissions review; copied to the student's account when approved.
  - **Check:** Landing › Submit Inquiry → Sex field is there; submitting without it says "Please complete: Sex".

- [ ] **#2 — Calendar button bugged (Teacher/Student user management)** · `db0e550`
  - The calendar's weeks were striped gray by the table-stripes rule (from the last batch). Fixed — stripes are only on data tables now.
  - Teacher Date of Birth no longer starts pre-filled with a date 18 years ago.
  - **Check:** Admin › Teachers › Add Teacher → Date of Birth says "Select date"; open it → no gray stripes on the weeks.

- [ ] **#3 — Batch enroll shows all students regardless of grade** · `db0e550`
  - Only students of the section's grade are listed. Others only with "Also show students from other grade levels".
  - **Check:** Admin › Sections → a Kinder section → Batch Enroll → only Kinder students (checked: 15 shown, 216 others hidden).

- [ ] **#4 — Returning vs Returnee** · `bc0d953`
  - Kept both (DepEd treats them differently), renamed so parents can tell them apart:
    - **Continuing Student (enrolled here last school year)**
    - **Returnee / Balik-Aral (stopped schooling, now coming back)**
  - Updated on the admission form, guardian enrollment form, landing glossary, and admin badges.
  - **Check:** Landing › Submit Inquiry › Enrollment Type.

- [ ] **#5 — Terms and Policy, red "and"** · `03b4650` (+ `d6c4d33`)
  - The pop-up you get when ticking "I have read and agree…" only showed a short summary. It now shows the **full** Terms of Service and Privacy Policy (same text as /terms and /privacy, which the admin edits in Settings).
  - The "and" between the two red links is now red. The checkbox sentence itself is also one red phrase.
  - **Check:** admission form → tick the Terms checkbox → pop-up shows sections "1. Acceptance of Terms…" and "1. Overview…".

- [ ] **#6 — Instructions in the email** · `cc983dd`
  - Admission approval email has a "What to do next" box:
    1. Sign in with the email and temporary password
    2. Set a new password
    3. Open the Enrollment tab and submit the form
    4. Check the Enrollment tab for its status
  - **Check:** approve an admission → read the email. (Checked by rendering the email without sending.)

- [ ] **#7 — Past grades visible for current students** · `6bebf91` (+ `515b0f2`)
  - **Currently enrolled** students: the Enrollment page has a **My Grades** card (every school year with approved grades, newest first), above Enrolled Classes.
  - **Re-enrolling** students: the enrollment form shows "Your grades — Grade X, S.Y. …" for last school year.
  - Q1–Q4 + average; averages below 75 in red.
  - **Check:** log in as an enrolled student → Enrollment → My Grades.

- [ ] **#8 — Max capacity on sections** · `a4354a9`
  - Click a section's capacity number in Admin › Sections to change it (can't go below the students already in it).
  - Enrollment approval and Add Student refuse a full section with a clear message. Batch enroll already did.
  - **Check:** Sections → click a capacity → change it → Enter.

- [ ] **#9 — User info edit: required fields** · `31395b2`
  - Teachers (add + edit): department, phone number, date of birth, address.
  - Students: date of birth (add + edit), gender (edit; add already required it).
  - Also fixed: editing a teacher added ", Trece Martires City, Cavite" to the address again on every save.
  - **Check:** edit a teacher, clear the phone → "Required: Phone Number".

- [ ] **#11 — Can't click anything after creating a subject / class** · `db0e550`
  - The success alert was putting back the closing dialog's "block clicks" on the page. Now cleared when the alert closes.
  - ⚠️ Not tested end-to-end by Claude (creating a subject writes to the live database). **Please create one test subject and confirm the page is clickable afterwards.**

- [ ] **#12 — Subject Mgmt: unassigned students show after filtering** · `db0e550`
  - Choosing a section lists only that section's students.
  - **Check:** Add Subject → pick grade + section → student list.

- [ ] **#13 — Always "Failed to create class"** · `db0e550`
  - Errors now say what went wrong in plain language.
  - **Check:** try to save a subject that clashes or is missing a field.

- [ ] **#14 — Can't create subject if room occupied / teacher's time taken** · `bfb2cf4`
  - The dialog shows the clash (e.g. *This teacher already has "English" on Monday 8:00 AM–9:00 AM.*) and disables Create/Update. The server checks too.
  - **Check:** Add Subject → pick a teacher who already teaches Monday 8–9 → add a Monday 8–9 slot → button turns off. (Checked with John Jerick.)

- [ ] **#15 — Same subject code and name allowed** · migration
  - Needs `migrations/allow-duplicate-subject-codes.sql` (see top).
  - **Check:** after running it, create two subjects with the same code.

## Not 100% sure — please confirm with the client

| # | What I did | What might still be different |
|---|---|---|
| #2 Calendar button | Fixed the gray stripes inside the calendar and the pre-filled teacher birth date. Opening, changing month/year and picking a day all work. | I couldn't make it break any other way. If the client still sees a problem, ask **what exactly happens** (won't open? wrong date saved? which form?). |
| #6 Instructions in email | Added "What to do next" to the **admission approval** email. | If they meant another email (e.g. teacher/guardian account emails, or enrollment rejection), tell me which. |
| #9 User info edit, required | Admin forms: Students, Teachers (Guardians were already done). | If they meant the users' **own profile pages** (Student Profile, Teacher My Account), those aren't changed yet. |
| #11 Unclickable after create | Fixed the cause in the code. | Not tested with a real create (it would write to the live database). Please create one test subject. |
| #15 Same code/name | Migration written. | Not run yet; after running it, try two subjects with the same code. |

## Not code

| # | Item | Who |
|---|---|---|
| #10 | Ask Praga about the process of hiring | You → client |

## Tell the client

- **Missing data is now required to save edits:** 204 of 355 students have no date of birth, 56 have no gender; 35 of 38 teachers have no phone number. Those records must be completed on their next edit.
- **Section Courteous (Grade 1) has 50 students but capacity 45.** Nobody can be approved into it until the capacity is raised.
- **Some saved subjects already clash** (a teacher with overlapping subjects, odd times like 10:25 PM–8:16 AM). Editing those is blocked until the times are fixed.

## How "done" was verified

- 118 automated tests pass (`npm test`), including new ones for section capacity, schedule clashes and the grades summary.
- Re-checked on 2026-11-11 after your question: #5 and #7 were incomplete and are now fixed.
- Production build passes (`npm run build`).
- Each screen checked in headless Chrome against the live data, view-only.

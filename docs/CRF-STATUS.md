# CRF Status — Client Feedback (CRF.xlsx)

Branch: `fix/crf-client-feedback` · Updated: 2026-11-04

**17 of 21 items done** · 4 waiting on someone (see [Pending](#pending)).

Legend: `[/]` checked by you · `[*]` checked by Claude · `[x]` not okay.

Each item lists **how to check it yourself** in the app. "Done" means the code is committed and the
automated tests + production build pass. It does **not** yet mean someone clicked through it — use the
checks below for that, then tick the box.

## Before testing: run these in Supabase (SQL editor)

1. `migrations/add-guardian-address.sql` — **required**, or the admission form will fail on submit.
2. `migrations/normalize-grade-levels.sql` — fixes old grade values (`grade1` → `Grade 1`, `kindergarten` → `Kinder`).

---

## Done

### Bugs

- [*] **#18 / #19 — New sections don't appear in Student Management / Sections** · `060b008`
  - Cause: the Students and Add Subject dropdowns read an old saved list, not the real sections.
  - **Check:** Admin › Sections → add a section (e.g. "Test-A", Grade 1, current year) → Admin › Students → edit a Grade 1 student → Section dropdown shows "Test-A". Same in Admin › Classes › Add Subject.
  - ✅ **Checked:** Edit Student and Add Subject Section lists now come from the real sections table (Grade 1 → Courteous, Polite, Sampaguita for 2026-2027). Did not add a test section (would write to the live DB); adding works per your #16 check.

- [*] **#13 — Teacher calendar (check if bugged)** · `b9f41ed`
  - Cause: it was a real bug — the calendar never showed any class (it read a different schedule format than admin saves).
  - **Check:** give a teacher a subject on Monday 8:00–9:00 → log in as that teacher → Calendar → pick a Monday → the class is listed.
  - ✅ **Checked:** Real teachers' classes now appear on the correct weekdays (API + calendar page). Some saved subjects have odd times (e.g. 10:25 PM–8:16 AM, or no day) — that's data, not code.

### Enrollment / LRN

- [*] **#8 — Grade level drop-down has no Kinder** · `4152bd7`
  - All grade drop-downs now use one list: Kinder, Grade 1 … Grade 12.
  - **Check:** Student Portal › Enrollment, Guardian Portal enrollment request, Admin filters → "Kinder" is the first option.
  - ✅ **Checked:** Kinder is first in the landing form and admin dropdowns. After `normalize-grade-levels.sql` was run, every grade in users, admissions, enrollment requests, sections and classes is standard, and the admin filter shows only Kinder, Grade 1–12.

- [*] **#4 — LRN optional for Kinder** · `4e5713d`
  - **Check:** Landing page admission form → Grade = Kinder → LRN label says "(optional for Kinder)" → submit with LRN blank → succeeds. Change grade to Grade 1 → submit blank LRN → blocked.
  - Same rule in Admin › Students add/edit.
  - ✅ **Checked:** Kinder → label says "(optional for Kinder)", field not required; Grade 1 → required. Server rejects blank/short LRN for Grade 1 and accepts blank for Kinder (checked up to the save step, nothing written).

- [*] **#11 — LRN limit** · `4e5713d` (and earlier `d1416e5`)
  - Kept at **12 digits** (DepEd standard; CRF said "11 ata").
  - **Check:** enter 11 digits → "LRN must be exactly 12 digits".
  - ✅ **Checked:** ❌ found a problem → fixed in `72046ad`: 318 of 352 students have old short LRNs (e.g. 443), so admins couldn't save *any* edit to them. Now an unchanged LRN is left alone; a changed one must be 12 digits.

### Guardian

- [*] **#12 — Show the child's name before tagging** · `b547a1a`
  - **Check:** Guardian Portal → Add Student → enter LRN → Find Student → shows "Is this your child? Juan D. — Grade 3" → Yes, add my child. A wrong LRN shows "No student found" and nothing is saved.
  - Name is shown as first name + last-name initial only, for privacy.
  - ✅ **Checked:** Real LRN → "Is this your child? John D. — Grade 1"; unknown LRN → "No student found"; Back returns without saving. Also fixed: one click opened two stacked dialogs (`72046ad`).

- [*] **#10 — Guardian address everywhere, with "same household" button** · `99cff25`
  - **Check (landing form):** Guardian section has "I live in the same household as my child" (ticked by default). Untick → address fields appear.
  - **Check (Admin › Students):** add/edit shows Guardian Address with "Guardian lives in the same household as the student".
  - Guardian address also shows in the student's view panel.
  - ✅ **Checked:** Landing: checkbox ticked by default, unticking shows the address fields. Admin Edit Student shows Guardian Address + same-household box. `add-guardian-address.sql` has been run; the column exists, so saving works.

- [ /] **#14 — All address fields required** · `99cff25`, fixes in `11c2015`
  - **Check:** leave any address blank on the landing form, Admin › Students, Admin › Parents → form refuses to save and names the missing field.

- [ /] **#15 — Guardian address and contact number required** · `99cff25`, fixes in `11c2015`
  - **Check:** blank guardian phone or address on landing form, Admin › Students, Admin › Parents, and the Guardian Portal profile → blocked.
  - Both `+63XXXXXXXXXX` and `09XXXXXXXXX` formats are accepted.

### Admin

- [ /] **#16 — Add Section as a pop-up like Add Subject** · `7ecd5af`
  - **Check:** Admin › Sections → "Add Section" button → pop-up with Grade, (Strand for SHS), Name, Capacity → Save closes it and the section appears.

- [ /] **#20 — Room/time availability limited to 5 PM** · `b6d3983`
  - Times are drop-downs (15-minute steps, 6:00 AM – 5:00 PM), so 6 PM and later can't be picked at all. The end list only shows times after the start. · `2d104dd`
  - **Check:** Admin › Classes › Add Subject → time drop-downs stop at 5:00 PM; pick a start of 4:30 PM → end list shows only 4:45 PM and 5:00 PM.
  - Note: existing subjects that end after 5 PM must have their time fixed before they can be edited again.

### Emails

- [*] **#6 — Different message for override approve / deny** · `86ab7f9`
  - Override approve (was rejected → approved): _"After reconsideration, we are pleased to inform you that [Student] is now qualified to enroll … We sincerely apologize for any inconvenience …"_
  - Override reject (was approved → rejected): explains the decision was reconsidered and the portal account deactivated.
  - Subject ends with "(Updated Decision)".
  - **Check:** Admin › Admission → reject an application, then "Override: Approve" → check the applicant's inbox.
  - ✅ **Checked:** Rendered both override emails without sending: approve opens "After reconsideration … now qualified to enroll … We sincerely apologize"; reject explains the reconsideration and deactivation. Not sent to a real inbox.

### Look & feel

- [*] **#5 — Surname first on landing page** · `fab9436`
  - **Check:** admission form order is Last Name, First Name, Middle Initial, Suffix.
  - Also: Intended Grade Level / Enrollment Type / School Year now come first, above the name — the LRN rule depends on the grade, so it was odd to ask for the LRN before the grade.
  - ✅ **Checked:** Order is Grade/Enrollment Type/School Year → Last Name, First Name, Middle Initial, Suffix → Date of Birth, LRN.

- [*] **#7 — Red accent on Student Portal; PDFs red instead of green** · `5ba98ae`
  - Sidebar changed from blue to red. Grade PDFs now have a maroon table header.
  - There was no green in the student PDFs; green on the dashboard is kept only for "present / active / high grade" since red already means absent. **Confirm with client** if they meant a different PDF or element.
  - **Check:** log in as a student → red sidebar; download report card / grades PDF → maroon header.
  - ✅ **Checked:** Sidebar accent is red. PDF header colour verified in code only (no PDF downloaded).

- [*] **#9 — Tabs not clickable unless enrolled** · `5ba98ae`
  - Grades & Reports is greyed out with a lock until the student is enrolled. Opening it directly shows "Enroll first" with a button to Enrollment. Dashboard, Enrollment, Profile, Help stay open.
  - **Check:** log in as a not-yet-enrolled student.
  - ✅ **Checked:** Not-enrolled student: Grades & Reports greyed with a lock; opening it shows "Enroll first". Enrolled student: nothing locked.

- [*] **#17 — Striped tables** · `f89cbf6`
  - **Check:** any admin/teacher table → alternating row shading.
  - ✅ **Checked:** Alternating rows confirmed; made slightly darker in `72046ad` because they were barely visible.

---

## Pending

| CRF | Item                                       | Waiting on                                                                                                                                |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| #22 | Require section                            | Jez — where it should be required (enrollment approval already requires it)                                                               |
| #23 | Export on admin Enrollment tab             | JJ — confirm it's wanted (small job once confirmed)                                                                                       |
| #24 | Teacher portal tables exportable           | Client — Attendance, Grades, Classes (student list) and Reports already export; which table do they mean?                                 |
| #25 | Change log (time, date, name, IP, changes) | Needs server-side login checks first. Right now the API can't tell who made a change, so a log could be faked. Planned as a separate job. |

## Also fixed (not in CRF)

- Approved admissions saved the grade as `grade1` / `kindergarten`, which broke section lookups.
- Editing a parent added ", Trece Martires City, Cavite" to the address again on every save.
- Admins couldn't save edits to students who came in through the admission form (found in code review, fixed).
- Removed the unused old `/parent` page.

## How "done" was verified

- 102 automated tests pass (`npm test`), including new tests for grade levels, LRN rules, the 5 PM limit, phone format, address handling, and name masking.
- Production build passes (`npm run build`).
- A separate code review of the whole branch; its findings were fixed (`11c2015`).
- Claude clicked through each `[*]` item on the running app with real accounts (view-only, nothing saved), plus read-only database and API checks.
- **Still needs a real save/send:** submitting an admission, saving a guardian address (after the migration), sending an override email.

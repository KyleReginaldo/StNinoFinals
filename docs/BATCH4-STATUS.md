# Client Feedback Batch 4 — Status

Branch: `fix/crf-client-feedback` · Updated: 2026-11-18

**4 of 4 items done in code.** One needs a database step from you (item 2).

Legend: `[ ]` not yet checked by you · `[/]` checked by you · `[x]` not okay.
Claude checked every item in the browser against the live data (view-only, nothing saved) except where noted.

## Before testing: run this in Supabase (SQL editor)

`migrations/allow-duplicate-subject-codes.sql` — **required for item 2.** It was **not** applied before: the database still had the rule `classes_class_code_key`, which is why the same subject code kept failing. The file now drops that exact rule first. At the end it lists the rules that remain on `classes`; you should see only the primary key.

---

## Done

- [ ] **1 — Capacity max 60: rooms and sections** · `8327f37` + inline errors (latest commit)
  - The error now appears **right under the field while you type** (red border + message), and the Save button stays off until the number is valid. Above 60, below 1, decimals and huge numbers are all caught. The server still refuses them as a backstop.
  - Applies to **Rooms** (Add/Edit Room) and **Sections** (Add Section, and clicking a capacity number in the table). The client's note said rooms, but sections had no limit at all, so I used the same 60.
  - Existing sections already above 60 (the table has one at 70) show as they are; changing their capacity needs 60 or less.
  - Old rooms above 60 (**Gymnasium 300**, **Audio-Visual Room 80**) can still be renamed or re-described. Their capacity only has to be 60 or less if you change it.
  - **Check:** Admin › Rooms → Add Room → type 61 → red message under the field right away. Same in Admin › Sections → Add Section.

- [ ] **2 — "This record already exists" when the same subject code is used for another section** · `ee17705`
  - Cause (found on the live database): a unique rule `classes_class_code_key` on the subject code. Nothing in the app depends on codes being unique.
  - Fix: run the migration above. Then one subject code can be used in many sections, each with its own teacher.
  - Until then, the error now says what is wrong and which file to run, instead of "This record already exists".
  - **Check (after running the migration):** Admin › Subject Management → create a subject with a code that already exists, for a different section and teacher → it saves.
  - Nothing else changed: room and teacher time clashes are still blocked.

- [ ] **3 — Separate Grades and Reports** · `e6c47e0`
  - Student portal sidebar now has **Grades** and **Reports**.
  - **Grades:** every school year's approved grades, grouped by school year then quarter. Opens on the current year; the picker has past years and "All school years". (The old page mixed Quarter 1 of different years together.)
  - **Reports:** the report card for one school year: Q1–Q4, final grade, remarks, general average. Defaults to the current year; **past years can be picked**. PDF and Excel downloads moved here and can cover the whole year or one quarter.
  - **Past grades when not enrolled:** Grades and Reports now open when the student is enrolled **or already has approved grades**. Brand-new students with nothing still see "Enroll first".
  - Fixed along the way: the PDF said "of Grade Grade 7", and it now uses the grade level of the chosen school year (not the current one).
  - **Decision for you:** you were unsure whether Reports should show the last school year. I made past years available through the school-year picker, because families need last year's report card for transfers and scholarships. If you prefer current-year only, it is a one-line change.
  - **Check:** log in as a student with grades from two years → Grades → "All school years"; Reports → pick the older year → Export → PDF.

- [ ] **4 — Terms and Conditions: reusable display, editable in admin** · `9ba39b1`
  - One display is now used everywhere: `/terms`, `/privacy` (they were copy-pasted), and the "I agree" pop-up (it no longer has its own hard-coded summary). The text always comes from what the admin saves in Settings. The "I Agree" button waits until the real text has loaded.
  - Display fix: a heading with its paragraph typed directly underneath used to show as one giant heading. Now it is a heading plus a paragraph. Also supports `###` sub-headings and numbered lists.
  - **Admin › Settings › Legal Content:** Edit / Preview tabs (the preview is exactly what visitors see), **Heading / Bullets / Numbered** buttons (no need to type `##` or `-`), **Reset to default**, and a link to the public page. Saving an empty box restores the default.
  - **Check:** Admin › Settings → Terms of Service → select a line → Heading → Preview → Save → open `/terms` and the admission form's pop-up; both show the change.

## Notes

- 145 automated tests pass; production build passes.
- Not tested end-to-end: saving Settings, and creating a subject with a repeated code (needs the migration; creating subjects writes to the live database).
- 16 more tests were added this batch: room capacity, subject-save message, legal text reader and editor buttons, report-card rules.

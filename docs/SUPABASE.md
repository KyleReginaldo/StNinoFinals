# Supabase Database Schema

This document describes the database structure for the Sto Niño de Praga Academy system.

## Overview

The system uses Supabase (PostgreSQL) with the following key features:
- **Row Level Security (RLS)**: Enabled on all tables for data protection
- **Supabase Auth**: Built-in authentication system
- **Timezone**: All timestamps in Manila timezone (Asia/Manila, UTC+8)
- **UUIDs**: All primary keys use UUID type

---

## Database Tables

### 1. students
Stores student information and credentials.

**Columns:**
- `id` (uuid, PK): Unique student identifier
- `student_id` (text, unique): Human-readable ID (e.g., "2024-001")
- `name` (text): Full name
- `email` (text, unique): Email address (used for login)
- `password` (text): Hashed password
- `grade_level` (text): Current grade (e.g., "Grade 10")
- `section` (text): Class section
- `rfid` (text, unique, nullable): RFID card number
- `phone` (text, nullable): Contact number
- `address` (text, nullable): Home address
- `date_of_birth` (date, nullable): Birth date
- `created_at` (timestamp): Record creation date
- `updated_at` (timestamp): Last update date

**Indexes:**
- `idx_students_email` on `email`
- `idx_students_rfid` on `rfid`
- `idx_students_student_id` on `student_id`

**RLS Policies:**
- Students can read their own data
- Admin can read/write all student data
- Teachers can read student data for their classes

---

### 2. teachers
Stores teacher information and credentials.

**Columns:**
- `id` (uuid, PK): Unique teacher identifier
- `teacher_id` (text, unique): Human-readable ID (e.g., "T-2024-001")
- `name` (text): Full name
- `email` (text, unique): Email address (used for login)
- `password` (text): Hashed password
- `subject` (text, nullable): Primary subject taught
- `rfid` (text, unique, nullable): RFID card number
- `phone` (text, nullable): Contact number
- `created_at` (timestamp): Record creation date
- `updated_at` (timestamp): Last update date

**Indexes:**
- `idx_teachers_email` on `email`
- `idx_teachers_rfid` on `rfid`

**RLS Policies:**
- Teachers can read their own data
- Admin can read/write all teacher data

---

### 3. parents
Stores parent/guardian information.

**Columns:**
- `id` (uuid, PK): Unique parent identifier
- `name` (text): Full name
- `email` (text, unique): Email address (used for login)
- `password` (text): Hashed password
- `phone` (text): Contact number
- `address` (text, nullable): Home address
- `created_at` (timestamp): Record creation date
- `updated_at` (timestamp): Last update date

**Indexes:**
- `idx_parents_email` on `email`

**RLS Policies:**
- Parents can read their own data
- Admin can read/write all parent data

---

### 4. Admin
Stores administrator information and credentials.

**Columns:**
- `id` (uuid, PK): Unique admin identifier
- `name` (text): Full name
- `email` (text, unique): Email address (used for login)
- `password` (text): Hashed password
- `role` (text): Admin role (e.g., "Super Admin", "Registrar")
- `created_at` (timestamp): Record creation date

**Indexes:**
- `idx_admin_email` on `email`

**RLS Policies:**
- Only admins can access this table

---

### 5. student_parents
Junction table linking students to their parents/guardians.

**Columns:**
- `id` (uuid, PK): Unique relationship identifier
- `student_id` (uuid, FK → students): Student reference
- `parent_id` (uuid, FK → parents): Parent reference
- `relationship` (text): Relationship type (e.g., "Father", "Mother", "Guardian")
- `is_primary` (boolean): Is this the primary contact?
- `created_at` (timestamp): Record creation date

**Foreign Keys:**
- `student_id` → `students(id)` ON DELETE CASCADE
- `parent_id` → `parents(id)` ON DELETE CASCADE

**Indexes:**
- `idx_student_parents_student` on `student_id`
- `idx_student_parents_parent` on `parent_id`

---

### 6. attendance_records
Stores all attendance scans (RFID or manual).

**Columns:**
- `id` (uuid, PK): Unique attendance record identifier
- `student_id` (uuid, FK → students, nullable): Student reference
- `teacher_id` (uuid, FK → teachers, nullable): Teacher reference (if teacher attendance)
- `scan_type` (text): "TIME_IN" or "TIME_OUT"
- `scan_time` (timestamp): When the scan occurred (Manila timezone)
- `rfid` (text): RFID card number used
- `device_id` (text, nullable): ESP32 device identifier
- `notes` (text, nullable): Additional notes
- `created_at` (timestamp): Record creation date

**Check Constraints:**
- `scan_type` must be either "TIME_IN" or "TIME_OUT"
- Either `student_id` OR `teacher_id` must be set (not both)

**Foreign Keys:**
- `student_id` → `students(id)` ON DELETE SET NULL
- `teacher_id` → `teachers(id)` ON DELETE SET NULL

**Indexes:**
- `idx_attendance_student` on `student_id`
- `idx_attendance_teacher` on `teacher_id`
- `idx_attendance_scan_time` on `scan_time`
- `idx_attendance_scan_type` on `scan_type`

**RLS Policies:**
- Students can read their own attendance
- Teachers can read all student attendance
- Admin can read/write all attendance

---

### 7. classes
Stores class information.

**Columns:**
- `id` (uuid, PK): Unique class identifier
- `name` (text): Class name (e.g., "Math 10-A")
- `grade_level` (text): Grade level
- `section` (text): Section name
- `teacher_id` (uuid, FK → teachers): Assigned teacher
- `schedule` (jsonb, nullable): Class schedule
- `created_at` (timestamp): Record creation date

**Foreign Keys:**
- `teacher_id` → `teachers(id)` ON DELETE SET NULL

---

### 8. class_enrollments
Junction table linking students to classes.

**Columns:**
- `id` (uuid, PK): Unique enrollment identifier
- `student_id` (uuid, FK → students): Student reference
- `class_id` (uuid, FK → classes): Class reference
- `enrolled_at` (timestamp): Enrollment date

**Foreign Keys:**
- `student_id` → `students(id)` ON DELETE CASCADE
- `class_id` → `classes(id)` ON DELETE CASCADE

**Unique Constraint:**
- `(student_id, class_id)` - Prevent duplicate enrollments

---

### 9. grades
Stores student grades.

**Columns:**
- `id` (uuid, PK): Unique grade identifier
- `student_id` (uuid, FK → students): Student reference
- `class_id` (uuid, FK → classes): Class reference
- `quarter` (text): Grading period (e.g., "Q1", "Q2")
- `grade` (numeric): Numerical grade
- `remarks` (text, nullable): Teacher remarks
- `created_at` (timestamp): Record creation date

**Foreign Keys:**
- `student_id` → `students(id)` ON DELETE CASCADE
- `class_id` → `classes(id)` ON DELETE CASCADE

---

### 10. announcements
Stores school-wide announcements.

**Columns:**
- `id` (uuid, PK): Unique announcement identifier
- `title` (text): Announcement title
- `message` (text): Announcement content
- `author_id` (uuid, FK → Admin): Admin who created it
- `target_audience` (text): Who should see it (e.g., "all", "students", "teachers")
- `published` (boolean): Is it published?
- `created_at` (timestamp): Creation date
- `updated_at` (timestamp): Last update date

**Foreign Keys:**
- `author_id` → `Admin(id)` ON DELETE SET NULL

---

### 11. rfid_devices
Stores registered RFID scanner devices.

**Columns:**
- `id` (uuid, PK): Unique device identifier
- `device_id` (text, unique): ESP32 device ID
- `location` (text): Physical location (e.g., "Main Gate")
- `status` (text): "active" or "inactive"
- `last_seen` (timestamp, nullable): Last communication time
- `created_at` (timestamp): Registration date

---

## Database Relationships

```
students ──┬─> attendance_records
           ├─> class_enrollments ─> classes ─> teachers
           ├─> grades
           └─> student_parents ─> parents

teachers ──┬─> attendance_records
           └─> classes

Admin ─────> announcements
```

---

## Environment Variables

Create `.env.local` at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important:**
- `NEXT_PUBLIC_*` variables are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` is ONLY used server-side
- Never commit `.env.local` to git

---

## Client Usage

**Client-Side (uses anon key):**
```typescript
import { supabase } from '@/lib/supabaseClient'

const { data, error } = await supabase.from('students').select('*')
```

**Server-Side (uses service role key):**
```typescript
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabaseAdmin = getSupabaseAdmin()
const { data, error } = await supabaseAdmin.from('students').select('*')
```

---

## Health Check

Visit `/api/health/supabase` to verify database connectivity.

Expected response:
```json
{
  "status": "connected",
  "timestamp": "2024-12-10T10:30:00Z"
}
```

---

## Common Queries

### Get Student with Attendance
```sql
SELECT 
  s.*,
  COUNT(CASE WHEN ar.scan_type = 'TIME_IN' THEN 1 END) as days_present
FROM students s
LEFT JOIN attendance_records ar ON s.id = ar.student_id
WHERE s.id = 'student-uuid'
GROUP BY s.id;
```

### Get Students by Grade Level
```sql
SELECT * FROM students 
WHERE grade_level = 'Grade 10'
ORDER BY name;
```

### Get Attendance for Date Range
```sql
SELECT * FROM attendance_records
WHERE student_id = 'student-uuid'
  AND scan_time >= '2024-12-01T00:00:00'
  AND scan_time <= '2024-12-31T23:59:59'
ORDER BY scan_time DESC;
```

---

## Timezone Handling

**CRITICAL:** All timestamps use Manila timezone (Asia/Manila, UTC+8).

When querying dates:
```typescript
// Backend converts to Manila timezone
const manilaTime = new Date(scanDateTime.toLocaleString('en-US', { 
  timeZone: 'Asia/Manila' 
}))
```

When storing dates:
```typescript
// Frontend sends local date strings
const startDate = "2024-12-10" // Not ISO format!
```

---

## RLS Policies Setup

Enable Row Level Security on all tables:

```sql
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
-- etc.
```

Example policy (students can read their own data):
```sql
CREATE POLICY "Students can view own data" 
ON students 
FOR SELECT 
USING (auth.uid() = id);
```

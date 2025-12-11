# API Documentation

This document describes all API routes available in the Sto Niño de Praga Academy system.

## Base URL
All API routes are relative to: `/api/`

## Authentication
Most routes require authentication via Supabase Auth. The session is automatically validated using Supabase cookies.

---

## Admin Routes

### Get Attendance Reports
**Endpoint:** `GET /api/admin/attendance-reports`

Fetches student attendance data for a specific date range.

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format

**Response:**
```json
{
  "students": [
    {
      "id": "uuid",
      "name": "Juan Dela Cruz",
      "email": "juan@example.com",
      "grade_level": "Grade 10",
      "attendance": {
        "2024-12-09": {
          "time_in": "2024-12-09T08:30:00",
          "time_out": "2024-12-09T16:30:00",
          "status": "present"
        },
        "2024-12-10": {
          "time_in": null,
          "time_out": null,
          "status": "absent"
        }
      }
    }
  ],
  "dateRange": ["2024-12-09", "2024-12-10"]
}
```

**Notes:**
- Returns data in Manila timezone (UTC+8)
- Status can be: `present`, `absent`, `late`, `half-day`
- Dates with no attendance record show as absent

---

### Get Teacher Attendance
**Endpoint:** `GET /api/admin/teacher-attendance`

Fetches teacher attendance data for a specific date range.

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format

**Response:**
```json
{
  "teachers": [
    {
      "id": "uuid",
      "name": "Maria Santos",
      "email": "maria@example.com",
      "subject": "Mathematics",
      "attendance": {
        "2024-12-09": {
          "time_in": "2024-12-09T07:30:00",
          "time_out": "2024-12-09T17:00:00",
          "status": "present"
        }
      }
    }
  ],
  "dateRange": ["2024-12-09", "2024-12-10"]
}
```

---

### Get Admin Settings
**Endpoint:** `GET /api/admin/settings`

Retrieves system-wide settings.

**Response:**
```json
{
  "schoolName": "Sto Niño de Praga Academy",
  "timezone": "Asia/Manila",
  "rfidEnabled": true,
  "notificationsEnabled": true
}
```

---

## Student Routes

### Get Student Dashboard
**Endpoint:** `GET /api/student/dashboard`

Fetches student's dashboard data including grades, attendance summary, and announcements.

**Headers:**
- `Authorization`: Bearer token (or Supabase cookie)

**Response:**
```json
{
  "student": {
    "id": "uuid",
    "name": "Juan Dela Cruz",
    "grade_level": "Grade 10",
    "email": "juan@example.com"
  },
  "grades": [
    {
      "subject": "Mathematics",
      "grade": 95,
      "quarter": "Q2"
    }
  ],
  "attendance": {
    "present": 18,
    "absent": 2,
    "late": 1,
    "totalDays": 21
  },
  "announcements": [
    {
      "id": "uuid",
      "title": "Christmas Break",
      "message": "No classes from Dec 20-31",
      "date": "2024-12-01"
    }
  ]
}
```

---

### Update Student Profile
**Endpoint:** `POST /api/student/update-profile`

Updates student's profile information.

**Request Body:**
```json
{
  "student_id": "uuid",
  "phone": "+639171234567",
  "address": "123 Main St, Manila"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### Student Login
**Endpoint:** `POST /api/student/login`

**Note:** This endpoint is deprecated. Use Supabase Auth SDK directly instead:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'student@example.com',
  password: 'password123'
})
```

---

## Teacher Routes

### Get Teacher Classes
**Endpoint:** `GET /api/teacher/classes`

Fetches all classes assigned to the teacher.

**Response:**
```json
{
  "classes": [
    {
      "id": "uuid",
      "name": "Math 10-A",
      "grade_level": "Grade 10",
      "section": "Section A",
      "students": [
        {
          "id": "uuid",
          "name": "Juan Dela Cruz",
          "student_id": "2024-001"
        }
      ]
    }
  ]
}
```

---

### Mark Attendance
**Endpoint:** `POST /api/teacher/mark-attendance`

Manually marks student attendance (alternative to RFID).

**Request Body:**
```json
{
  "student_id": "uuid",
  "class_id": "uuid",
  "scan_type": "TIME_IN",
  "scan_time": "2024-12-10T08:30:00",
  "notes": "Late arrival"
}
```

**Response:**
```json
{
  "success": true,
  "attendance_id": "uuid"
}
```

---

## Parent Routes

### Get Parent Dashboard
**Endpoint:** `GET /api/parent/dashboard`

Fetches parent's dashboard including all children's data.

**Response:**
```json
{
  "parent": {
    "id": "uuid",
    "name": "Pedro Dela Cruz",
    "email": "pedro@example.com"
  },
  "children": [
    {
      "id": "uuid",
      "name": "Juan Dela Cruz",
      "grade_level": "Grade 10",
      "attendance": {
        "present": 18,
        "absent": 2,
        "late": 1
      },
      "recentGrades": [
        {
          "subject": "Mathematics",
          "grade": 95
        }
      ]
    }
  ]
}
```

---

## Attendance Routes

### Record RFID Scan
**Endpoint:** `POST /api/attendance/scan`

Called by ESP32 RFID scanner to record attendance.

**Request Body:**
```json
{
  "rfid": "1234567890",
  "scan_type": "TIME_IN",
  "device_id": "ESP32-001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance recorded",
  "student": {
    "name": "Juan Dela Cruz",
    "grade_level": "Grade 10"
  },
  "scan_time": "2024-12-10T08:30:00"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "RFID not found",
  "message": "No student found with this RFID"
}
```

---

## Health Check Routes

### Supabase Connection Test
**Endpoint:** `GET /api/health/supabase`

Tests connection to Supabase database.

**Response:**
```json
{
  "status": "connected",
  "timestamp": "2024-12-10T10:30:00Z"
}
```

---

## Admissions Routes

### Submit Admission Form
**Endpoint:** `POST /api/admissions`

Submits a new student admission application.

**Request Body:**
```json
{
  "studentName": "Juan Dela Cruz",
  "parentName": "Pedro Dela Cruz",
  "email": "pedro@example.com",
  "phone": "+639171234567",
  "gradeLevel": "Grade 10",
  "previousSchool": "Manila High School",
  "message": "Interested in enrolling for SY 2024-2025"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application_id": "uuid"
}
```

---

## Debug Routes

### Test Database Connection
**Endpoint:** `GET /api/debug/test-connection`

Tests database connection and returns sample data.

**Response:**
```json
{
  "connection": "success",
  "studentCount": 150,
  "teacherCount": 25
}
```

---

## Error Responses

All endpoints may return these error responses:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Please log in to access this resource"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong. Please try again later."
}
```

---

## Rate Limiting

- Most endpoints: 100 requests per minute per user
- RFID scan endpoint: 1000 requests per minute (to handle multiple scanners)
- Login endpoints: 5 requests per minute per IP

---

## Timezone Handling

**IMPORTANT:** All date/time values are in Manila timezone (Asia/Manila, UTC+8).

When sending dates to API:
- Use format: `YYYY-MM-DD` for dates
- Use format: `YYYY-MM-DDTHH:mm:ss` for date-times
- Do NOT convert to UTC manually - the backend handles this

Example:
```javascript
// Correct
const startDate = "2024-12-10"

// Incorrect (don't do this)
const startDate = new Date().toISOString() // This converts to UTC!
```

# Sto Niño de Praga Academy - Project Structure

## Overview
This is a Next.js school management system with RFID attendance tracking, built with TypeScript, Supabase, and Tailwind CSS.

## Tech Stack
- **Framework**: Next.js 16.0.8 (App Router + Turbopack)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript
- **Authentication**: Supabase Auth

## Directory Structure

```
/app                          # Next.js App Router pages
  /admin                      # Admin portal pages
    /attendance-reports       # Student attendance reports
    /teacher-attendance       # Teacher attendance tracking
    /live-attendance          # Real-time attendance monitoring
    /rfid-display            # RFID device status display
  /student                    # Student portal
  /teacher                    # Teacher portal
  /parent                     # Parent/Guardian portal
  /api                        # API routes
    /admin                    # Admin-only endpoints
    /student                  # Student endpoints
    /teacher                  # Teacher endpoints
    /parent                   # Parent endpoints
  /context                    # React Context providers
    user-context.tsx          # User authentication context

/lib                          # Utility libraries
  supabaseClient.ts           # Client-side Supabase instance
  supabaseAdmin.ts            # Server-side admin Supabase instance
  utils.ts                    # Utility functions
  notifications.ts            # Notification helpers

/components                   # Reusable UI components
  /ui                         # shadcn/ui base components

/public                       # Static assets (images, logos)

/docs                         # Documentation
  ARCHITECTURE.md             # System architecture
  BACKEND.md                  # Backend documentation
  FRONTEND.md                 # Frontend documentation
  SUPABASE.md                 # Database schema

Root Files:
  database.types.ts           # TypeScript types from Supabase
  tailwind.config.ts          # Tailwind configuration
  next.config.mjs             # Next.js configuration
```

## Key Features

### 1. Authentication System
- Multi-role login (Student, Teacher, Parent, Admin)
- Supabase Auth with `signInWithPassword`
- Session persistence across pages

### 2. RFID Attendance
- ESP32 RFID scanner integration
- Real-time attendance tracking
- Manila timezone support for accurate dates

### 3. User Portals
- **Admin**: Manage attendance, view reports, system settings
- **Teacher**: View classes, mark attendance
- **Student**: View grades, attendance records
- **Parent**: Monitor child's attendance and grades

### 4. Attendance Reports
- Date range filtering
- Export to CSV
- Visual charts and statistics
- Manila timezone (UTC+8) handling

## Database Tables (Supabase)

### Main Tables:
- `students` - Student information
- `teachers` - Teacher information
- `parents` - Parent/Guardian information
- `Admin` - Administrator accounts
- `attendance_records` - All attendance logs (RFID scans)
- `student_parents` - Student-Parent relationships
- `classes` - Class information
- `class_enrollments` - Student-Class relationships

### Supporting Tables:
- `announcements` - School announcements
- `rfid_devices` - RFID scanner devices
- `sms_notifications` - SMS notification logs
- `activity_logs` - System audit logs
- `system_settings` - Application settings

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## API Routes Pattern

```
/api/[role]/[action]
Example:
  /api/student/dashboard       - GET student dashboard data
  /api/admin/attendance-reports - GET attendance reports with filters
  /api/teacher/classes         - GET teacher's classes
```

## Important Notes

### Timezone Handling
- All dates use **Manila timezone (Asia/Manila, UTC+8)**
- Date conversions avoid UTC issues by:
  - Parsing dates as local time (`YYYY-MM-DDT00:00:00`)
  - Converting scan_time to Manila timezone before grouping
  - Returning date strings (YYYY-MM-DD) instead of ISO timestamps

### Security
- Service role key only used server-side (`lib/supabaseAdmin.ts`)
- Client-side uses anon key (`lib/supabaseClient.ts`)
- Row Level Security (RLS) policies in Supabase

### RFID Integration
- ESP32 Arduino code in `app/RFID.ino`
- Scans POST to `/api/attendance/scan`
- Supports both Time In and Time Out

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## External Hardware
- **ESP32 Microcontroller** - RFID scanner
- **MFRC522 RFID Module** - Card reader
- **LCD Display** - Show scan results
- **WiFi Connection** - POST scans to API

## Common Issues & Solutions

1. **Date showing wrong day**: Ensure Manila timezone is used in both frontend and backend
2. **Authentication not persisting**: Use Supabase Auth SDK, not custom APIs
3. **RFID scan timeout**: Check network connection and API endpoint availability

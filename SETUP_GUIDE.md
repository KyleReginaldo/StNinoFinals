# Setup Guide - Sto Niño de Praga Academy

Quick start guide to set up and run this project.

---

## Prerequisites

Install these before starting:

- **Node.js 18+** (included in `tools/node-v18.20.8-win-x64/`)
- **pnpm** (package manager)
- **Git**
- **Supabase Account** (for database)

---

## 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd StNinoFinals

# Install dependencies
pnpm install
```

---

## 2. Environment Setup

Create `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to get these:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. Database Setup

### Option A: Use Supabase Dashboard

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the SQL files in this order:

```sql
-- 1. Create tables
CREATE TABLE students (...);
CREATE TABLE teachers (...);
CREATE TABLE parents (...);
CREATE TABLE Admin (...);
CREATE TABLE attendance_records (...);
-- etc.

-- 2. Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- etc.

-- 3. Create policies
CREATE POLICY "Students can view own data" ON students...
-- etc.
```

### Option B: Use Migration Files

If you have migration files, run:
```bash
pnpm supabase db push
```

**See `docs/SUPABASE.md` for complete database schema**

---

## 4. Create Initial Admin User

Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO "Admin" (id, name, email, password, role, created_at)
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@school.com',
  'hashed_password_here',  -- Use proper password hashing!
  'Super Admin',
  NOW()
);
```

**Note:** For production, use proper password hashing (bcrypt, etc.)

---

## 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Login

Use one of these user types:

- **Admin**: admin@school.com
- **Teacher**: teacher@school.com
- **Student**: student@school.com
- **Parent**: parent@school.com

Default dashboards:
- Admin: `/admin`
- Teacher: `/teacher`
- Student: `/student`
- Parent: `/parent`

---

## 7. RFID Setup (Optional)

If using ESP32 RFID scanner:

1. Open `app/RFID.ino` in Arduino IDE
2. Update WiFi credentials:
   ```cpp
   const char* ssid = "Your_WiFi_SSID";
   const char* password = "Your_WiFi_Password";
   ```
3. Update API endpoint:
   ```cpp
   String serverUrl = "http://YOUR_IP:3000/api/attendance/scan";
   ```
4. Flash to ESP32 device

**See `app/ESP32_RFID_README.md` for complete hardware setup**

---

## Project Structure

```
/app
  /admin          - Admin portal pages
  /student        - Student portal pages
  /teacher        - Teacher portal pages
  /parent         - Parent portal pages
  /api            - API routes
  /context        - React Context providers

/lib
  supabaseClient.ts    - Client-side Supabase (anon key)
  supabaseAdmin.ts     - Server-side Supabase (service role key)

/components
  /ui             - Reusable UI components (shadcn/ui)

/docs             - Documentation files
```

---

## Common Commands

```bash
# Development
pnpm dev            # Start dev server
pnpm build          # Build for production
pnpm start          # Start production server

# Code Quality
pnpm lint           # Run ESLint
pnpm type-check     # Check TypeScript types

# Database
pnpm supabase status    # Check Supabase connection
```

---

## Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env.local` exists
- Verify all three environment variables are set
- Restart dev server after changing `.env.local`

### "Login not working"
- Verify Supabase Auth is enabled in dashboard
- Check that user exists in correct table (students, teachers, Admin, parents)
- Verify email matches in both Supabase Auth and table

### "Date showing wrong day"
- All dates should use Manila timezone (UTC+8)
- Don't convert dates to ISO format manually
- Backend handles timezone conversion

### "RFID scanner not connecting"
- Check WiFi credentials in Arduino code
- Verify API endpoint URL is correct
- Check firewall allows port 3000
- See `ESP32_ERROR-11_TROUBLESHOOTING.md`

---

## Documentation

- **Project Structure**: `PROJECT_STRUCTURE.md`
- **API Endpoints**: `API_DOCUMENTATION.md`
- **Database Schema**: `docs/SUPABASE.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **RFID Setup**: `app/ESP32_RFID_README.md`
- **Backend Guide**: `docs/BACKEND.md`
- **Frontend Guide**: `docs/FRONTEND.md`

---

## Need Help?

1. Check the documentation files listed above
2. Review error messages in browser console
3. Check Supabase logs in dashboard
4. Verify environment variables are set correctly

---

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Set environment variables in Vercel project settings
4. Deploy

**See `VERCEL_ENV_SETUP.md` for detailed Vercel setup**

### Other Platforms

This is a standard Next.js app and can be deployed to:
- Netlify
- Railway
- AWS Amplify
- Self-hosted VPS

Make sure to set environment variables in your deployment platform.

---

## Security Notes

- Never commit `.env.local` to Git (already in `.gitignore`)
- Service role key is ONLY for server-side use
- Enable Row Level Security (RLS) on all Supabase tables
- Use HTTPS in production
- Implement proper password hashing for new users

---

## License

[Add your license here]

## Credits

Built with:
- Next.js 16
- Supabase
- Tailwind CSS
- shadcn/ui
- TypeScript

# Change Log (CRF #25) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Admin › System › Change Log tab listing every change in the system with date & time, name, IP address and what changed.

**Architecture:** Postgres triggers write every INSERT/UPDATE/DELETE on the important tables into the existing (empty) `activity_logs` table, with the old and new row. The *who* comes from PostgREST request headers (`x-actor-id`, `x-actor-ip`) that our server-side Supabase admin client attaches — after verifying the caller's Supabase login token. The browser attaches that token to every `/api/` call. An admin-only API + page reads the log and shows a per-field diff.

**Tech Stack:** Next.js 16 route handlers, `next/headers`, Supabase (PostgREST `request.headers` GUC, plpgsql triggers), vitest.

**Spec:** CRF.xlsx row 25 — "Pa lagyan ng isang tab with change log sa system. including time and date, name, ip address tsaka changes".

## Global Constraints

- Table `activity_logs` already exists: `action, created_at, id, ip_address (inet), new_values jsonb, old_values jsonb, record_id text, table_name text, user_agent, user_id`.
- Logged tables: users, admissions, enrollment_requests, sections, classes, class_subjects, grades, rooms, announcements, academic_periods, user_relationships, system_settings; `attendance_records` UPDATE/DELETE only (RFID scans insert constantly).
- Never store secrets: strip any key containing `password` or `token` from old/new values.
- Logging must never block or fail a save: a missing/invalid token just means "unknown actor".
- No new dependencies.

## Review Focus

1. Admin edits a student → log row shows the admin's name, their IP, and only the changed fields.
2. Request with a forged/expired token → actor is blank, not the forged id (token is verified server-side).
3. Update that changes nothing (same values) → no log row.
4. Non-admin (or no token) calling the log API → 401/403; IP addresses are not public.
5. Cron/background route with no request context → still saves, logs with blank actor.

---

### Task 1: Browser sends the login token on every API call

**Files:** Create `components/auth-token-fetch.tsx`; modify `app/providers.tsx`, `app/api/student/login/route.ts`, `app/api/teacher/login/route.ts`, `app/login/page.tsx`.

- [ ] `AuthTokenFetch` (client, renders null): on mount wraps `window.fetch` once; for same-origin URLs starting `/api/` without an `Authorization` header, adds `Bearer <supabase.auth.getSession() access_token>` when present.
- [ ] Student/teacher login routes also return `session: { access_token, refresh_token }`; login page calls `supabase.auth.setSession(...)` before redirect (admin/parent already sign in in the browser).
- [ ] Mount `<AuthTokenFetch />` in `Providers`.
- [ ] Verify: tsc clean; in browser, an `/api/` request carries `Authorization` after login.

### Task 2: Server knows the verified actor

**Files:** Create `lib/audit.ts`; modify `lib/supabaseAdmin.ts`; switch server-side writes from `lib/supabaseClient` to `getSupabaseAdmin()` in `app/api/admissions/approve/route.ts`, `app/api/admin/students/route.ts`, `app/api/admin/attendance-live/route.ts`. Test: `__tests__/audit.test.ts`.

**Interfaces (produces):**
- `clientIp(h: Headers): string | null` — first `x-forwarded-for` entry, else `x-real-ip`.
- `actorHeaders(a: { id?: string | null; ip?: string | null; userAgent?: string | null }): Record<string, string>` — only non-empty `x-actor-id`, `x-actor-ip`, `x-actor-ua`.
- `getActor(): Promise<{ id: string | null; ip: string | null; userAgent: string | null } | null>` — `null` outside a request; verifies Bearer token via `auth.getUser(token)` with a 5-minute in-memory cache.
- Admin client created with `global.fetch = auditFetch` (adds `actorHeaders(await getActor())` to PostgREST calls; auth calls untouched to avoid recursion).

- [ ] Tests: `clientIp` (`"1.2.3.4, 10.0.0.1"` → `1.2.3.4`; none → null); `actorHeaders` drops empty values.

### Task 3: Triggers write the log

**Files:** Create `migrations/create-activity-log-triggers.sql`.

- [ ] `log_activity()` plpgsql, `SECURITY DEFINER`: reads `current_setting('request.headers', true)::json`; actor = `x-actor-id` header, else `auth.uid()`; ip = `x-actor-ip`; strips secret keys; skips UPDATE where old = new (ignoring `updated_at`); inserts into `activity_logs`.
- [ ] `AFTER INSERT OR UPDATE OR DELETE ... FOR EACH ROW` on the logged tables; `attendance_records` UPDATE/DELETE only. Idempotent (`DROP TRIGGER IF EXISTS`).
- [ ] User runs it in the Supabase SQL editor.

### Task 4: Log API (admin only)

**Files:** Create `app/api/admin/activity-logs/route.ts`.

- [ ] `GET ?from=&to=&table=&q=&page=` → `{ success, logs: [{ id, created_at, action, table_name, record_id, ip_address, user_agent, actor: { name, role } | null, old_values, new_values }], total }`, 50 per page, newest first. Actor names joined from `users`.
- [ ] 401 when `getActor()` has no id; 403 when that user's role ≠ admin.

### Task 5: Change Log tab

**Files:** Create `lib/activity-log.ts`, `app/admin/change-log/page.tsx`; modify `components/admin/sidebar.tsx` (System › Change Log). Test: `__tests__/activity-log.test.ts`.

**Interfaces:**
- `diffChanges(oldV, newV): { field: string; from: unknown; to: unknown }[]` — insert → all new fields; delete → all old fields; update → changed fields only; ignores `updated_at`, `created_at`.
- `describeRecord(table, row): string` — person name / `class_name` / `name` / `title`, else record id.
- `TABLE_LABELS: Record<string, string>` — e.g. `users` → "User", `classes` → "Subject".

- [ ] Tests for both helpers.
- [ ] Page: filters (date range, record type, search name), table: Date & Time · Name (role) · IP Address · Action · Record · Changes (`field: old → new`, long lists collapsed). Pagination.
- [ ] Verify in browser as admin after making one edit.

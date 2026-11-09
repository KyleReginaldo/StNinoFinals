-- Change Log (CRF #25): record every insert/update/delete on the main tables into
-- activity_logs, with who (verified by the app server), their IP, and old/new values.
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Who: the app's server verifies the user's login token and sends x-actor-id /
-- x-actor-ip / x-actor-ua headers with its database calls; PostgREST exposes them as
-- request.headers. Those headers are trusted ONLY on service-role requests (our
-- server). Any other caller is identified by its own login (auth.uid()) and the
-- gateway's IP, so nobody can forge a name.

CREATE OR REPLACE FUNCTION public.log_activity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  h        json;
  claims   json;
  old_j    jsonb;
  new_j    jsonb;
  rid      text;
  v_actor  uuid;
  v_ip     inet;
  v_ua     text;
  v_id_txt text;
  v_ip_txt text;
BEGIN
  BEGIN
    -- Never store secrets (strip before comparing, so a password-only change isn't a blank row)
    IF TG_OP <> 'INSERT' THEN
      SELECT jsonb_object_agg(key, value) INTO old_j FROM jsonb_each(to_jsonb(OLD)) WHERE key !~* '(password|token|secret)';
    END IF;
    IF TG_OP <> 'DELETE' THEN
      SELECT jsonb_object_agg(key, value) INTO new_j FROM jsonb_each(to_jsonb(NEW)) WHERE key !~* '(password|token|secret)';
    END IF;

    -- Nothing visible changed (ignoring updated_at) → don't log
    IF TG_OP = 'UPDATE' AND (old_j - 'updated_at') IS NOT DISTINCT FROM (new_j - 'updated_at') THEN
      RETURN NULL;
    END IF;

    h      := nullif(current_setting('request.headers', true), '')::json;
    claims := nullif(current_setting('request.jwt.claims', true), '')::json;

    IF claims ->> 'role' = 'service_role' THEN
      -- Our server: it verified the user's login token and passes who/where
      v_id_txt := h ->> 'x-actor-id';
      v_ip_txt := h ->> 'x-actor-ip';
      v_ua     := h ->> 'x-actor-ua';
    ELSE
      -- Anyone else (public key / signed-in browser): never trust custom headers
      v_id_txt := auth.uid()::text;
      v_ip_txt := trim(split_part(coalesce(h ->> 'cf-connecting-ip', h ->> 'x-forwarded-for', ''), ',', 1));
      v_ua     := h ->> 'user-agent';
    END IF;

    -- Tolerant casts: a bad value drops that one field, not the whole log row
    IF v_id_txt ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN v_actor := v_id_txt::uuid; END IF;
    BEGIN
      v_ip := nullif(v_ip_txt, '')::inet;
    EXCEPTION WHEN others THEN
      v_ip := NULL;
    END;

    -- activity_logs.record_id is uuid; tables with other id types store NULL
    rid := coalesce(new_j ->> 'id', old_j ->> 'id');

    INSERT INTO activity_logs (action, table_name, record_id, old_values, new_values, user_id, ip_address, user_agent, created_at)
    VALUES (
      lower(TG_OP),
      TG_TABLE_NAME,
      CASE WHEN rid ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN rid::uuid END,
      old_j,
      new_j,
      v_actor,
      v_ip,
      left(v_ua, 300),
      now()
    );
  EXCEPTION WHEN others THEN
    -- Logging must never block a save
    RAISE WARNING 'log_activity skipped: %', SQLERRM;
  END;
  RETURN NULL;
END;
$$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users', 'admissions', 'enrollment_requests', 'sections', 'classes', 'class_subjects',
    'grades', 'rooms', 'announcements', 'academic_periods', 'user_relationships', 'system_settings',
    'class_enrollments', 'user_classes'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_log_activity ON public.%I', t);
      EXECUTE format('CREATE TRIGGER trg_log_activity AFTER INSERT OR UPDATE OR DELETE ON public.%I
                      FOR EACH ROW EXECUTE FUNCTION public.log_activity()', t);
    END IF;
  END LOOP;

  -- Attendance: RFID scans insert all day, so only log edits and deletions
  IF to_regclass('public.attendance_records') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_log_activity ON public.attendance_records;
    CREATE TRIGGER trg_log_activity AFTER UPDATE OR DELETE ON public.attendance_records
      FOR EACH ROW EXECUTE FUNCTION public.log_activity();
  END IF;
END $$;

-- The log holds IPs and before/after values: only the server (service role) may read it.
-- The trigger runs as the table owner, so it can still write.
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON activity_logs FROM anon, authenticated;

-- Fast newest-first listing and filtering
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_table_idx ON activity_logs (table_name, created_at DESC);

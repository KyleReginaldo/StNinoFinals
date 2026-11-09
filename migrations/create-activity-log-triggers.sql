-- Change Log (CRF #25): record every insert/update/delete on the main tables into
-- activity_logs, with who (verified by the app server), their IP, and old/new values.
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Who: the app's server verifies the user's login token and sends x-actor-id /
-- x-actor-ip / x-actor-ua headers with its database calls; PostgREST exposes them as
-- request.headers. Those headers are trusted ONLY on service-role requests (our
-- server); anything else (e.g. the public anon key) uses auth.uid() so it can't forge
-- a name. activity_logs.record_id is uuid, so non-uuid ids are stored as NULL.

CREATE OR REPLACE FUNCTION public.log_activity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  h      json;
  trusted boolean;
  rid    text;
  old_j  jsonb := CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) END;
  new_j  jsonb := CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) END;
BEGIN
  -- Nothing actually changed (ignoring updated_at) → don't log
  IF TG_OP = 'UPDATE' AND (old_j - 'updated_at') = (new_j - 'updated_at') THEN
    RETURN NULL;
  END IF;

  BEGIN
    h := nullif(current_setting('request.headers', true), '')::json;
    trusted := coalesce(nullif(current_setting('request.jwt.claims', true), '')::json ->> 'role', '') = 'service_role';
    IF NOT trusted THEN h := NULL; END IF;

    -- Never store secrets
    SELECT jsonb_object_agg(key, value) INTO old_j FROM jsonb_each(old_j) WHERE key !~* '(password|token|secret)';
    SELECT jsonb_object_agg(key, value) INTO new_j FROM jsonb_each(new_j) WHERE key !~* '(password|token|secret)';

    rid := coalesce(new_j ->> 'id', old_j ->> 'id');

    INSERT INTO activity_logs (action, table_name, record_id, old_values, new_values, user_id, ip_address, user_agent, created_at)
    VALUES (
      lower(TG_OP),
      TG_TABLE_NAME,
      CASE WHEN rid ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN rid::uuid END,
      old_j,
      new_j,
      coalesce(nullif(h ->> 'x-actor-id', '')::uuid, auth.uid()),
      nullif(h ->> 'x-actor-ip', '')::inet,
      h ->> 'x-actor-ua',
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
    'grades', 'rooms', 'announcements', 'academic_periods', 'user_relationships', 'system_settings'
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

-- Fast newest-first listing and filtering
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_table_idx ON activity_logs (table_name, created_at DESC);

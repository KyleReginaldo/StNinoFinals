-- Client: "Dapat pwede same subject code and subject name" — e.g. MATH101 for
-- Grade 7 Rizal and Grade 7 Bonifacio. Drops any UNIQUE constraint or unique index
-- on classes that covers class_code and/or class_name (never the primary key).
-- Safe to re-run; prints what it dropped.

DO $$
DECLARE
  r record;
BEGIN
  -- Unique constraints
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid AND rel.relname = 'classes'
    JOIN pg_namespace ns ON ns.oid = rel.relnamespace AND ns.nspname = 'public'
    WHERE con.contype = 'u'
      AND EXISTS (
        SELECT 1 FROM unnest(con.conkey) k
        JOIN pg_attribute a ON a.attrelid = rel.oid AND a.attnum = k
        WHERE a.attname IN ('class_code', 'class_name')
      )
  LOOP
    EXECUTE format('ALTER TABLE public.classes DROP CONSTRAINT %I', r.conname);
    RAISE NOTICE 'Dropped constraint %', r.conname;
  END LOOP;

  -- Unique indexes not backing a constraint
  FOR r IN
    SELECT i.relname AS indexname
    FROM pg_index ix
    JOIN pg_class t ON t.oid = ix.indrelid AND t.relname = 'classes'
    JOIN pg_namespace ns ON ns.oid = t.relnamespace AND ns.nspname = 'public'
    JOIN pg_class i ON i.oid = ix.indexrelid
    WHERE ix.indisunique AND NOT ix.indisprimary
      AND NOT EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conindid = ix.indexrelid)
      AND EXISTS (
        SELECT 1 FROM unnest(ix.indkey) k
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k
        WHERE a.attname IN ('class_code', 'class_name')
      )
  LOOP
    EXECUTE format('DROP INDEX public.%I', r.indexname);
    RAISE NOTICE 'Dropped index %', r.indexname;
  END LOOP;
END $$;

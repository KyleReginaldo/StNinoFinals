-- Normalize grade level values to the canonical set: 'Kinder', 'Grade 1' … 'Grade 12'.
-- The landing form used to store 'kindergarten' / 'grade1'; approval copied that
-- into users.grade_level, which broke section lookups. Safe to re-run.

CREATE OR REPLACE FUNCTION pg_temp.norm_grade(v text) RETURNS text AS $$
  SELECT CASE
    WHEN v IS NULL THEN NULL
    WHEN trim(v) ~* '^kinder(garten)?$' THEN 'Kinder'
    WHEN trim(v) ~* '^grade\s*0*\d+$' THEN 'Grade ' || (regexp_replace(trim(v), '\D', '', 'g'))::int
    ELSE v
  END
$$ LANGUAGE sql IMMUTABLE;

UPDATE admissions          SET intended_grade_level = pg_temp.norm_grade(intended_grade_level) WHERE intended_grade_level IS DISTINCT FROM pg_temp.norm_grade(intended_grade_level);
UPDATE users               SET grade_level = pg_temp.norm_grade(grade_level) WHERE grade_level IS DISTINCT FROM pg_temp.norm_grade(grade_level);
UPDATE enrollment_requests SET grade_level = pg_temp.norm_grade(grade_level) WHERE grade_level IS DISTINCT FROM pg_temp.norm_grade(grade_level);
UPDATE sections            SET grade_level = pg_temp.norm_grade(grade_level) WHERE grade_level IS DISTINCT FROM pg_temp.norm_grade(grade_level);
UPDATE classes             SET grade_level = pg_temp.norm_grade(grade_level) WHERE grade_level IS DISTINCT FROM pg_temp.norm_grade(grade_level);

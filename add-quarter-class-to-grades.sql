-- Add quarter and class_id columns to grades table
-- quarter: tracks which grading period (1st, 2nd, 3rd, 4th)
-- class_id: links a grade entry to a specific class (fixes ambiguity when
--           a student has the same subject across multiple teachers/classes)

ALTER TABLE grades
ADD COLUMN IF NOT EXISTS quarter INTEGER
  CHECK (quarter BETWEEN 1 AND 4);

ALTER TABLE grades
ADD COLUMN IF NOT EXISTS class_id UUID
  REFERENCES classes(id) ON DELETE SET NULL;

COMMENT ON COLUMN grades.quarter  IS 'Grading quarter (1-4)';
COMMENT ON COLUMN grades.class_id IS 'FK to classes – identifies which class this grade belongs to';

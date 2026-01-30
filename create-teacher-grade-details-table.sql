-- Create teacher_grade_details table to store detailed grading components
CREATE TABLE IF NOT EXISTS public.teacher_grade_details (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  student_id UUID NOT NULL,
  class_id UUID NOT NULL,
  subject TEXT NOT NULL,
  teacher_id UUID NOT NULL,
  
  -- Written Work scores (array of 5 scores)
  written_work_1 NUMERIC,
  written_work_2 NUMERIC,
  written_work_3 NUMERIC,
  written_work_4 NUMERIC,
  written_work_5 NUMERIC,
  
  -- Performance Tasks scores (array of 5 scores)
  performance_task_1 NUMERIC,
  performance_task_2 NUMERIC,
  performance_task_3 NUMERIC,
  performance_task_4 NUMERIC,
  performance_task_5 NUMERIC,
  
  -- Quarterly Assessment
  quarterly_assessment NUMERIC,
  
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT teacher_grade_details_pkey PRIMARY KEY (id),
  CONSTRAINT teacher_grade_details_student_fkey FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT teacher_grade_details_class_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT teacher_grade_details_teacher_fkey FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT teacher_grade_details_unique UNIQUE (student_id, class_id, subject)
) TABLESPACE pg_default;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teacher_grade_details_student ON teacher_grade_details(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_grade_details_class ON teacher_grade_details(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_grade_details_teacher ON teacher_grade_details(teacher_id);

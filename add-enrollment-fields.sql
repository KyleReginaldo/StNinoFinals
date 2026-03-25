-- Add previous_grades_url column to enrollment_requests
ALTER TABLE enrollment_requests
ADD COLUMN IF NOT EXISTS previous_grades_url text DEFAULT NULL;

-- Create storage bucket for enrollment documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload and view documents
-- (You may need to adjust these policies based on your exact security requirements)
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'documents' );

CREATE POLICY "Allow public viewing of documents" 
ON storage.objects FOR SELECT 
TO public 
USING ( bucket_id = 'documents' );
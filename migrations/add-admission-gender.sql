-- Client: "Wala pa rin gender/sex sa admission". Applicant's sex on the admission
-- form ('Male' | 'Female'); copied to users.gender when the admission is approved.
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS gender text;

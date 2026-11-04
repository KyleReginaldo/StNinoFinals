-- Guardian's home address (CRF: required on every guardian form).
-- Stored composed: "street, Brgy. X, City, Province". Safe to re-run.
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS guardian_address text;
ALTER TABLE users      ADD COLUMN IF NOT EXISTS guardian_address text;

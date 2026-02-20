-- Add password_change_required column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_change_required BOOLEAN DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN users.password_change_required IS 'Indicates if user must change password on next login (for admin-created accounts)';

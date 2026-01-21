-- Add username and password_changed columns to profiles table
-- This allows barbers to login with username and tracks if they've changed their initial password

-- Add username column (unique)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add password_changed flag (default false for new accounts)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT false;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Add comment to explain the columns
COMMENT ON COLUMN profiles.username IS 'Unique username for login (format: firstname.lastname)';
COMMENT ON COLUMN profiles.password_changed IS 'Tracks if user has changed their initial auto-generated password';

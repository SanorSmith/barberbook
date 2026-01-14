-- CREATE ADMIN USER
-- Run this SQL in Supabase SQL Editor after registering a user

-- Option 1: Update existing user by email
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@barberbook.com';

-- Option 2: Update by user ID (if you know the ID)
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = 'your-user-id-here';

-- Verify the admin user was created
SELECT id, email, full_name, role, created_at 
FROM profiles 
WHERE role = 'admin';

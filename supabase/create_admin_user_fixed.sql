-- ============================================
-- CREATE ADMIN USER - FIXED VERSION
-- ============================================
-- This script creates an admin user directly in Supabase
-- Admin users CANNOT be created through the UI registration
-- Run this in Supabase Dashboard > SQL Editor

-- STEP 1: Create the auth user ONLY
-- The trigger will automatically create the profile
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@barberbook.com', -- CHANGE THIS to your admin email
  crypt('Admin123!', gen_salt('bf')), -- CHANGE THIS to your admin password
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User"}', -- CHANGE THIS to admin name
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- STEP 2: Update the created profile to admin role
-- The trigger created it with 'customer' role, so we need to update it
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@barberbook.com';

-- STEP 3: Verify admin user was created
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@barberbook.com';

-- ============================================
-- ALTERNATIVE METHOD (if the above doesn't work)
-- ============================================
-- If you still get errors, try this approach:

/*
-- Disable the trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create auth user
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@barberbook.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User"}',
  NOW(), NOW(), '', '', '', ''
);

-- Create profile manually with admin role
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name',
  'admin', -- Set role as admin
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'admin@barberbook.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
*/

-- ============================================
-- EXPECTED OUTPUT:
-- You should see one row with:
-- - email: admin@barberbook.com
-- - role: admin
-- - email_confirmed_at: current timestamp
-- ============================================

-- ============================================
-- TO CREATE ADDITIONAL ADMIN USERS:
-- ============================================
-- Simply change the email, password, and full_name in STEP 1
-- Then run the script again

-- Example for second admin:
/*
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin2@barberbook.com',
  crypt('SecurePassword123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Second Admin"}',
  NOW(), NOW(), '', '', '', ''
);

UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin2@barberbook.com';
*/

-- ============================================
-- TROUBLESHOOTING:
-- ============================================
-- If you still get errors:
-- 1. Make sure you're running this in Supabase SQL Editor
-- 2. Check that the auth.users table exists
-- 3. Check that the profiles table exists
-- 4. Try the alternative method above
-- 5. Contact support if issues persist

-- ============================================
-- SECURITY NOTES:
-- ============================================
-- 1. Admin users can ONLY be created via this SQL script
-- 2. UI registration is blocked from creating admin users
-- 3. Barber users should be created by admin through the dashboard
-- 4. Customer users are created through normal registration
-- 5. Never share admin credentials
-- 6. Use strong passwords for admin accounts

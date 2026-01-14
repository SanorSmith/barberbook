-- ============================================
-- CREATE ADMIN USER - SUPABASE SQL EDITOR ONLY
-- ============================================
-- This script creates an admin user directly in Supabase
-- Admin users CANNOT be created through the UI registration
-- Run this in Supabase Dashboard > SQL Editor

-- STEP 1: Create the auth user
-- Replace with your desired admin credentials
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

-- STEP 2: Create the profile with admin role
-- This will be created automatically by the trigger, but we ensure it's admin
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name',
  'admin', -- Set role as admin
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'admin@barberbook.com' -- Match the email from STEP 1
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';

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
-- EXPECTED OUTPUT:
-- You should see one row with:
-- - email: admin@barberbook.com
-- - role: admin
-- - email_confirmed_at: current timestamp
-- ============================================

-- ============================================
-- TO CREATE ADDITIONAL ADMIN USERS:
-- ============================================
-- Simply change the email, password, and full_name in STEP 1 and STEP 2
-- Then run the script again

-- Example for second admin:
/*
-- STEP 1: Create auth user
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

-- STEP 2: Create profile
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT id, email, raw_user_meta_data->>'full_name', 'admin', NOW(), NOW()
FROM auth.users WHERE email = 'admin2@barberbook.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
*/

-- ============================================
-- SECURITY NOTES:
-- ============================================
-- 1. Admin users can ONLY be created via this SQL script
-- 2. UI registration is blocked from creating admin users
-- 3. Barber users should be created by admin through the dashboard
-- 4. Customer users are created through normal registration
-- 5. Never share admin credentials
-- 6. Use strong passwords for admin accounts

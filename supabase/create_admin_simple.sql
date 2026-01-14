-- ============================================
-- CREATE ADMIN USER - SIMPLE WORKING VERSION
-- ============================================
-- This script creates an admin user in Supabase
-- Run this in Supabase Dashboard > SQL Editor

-- STEP 1: Create the auth user
-- The trigger will automatically create the profile with 'customer' role
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

-- STEP 2: Update the profile to admin role
-- The trigger created it with 'customer' role, so we update it to 'admin'
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
-- EXPECTED OUTPUT:
-- You should see one row with:
-- - email: admin@barberbook.com
-- - role: admin
-- - email_confirmed_at: current timestamp
-- ============================================

-- ============================================
-- CUSTOMIZE YOUR ADMIN USER:
-- ============================================
-- Before running, change these values:
-- 1. admin@barberbook.com → Your admin email
-- 2. Admin123! → Your secure password  
-- 3. Admin User → Your admin name

-- ============================================
-- ALTERNATIVE: If you need to reset password
-- ============================================
/*
UPDATE auth.users 
SET encrypted_password = crypt('NewPassword123!', gen_salt('bf'))
WHERE email = 'admin@barberbook.com';
*/

-- ============================================
-- ALTERNATIVE: If you need to change admin email
-- ============================================
/*
-- Update auth.users email
UPDATE auth.users 
SET email = 'newadmin@barberbook.com'
WHERE email = 'admin@barberbook.com';

-- Update profiles email
UPDATE public.profiles 
SET email = 'newadmin@barberbook.com'
WHERE email = 'admin@barberbook.com';
*/

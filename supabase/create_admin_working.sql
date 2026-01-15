-- ============================================
-- CREATE ADMIN USER - WORKING VERSION
-- ============================================
-- Run this in Supabase Dashboard > SQL Editor
-- Make sure to change the email, password, and name below

-- STEP 1: Create the auth user
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
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@barberbook.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Admin User"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  '';

-- STEP 2: Update the profile to admin role
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

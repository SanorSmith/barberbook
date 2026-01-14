-- ============================================
-- CREATE ADMIN USER - FINAL WORKING VERSION
-- ============================================
-- IMPORTANT: Run each section separately in Supabase SQL Editor
-- Do NOT run all at once - run STEP 1, then STEP 2, then STEP 3

-- ============================================
-- STEP 1: Create the auth user
-- Copy and run this first
-- ============================================
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Insert into auth.users
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
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'admin@barberbook.com',  -- CHANGE THIS
    crypt('Admin123!', gen_salt('bf')),  -- CHANGE THIS
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}',  -- CHANGE THIS
    now(),
    now(),
    '',
    '',
    '',
    ''
  );
  
  RAISE NOTICE 'Admin user created with ID: %', new_user_id;
END $$;

-- ============================================
-- STEP 2: Update profile to admin role
-- Wait for STEP 1 to complete, then run this
-- ============================================
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@barberbook.com';  -- CHANGE THIS to match STEP 1

-- ============================================
-- STEP 3: Verify admin user was created
-- Run this to check everything worked
-- ============================================
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@barberbook.com';  -- CHANGE THIS to match STEP 1

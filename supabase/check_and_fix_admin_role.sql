-- ============================================
-- CHECK AND FIX ADMIN ROLE
-- ============================================
-- This will check the current role and update it to admin

-- STEP 1: Check current role for admin@barberbook.com
SELECT 
  id,
  user_id,
  email,
  full_name,
  role,
  municipality,
  created_at
FROM public.profiles
WHERE email = 'admin@barberbook.com';

-- STEP 2: Update role to admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@barberbook.com';

-- STEP 3: Verify the update
SELECT 
  id,
  user_id,
  email,
  full_name,
  role,
  municipality,
  created_at
FROM public.profiles
WHERE email = 'admin@barberbook.com';

-- STEP 4: Check if there are any other admin users
SELECT 
  id,
  email,
  full_name,
  role
FROM public.profiles
WHERE role = 'admin';

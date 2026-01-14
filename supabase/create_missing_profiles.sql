-- ============================================
-- CREATE MISSING PROFILES FOR EXISTING USERS
-- ============================================
-- This will create profiles for all users in auth.users that don't have profiles

-- Step 1: Create profiles for all existing auth users
INSERT INTO public.profiles (
  id,
  user_id,
  email,
  full_name,
  municipality,
  role,
  created_at,
  updated_at
)
SELECT
  u.id,
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  '',
  'customer',
  u.created_at,
  now()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Update admin@barberbook.com to admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@barberbook.com';

-- Step 3: Verify all profiles were created
SELECT 
  u.id,
  u.email,
  u.created_at as auth_created,
  p.role,
  p.full_name,
  p.municipality
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Step 4: Count profiles by role
SELECT 
  role,
  COUNT(*) as count
FROM public.profiles
GROUP BY role
ORDER BY role;

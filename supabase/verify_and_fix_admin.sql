-- ============================================
-- VERIFY AND FIX ADMIN USER
-- ============================================

-- STEP 1: Find the user by email and check their role
SELECT 
  id,
  user_id,
  email,
  full_name,
  role,
  municipality,
  phone,
  created_at
FROM public.profiles
WHERE email = 'admin@barberbook.com';

-- If the role shows 'customer', run STEP 2
-- If no results, the user doesn't exist - you need to register first

-- STEP 2: Force update to admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@barberbook.com'
RETURNING id, email, full_name, role;

-- STEP 3: Verify in auth.users table
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.raw_user_meta_data,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@barberbook.com';

-- STEP 4: Check all users with admin role
SELECT 
  id,
  email,
  full_name,
  role
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ============================================
-- CHECK FOR ADMIN USERS IN DATABASE
-- ============================================

-- Query 1: Check all users with admin role
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
WHERE role = 'admin'
ORDER BY created_at DESC;

-- Query 2: Check the user you registered (admin@barberbook.com)
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

-- Query 3: Count users by role
SELECT 
  role,
  COUNT(*) as count
FROM public.profiles
GROUP BY role
ORDER BY role;

-- Query 4: Check all users in the database
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 20;

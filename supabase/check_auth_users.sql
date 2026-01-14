-- ============================================
-- CHECK AUTH USERS TABLE
-- ============================================
-- No users in profiles table means either:
-- 1. No users registered at all
-- 2. Database trigger failed to create profiles

-- Check if users exist in auth.users table
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- Check if the trigger exists
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Check if the function exists
SELECT 
  proname as function_name,
  prosrc as function_code
FROM pg_proc
WHERE proname = 'handle_new_user';

-- ============================================
-- FIX TRIGGER - EXACT FOR YOUR TABLE STRUCTURE
-- ============================================
-- Based on your profiles table structure:
-- NOT NULL columns: id, user_id, full_name, email, role, municipality
-- NULLABLE columns: phone, avatar_url, created_at, updated_at

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create trigger function with ALL required columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    user_id,
    full_name,
    email,
    phone,
    role,
    municipality,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,                                              -- id (NOT NULL)
    NEW.id,                                              -- user_id (NOT NULL) - same as id
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), -- full_name (NOT NULL)
    NEW.email,                                           -- email (NOT NULL)
    NEW.raw_user_meta_data->>'phone',                   -- phone (NULLABLE)
    'customer',                                          -- role (NOT NULL) - always customer for new registrations
    '',                                                  -- municipality (NOT NULL) - empty string default
    NULL,                                                -- avatar_url (NULLABLE)
    NOW(),                                               -- created_at (NULLABLE but has default)
    NOW()                                                -- updated_at (NULLABLE but has default)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth user creation
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger was created
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Test: Show the function definition
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'handle_new_user';

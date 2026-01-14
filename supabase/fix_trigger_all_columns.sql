-- ============================================
-- FIX TRIGGER - HANDLE ALL REQUIRED COLUMNS
-- ============================================
-- This will check what columns exist in profiles table
-- and create a trigger that handles all of them

-- First, let's see what columns exist in profiles table
SELECT column_name, is_nullable, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Based on the error, we know these columns exist and are NOT NULL:
-- id, user_id, email, full_name, municipality, role, created_at, updated_at

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create comprehensive function that handles all columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with all required columns
  -- Set municipality to empty string as default
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
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    '', -- Empty string for municipality
    'customer',
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger was created
SELECT 'Trigger created successfully' as status;

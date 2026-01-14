-- ============================================
-- PREVENT ADMIN/BARBER CREATION VIA UI
-- ============================================
-- This migration ensures that:
-- 1. Only 'customer' role can be created via UI registration
-- 2. Admin users can ONLY be created via SQL Editor
-- 3. Barber users can ONLY be created by admin through dashboard

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function that enforces customer role for new registrations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with customer role by default
  -- Admin and barber roles can only be set manually or by admin
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer', -- Always set to customer for new registrations
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

-- ============================================
-- ADD CHECK CONSTRAINT TO PREVENT INVALID ROLES
-- ============================================
-- Ensure only valid roles can be stored
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('customer', 'barber', 'admin'));

-- ============================================
-- CREATE FUNCTION TO PREVENT ADMIN ROLE VIA API
-- ============================================
-- This function prevents any API call from setting admin role
CREATE OR REPLACE FUNCTION public.prevent_admin_role_via_api()
RETURNS TRIGGER AS $$
BEGIN
  -- If trying to set admin role and not from SQL Editor (no special flag)
  IF NEW.role = 'admin' AND OLD.role IS NOT NULL AND OLD.role != 'admin' THEN
    -- Check if this is being done via SQL Editor or by existing admin
    -- If current user is not admin, prevent the change
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Admin role can only be set via Supabase SQL Editor or by existing admin users';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce admin role restriction
DROP TRIGGER IF EXISTS prevent_admin_role_trigger ON public.profiles;
CREATE TRIGGER prevent_admin_role_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role = 'admin' AND OLD.role != 'admin')
  EXECUTE FUNCTION public.prevent_admin_role_via_api();

-- ============================================
-- UPDATE RLS POLICIES FOR PROFILES
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recreate policies with role restrictions
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = OLD.role -- Prevent users from changing their own role
  );

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    AND (
      -- Admins can change role to customer or barber, but not to admin
      NEW.role IN ('customer', 'barber')
      OR (NEW.role = 'admin' AND OLD.role = 'admin') -- Keep existing admin
    )
  );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the migration worked:

-- 1. Check that trigger exists
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 2. Check that function exists
-- SELECT * FROM pg_proc WHERE proname = 'handle_new_user';

-- 3. Check that constraint exists
-- SELECT * FROM pg_constraint WHERE conname = 'profiles_role_check';

-- 4. Test that new users get customer role
-- (Register a new user via UI and check their role)

-- ============================================
-- NOTES:
-- ============================================
-- 1. All new UI registrations will have 'customer' role
-- 2. Admin users must be created using create_admin_user.sql
-- 3. Barber users should be created by admin through dashboard
-- 4. Users cannot change their own role
-- 5. Admins can change user roles to customer or barber only
-- 6. Admin role can only be set via SQL Editor

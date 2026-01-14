-- ============================================
-- CREATE ADMIN USER - DIRECT METHOD
-- ============================================
-- This creates admin by using UI registration first,
-- then updating the role via SQL

-- OPTION 1: If you already registered via UI
-- Just run this to upgrade existing user to admin:
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@barberbook.com';

-- Then verify:
SELECT id, email, full_name, role, municipality
FROM public.profiles
WHERE email = 'admin@barberbook.com';

-- ============================================
-- OPTION 2: Create completely via SQL
-- ============================================
-- If the above doesn't work, use this method:
-- First, check what the role constraint allows:

SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
AND conname LIKE '%role%';

-- If the constraint shows role can be 'admin', 'barber', 'customer'
-- Then you can create the user manually:

-- Create a unique ID
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  hashed_password text;
BEGIN
  -- Hash the password
  hashed_password := crypt('Admin123!', gen_salt('bf'));
  
  -- Insert into auth.users (this will trigger profile creation)
  -- But we'll update it immediately after
  PERFORM 1; -- Placeholder, actual insert happens via Supabase Auth
  
  RAISE NOTICE 'Please use the UI to register first, then run the UPDATE query above';
END $$;

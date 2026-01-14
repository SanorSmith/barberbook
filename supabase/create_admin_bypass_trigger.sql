-- ============================================
-- CREATE ADMIN USER - BYPASS TRIGGER METHOD
-- ============================================
-- This method temporarily disables the trigger to avoid conflicts

-- STEP 1: Check the role constraint to see what values are allowed
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
AND conname LIKE '%role%';

-- STEP 2: Disable the trigger temporarily
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- STEP 3: Create the auth user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  new_user_id := gen_random_uuid();
  
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
    'admin@barberbook.com',
    crypt('Admin123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );
  
  RAISE NOTICE 'Auth user created with ID: %', new_user_id;
END $$;

-- STEP 4: Manually create the profile with admin role
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
  id,
  id,
  email,
  raw_user_meta_data->>'full_name',
  '',
  'admin',
  now(),
  now()
FROM auth.users
WHERE email = 'admin@barberbook.com';

-- STEP 5: Re-enable the trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- STEP 6: Verify admin user was created
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role,
  p.municipality
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@barberbook.com';

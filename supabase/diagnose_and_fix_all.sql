-- ============================================
-- COMPREHENSIVE DIAGNOSTIC AND FIX SCRIPT
-- ============================================

-- 1. Check if there are any bookings
SELECT 'Total Bookings:' as info, COUNT(*) as count FROM bookings;

-- 2. Check bookings with details
SELECT 
  b.id,
  b.booking_date,
  b.booking_time,
  b.status,
  b.user_id,
  b.barber_id,
  b.service_id,
  p.full_name as customer_name,
  br.name as barber_name,
  s.name as service_name
FROM bookings b
LEFT JOIN profiles p ON b.user_id = p.id
LEFT JOIN barbers br ON b.barber_id = br.id
LEFT JOIN services s ON b.service_id = s.id
ORDER BY b.created_at DESC
LIMIT 10;

-- 3. Check customers
SELECT 'Total Customers:' as info, COUNT(*) as count FROM profiles WHERE role = 'customer';

-- 4. Check barbers
SELECT 'Total Active Barbers:' as info, COUNT(*) as count FROM barbers WHERE is_active = true;

-- 5. Check services
SELECT 'Total Active Services:' as info, COUNT(*) as count FROM services WHERE is_active = true;

-- 6. Check current RLS policies on bookings
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;

-- ============================================
-- FIX RLS POLICIES FOR BOOKINGS
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can insert bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON bookings;
DROP POLICY IF EXISTS "Barbers can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Admin policies (full access)
CREATE POLICY "admin_select_bookings"
ON bookings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "admin_insert_bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "admin_update_bookings"
ON bookings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "admin_delete_bookings"
ON bookings FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Customer policies (own bookings only)
CREATE POLICY "customer_select_own_bookings"
ON bookings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "customer_insert_own_bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "customer_update_own_bookings"
ON bookings FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Barber policies (view their assigned bookings)
CREATE POLICY "barber_select_assigned_bookings"
ON bookings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'barber'
  )
);

-- Verify new policies
SELECT 
  'New Policies:' as info,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;

-- ============================================
-- CREATE SAMPLE DATA (if needed)
-- ============================================

-- Check if we need sample data
DO $$
DECLARE
  customer_count INT;
  barber_count INT;
  service_count INT;
  booking_count INT;
BEGIN
  SELECT COUNT(*) INTO customer_count FROM profiles WHERE role = 'customer';
  SELECT COUNT(*) INTO barber_count FROM barbers WHERE is_active = true;
  SELECT COUNT(*) INTO service_count FROM services WHERE is_active = true;
  SELECT COUNT(*) INTO booking_count FROM bookings;
  
  RAISE NOTICE 'Customers: %, Barbers: %, Services: %, Bookings: %', 
    customer_count, barber_count, service_count, booking_count;
END $$;

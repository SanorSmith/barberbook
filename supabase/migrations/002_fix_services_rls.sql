-- Fix RLS policies for services table to allow admin CRUD operations

-- Enable RLS on services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view services" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;
DROP POLICY IF EXISTS "Admin full access to services" ON services;

-- Allow everyone to view active services
CREATE POLICY "Anyone can view services" ON services
  FOR SELECT USING (true);

-- Allow admins to do everything (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Also ensure barbers table has proper RLS
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view barbers" ON barbers;
DROP POLICY IF EXISTS "Admins can manage barbers" ON barbers;
DROP POLICY IF EXISTS "Barbers can update own profile" ON barbers;

CREATE POLICY "Anyone can view active barbers" ON barbers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage barbers" ON barbers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Barbers can update own profile" ON barbers
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- Ensure bookings table has proper RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Barbers can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Barbers can update their bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;

CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Barbers can view their bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM barbers 
      WHERE barbers.id = bookings.barber_id 
      AND barbers.user_id = auth.uid()
    )
  );

CREATE POLICY "Barbers can update their bookings" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM barbers 
      WHERE barbers.id = bookings.barber_id 
      AND barbers.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all bookings" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Ensure reviews table has proper RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;

CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage reviews" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

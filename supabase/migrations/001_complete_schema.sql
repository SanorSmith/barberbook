-- BarberBook Complete Database Schema
-- This adds missing tables to the existing schema

-- Add language_preference to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='language_preference') THEN
    ALTER TABLE profiles ADD COLUMN language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'fi', 'sv'));
  END IF;
END $$;

-- Barber Services junction table (for custom pricing)
CREATE TABLE IF NOT EXISTS barber_services (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  custom_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barber_id, service_id)
);

-- Working Hours table (replaces barber_schedules with better naming)
CREATE TABLE IF NOT EXISTS working_hours (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Off table
CREATE TABLE IF NOT EXISTS time_off (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shop Settings table
CREATE TABLE IF NOT EXISTS shop_settings (
  id SERIAL PRIMARY KEY,
  shop_name TEXT DEFAULT 'BarberBook',
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  advance_booking_days INTEGER DEFAULT 30,
  cancellation_hours INTEGER DEFAULT 24,
  slot_interval_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to services table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='services' AND column_name='image_url') THEN
    ALTER TABLE services ADD COLUMN image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='services' AND column_name='display_order') THEN
    ALTER TABLE services ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add missing columns to barbers table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='barbers' AND column_name='years_experience') THEN
    ALTER TABLE barbers ADD COLUMN years_experience INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='barbers' AND column_name='total_reviews') THEN
    ALTER TABLE barbers ADD COLUMN total_reviews INTEGER DEFAULT 0;
  END IF;
END $$;

-- Update bookings table to use appointments naming convention
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_name='appointments') THEN
    ALTER TABLE bookings RENAME TO appointments;
  END IF;
END $$;

-- Add missing columns to appointments
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='appointments' AND column_name='start_time') THEN
    ALTER TABLE appointments ADD COLUMN start_time TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='appointments' AND column_name='end_time') THEN
    ALTER TABLE appointments ADD COLUMN end_time TIMESTAMPTZ;
  END IF;
END $$;

-- Update reviews table structure
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='reviews' AND column_name='appointment_id') THEN
    ALTER TABLE reviews RENAME COLUMN booking_id TO appointment_id;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='reviews' AND column_name='customer_id') THEN
    ALTER TABLE reviews RENAME COLUMN user_id TO customer_id;
  END IF;
END $$;

-- RLS Policies for new tables

-- Barber Services
ALTER TABLE barber_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view barber services" ON barber_services
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage barber services" ON barber_services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Working Hours
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view working hours" ON working_hours
  FOR SELECT USING (true);

CREATE POLICY "Barbers can manage their own working hours" ON working_hours
  FOR ALL USING (
    EXISTS (SELECT 1 FROM barbers WHERE id = barber_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all working hours" ON working_hours
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Time Off
ALTER TABLE time_off ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view time off" ON time_off
  FOR SELECT USING (true);

CREATE POLICY "Barbers can manage their own time off" ON time_off
  FOR ALL USING (
    EXISTS (SELECT 1 FROM barbers WHERE id = barber_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all time off" ON time_off
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Shop Settings
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shop settings" ON shop_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage shop settings" ON shop_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insert default shop settings
INSERT INTO shop_settings (shop_name, advance_booking_days, cancellation_hours, slot_interval_minutes)
VALUES ('BarberBook', 30, 24, 15)
ON CONFLICT DO NOTHING;

-- Migrate data from barber_schedules to working_hours if needed
INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time, is_available)
SELECT barber_id, day_of_week, start_time, end_time, is_available
FROM barber_schedules
WHERE NOT EXISTS (SELECT 1 FROM working_hours)
ON CONFLICT DO NOTHING;

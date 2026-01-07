-- BarberBook Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'barber', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  category TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barbers table
CREATE TABLE IF NOT EXISTS barbers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Barber',
  bio TEXT,
  experience TEXT,
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  specialties TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barber availability/schedule
CREATE TABLE IF NOT EXISTS barber_schedules (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  barber_id INTEGER REFERENCES barbers(id) ON DELETE SET NULL,
  service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  total_price DECIMAL(10,2),
  confirmation_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to generate confirmation code
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.confirmation_code := 'BB-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for confirmation code
DROP TRIGGER IF EXISTS set_confirmation_code ON bookings;
CREATE TRIGGER set_confirmation_code
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_confirmation_code();

-- Function to update barber rating
CREATE OR REPLACE FUNCTION update_barber_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE barbers
  SET 
    rating = (SELECT AVG(rating) FROM reviews WHERE barber_id = NEW.barber_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE barber_id = NEW.barber_id)
  WHERE id = NEW.barber_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating barber rating
DROP TRIGGER IF EXISTS update_barber_rating_trigger ON reviews;
CREATE TRIGGER update_barber_rating_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_barber_rating();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Services policies (public read)
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Barbers policies (public read)
CREATE POLICY "Anyone can view active barbers" ON barbers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage barbers" ON barbers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Barber schedules policies
CREATE POLICY "Anyone can view barber schedules" ON barber_schedules
  FOR SELECT USING (true);

CREATE POLICY "Barbers can manage their own schedule" ON barber_schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM barbers WHERE id = barber_id AND user_id = auth.uid())
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Barbers can view their bookings" ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM barbers WHERE id = barber_id AND user_id = auth.uid())
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their completed bookings" ON reviews
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND user_id = auth.uid() AND status = 'completed')
  );

-- Insert sample data
INSERT INTO services (name, description, price, duration, category, icon) VALUES
  ('Classic Haircut', 'Traditional cut tailored to your style', 35.00, 30, 'HAIRCUT', 'scissors'),
  ('Signature Fade', 'Precision fade with seamless blending', 45.00, 45, 'HAIRCUT', 'layers'),
  ('Beard Sculpting', 'Expert shaping and conditioning', 25.00, 20, 'BEARD', 'user'),
  ('Hot Towel Shave', 'Luxurious traditional straight razor shave', 40.00, 30, 'SHAVE', 'wind'),
  ('The Executive', 'Haircut + beard + hot towel treatment', 65.00, 60, 'PACKAGE', 'crown'),
  ('Junior Cut', 'Expert cuts for young gentlemen (under 12)', 25.00, 20, 'HAIRCUT', 'smile')
ON CONFLICT DO NOTHING;

INSERT INTO barbers (name, role, bio, experience, image_url, rating, review_count, specialties) VALUES
  ('Marcus Williams', 'Senior Barber', 'With over a decade of experience in premium grooming, Marcus brings an artistic eye to every cut.', '12 years', 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=600', 4.9, 127, ARRAY['Fades', 'Designs', 'Classic']),
  ('James Chen', 'Master Barber', 'Specializing in beard work and traditional shaves with modern techniques.', '8 years', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600', 4.8, 94, ARRAY['Beards', 'Hot Shaves']),
  ('David Thompson', 'Style Specialist', 'Known for creating modern, textured looks that suit each client''s lifestyle.', '6 years', 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600', 4.9, 78, ARRAY['Modern', 'Textures'])
ON CONFLICT DO NOTHING;

-- Insert default schedules for barbers (Mon-Sat 9am-7pm)
INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time)
SELECT b.id, d.day, '09:00'::TIME, '19:00'::TIME
FROM barbers b
CROSS JOIN (SELECT generate_series(1, 6) AS day) d
ON CONFLICT DO NOTHING;

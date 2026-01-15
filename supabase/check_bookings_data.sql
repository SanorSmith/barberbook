-- Check if there are any bookings in the database
SELECT 
  b.id,
  b.booking_date,
  b.booking_time,
  b.status,
  b.user_id,
  b.barber_id,
  b.service_id,
  b.created_at
FROM bookings b
ORDER BY b.created_at DESC
LIMIT 20;

-- Check bookings with related data
SELECT 
  b.id,
  b.booking_date,
  b.booking_time,
  b.status,
  p.full_name as customer_name,
  p.email as customer_email,
  br.name as barber_name,
  s.name as service_name,
  s.price as service_price
FROM bookings b
LEFT JOIN profiles p ON b.user_id = p.id
LEFT JOIN barbers br ON b.barber_id = br.id
LEFT JOIN services s ON b.service_id = s.id
ORDER BY b.created_at DESC
LIMIT 20;

-- Check if there are any customers
SELECT id, full_name, email, role
FROM profiles
WHERE role = 'customer'
LIMIT 10;

-- Check if there are any active barbers
SELECT id, name, is_active
FROM barbers
WHERE is_active = true
LIMIT 10;

-- Check if there are any active services
SELECT id, name, price, duration, is_active
FROM services
WHERE is_active = true
LIMIT 10;

-- Check RLS policies on bookings table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'bookings';

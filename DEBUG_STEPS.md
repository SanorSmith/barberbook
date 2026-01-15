# 🔍 DEBUG STEPS - Bookings & Appointments Not Showing

## 🚨 ISSUE
- Bookings and appointments not showing in admin dashboard
- Create buttons not working
- Services not loading

## 📋 STEP-BY-STEP DEBUGGING

### **STEP 1: Run SQL Diagnostic Script**

Go to **Supabase SQL Editor** and run:
```sql
g:\Windsurf Workspace\barberbook\supabase\diagnose_and_fix_all.sql
```

This will:
- Check if bookings exist
- Check customers, barbers, services
- Show current RLS policies
- Fix RLS policies for admin access
- Create proper policies for all roles

### **STEP 2: Check Browser Console**

1. Open **http://localhost:3000/admin/bookings**
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for these messages:
   - "Loading bookings..."
   - "Bookings loaded: [data]"
   - "Number of bookings: X"
   - Any error messages in red

**Expected Output:**
```
Loading bookings...
Bookings loaded: [array of bookings]
Number of bookings: X
```

**If you see errors:**
- Copy the error message
- Look for "Error loading bookings:" or "Error creating booking:"
- The error will tell us what's wrong (RLS policy, missing data, etc.)

### **STEP 3: Test Create Booking**

1. Click **"+ Create Booking"** button
2. Check console for:
   - "Creating booking with data: {...}"
   - "Inserting booking: {...}"
   - "Booking created successfully:" or error message

**If dropdowns are empty:**
- Check console for errors loading customers/barbers/services
- Run this SQL to verify data exists:
```sql
SELECT COUNT(*) FROM profiles WHERE role = 'customer';
SELECT COUNT(*) FROM barbers WHERE is_active = true;
SELECT COUNT(*) FROM services WHERE is_active = true;
```

### **STEP 4: Check RLS Policies**

Run this SQL to see current policies:
```sql
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;
```

**You should see:**
- `admin_select_bookings` (SELECT)
- `admin_insert_bookings` (INSERT)
- `admin_update_bookings` (UPDATE)
- `admin_delete_bookings` (DELETE)
- Customer and barber policies

**If policies are missing or wrong:**
Run the fix script: `supabase\fix_bookings_rls.sql`

### **STEP 5: Verify Admin User**

Check if you're logged in as admin:
```sql
-- Check your current user
SELECT 
  auth.uid() as my_user_id,
  p.role,
  p.full_name,
  p.email
FROM profiles p
WHERE p.id = auth.uid();
```

**Expected:** role should be `'admin'`

**If not admin:**
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@barberbook.com';
```

Then **logout and login again**.

---

## 🔧 COMMON FIXES

### **Fix 1: RLS Policies Not Allowing Admin Access**
```sql
-- Run this in Supabase SQL Editor
\i supabase/fix_bookings_rls.sql
```

### **Fix 2: No Data Exists**
Check if you have:
- At least 1 customer
- At least 1 active barber
- At least 1 active service

**Create test customer:**
```sql
-- Register via UI at http://localhost:3000/register
-- Or insert manually (not recommended)
```

**Create test barber:**
Go to http://localhost:3000/admin/barbers and click "+ Add Barber"

**Create test service:**
Go to http://localhost:3000/admin/services and click "+ Add Service"

### **Fix 3: Foreign Key Constraints**
If you get foreign key errors when creating bookings:
```sql
-- Check if IDs exist
SELECT id, full_name FROM profiles WHERE role = 'customer' LIMIT 5;
SELECT id, name FROM barbers WHERE is_active = true LIMIT 5;
SELECT id, name FROM services WHERE is_active = true LIMIT 5;
```

---

## 📊 WHAT TO CHECK IN CONSOLE

### **When page loads:**
```
Loading bookings...
Loading customers...
Loading barbers...
Loading services...
Bookings loaded: [...]
Number of bookings: X
```

### **When creating booking:**
```
Creating booking with data: {user_id: "...", barber_id: 1, ...}
Inserting booking: {user_id: "...", barber_id: 1, ...}
Booking created successfully: [...]
```

### **Common Error Messages:**

**"new row violates row-level security policy"**
→ RLS policy issue. Run `fix_bookings_rls.sql`

**"violates foreign key constraint"**
→ Invalid customer/barber/service ID. Check if they exist.

**"null value in column"**
→ Missing required field. Check form data.

**"permission denied for table"**
→ Not logged in as admin. Check user role.

---

## ✅ VERIFICATION CHECKLIST

After running fixes, verify:

- [ ] Can see bookings list (even if empty)
- [ ] Can click "+ Create Booking" button
- [ ] Dropdowns show customers, barbers, services
- [ ] Can create a new booking
- [ ] New booking appears in the list
- [ ] Can change booking status
- [ ] Can edit booking notes
- [ ] Can delete booking
- [ ] Same for appointments page

---

## 🆘 IF STILL NOT WORKING

**Send me:**
1. Browser console output (all messages)
2. SQL query results from diagnostic script
3. Current RLS policies
4. Your user role from profiles table

**I'll help you debug further!**

# Fix for Admin Services CRUD Issue

## Problem
Admin users cannot create, update, or delete services due to missing RLS (Row Level Security) policies.

## Solution

### Step 1: Run the RLS Fix Migration
Execute this SQL in your Supabase SQL Editor:

```sql
-- File: supabase/migrations/002_fix_services_rls.sql

-- Enable RLS on services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view services" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;

-- Allow everyone to view services
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
```

### Step 2: Verify Your User is Admin
Check your user's role in Supabase:

```sql
SELECT id, email, role FROM profiles WHERE email = 'your@email.com';
```

If role is not 'admin', update it:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### Step 3: Test the Services CRUD
1. Login as admin user
2. Go to `/admin/services`
3. Try to:
   - Add a new service
   - Edit an existing service
   - Delete a service
   - Toggle active/inactive status

### What Was Fixed

**Before:**
- No RLS policies on services table
- Admin users couldn't insert/update/delete services
- Operations would fail silently or with permission errors

**After:**
- RLS enabled with proper policies
- Everyone can view services (SELECT)
- Only admins can create/update/delete services
- Error messages now show in alerts for debugging

### Additional Fixes Included

The migration also fixes RLS policies for:
- **barbers** table - Admin full access, barbers can update own profile
- **bookings** table - Users see own, barbers see theirs, admins see all
- **reviews** table - Anyone can view, users can create/update own, admins full access

### Files Modified

1. `src/app/admin/services/page.tsx` - Added error handling with alerts
2. `supabase/migrations/002_fix_services_rls.sql` - Complete RLS policy fix

### How to Apply

**Option 1: Via Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/002_fix_services_rls.sql`
3. Paste and run

**Option 2: Via Supabase CLI**
```bash
supabase db push
```

### Testing Checklist

- [ ] Run the migration SQL
- [ ] Verify user role is 'admin'
- [ ] Refresh the admin services page
- [ ] Try adding a new service
- [ ] Try editing a service
- [ ] Try deleting a service
- [ ] Try toggling active status
- [ ] Check browser console for any errors

### Expected Behavior

**Success:**
- Services CRUD operations work without errors
- Modal closes after successful save
- Table refreshes with new data
- No error alerts appear

**If Still Failing:**
- Check browser console for error messages
- Check Supabase logs in Dashboard → Logs
- Verify the migration ran successfully
- Ensure you're logged in as admin user

---

**Status:** Ready to test after running migration

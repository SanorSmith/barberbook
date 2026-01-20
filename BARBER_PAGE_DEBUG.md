# Barber Page Access Debug Guide

## Issue
User reports that clicking on barber link under user profile doesn't open the page.

## Possible Causes

### 1. **User Role Issue**
The user might not have the 'barber' role assigned in their profile.

**Check:**
```sql
-- Run in Supabase SQL Editor
SELECT id, email, role FROM profiles WHERE email = 'your-email@example.com';
```

**Expected:** Role should be 'barber'

**Fix if needed:**
```sql
UPDATE profiles SET role = 'barber' WHERE email = 'your-email@example.com';
```

### 2. **Missing Barber Record**
The user might not have a corresponding record in the `barbers` table.

**Check:**
```sql
-- Run in Supabase SQL Editor
SELECT b.*, p.email 
FROM barbers b
JOIN profiles p ON b.user_id = p.id
WHERE p.email = 'your-email@example.com';
```

**Fix if needed:**
```sql
-- Create barber record
INSERT INTO barbers (user_id, name, role, specialties, rating, review_count, is_active)
SELECT 
  id,
  full_name,
  'Senior Barber',
  ARRAY['Classic Cuts', 'Beard Styling'],
  4.8,
  0,
  true
FROM profiles
WHERE email = 'your-email@example.com'
AND role = 'barber';
```

### 3. **Middleware Redirect**
The middleware might be redirecting based on role.

**Check browser console for:**
- Redirect loops
- Access denied messages
- 403 errors

### 4. **Authentication Issue**
User might not be properly authenticated.

**Test:**
1. Log out completely
2. Clear browser cache
3. Log back in
4. Try accessing `/barber` directly

## Testing Steps

### Step 1: Check User Role
```sql
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  b.id as barber_id,
  b.name as barber_name
FROM profiles p
LEFT JOIN barbers b ON b.user_id = p.id
WHERE p.email = 'your-email@example.com';
```

### Step 2: Test Direct Access
1. Open browser
2. Navigate directly to: `http://localhost:3000/barber`
3. Check what happens:
   - Redirects to login? → Not authenticated
   - Redirects to dashboard? → Wrong role (customer)
   - Shows page? → Working correctly
   - Shows error? → Check console

### Step 3: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Try clicking barber link
4. Look for errors or warnings

### Step 4: Check Network Tab
1. Open DevTools → Network tab
2. Click barber link
3. Look for:
   - 302 redirects
   - 403 forbidden
   - 404 not found

## Common Fixes

### Fix 1: Assign Barber Role
```sql
UPDATE profiles 
SET role = 'barber' 
WHERE email = 'your-email@example.com';
```

### Fix 2: Create Barber Record
```sql
INSERT INTO barbers (user_id, name, role, specialties, rating, review_count, is_active)
VALUES (
  (SELECT id FROM profiles WHERE email = 'your-email@example.com'),
  'Your Name',
  'Senior Barber',
  ARRAY['Classic Cuts', 'Beard Styling', 'Hot Towel Shave'],
  4.8,
  0,
  true
);
```

### Fix 3: Clear Session
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
// Then refresh page
```

## Quick Test Script

Run this in browser console on any page:
```javascript
// Check authentication and role
fetch('/api/auth/user')
  .then(r => r.json())
  .then(data => {
    console.log('User:', data);
    console.log('Role:', data.role);
    console.log('Can access barber page:', data.role === 'barber' || data.role === 'admin');
  });
```

## Expected Behavior

### For Barber Users:
1. Click "Today" in user dropdown
2. Should navigate to `/barber`
3. Should see "Today's Schedule" page
4. Should see sidebar with navigation

### For Non-Barber Users:
1. Click barber link
2. Should redirect to `/dashboard`
3. Should see "Access Denied" message briefly

## Verification Checklist

- [ ] User has 'barber' role in profiles table
- [ ] User has record in barbers table
- [ ] User is properly authenticated
- [ ] No console errors when clicking link
- [ ] No redirect loops
- [ ] Barber page loads correctly
- [ ] Sidebar shows correctly
- [ ] Can navigate between barber pages

## If Still Not Working

1. **Check the exact error message** in browser console
2. **Check Network tab** for redirect chains
3. **Verify database records** with SQL queries above
4. **Test with admin account** (admins can access barber pages)
5. **Clear all caches** and try again

## Contact Points

If issue persists, provide:
1. User email
2. Current role in database
3. Browser console errors
4. Network tab redirect chain
5. Screenshot of the issue

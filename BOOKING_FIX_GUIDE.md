# Booking Time Selection Fix

## Issue
After selecting a date in the booking flow, time slots are not appearing and the confirm button is not available.

## Root Cause
The `working_hours` table likely doesn't have data for the barbers, causing the availability check to return empty results.

## What I Fixed

### 1. Added Comprehensive Logging
**Files Modified**: 
- `src/app/booking/page.tsx`
- `src/lib/availability.ts`

**Logging Added**:
- When loading slots starts
- Barber ID, date, and service duration
- Day of week calculation
- Working hours query results
- Bookings query results
- Final slots generated

### 2. Added Fallback Default Slots
If no working hours are defined in the database, the system now generates default time slots:
- **Hours**: 9:00 AM - 5:00 PM
- **Interval**: 15 minutes
- **All slots available** by default

### 3. Better Error Messages
- Shows specific error if no slots available
- Displays error if slot loading fails
- Console logs for debugging

---

## How to Test

### Step 1: Open Browser Console
1. Go to booking page: `http://localhost:3000/booking`
2. Open DevTools (F12)
3. Go to Console tab

### Step 2: Go Through Booking Flow
1. Select a service
2. Select a barber
3. Select a date
4. **Watch the console logs**

### Step 3: Check Console Output
You should see logs like:
```
Loading slots for: { barberId: 1, date: "2026-01-08", duration: 30 }
getAvailableSlots called with: { barberId: 1, date: "2026-01-08", serviceDuration: 30 }
Day of week: 3
Working hours query result: { workingHours: null, error: {...} }
No working hours found, generating default slots
Received slots: [{ time: "09:00", available: true }, ...]
```

---

## Expected Behavior

### If Working Hours Exist:
- Time slots based on barber's schedule
- Unavailable slots shown as disabled
- Slots respect existing bookings

### If No Working Hours (Current State):
- Default slots: 9:00 AM - 5:00 PM
- All slots available
- 15-minute intervals

---

## Solution: Add Working Hours Data

To fix properly, you need to add working hours for barbers:

### SQL to Add Working Hours:
```sql
-- Add working hours for all barbers (Monday-Friday, 9am-5pm)
INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time, is_available)
SELECT 
  id as barber_id,
  day_of_week,
  '09:00' as start_time,
  '17:00' as end_time,
  true as is_available
FROM barbers
CROSS JOIN (
  SELECT 1 as day_of_week UNION ALL  -- Monday
  SELECT 2 UNION ALL                  -- Tuesday
  SELECT 3 UNION ALL                  -- Wednesday
  SELECT 4 UNION ALL                  -- Thursday
  SELECT 5                            -- Friday
) days
WHERE barbers.is_active = true
ON CONFLICT DO NOTHING;

-- Add Saturday hours (9am-3pm)
INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time, is_available)
SELECT 
  id as barber_id,
  6 as day_of_week,              -- Saturday
  '09:00' as start_time,
  '15:00' as end_time,
  true as is_available
FROM barbers
WHERE is_active = true
ON CONFLICT DO NOTHING;
```

---

## What to Tell Me

After testing, please share:

1. **What you see in the console** when you select a date
2. **Do time slots appear?** If yes, how many?
3. **Any error messages?** Red text in console or on page
4. **Can you select a time and proceed?**

This will help me identify if it's:
- ❌ Database issue (no working hours)
- ❌ Query issue (wrong table structure)
- ❌ Logic issue (slot generation problem)
- ✅ Working with fallback slots

---

## Quick Fix Option

If you want booking to work immediately without setting up working hours:

**The fallback is already active!** 
- Just refresh the booking page
- Select service → barber → date
- You should see time slots from 9 AM to 5 PM
- All slots will be available

If you still don't see slots, check the console and let me know what errors appear.

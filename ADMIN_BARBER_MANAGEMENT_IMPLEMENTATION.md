# Admin Barber Management System - Implementation Guide

## ✅ COMPLETED COMPONENTS

### 1. Database Schema (SQL File Created)
**File:** `supabase/add_username_to_profiles.sql`
- Added `username` column to profiles table (unique)
- Added `password_changed` column to profiles table (default false)
- Created index for username lookups

**Action Required:** Run this SQL file in Supabase SQL Editor

### 2. API Route for Creating Barbers
**File:** `src/app/api/admin/create-barber/route.ts`
- Auto-generates username from firstName.lastName
- Handles username conflicts (adds numbers: marcus.williams2, etc.)
- Auto-generates password: Barber@FirstName + 4 random digits
- Creates auth user with email_confirm: true
- Creates profile with username and role='barber'
- Creates barber record in barbers table
- Creates default working_hours (Mon-Fri 9-19, Sat 9-17, Sun closed)
- Returns credentials to admin

### 3. Credentials Display Modal
**File:** `src/components/admin/BarberCredentialsModal.tsx`
- Beautiful modal showing barber name, email, username, password
- Copy to clipboard button
- Send via email button
- Professional design with gold accents

### 4. Admin Barbers Page (Partially Updated)
**File:** `src/app/admin/barbers/page.tsx`
- Updated formData state to include firstName, lastName, email, phone
- Updated handleSubmit to call new API for creating barbers
- Shows credentials modal after successful creation

---

## 🔧 REMAINING IMPLEMENTATION STEPS

### STEP 1: Fix Admin Barbers Page Form UI

The form UI in `src/app/admin/barbers/page.tsx` needs to be updated to match the new form structure.

**Current Issues:**
- Form still shows single "Name" field instead of "First Name" and "Last Name"
- Missing "Email" field (required)
- Missing "Phone" field (optional)
- Field name "experience" should be "yearsExperience"
- handleEdit function references old field names

**Required Changes:**

1. **Update the form JSX** (around line 200-350):
   Replace the "Name" input with:
   ```jsx
   {/* First Name */}
   <div>
     <label className="block text-sm font-medium text-cream mb-2">
       First Name <span className="text-red-500">*</span>
     </label>
     <input
       type="text"
       required
       value={formData.firstName}
       onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
       className="w-full px-4 py-2 bg-charcoal border border-slate rounded-lg text-cream"
     />
   </div>

   {/* Last Name */}
   <div>
     <label className="block text-sm font-medium text-cream mb-2">
       Last Name <span className="text-red-500">*</span>
     </label>
     <input
       type="text"
       required
       value={formData.lastName}
       onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
       className="w-full px-4 py-2 bg-charcoal border border-slate rounded-lg text-cream"
     />
   </div>

   {/* Email */}
   <div>
     <label className="block text-sm font-medium text-cream mb-2">
       Email <span className="text-red-500">*</span>
     </label>
     <input
       type="email"
       required
       value={formData.email}
       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
       className="w-full px-4 py-2 bg-charcoal border border-slate rounded-lg text-cream"
     />
   </div>

   {/* Phone */}
   <div>
     <label className="block text-sm font-medium text-cream mb-2">
       Phone (Optional)
     </label>
     <input
       type="tel"
       value={formData.phone}
       onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
       placeholder="+358 40 123 4567"
       className="w-full px-4 py-2 bg-charcoal border border-slate rounded-lg text-cream"
     />
   </div>
   ```

2. **Update "Experience" field name** to "Years of Experience":
   ```jsx
   <div>
     <label className="block text-sm font-medium text-cream mb-2">
       Years of Experience
     </label>
     <input
       type="number"
       value={formData.yearsExperience}
       onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
       className="w-full px-4 py-2 bg-charcoal border border-slate rounded-lg text-cream"
     />
   </div>
   ```

3. **Fix handleEdit function** (around line 169):
   ```jsx
   const handleEdit = (barber: any) => {
     setEditingBarber(barber)
     const [firstName, ...lastNameParts] = barber.name.split(' ')
     const lastName = lastNameParts.join(' ')
     
     setFormData({
       firstName: firstName || '',
       lastName: lastName || '',
       email: barber.email || '',
       phone: barber.phone || '',
       role: barber.role || 'Senior Barber',
       bio: barber.bio || '',
       yearsExperience: barber.years_experience?.toString() || '',
       image_url: barber.image_url || '',
       specialties: Array.isArray(barber.specialties) ? barber.specialties.join(', ') : '',
       is_active: barber.is_active !== undefined ? barber.is_active : true
     })
     setImagePreview(barber.image_url || null)
     setShowModal(true)
   }
   ```

4. **Add error display** in the modal (after form opening tag):
   ```jsx
   {error && (
     <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
       {error}
     </div>
   )}
   ```

5. **Add credentials modal** at the end of the component (before closing return):
   ```jsx
   {/* Credentials Modal */}
   {credentials && (
     <BarberCredentialsModal
       credentials={credentials}
       onClose={() => {
         setCredentials(null)
         loadBarbers()
       }}
     />
   )}
   ```

### STEP 2: Add Username Column to Barbers List Table

In the barbers list table (around line 180-250), add username column:

```jsx
<thead>
  <tr className="border-b border-slate">
    <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Photo</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Name</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Username</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Email</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Specialties</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Status</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Actions</th>
  </tr>
</thead>
```

Update the loadBarbers query to join with profiles:
```typescript
const loadBarbers = async () => {
  const { data } = await supabase
    .from('barbers')
    .select(`
      *,
      profiles!inner(username)
    `)
    .order('name', { ascending: true })

  setBarbers(data || [])
  setLoading(false)
}
```

Add username cell in the table body:
```jsx
<td className="px-6 py-4 text-sm text-slate font-mono">
  {barber.profiles?.username || 'N/A'}
</td>
```

### STEP 3: Update Login Page to Accept Username or Email

**File:** `src/app/login/page.tsx`

1. Update the email input label:
   ```jsx
   <label className="block text-sm font-medium text-cream mb-2">
     Email or Username
   </label>
   ```

2. Update the login handler to check if input is username:
   ```typescript
   const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault()
     setLoading(true)
     setError(null)

     try {
       let emailToUse = email

       // Check if input is username (no @ symbol)
       if (!email.includes('@')) {
         // Lookup email from username
         const { data: profile } = await supabase
           .from('profiles')
           .select('email')
           .eq('username', email)
           .single()

         if (!profile) {
           setError('Username not found')
           setLoading(false)
           return
         }

         emailToUse = profile.email
       }

       // Login with email
       const { error: signInError } = await supabase.auth.signInWithPassword({
         email: emailToUse,
         password: password,
       })

       if (signInError) {
         setError(signInError.message)
         setLoading(false)
         return
       }

       // Redirect based on role
       const { data: { user } } = await supabase.auth.getUser()
       if (user) {
         const { data: profile } = await supabase
           .from('profiles')
           .select('role')
           .eq('id', user.id)
           .single()

         if (profile?.role === 'admin') {
           router.push('/admin')
         } else if (profile?.role === 'barber') {
           router.push('/barber')
         } else {
           router.push('/dashboard')
         }
       }
     } catch (error: any) {
       setError(error.message || 'Login failed')
       setLoading(false)
     }
   }
   ```

### STEP 4: Add Reset Password Functionality (Optional but Recommended)

Create API route: `src/app/api/admin/reset-barber-password/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function generatePassword(firstName: string): string {
  const capitalizedFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
  const randomDigits = Math.floor(1000 + Math.random() * 9000)
  return `Barber@${capitalizedFirst}${randomDigits}`
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { barberId } = await request.json()
    
    // Get barber info
    const { data: barber } = await supabase
      .from('barbers')
      .select('user_id, name, email')
      .eq('id', barberId)
      .single()
    
    if (!barber) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 })
    }
    
    // Generate new password
    const firstName = barber.name.split(' ')[0]
    const newPassword = generatePassword(firstName)
    
    // Update password in auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      barber.user_id,
      { password: newPassword }
    )
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    
    // Reset password_changed flag
    await supabase
      .from('profiles')
      .update({ password_changed: false })
      .eq('id', barber.user_id)
    
    return NextResponse.json({
      success: true,
      password: newPassword
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

Add Reset Password button in barbers list:
```jsx
<button
  onClick={() => handleResetPassword(barber.id)}
  className="text-amber-500 hover:text-amber-400"
  title="Reset Password"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
</button>
```

---

## 📋 TESTING CHECKLIST

### Database Setup
- [ ] Run `supabase/add_username_to_profiles.sql` in Supabase SQL Editor
- [ ] Verify `username` column exists in profiles table
- [ ] Verify `password_changed` column exists in profiles table

### Admin Create Barber Flow
- [ ] Login as admin
- [ ] Navigate to /admin/barbers
- [ ] Click "Add Barber" button
- [ ] Fill in First Name, Last Name, Email
- [ ] Optionally fill Phone, Bio, Specialties, Years Experience
- [ ] Submit form
- [ ] Verify credentials modal appears with username and password
- [ ] Copy credentials to clipboard
- [ ] Close modal
- [ ] Verify barber appears in list with username

### Barber Login Flow
- [ ] Logout from admin
- [ ] Go to /login
- [ ] Try login with username (e.g., "marcus.williams")
- [ ] Try login with email
- [ ] Verify redirect to /barber dashboard
- [ ] Verify barber sees only their appointments

### Username Conflict Handling
- [ ] Create barber "Marcus Williams" → username: marcus.williams
- [ ] Create another "Marcus Williams" → username: marcus.williams2
- [ ] Create third "Marcus Williams" → username: marcus.williams3

### Password Reset (if implemented)
- [ ] Login as admin
- [ ] Click Reset Password on a barber
- [ ] Verify new password is shown
- [ ] Logout and login as barber with new password

---

## 🚀 DEPLOYMENT NOTES

1. **Database Migration:** Run the SQL file first before deploying code
2. **Environment Variables:** No new env vars needed
3. **Supabase Auth Settings:** Ensure admin API is enabled
4. **RLS Policies:** Verify admin can create users and profiles

---

## 📝 FUTURE ENHANCEMENTS

1. **First Login Password Change:** Prompt barber to change password on first login
2. **Email Notifications:** Send credentials via email automatically
3. **Barber Profile Management:** Allow barbers to update their own profile
4. **Audit Log:** Track who created which barber and when
5. **Bulk Import:** Import multiple barbers from CSV

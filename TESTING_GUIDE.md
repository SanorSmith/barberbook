# BarberBook Admin Features - Testing Guide

## ✅ COMPLETED FEATURES

### 1. **Barber Image Upload** (`/admin/barbers`)
- ✅ Upload images directly from computer
- ✅ Live preview of selected images
- ✅ Circular image display in barber cards
- ✅ Support for both file upload and URL input
- ✅ Images stored in Supabase Storage

**Before Testing:**
Run this SQL in Supabase SQL Editor to create the storage bucket:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('barber-images', 'barber-images', true)
ON CONFLICT (id) DO NOTHING;
```

### 2. **Bookings Management** (`/admin/bookings`)
- ✅ View all bookings with customer, barber, service details
- ✅ **CREATE** - Add new bookings with modal form
- ✅ **READ** - View all booking details in table
- ✅ **UPDATE** - Change status, edit notes
- ✅ **DELETE** - Remove bookings
- ✅ Filter by status (all, pending, confirmed, completed, cancelled)
- ✅ Search by customer, barber, or service
- ✅ Statistics dashboard

### 3. **Appointments Management** (`/admin/appointments`)
- ✅ View all appointments with full details
- ✅ **CREATE** - Add new appointments with modal form
- ✅ **READ** - View all appointment details
- ✅ **UPDATE** - Edit appointment details (customer, barber, service, date, time, status, notes)
- ✅ **DELETE** - Remove appointments
- ✅ Filter by date (all, today, upcoming, past)
- ✅ Filter by status
- ✅ Revenue statistics

---

## 🧪 TESTING CHECKLIST

### **Barbers Page** (`http://localhost:3000/admin/barbers`)
- [ ] Click "Add Barber"
- [ ] Upload an image file (JPG, PNG, etc.)
- [ ] Verify image preview appears
- [ ] Fill in barber details
- [ ] Click "Create"
- [ ] Verify barber appears with uploaded image
- [ ] Click "Edit" on existing barber
- [ ] Upload a different image
- [ ] Verify image updates

### **Bookings Page** (`http://localhost:3000/admin/bookings`)
- [ ] Click "+ Create Booking"
- [ ] Select customer from dropdown
- [ ] Select barber from dropdown
- [ ] Select service from dropdown
- [ ] Choose date and time
- [ ] Add notes (optional)
- [ ] Click "Create Booking"
- [ ] Verify booking appears in table
- [ ] Change booking status using dropdown
- [ ] Click "Edit Notes" icon
- [ ] Modify notes and save
- [ ] Click "Delete" icon
- [ ] Confirm deletion works
- [ ] Test status filters (pending, confirmed, etc.)
- [ ] Test search functionality

### **Appointments Page** (`http://localhost:3000/admin/appointments`)
- [ ] Click "+ Create Appointment"
- [ ] Fill in all appointment details
- [ ] Click "Create Appointment"
- [ ] Verify appointment appears in table
- [ ] Click "Edit" on existing appointment
- [ ] Modify appointment details
- [ ] Click "Update Appointment"
- [ ] Verify changes saved
- [ ] Change status using dropdown
- [ ] Click "Delete"
- [ ] Confirm deletion works
- [ ] Test date filters (today, upcoming, past)
- [ ] Test status filters
- [ ] Verify revenue calculation

---

## 🔧 SETUP REQUIRED

### **1. Create Supabase Storage Bucket**
Run this in Supabase SQL Editor:
```sql
-- Create storage bucket for barber images
INSERT INTO storage.buckets (id, name, public)
VALUES ('barber-images', 'barber-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access for barber images"
ON storage.objects FOR SELECT
USING (bucket_id = 'barber-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload barber images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'barber-images' 
  AND auth.role() = 'authenticated'
);

-- Allow admins to update/delete
CREATE POLICY "Admins can update barber images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'barber-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete barber images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'barber-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### **2. Start Development Server**
```bash
npm run dev
```

### **3. Login as Admin**
- Go to http://localhost:3000/login
- Email: admin@barberbook.com
- Password: Admin123!

---

## 📊 ADMIN DASHBOARD PAGES

| Page | URL | Features |
|------|-----|----------|
| **Dashboard** | `/admin` | Overview & stats |
| **Services** | `/admin/services` | CRUD for services |
| **Barbers** | `/admin/barbers` | CRUD for barbers + **Image Upload** |
| **Customers** | `/admin/customers` | View & manage customers |
| **Bookings** | `/admin/bookings` | **Full CRUD** for bookings |
| **Appointments** | `/admin/appointments` | **Full CRUD** for appointments |
| **Settings** | `/admin/settings` | Shop configuration |

---

## 🎯 KEY FEATURES

### **Image Upload (Barbers)**
- Direct file upload from computer
- Automatic upload to Supabase Storage
- Public URL generation
- Circular preview display
- Fallback to URL input

### **Bookings CRUD**
- Create bookings with customer/barber/service selection
- Edit booking notes
- Change booking status
- Delete bookings
- Filter and search functionality

### **Appointments CRUD**
- Create appointments with full details
- Edit all appointment fields
- Change appointment status
- Delete appointments
- Date and status filtering
- Revenue tracking

---

## 🚀 READY TO TEST!

All features are implemented and ready for testing. No push to GitHub yet - test first!

**Server:** http://localhost:3000
**Admin Login:** admin@barberbook.com / Admin123!

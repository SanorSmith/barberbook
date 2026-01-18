# 🚀 Deploy BarberBook to Vercel

## 📋 Prerequisites

- GitHub account with BarberBook repository
- Vercel account (free tier works)
- Supabase project with all migrations applied

---

## 🔧 Step 1: Prepare for Deployment

### **1.1 Verify Environment Variables**

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://gqqvmnqxtizspgigatct.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **1.2 Test Build Locally**

Run this to ensure the app builds without errors:
```bash
npm run build
```

If build succeeds, you're ready to deploy!

---

## 🌐 Step 2: Deploy to Vercel

### **Option A: Deploy via Vercel CLI (Recommended)**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **barberbook** (or your choice)
- Directory? **./** (press Enter)
- Override settings? **N**

4. **Add Environment Variables:**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

Paste the values when prompted. Select **Production, Preview, and Development**.

5. **Deploy to Production:**
```bash
vercel --prod
```

### **Option B: Deploy via Vercel Dashboard**

1. **Go to:** https://vercel.com/new

2. **Import Git Repository:**
   - Click "Import Project"
   - Select your GitHub account
   - Choose the `barberbook` repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** ./
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://gqqvmnqxtizspgigatct.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key from Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your service role key from Supabase |

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete

---

## ✅ Step 3: Post-Deployment Setup

### **3.1 Update Supabase Redirect URLs**

1. Go to **Supabase Dashboard** → Your Project → **Authentication** → **URL Configuration**

2. Add your Vercel URL to **Redirect URLs:**
   ```
   https://your-app-name.vercel.app/**
   https://your-app-name.vercel.app/auth/callback
   ```

3. Add to **Site URL:**
   ```
   https://your-app-name.vercel.app
   ```

### **3.2 Run Database Migrations**

Make sure all SQL migrations are applied in Supabase:

1. **RLS Policies:**
   - Run `supabase/diagnose_and_fix_all.sql`

2. **Storage Bucket:**
   - Run `supabase/migrations/006_create_barber_images_bucket.sql`

3. **Verify Admin User:**
   ```sql
   SELECT id, email, role FROM profiles WHERE email = 'admin@barberbook.com';
   ```

### **3.3 Test Deployment**

Visit your Vercel URL and test:
- [ ] Homepage loads
- [ ] Login works
- [ ] Admin dashboard accessible
- [ ] Bookings page loads
- [ ] Appointments page loads
- [ ] Image upload works
- [ ] Create booking/appointment works

---

## 🔄 Step 4: Continuous Deployment

Every time you push to GitHub `main` branch, Vercel will automatically:
1. Build your app
2. Run tests (if configured)
3. Deploy to production

**To deploy updates:**
```bash
git add .
git commit -m "your changes"
git push origin main
```

Vercel will auto-deploy in ~2 minutes.

---

## 🐛 Troubleshooting

### **Build Fails**

**Error:** "Module not found"
```bash
# Fix: Install missing dependencies
npm install
npm run build
```

**Error:** "Environment variable not found"
- Check all env vars are added in Vercel dashboard
- Make sure they're available for Production

### **App Loads but Features Don't Work**

1. **Check Browser Console** for errors
2. **Verify Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Ensure all 3 variables are set

3. **Check Supabase:**
   - Verify redirect URLs are correct
   - Check RLS policies are applied
   - Ensure admin user exists

### **Images Not Loading**

1. **Check Next.js Image Config:**
   - Verify `next.config.mjs` has Supabase domain
   
2. **Check Storage Bucket:**
   - Run `supabase/migrations/006_create_barber_images_bucket.sql`
   - Verify bucket is public

---

## 📊 Vercel Dashboard Features

### **Deployments**
- View all deployments
- Rollback to previous versions
- Preview deployments for branches

### **Analytics**
- Page views
- Performance metrics
- User insights

### **Logs**
- Real-time function logs
- Error tracking
- Build logs

---

## 🎯 Production Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Supabase redirect URLs updated
- [ ] RLS policies applied
- [ ] Storage bucket created
- [ ] Admin user exists and tested
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] CRUD operations work
- [ ] Image upload works
- [ ] Mobile responsive tested
- [ ] Error handling tested

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Supabase Auth:** https://supabase.com/docs/guides/auth

---

## 🆘 Need Help?

If deployment fails, check:
1. Build logs in Vercel dashboard
2. Browser console for runtime errors
3. Supabase logs for database errors
4. Environment variables are correct

**Your app will be live at:** `https://your-app-name.vercel.app`

🎉 **Happy Deploying!**

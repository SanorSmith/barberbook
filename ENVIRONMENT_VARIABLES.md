# Environment Variables Setup

## Required Environment Variables

### Supabase Configuration

Your `.env.local` file must include the following variables:

```env
# Public Supabase URL (safe to expose to client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Public Anon Key (safe to expose to client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role Key (NEVER expose to client - server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Where to Find These Values

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. You'll find:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → Use for `SUPABASE_SERVICE_ROLE_KEY`

## Why Service Role Key is Required

The **service role key** is required for admin operations that bypass Row Level Security (RLS), specifically:

- Creating auth users via `auth.admin.createUser()`
- Deleting auth users via `auth.admin.deleteUser()`
- Updating user passwords via `auth.admin.updateUserById()`

These operations are used in:
- `/api/admin/create-barber` - Creates barber accounts with auto-generated credentials
- Future admin operations (password reset, user management)

## Security Notes

⚠️ **IMPORTANT SECURITY WARNINGS:**

1. **NEVER commit `.env.local` to git** - It's already in `.gitignore`
2. **NEVER expose service role key to client** - Only use in API routes
3. **Service role key bypasses ALL RLS policies** - Use with extreme caution
4. **Only use service role in admin-protected API routes** - Always verify user is admin first

## Example .env.local File

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjE2MTYxNiwiZXhwIjoxOTMxNzM3NjE2fQ.1234567890abcdefghijklmnopqrstuvwxyz
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MTYxNjE2LCJleHAiOjE5MzE3Mzc2MTZ9.abcdefghijklmnopqrstuvwxyz1234567890
```

## Troubleshooting

### Error: "User not allowed"
- **Cause:** Missing `SUPABASE_SERVICE_ROLE_KEY` environment variable
- **Solution:** Add the service role key to `.env.local` and restart dev server

### Error: "Missing Supabase environment variables for admin client"
- **Cause:** Either `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing
- **Solution:** Verify both variables are set in `.env.local`

### Changes not taking effect
- **Solution:** Restart the Next.js development server after changing `.env.local`
  ```bash
  # Stop the server (Ctrl+C)
  # Start it again
  npm run dev
  ```

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Add all three environment variables to your hosting platform's environment settings
2. **NEVER** commit the service role key to your repository
3. Use your hosting platform's secrets management for the service role key
4. Verify the variables are set correctly before deploying

### Vercel Deployment
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add all three variables
4. Redeploy your application

### Netlify Deployment
1. Go to **Site settings** → **Environment variables**
2. Add all three variables
3. Trigger a new deploy

# REVERT AUTH PROTECTION

## ⚠️ IMPORTANT: Run this after testing the admin dashboard

The authentication has been temporarily disabled for testing.
You MUST revert this change before deploying or continuing development.

## How to Revert

Run this command in your terminal:

```bash
git checkout src/app/admin/layout.tsx
```

Or manually edit `src/app/admin/layout.tsx` and uncomment the auth check code.

## What was changed

File: `src/app/admin/layout.tsx`

The authentication check was commented out and replaced with a mock profile.
This allows viewing the admin dashboard without logging in.

**This is a SECURITY RISK and should only be used for testing!**

# 🔧 Deployment Troubleshooting - Login Not Working

## Issue: Cannot Login on Preview Deployment

**Symptoms:**
- ✅ Login page loads correctly
- ❌ Login fails for all users (admin, finance, etc.)
- ❌ May show "Invalid email or password" error
- ❌ Or just redirects back to login page

**Root Cause:**
Missing environment variables in Vercel for the preview deployment.

---

## 🎯 Solution: Configure Vercel Environment Variables

NextAuth.js requires these environment variables to work:

1. `AUTH_SECRET` - Secret key for JWT signing
2. `NEXTAUTH_URL` - The deployment URL

### Step-by-Step Fix

---

## Method 1: Vercel Dashboard (Recommended)

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com
2. Sign in to your account
3. Find your project: **finarif-dashboard**
4. Click on the project

### Step 2: Navigate to Environment Variables

1. Click **Settings** tab
2. Click **Environment Variables** in left sidebar

### Step 3: Add AUTH_SECRET

1. Click **Add New** button
2. Fill in:
   - **Key:** `AUTH_SECRET`
   - **Value:** Generate a secure secret (see below)
   - **Environments:** Check **Preview** (and optionally Production, Development)
3. Click **Save**

**Generate AUTH_SECRET:**

Run this command on your computer:
```bash
openssl rand -base64 32
```

Copy the output (example: `abc123xyz789...`) and paste as the value.

### Step 4: Add NEXTAUTH_URL

1. Click **Add New** again
2. Fill in:
   - **Key:** `NEXTAUTH_URL`
   - **Value:** `https://finarif-dashboard-git-feature-auth-system.vercel.app`
   - **Environments:** Check **Preview** only
3. Click **Save**

**Important:** For preview deployments, you can use a wildcard:
- Value: `https://finarif-dashboard.vercel.app` (Vercel will handle preview URLs automatically)

Or set specific URLs for each environment:
- Preview: `https://finarif-dashboard-git-feature-auth-system.vercel.app`
- Development: `https://finarif-dashboard-dev.vercel.app`
- Production: `https://finarif-dashboard.vercel.app`

### Step 5: Redeploy

After adding environment variables:

**Option A: Redeploy from Vercel**
1. Go to **Deployments** tab
2. Find your latest `feature/auth-system` deployment
3. Click the **...** menu
4. Click **Redeploy**

**Option B: Push a small change**
```bash
# Make a small change (like adding a space to a comment)
git commit --allow-empty -m "chore: trigger redeploy for env vars"
git push origin feature/auth-system
```

---

## Method 2: Vercel CLI (Advanced)

If you have Vercel CLI installed:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
cd /Users/arifkhan/Desktop/FinArif/finarif-dashboard
vercel link

# Add environment variables
vercel env add AUTH_SECRET preview
# Paste the secret when prompted

vercel env add NEXTAUTH_URL preview
# Enter: https://finarif-dashboard-git-feature-auth-system.vercel.app

# Redeploy
vercel --prod
```

---

## Environment Variables Reference

Here's what you need to set for each environment:

### Preview Environment (feature/auth-system)
```env
AUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://finarif-dashboard-git-feature-auth-system.vercel.app
```

### Development Environment (develop branch)
```env
AUTH_SECRET=<generate-different-secret>
NEXTAUTH_URL=https://finarif-dashboard-dev.vercel.app
```

### Production Environment (prod branch)
```env
AUTH_SECRET=<generate-different-secret>
NEXTAUTH_URL=https://finarif-dashboard.vercel.app
```

**Important:**
- ✅ Use **different** AUTH_SECRET for each environment
- ✅ Make sure NEXTAUTH_URL matches the deployment URL exactly
- ✅ Include `https://` in the URL
- ✅ No trailing slash in the URL

---

## Verification Steps

After setting environment variables and redeploying:

### 1. Check Environment Variables Are Set

In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Verify you see:
   - `AUTH_SECRET` (value hidden)
   - `NEXTAUTH_URL` (value visible)
3. Check the **Preview** checkbox is selected

### 2. Check Build Logs

1. Go to **Deployments** tab
2. Click on latest deployment
3. Click **Building** or **View Function Logs**
4. Look for errors related to `AUTH_SECRET` or `NEXTAUTH_URL`

### 3. Test Login Again

1. Visit your preview URL
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Try login with: `admin@finarif.com` / `password123`
4. Should redirect to dashboard with user name showing

---

## Common Errors & Solutions

### Error: "Configuration Error"

**Problem:** AUTH_SECRET not set or invalid
**Solution:**
```bash
# Generate a new secret
openssl rand -base64 32

# Add to Vercel environment variables
# Redeploy
```

### Error: "Invalid email or password" (but credentials are correct)

**Problem:** Several possible causes:

1. **Auth secret mismatch**
   - Solution: Ensure AUTH_SECRET is the same that was used during build

2. **NEXTAUTH_URL mismatch**
   - Solution: Verify NEXTAUTH_URL exactly matches your preview URL

3. **Cookies not working**
   - Solution: Make sure you're using HTTPS (Vercel auto-provides this)

### Error: Redirects back to login page after submitting

**Problem:** Session not being created
**Solution:**
1. Check browser console for errors (F12 → Console tab)
2. Check Network tab for failed API calls
3. Verify environment variables are set
4. Check NEXTAUTH_URL is correct

### Error: "fetch failed" or network errors

**Problem:** API route not accessible
**Solution:**
1. Verify `/app/api/auth/[...nextauth]/route.ts` was deployed
2. Check Vercel function logs for errors
3. Test API endpoint directly: `https://your-url/api/auth/providers`

---

## Debug Checklist

Run through this checklist:

- [ ] Environment variables set in Vercel
  - [ ] AUTH_SECRET (generated with openssl)
  - [ ] NEXTAUTH_URL (matches preview URL)
- [ ] Environment variables applied to "Preview" environment
- [ ] Redeployed after setting variables
- [ ] Browser cache cleared
- [ ] Using HTTPS URL (not HTTP)
- [ ] No typos in email: `admin@finarif.com`
- [ ] No typos in password: `password123`
- [ ] Checked browser console for errors (F12)
- [ ] Checked Vercel function logs for errors

---

## Quick Test: Does API Work?

Visit this URL in your browser:
```
https://finarif-dashboard-git-feature-auth-system.vercel.app/api/auth/providers
```

**Expected response:**
```json
{
  "credentials": {
    "id": "credentials",
    "name": "credentials",
    "type": "credentials"
  }
}
```

**If you get an error or empty response:**
- Environment variables are not set correctly
- API route didn't deploy properly

---

## Alternative: Test Locally First

If Vercel setup is taking too long, you can test locally:

```bash
# Start local dev server
npm run dev

# Visit http://localhost:3000
# Login with: admin@finarif.com / password123
```

**If local works but Vercel doesn't:**
- Definitely an environment variable issue
- Follow the Vercel Dashboard steps above

---

## Expected Working Flow

Once environment variables are set correctly:

1. ✅ Visit preview URL
2. ✅ Redirected to `/login`
3. ✅ Enter: `admin@finarif.com` / `password123`
4. ✅ Click "Sign in"
5. ✅ Loading spinner appears
6. ✅ Redirected to dashboard (`/`)
7. ✅ Header shows: "Admin User" / "Administrator"
8. ✅ Avatar shows "AU" initials
9. ✅ Can click avatar to see dropdown menu
10. ✅ Can logout successfully

---

## Need More Help?

### Check These Logs

**1. Browser Console (F12)**
```javascript
// Look for errors like:
// "Failed to fetch"
// "Configuration error"
// Network errors
```

**2. Browser Network Tab (F12 → Network)**
```
// Filter by "auth"
// Look for POST to /api/auth/callback/credentials
// Check if it returns 200 or error
```

**3. Vercel Function Logs**
```
1. Vercel Dashboard → Deployments
2. Click your deployment
3. Click "Functions" tab
4. Look for errors in /api/auth/[...nextauth]
```

### Share These Details

If still not working, share:
1. Error message (if any)
2. Browser console errors (screenshot)
3. Network tab showing auth request (screenshot)
4. Vercel function logs (screenshot)

---

## Summary

**Most Likely Fix:**

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `AUTH_SECRET` with value from `openssl rand -base64 32`
3. Add `NEXTAUTH_URL` with your preview URL
4. Select "Preview" environment
5. Redeploy from Vercel or push a new commit
6. Wait 2-3 minutes for build
7. Clear browser cache and try again

**This should fix 95% of login issues on Vercel deployments!** 🎯

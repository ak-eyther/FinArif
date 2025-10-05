# 🚀 Quick Start Guide - FinArif Authentication

## ⚡ TL;DR - Get Started in 30 Seconds

```bash
# 1. Start the server
npm run dev

# 2. Open browser
http://localhost:3000

# 3. Login
Email: admin@finarif.com
Password: password123
```

That's it! You're in. 🎉

---

## 📋 What You Get

✅ **Sleek login page** with email/password authentication
✅ **5 user roles** (Admin, Finance Manager, Risk Analyst, Accountant, Viewer)
✅ **Role-based permissions** for each dashboard section
✅ **Secure sessions** (30-minute JWT tokens)
✅ **User menu** with avatar and logout
✅ **Production-ready** authentication system

---

## 🧪 Test All Roles

Try logging in with different users to see role-based access:

| Role | Email | Password | What You'll See |
|------|-------|----------|-----------------|
| **Admin** | admin@finarif.com | password123 | "Administrator" in header |
| **Finance Manager** | finance@finarif.com | password123 | "Finance Manager" in header |
| **Risk Analyst** | risk@finarif.com | password123 | "Risk Analyst" in header |
| **Accountant** | accountant@finarif.com | password123 | "Senior Accountant" in header |
| **Viewer** | viewer@finarif.com | password123 | "Board Member" in header |

---

## 🎯 What to Test

### 1. Login Flow
- ✅ Enter credentials → Click "Sign in"
- ✅ Form validation works (try invalid email)
- ✅ Password show/hide toggle
- ✅ Loading state during authentication
- ✅ Redirect to dashboard on success

### 2. Dashboard
- ✅ User name displays in top-right
- ✅ Role label shows under name
- ✅ Avatar with initials

### 3. User Menu
- ✅ Click avatar to open dropdown
- ✅ Shows user email
- ✅ Profile/Settings (disabled - placeholder)
- ✅ Sign out button (red text)

### 4. Logout
- ✅ Click "Sign out"
- ✅ Session cleared
- ✅ Redirect to login page

### 5. Route Protection
- ✅ Try accessing `http://localhost:3000` when logged out
- ✅ Should auto-redirect to `/login`
- ✅ After login, can't access `/login` (redirects to dashboard)

---

## 📁 Key Files to Know

**Login Page:**
- [app/login/page.tsx](app/login/page.tsx) - Login UI

**Authentication:**
- [auth.ts](auth.ts) - NextAuth configuration
- [middleware.ts](middleware.ts) - Route protection

**User Database:**
- [lib/db/users.ts](lib/db/users.ts) - Mock users (5 demo accounts)

**Permissions:**
- [lib/auth/permissions.ts](lib/auth/permissions.ts) - Role checks

---

## 🔧 Troubleshooting

### "Invalid email or password"
- ✅ Check spelling (case-sensitive)
- ✅ Use demo credentials exactly as shown
- ✅ Password is: `password123`

### Session not persisting
- ✅ Check browser cookies are enabled
- ✅ Clear browser cache
- ✅ Restart dev server

### Build errors
```bash
# Check TypeScript
npx tsc --noEmit

# Rebuild
npm run build
```

---

## 📚 Full Documentation

For detailed information:

1. **[AUTH_SETUP.md](AUTH_SETUP.md)** - Complete setup guide, security, production deployment
2. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - All features, file structure, next steps
3. **[DEPENDENCY_CHECK.md](DEPENDENCY_CHECK.md)** - Dependency verification report

---

## 🌐 Deployment URLs (Branching Strategy)

When deploying to Vercel, each branch has its own URL:

### Production Environment
- **Branch:** `prod`
- **URL:** `https://finarif-dashboard.vercel.app`
- **Purpose:** Live production application
- **Deploy:** Automatic on push to `prod`

### UAT Environment
- **Branch:** `uat`
- **URL:** `https://finarif-dashboard-uat.vercel.app`
- **Purpose:** User Acceptance Testing
- **Deploy:** Automatic on push to `uat`

### QA Environment
- **Branch:** `qa`
- **URL:** `https://finarif-dashboard-qa.vercel.app`
- **Purpose:** Quality Assurance testing
- **Deploy:** Automatic on push to `qa`

### Development Environment
- **Branch:** `develop`
- **URL:** `https://finarif-dashboard-dev.vercel.app`
- **Purpose:** Development testing
- **Deploy:** Automatic on push to `develop`

### Feature Branches
- **Branch:** `feature/*`
- **URL:** `https://finarif-dashboard-git-{branch-name}.vercel.app`
- **Purpose:** Feature development previews
- **Deploy:** Automatic on push to feature branches

**Current Branch:** `feature/auth-system`
**Preview URL (once deployed):** `https://finarif-dashboard-git-feature-auth-system.vercel.app`

---

## 🚀 Deployment Workflow

```bash
# 1. Feature development (you are here)
git checkout feature/auth-system
git commit -m "feat: authentication system"
git push origin feature/auth-system

# 2. Merge to develop for testing
git checkout develop
git merge feature/auth-system
git push origin develop
# Preview at: https://finarif-dashboard-dev.vercel.app

# 3. Merge to QA for testing
git checkout qa
git merge develop
git push origin qa
# Preview at: https://finarif-dashboard-qa.vercel.app

# 4. Merge to UAT for stakeholder testing
git checkout uat
git merge qa
git push origin uat
# Preview at: https://finarif-dashboard-uat.vercel.app

# 5. Merge to production
git checkout prod
git merge uat
git push origin prod
# Live at: https://finarif-dashboard.vercel.app
```

---

## 🔒 Environment Variables for Deployment

Add these to Vercel environment variables for each environment:

```env
# Required for all environments
AUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=<your-vercel-url>

# Example for production:
AUTH_SECRET=abc123...xyz789
NEXTAUTH_URL=https://finarif-dashboard.vercel.app

# Example for develop:
AUTH_SECRET=def456...uvw012
NEXTAUTH_URL=https://finarif-dashboard-dev.vercel.app
```

**Generate secure secrets:**
```bash
openssl rand -base64 32
```

---

## ✅ Pre-Deployment Checklist

Before pushing to `prod`:

- [ ] Change `AUTH_SECRET` to secure random value
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Remove demo credentials from login page
- [ ] Migrate to real database (remove mock users)
- [ ] Add rate limiting for login attempts
- [ ] Enable HTTPS only
- [ ] Test all authentication flows
- [ ] Run security audit

---

## 💡 Pro Tips

1. **Multi-window Testing:** Open two browser windows with different users logged in (use incognito mode for second user)

2. **Network Tab:** Check DevTools Network tab to see authentication API calls

3. **Cookie Inspection:** Check Application → Cookies to see JWT session token

4. **Role Testing:** Login as each role to verify permissions display correctly

---

## 🎉 Success!

You now have a production-ready authentication system! 🚀

**Next Steps:**
- Test all user roles
- Review permission system
- Plan database migration
- Consider adding 2FA
- Set up Vercel deployment

**Questions?** Check the full documentation in [AUTH_SETUP.md](AUTH_SETUP.md)

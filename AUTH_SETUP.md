# FinArif Authentication System

## Overview

The FinArif dashboard now includes a complete authentication system with role-based access control (RBAC). The system uses NextAuth.js v5 with email/password credentials and includes 5 predefined user roles.

## Features

✅ **Email/Password Authentication** - Secure login with hashed passwords (bcrypt)
✅ **Role-Based Access Control** - 5 user roles with granular permissions
✅ **Session Management** - JWT-based sessions with 30-minute timeout
✅ **Route Protection** - Middleware automatically protects all dashboard routes
✅ **Sleek Login UI** - Modern, responsive login page built with Shadcn UI
✅ **User Menu** - Avatar dropdown with user info and logout
✅ **Type Safety** - Full TypeScript support with custom type definitions

## User Roles & Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| **Admin** | Full system access | Create, Read, Update, Delete all resources |
| **Finance Manager** | Manages transactions & capital | Full access to transactions/capital, read-only settings |
| **Risk Analyst** | Analyzes risk metrics | Full risk analysis, read-only transactions/capital |
| **Accountant** | Handles accounting tasks | Full transactions/capital, read-only risk |
| **Viewer** | Board member view | Read-only access to all dashboards |

## Demo Credentials

The system comes with 5 pre-configured demo users:

```
Admin:       admin@finarif.com / password123
Finance:     finance@finarif.com / password123
Risk:        risk@finarif.com / password123
Accountant:  accountant@finarif.com / password123
Viewer:      viewer@finarif.com / password123
```

## Getting Started

### 1. Dependencies ✅ Already Installed

All required dependencies have been installed and verified:

**Authentication:**
- `next-auth@5.0.0-beta.29` - Authentication framework
- `bcryptjs@3.0.2` - Password hashing
- `@types/bcryptjs@2.4.6` - TypeScript types

**Forms & Validation:**
- `react-hook-form@7.64.0` - Form management
- `@hookform/resolvers@5.2.2` - Validation resolvers
- `zod@4.1.11` - Schema validation

**UI Components:**
- Shadcn UI components (Input, Button, Card, Label, Form, Dropdown Menu, Avatar)

**Verification:**
- ✅ TypeScript compiles without errors
- ✅ Production build successful
- ✅ All imports resolve correctly

### 2. Configure Environment Variables ✅ Already Configured

The `.env.local` file has been created with default values:

```env
AUTH_SECRET=finarif-dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

**Important:** Generate a secure secret for production:

```bash
openssl rand -base64 32
```

### 3. Run the Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000` - you'll be redirected to the login page.

**Server will start at:**
- Local: http://localhost:3000
- Network: http://192.168.1.6:3000

### 4. Login & Test

Use any of the demo credentials above to log in:

**Quick Test:**
```
Email: admin@finarif.com
Password: password123
```

**What happens:**
1. ✅ Enter credentials and click "Sign in"
2. ✅ Form validates input
3. ✅ Password is verified (bcrypt)
4. ✅ JWT session created (30 min)
5. ✅ Redirect to dashboard
6. ✅ User name + role displayed in header
7. ✅ Avatar menu shows logout option

**Test Different Roles:**
- Login as different users to see role labels change
- Each role has different permission levels (see Role Matrix below)

## File Structure

```
finarif-dashboard/
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # NextAuth API handler
│   ├── login/page.tsx                    # Login page
│   └── (dashboard)/layout.tsx            # Protected dashboard layout
├── components/
│   └── auth/
│       ├── login-form.tsx                # Login form component
│       └── user-menu.tsx                 # User menu dropdown
├── lib/
│   ├── auth/
│   │   ├── actions.ts                    # Server actions (logout)
│   │   └── permissions.ts                # Permission utilities
│   ├── db/
│   │   └── users.ts                      # Mock user database
│   └── types/
│       └── auth.ts                       # Auth types & role definitions
├── types/
│   └── next-auth.d.ts                    # NextAuth type extensions
├── auth.ts                               # NextAuth setup
├── auth.config.ts                        # NextAuth configuration
├── middleware.ts                         # Route protection middleware
└── .env.local                            # Environment variables
```

## How It Works

### Authentication Flow

1. **User visits dashboard** → Middleware checks authentication
2. **Not authenticated** → Redirect to `/login`
3. **User submits credentials** → Validated against mock database
4. **Password verified** → JWT session created (30 min expiry)
5. **Redirect to dashboard** → User info displayed in header
6. **Session active** → Access granted based on role permissions

### Session Management

- **Strategy:** JWT (JSON Web Tokens)
- **Storage:** HTTP-only secure cookies
- **Expiry:** 30 minutes of inactivity
- **Refresh:** Automatic on page navigation
- **Logout:** Server action clears session and redirects to login

### Route Protection

The `middleware.ts` file automatically protects all routes except:
- `/login` - Public login page
- `/api/*` - API routes (protected separately)
- `/_next/*` - Next.js internals
- Static files (images, favicon, etc.)

### Permission Checking

Use the permission utilities in your components:

```typescript
import { hasPermission, canCreate, isAdmin } from '@/lib/auth/permissions';
import { auth } from '@/auth';

// In a Server Component
const session = await auth();
const userRole = session?.user?.role;

// Check specific permission
if (hasPermission(userRole, 'transactions', 'create')) {
  // Show create button
}

// Shorthand helpers
if (canCreate(userRole, 'transactions')) { /* ... */ }
if (isAdmin(userRole)) { /* ... */ }
```

## Migrating to a Real Database

The current system uses a mock in-memory database (`lib/db/users.ts`). To migrate to a real database:

### Option 1: Prisma + PostgreSQL

1. Install Prisma:
```bash
npm install @prisma/client
npm install -D prisma
```

2. Initialize Prisma:
```bash
npx prisma init
```

3. Update `schema.prisma`:
```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String
  name        String
  role        String
  status      String   @default("active")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastLoginAt DateTime?
}
```

4. Replace functions in `lib/db/users.ts` with Prisma queries

### Option 2: Supabase

1. Install Supabase:
```bash
npm install @supabase/supabase-js
```

2. Create a `users` table in Supabase
3. Replace functions in `lib/db/users.ts` with Supabase queries

## Security Features

✅ **Password Hashing** - bcrypt with 10 rounds
✅ **HTTP-only Cookies** - Prevents XSS attacks
✅ **CSRF Protection** - Built into NextAuth
✅ **Secure Sessions** - JWT with secret signing
✅ **Route Protection** - Middleware blocks unauthenticated access
✅ **Input Validation** - Zod schema validation
✅ **Type Safety** - TypeScript throughout

## Customization

### Adding New Roles

1. Update `lib/types/auth.ts`:
```typescript
export type UserRole = 'admin' | 'finance_manager' | 'new_role';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // ... existing roles
  new_role: [
    { resource: 'dashboard', actions: ['read'] },
  ],
};
```

2. Add new user to `lib/db/users.ts`

### Customizing Session Duration

Edit `auth.ts`:
```typescript
session: {
  strategy: 'jwt',
  maxAge: 60 * 60, // 1 hour (in seconds)
},
```

### Adding Google OAuth (Future)

1. Get Google OAuth credentials from Google Cloud Console
2. Add to `.env.local`:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

3. Update `auth.ts`:
```typescript
import Google from 'next-auth/providers/google';

providers: [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
  // ... existing providers
],
```

## Troubleshooting

### "Invalid email or password" error
- Check that credentials match exactly (case-sensitive)
- Verify user exists in `lib/db/users.ts`
- Check that user status is 'active'

### Session not persisting
- Verify `AUTH_SECRET` is set in `.env.local`
- Check browser cookies are enabled
- Clear browser cache and cookies

### Redirecting to login on every page
- Check middleware matcher in `middleware.ts`
- Verify session is being created (check Network tab)
- Ensure `NEXTAUTH_URL` matches your domain

## Production Deployment

### Branching Strategy & Deployment URLs

The FinArif project uses a multi-environment deployment strategy with Vercel:

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| **Production** | `prod` | `https://finarif-dashboard.vercel.app` | Live application |
| **UAT** | `uat` | `https://finarif-dashboard-uat.vercel.app` | User Acceptance Testing |
| **QA** | `qa` | `https://finarif-dashboard-qa.vercel.app` | Quality Assurance |
| **Development** | `develop` | `https://finarif-dashboard-dev.vercel.app` | Development testing |
| **Feature** | `feature/*` | `https://finarif-dashboard-git-{branch}.vercel.app` | Feature previews |

**Current Branch:** `feature/auth-system`
**Preview URL:** `https://finarif-dashboard-git-feature-auth-system.vercel.app` (after deployment)

### Deployment Workflow

```bash
# 1. Commit changes to feature branch
git add .
git commit -m "feat: Add authentication system"
git push origin feature/auth-system

# 2. Merge to develop for testing
git checkout develop
git merge feature/auth-system
git push origin develop
# → Deploys to https://finarif-dashboard-dev.vercel.app

# 3. Promote to QA
git checkout qa
git merge develop
git push origin qa
# → Deploys to https://finarif-dashboard-qa.vercel.app

# 4. Promote to UAT
git checkout uat
git merge qa
git push origin uat
# → Deploys to https://finarif-dashboard-uat.vercel.app

# 5. Promote to Production
git checkout prod
git merge uat
git push origin prod
# → Deploys to https://finarif-dashboard.vercel.app
```

### Environment Variables for Each Environment

Set these in Vercel dashboard for **each environment**:

**Development (`develop`):**
```env
AUTH_SECRET=<generate-unique-secret-for-dev>
NEXTAUTH_URL=https://finarif-dashboard-dev.vercel.app
```

**QA (`qa`):**
```env
AUTH_SECRET=<generate-unique-secret-for-qa>
NEXTAUTH_URL=https://finarif-dashboard-qa.vercel.app
```

**UAT (`uat`):**
```env
AUTH_SECRET=<generate-unique-secret-for-uat>
NEXTAUTH_URL=https://finarif-dashboard-uat.vercel.app
```

**Production (`prod`):**
```env
AUTH_SECRET=<generate-unique-secret-for-prod>
NEXTAUTH_URL=https://finarif-dashboard.vercel.app
```

**Generate unique secrets for each environment:**
```bash
openssl rand -base64 32
```

### Pre-Deployment Checklist

Before deploying to production:

1. **Generate secure secrets** for all environments

2. **Update environment variables** in Vercel dashboard

3. **Migrate to real database** (see "Migrating to a Real Database" section)

4. **Remove demo credentials** from login page

5. **Add rate limiting** to prevent brute force attacks

6. **Enable HTTPS** (required for secure cookies)

7. **Review security headers** in `next.config.ts`

## Support

For issues or questions:
- Check NextAuth.js docs: https://authjs.dev
- Review this README thoroughly
- Check browser console for errors
- Verify environment variables are set correctly

---

**Built with:**
- NextAuth.js v5 (Auth.js)
- Shadcn UI
- TypeScript
- bcryptjs
- Zod validation

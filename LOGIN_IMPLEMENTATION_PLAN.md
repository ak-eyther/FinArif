# Admin Login Feature Plan

## Context & References
- **Branch:** `feature/balance-login` (per project balance workflow)
- **Design System:** Derived from `.claude/design/03_UI_WIREFRAMES.md` (FinArif palette, typography, component usage via shadcn/ui)
- **Architecture Guardrails:** `.claude/AGENT_CONTEXT_MASTER.md`, `.claude/design/04_API_CONTRACTS.md`, `.claude/design/06_COMPONENT_TREE.md`
- **Security & Operations:** `PR6_SECURITY_UPDATE.md`, `DEPLOYMENT_TROUBLESHOOTING.md`, `VERCEL_ENV_SETUP_GUIDE.md`
- **Git Workflow:** `GIT_WORKFLOW_GUIDE.md`, `.github/BRANCHING_STRATEGY.md`

## Objectives
1. Deliver an admin-only authentication experience using email + password.
2. Leverage existing design language so the login mirrors FinArif finance aesthetics.
3. Comply with documented security standards (hashed credentials, zero-trust inputs, protected routes).
4. Provide reusable auth foundation for future multi-role expansion.

## Constraints & Assumptions
- **Database:** Vercel Postgres accessed via `@vercel/postgres` (no ORM).
- **Single Admin:** `admin@finarif.com` seeded with a hashed password stored server-side.
- **Session Layer:** NextAuth.js (Credentials provider) to align with documentation and Vercel deployment guides.
- **Protected Surface:** All dashboard routes under `app/(dashboard)` require authentication; upload APIs must reject unauthenticated requests.
- **Environment Vars:** `AUTH_SECRET`, `NEXTAUTH_URL` already defined per `VERCEL_ENV_SETUP_GUIDE.md` (use `.env.local` for local dev).

## Parallel Workstreams ("YOLO multi-agent" breakdown)
1. **Auth Platform Track**
   - Create `users` table migration + seed script for admin.
   - Implement `lib/db/users.ts` for SQL queries with typed results.
   - Add password hashing utilities (bcrypt) + unit test.
2. **Session Services Track**
   - Install `next-auth` + credentials provider wiring in `auth.ts`/`auth.config.ts`.
   - Add route handler `app/api/auth/[...nextauth]/route.ts` with secure credential check + structured error messages (per API contracts).
   - Introduce `middleware.ts` to gatekeep dashboard routes and API endpoints (302 to `/login`).
3. **Experience Track**
   - Build `app/login/page.tsx` using shadcn primitives (Card, Input, Button) with FinArif colors, responsive layout, accessibility annotations.
   - Add `components/auth/LoginForm.tsx` (form state, validation, error handling) + shared loading indicator.
   - Update global layout to redirect authenticated users and surface user context (header avatar placeholder).
4. **Hardening & QA Track**
   - Unit tests for password helpers + auth query function (mock sql).
   - Integration smoke test for login route (NextAuth authorize) using MSW or supertest stub.
   - Update documentation: quickstart snippet in README, environment checklist, test instructions.

## Architecture Overview
- **Data Model (`sql/schema/00_users.sql`):**
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
  - Index on `email` for credentials lookup.
  - Seed migration inserts admin user with bcrypt hash.
- **Server Utilities:**
  - `lib/auth/password.ts` exporting `hashPassword`, `verifyPassword` (async, bcrypt).
  - `lib/db/users.ts` containing `getUserByEmail`, `recordLogin` using parameterized SQL.
  - `lib/auth/errors.ts` for typed auth error messages (maps to API contracts' `ErrorResponse`).
- **Session Management:**
  - `auth.config.ts` defines NextAuth options (session JWT, 1h expiry, credentials authorize calling DB utility).
  - `auth.ts` re-export `auth`, `signIn`, `signOut`, `credential` helper as per NextAuth 5 pattern.
  - `middleware.ts` uses `auth` helper to guard `/`, `/app/(dashboard)/**`, `/api/(payers|providers|schemes|upload|analytics)/**`; allow `/login`, `/api/auth/**`, static assets.
- **UI Composition:**
  - Layout: split screen with gradient background referencing FinArif palette (#2563EB primary, #0F172A text) and finance-themed illustration (`public/login-abstract.svg` TBD).
  - Form: shadcn `Card` with header (FinArif mark), fields (Label + Input), CTA button, error banner (using `components/ui/alert`).
  - UX states: loading overlay, invalid credentials messaging, password visibility toggle, remember me (optional placeholder) for future expansion.

## Security Checklist
- Hash passwords with bcrypt (`bcryptjs`), minimum 12 salt rounds.
- Rate-limit credential failures via incremental delay (client-level) + log attempt timestamp.
- Use constant-time comparison when validating credentials (`bcrypt.compare`).
- Sanitize inbound email/password (trim) and enforce RFC-compliant email RegExp.
- Ensure login form prevents autofill phishing (autocomplete attributes) and supports password managers.
- Force HTTPS redirects via `NEXTAUTH_URL` and `vercel.json` (already present) and deny credentials on non-HTTPS in production.

## Testing & Validation
- **Unit:** password helpers, SQL query mocks, NextAuth authorize function (happy + failure path).
- **Integration:** `GET /` when unauthenticated → 302 `/login`; `POST /api/auth/callback/credentials` with valid/invalid combos.
- **UI:** Playwright smoke (if time) ensuring login form loads, validation triggered.
- **Manual:** Local scenario script in README (start dev server, login, logout).

## Deliverables
- Schema + seed script for `users` table.
- Auth utilities (`lib/auth/*`), NextAuth config + middleware.
- Login UX (`app/login/page.tsx`, `components/auth/LoginForm.tsx`).
- Documentation updates (`README`, `LOGIN_IMPLEMENTATION_PLAN.md` summary section, env checklist).
- Tests under `tests/auth/` covering helpers + route logic.

## Open Questions & Follow-ups
- ⚙️ Future roles? For now locked to `admin`, but schema prepared for other roles.
- 🔄 Password reset not required in this release (document as out-of-scope).
- 🌐 Localization? English-only copy per current dashboard docs.


## Implementation Status (2025-10-07)

- [x] Auth schema + admin seed (`sql/schema/00_users.sql`)
- [x] Credential-based NextAuth configuration with middleware gating
- [x] Finance-styled login experience aligned with design system
- [x] Password + error helper tests scaffolded under `tests/auth/`
- [x] README authentication documentation updated

# FinArif MVP Dashboard

> Healthcare provider financing platform for Kenya - T+1 settlement with auto-adjudication

![Status](https://img.shields.io/badge/status-MVP%20Complete-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)

---

## Overview

FinArif solves the **30-90 day payment delay** problem for healthcare providers in Kenya by offering **T+1 settlement** on approved insurance claims. This dashboard demonstrates the financial model, risk management, and capital efficiency to board members for seed funding approval.

### The Business Model

**Problem:** Healthcare providers wait 30-90 days for insurance payments, creating cash flow crisis.

**Solution:**
- Vitraya's AI instantly approves claims
- FinArif pays providers within 24 hours
- We collect from insurers later
- Earn 3-5% discount fee while managing risk

**Target Metrics:** NIM 4.5% | Default Rate < 5% | ROE 20%

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## Database Configuration

1. Copy the provided environment template:
   ```bash
   cp .env.example .env.local
   ```
2. The sample file contains the Prisma-managed Postgres credentials shared for FinArif:
   - `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` feed the `@vercel/postgres` client used by API routes and migration scripts.
   - `PRISMA_DATABASE_URL` / `PRISMA_ACCELERATE_URL` are ready for Prisma tooling if we layer Prisma Client later.
3. Next.js picks up `.env.local` automatically. On Vercel, add the same keys in **Settings → Environment Variables** (set for Preview + Production).

After the environment variables are in place you can run the seed/migration scripts (see [Authentication](#authentication)) and the app will connect to the Prisma Postgres instance.

---

## Authentication

```bash
# Create users table + seed admin credential
npx tsx scripts/migrate-users.ts
```

- Default admin credential: `admin@finarif.com` / `password123` (rotate in production).
- Sessions expire after 60 minutes; `AUTH_SECRET` and `NEXTAUTH_URL` must be set (see `VERCEL_ENV_SETUP_GUIDE.md`).
- Passwords hashed with bcrypt (12 rounds) inside Vercel Postgres (`sql/schema/00_users.sql`).

---

## Dashboard Pages

1. **Main Dashboard** (`/`) - 4 key metrics + recent transactions
2. **Transactions** (`/transactions`) - Full list with sorting/filtering
3. **Risk Analysis** (`/risk`) - Heat map + concentration metrics
4. **Capital Management** (`/capital`) - Utilization tracking
5. **Transaction Details** (`/transactions/[id]`) - Complete P&L breakdown

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.7 (Strict)
- **UI:** shadcn/ui + TailwindCSS
- **Charts:** Recharts
- **Deployment:** Vercel

---

## Project Structure

```
finarif-dashboard/
├── app/(dashboard)/          # Dashboard pages
├── components/               # UI components
├── lib/
│   ├── calculations/        # Financial formulas (Risk, NIM, P&L)
│   ├── types/              # TypeScript types
│   ├── constants.ts        # Business rules
│   └── mock-data.ts        # 18 sample transactions
├── .claude/                # Documentation
└── .github/                # CI/CD workflows
```

---

## Git Branches

- **`develop`** - Active development (current)
- **`qa`** - Quality assurance testing
- **`uat`** - User acceptance testing
- **`prod`** - Production ready

See `.github/BRANCHING_STRATEGY.md` for workflow details.

---

## Documentation

- **`PROJECT_STATUS.md`** - Complete project status
- **`.claude/project-brief.md`** - Business overview
- **`.claude/coding-rules.md`** - TypeScript standards
- **`.claude/calculation-formulas.md`** - Financial formulas

---

## Key Features

✅ Risk-based pricing (3-5% fees)
✅ NIM calculation with cost of funds
✅ Complete P&L with provisions
✅ 18 realistic transactions
✅ Professional board-ready UI
✅ TypeScript strict mode (zero errors)

---

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # ESLint check
npx tsc --noEmit     # TypeScript check
```

---

## Current Portfolio (Mock Data)

| Metric | Value |
|--------|-------|
| Total Outstanding | KES 15,165,000 |
| Portfolio NIM | 2.61% |
| Active Transactions | 11 |
| Capital Utilization | 4.99% |

---

## Status

✅ **MVP Complete - Ready for Board Presentation**

Built with Claude Code 🤖

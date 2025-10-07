# Vercel Environment Variables Setup

## Database Configuration (Completed ✅)

Your Vercel Postgres database **prisma-postgres-purple-lamp** is now initialized with all tables.

### ✅ Local Setup Complete
- `.env.local` configured with database URLs
- Database initialized with 10 tables
- All schema migrations applied

---

## Vercel Dashboard Setup Required

You need to add these environment variables to your Vercel project:

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard → Your Project → Settings → Environment Variables

### 2. Add These Variables

#### Database URLs (From Vercel Postgres)
These should already be automatically configured by Vercel when you created the database:

```
POSTGRES_URL=<auto-configured>
POSTGRES_PRISMA_URL=<auto-configured>
POSTGRES_URL_NON_POOLING=<auto-configured>
POSTGRES_USER=<auto-configured>
POSTGRES_HOST=<auto-configured>
POSTGRES_PASSWORD=<auto-configured>
POSTGRES_DATABASE=<auto-configured>
```

#### Authentication (Required)
```
AUTH_SECRET=<generate-random-secret>
NEXTAUTH_URL=https://your-app-url.vercel.app
```

To generate AUTH_SECRET, run:
```bash
openssl rand -base64 32
```

---

## Environment Setup by Branch

### Production (prod branch)
- AUTH_SECRET: Use strong production secret
- NEXTAUTH_URL: https://your-production-domain.com

### UAT (uat branch)
- AUTH_SECRET: Use separate UAT secret
- NEXTAUTH_URL: https://your-uat-url.vercel.app

### QA (qa branch)
- AUTH_SECRET: Use separate QA secret
- NEXTAUTH_URL: https://your-qa-url.vercel.app

### Development (develop branch)
- AUTH_SECRET: Use separate dev secret
- NEXTAUTH_URL: https://your-dev-url.vercel.app

---

## Verification Steps

### 1. Check Database Connection
After deployment, verify the database is accessible:
```bash
curl https://your-app-url.vercel.app/api/providers
```

Should return JSON (empty array or data).

### 2. Check Build Logs
Go to Vercel → Your Project → Deployments → Click on deployment → View Logs

Look for:
- ✅ Build completed successfully
- ✅ No environment variable errors
- ✅ API routes responding

### 3. Test API Endpoints
```bash
# Providers
curl https://your-app-url.vercel.app/api/providers

# Payers
curl https://your-app-url.vercel.app/api/payers

# Schemes
curl https://your-app-url.vercel.app/api/schemes
```

---

## Database Schema

Your database now has these tables:

1. **users** - User authentication
2. **providers** - Healthcare providers
3. **payers** - Insurance payers
4. **schemes** - Insurance schemes
5. **claims** - Claims transactions
6. **upload_batches** - File upload tracking
7. **column_mappings** - CSV column mappings
8. **provider_analytics_cache** - Provider analytics
9. **payer_analytics_cache** - Payer analytics
10. **scheme_analytics_cache** - Scheme analytics

---

## Troubleshooting

### Database Connection Errors
If you see "Cannot connect to database":
1. Check that POSTGRES_URL is set in Vercel
2. Verify the database is not paused (Vercel Postgres auto-pauses)
3. Check Vercel Postgres dashboard for database status

### Missing Environment Variables
If build fails with "Missing environment variables":
1. Go to Vercel Project → Settings → Environment Variables
2. Make sure variables are set for the correct environment (Preview/Production)
3. Redeploy after adding variables

### AUTH_SECRET Issues
If you see auth errors:
1. Generate a new secret: `openssl rand -base64 32`
2. Add to Vercel environment variables
3. Redeploy

---

## Next Steps

1. ✅ Database initialized locally
2. ⏳ Add AUTH_SECRET to Vercel (generate with openssl)
3. ⏳ Set NEXTAUTH_URL for each environment
4. ⏳ Verify deployment succeeds
5. ⏳ Test API endpoints

---

## Current Status

| Task | Status |
|------|--------|
| Database created | ✅ Done |
| Schema migrated | ✅ Done |
| Local .env setup | ✅ Done |
| Vercel ENV vars | ⏳ Required |
| Deployment | 🔄 In Progress |

---

**Last Updated:** 2025-10-07
**Database:** prisma-postgres-purple-lamp (Vercel Postgres)
**Tables:** 10 tables initialized

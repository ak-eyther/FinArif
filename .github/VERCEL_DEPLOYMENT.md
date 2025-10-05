# Vercel Deployment Guide for FinArif Dashboard

## 📚 What You'll Learn

This guide will teach you:
- How Vercel works with Next.js
- Git-based deployment workflow
- Environment management
- Domain configuration
- Deployment best practices

---

## 🎓 Understanding Vercel

### What is Vercel?

**Vercel** is a cloud platform specifically designed for frontend applications. It's built by the creators of Next.js and offers:

1. **Automatic Deployments** - Push to Git → Automatic deploy
2. **Preview URLs** - Every branch gets a unique URL
3. **Edge Network** - Global CDN for fast loading
4. **Zero Config** - Detects Next.js automatically
5. **Free Tier** - Generous limits for MVPs

### How It Works

```
Developer pushes to GitHub
         ↓
Vercel detects the push
         ↓
Builds Next.js application
         ↓
Deploys to Edge Network
         ↓
Returns deployment URL
```

**Key Concepts:**

- **Production Deployment:** From your `prod` branch → `finarif-dashboard.vercel.app`
- **Preview Deployment:** From any other branch → `finarif-dashboard-git-branch-xxx.vercel.app`
- **Build Time:** Happens on Vercel's servers
- **Runtime:** Edge functions (serverless)

---

## 🚀 Step 1: Create Vercel Account

### 1.1 Sign Up with GitHub

**Why GitHub OAuth?**
- Seamless repository access
- Automatic webhook setup
- No manual token management

**Steps:**

1. Go to: https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your repositories
4. Complete profile setup

**What happens behind the scenes:**
- Vercel gets read access to your repos
- Creates a webhook for deployment triggers
- Sets up SSH keys for Git access

---

### 1.2 Understand Vercel's Free Tier

**What's included (Free Hobby Plan):**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ Custom domains (1 for free)
- ✅ Edge functions
- ✅ Analytics (basic)

**Limitations:**
- 1 team member (you)
- 6 second max execution time
- 50 MB deployment size
- Vercel branding in deployment emails

**For FinArif MVP:** Free tier is perfect! ✅

---

## 🔧 Step 2: Import GitHub Repository

### 2.1 Import from GitHub

**Steps:**

1. **Click "Add New..." → "Project"**
   - In Vercel dashboard: https://vercel.com/new

2. **Select "Import Git Repository"**

3. **Choose `ak-eyther/FinArif`**
   - If not visible, click "Adjust GitHub App Permissions"
   - Grant access to the FinArif repository

4. **Configure Project Settings:**

   ```
   Project Name:      finarif-dashboard
   Framework Preset:  Next.js (auto-detected)
   Root Directory:    ./  (leave as root)
   Build Command:     npm run build  (auto-filled)
   Output Directory:  .next  (auto-filled)
   Install Command:   npm install  (auto-filled)
   ```

**Why these settings?**
- **Project Name:** Becomes part of your URL
- **Framework Preset:** Vercel optimizes for Next.js
- **Root Directory:** Where package.json lives
- **Build/Output:** Next.js standards

---

### 2.2 Configure Production Branch

**Critical Setting:** Set production branch to `prod`

**Steps:**

1. **In "Git" section, expand "Production Branch"**

2. **Change from `main` to `prod`**
   ```
   Production Branch: prod
   ```

**Why this matters:**
- Only deploys to production from `prod` branch
- Prevents accidental production deploys
- Matches your branching strategy

3. **Enable "Only production deployments"**
   - Toggle OFF (we want preview deployments too)

---

### 2.3 Environment Variables (Optional)

**For MVP:** Not needed (using mock data)

**For Production Later:**

Add these when ready:
```env
# Future variables
NEXT_PUBLIC_API_URL=https://api.finarif.com
VITRAYA_API_KEY=your_api_key_here
DATABASE_URL=your_database_url
```

**How to add:**
1. Project Settings → Environment Variables
2. Add key-value pairs
3. Select environments: Production, Preview, Development

**Why use environment variables?**
- Keep secrets out of Git
- Different configs per environment
- Easy to update without redeploying

---

### 2.4 Deploy!

**Click "Deploy"**

**What happens now (in real-time):**

```
1. Queuing Build...                    [~5s]
   → Allocating build server

2. Cloning Repository...               [~10s]
   → git clone https://github.com/ak-eyther/FinArif.git
   → git checkout prod

3. Installing Dependencies...          [~30s]
   → npm ci
   → 380 packages installed

4. Building Application...             [~60s]
   → npm run build
   → Compiling Next.js pages
   → Optimizing images
   → Generating static pages

5. Uploading Build Output...           [~15s]
   → Uploading .next directory
   → Creating edge functions

6. Deploying to Edge Network...        [~10s]
   → Distributing to global CDN
   → Updating DNS

7. ✅ Deployment Complete!             [~2min total]
   → Production: https://finarif-dashboard.vercel.app
```

**First deployment:** ~2-3 minutes
**Subsequent deploys:** ~1-2 minutes (with caching)

---

## 🌍 Step 3: Configure Preview Deployments

### 3.1 Enable Branch Deployments

**What are Preview Deployments?**
- Automatic deployments for non-production branches
- Each branch gets a unique URL
- Perfect for testing before production

**Steps:**

1. **Go to Project Settings → Git**

2. **Find "Deploy Branches" section**

3. **Select "All branches"** (recommended)
   - OR specify: `develop`, `qa`, `uat`

**Deployment URLs you'll get:**

```
Branch        →    URL
────────────────────────────────────────────────────────────
develop       →    https://finarif-dashboard-git-develop-ak-eyther.vercel.app
qa            →    https://finarif-dashboard-git-qa-ak-eyther.vercel.app
uat           →    https://finarif-dashboard-git-uat-ak-eyther.vercel.app
prod          →    https://finarif-dashboard.vercel.app (production)
```

**Why this matters for FinArif:**
- Test features on `develop` before QA
- Board can review on `uat` before production
- Each environment is isolated

---

### 3.2 Configure Deployment Protection

**For Production (`prod` branch):**

1. **Go to Project Settings → Deployment Protection**

2. **Enable "Vercel Authentication"** (optional)
   - Requires Vercel login to view
   - Good for private demos

3. **Enable "Password Protection"** (optional)
   - Set password for preview deployments
   - Protects sensitive data

**For FinArif MVP:**
- Production: No protection (for board demo)
- Preview branches: Optional password protection

---

## 🔗 Step 4: Custom Domain Setup (Optional)

### 4.1 Why Use a Custom Domain?

**Benefits:**
- ✅ Professional appearance: `finarif.com` vs `finarif-dashboard.vercel.app`
- ✅ Better for board presentations
- ✅ Branding and credibility
- ✅ Easier to remember

**Cost:** $10-15/year for domain (from Namecheap, Google Domains, etc.)

---

### 4.2 Add Domain to Vercel

**Steps:**

1. **Buy domain** (e.g., from Namecheap):
   - Search for `finarif.com`
   - Purchase domain
   - Get access to DNS settings

2. **In Vercel:**
   - Go to Project Settings → Domains
   - Click "Add"
   - Enter domain: `finarif.com`

3. **Configure DNS:**

   Vercel will show you DNS records to add:

   ```
   Type    Name    Value                          TTL
   A       @       76.76.21.21                    Auto
   CNAME   www     cname.vercel-dns.com.          Auto
   ```

4. **Add to your domain registrar:**
   - Copy Vercel's DNS records
   - Paste into Namecheap/GoDaddy DNS settings
   - Save changes

5. **Wait for propagation** (~5-60 minutes)

6. **Vercel automatically provisions SSL** (HTTPS)

**Result:**
- `https://finarif.com` → Production deployment
- `https://www.finarif.com` → Redirects to finarif.com
- Automatic HTTPS certificate

---

### 4.3 Environment-Specific Subdomains

**Advanced:** Use subdomains for different environments

```
Domain                     →    Branch    →    Purpose
────────────────────────────────────────────────────────────
finarif.com                →    prod      →    Production
uat.finarif.com            →    uat       →    Board review
qa.finarif.com             →    qa        →    Testing
dev.finarif.com            →    develop   →    Development
```

**How to set up:**
1. Add each subdomain in Vercel
2. Point to specific branch
3. Configure DNS with CNAME records

---

## 🔄 Step 5: GitHub Integration

### 5.1 Deployment Status in PRs

**What it does:**
- Shows deployment status in Pull Requests
- Adds "View Deployment" button
- Reports build success/failure

**How it works automatically:**

When you create a PR from `develop` to `qa`:

```
GitHub Pull Request UI:

✅ Vercel — Deployment ready
   🔗 View Deployment: https://finarif-dashboard-git-develop-xxx.vercel.app

   All checks have passed
   ✅ Build & Quality Checks
   ✅ Vercel Deployment
```

**Vercel bot comments on PRs with:**
- Deployment URL
- Build logs link
- Performance metrics

---

### 5.2 Deployment Notifications

**Configure notifications:**

1. **Go to Account Settings → Notifications**

2. **Enable:**
   - ✅ Deployment Started
   - ✅ Deployment Failed
   - ✅ Deployment Ready

3. **Choose channels:**
   - Email
   - Slack (if team)
   - GitHub comments

**Why this matters:**
- Know immediately if deployment fails
- Quick access to preview URLs
- Team collaboration

---

## 📊 Step 6: Monitor Deployments

### 6.1 Deployment Dashboard

**Access:** https://vercel.com/ak-eyther/finarif-dashboard

**What you see:**

```
Production                                 Updated 2m ago
├── Status:        Ready
├── URL:           https://finarif-dashboard.vercel.app
├── Build Time:    1m 23s
├── Framework:     Next.js 15.5.4
└── Git:           prod@cd5acf5

Preview Deployments
├── develop@cd5acf5                       Updated 5m ago
│   └── URL: https://finarif-dashboard-git-develop-xxx.vercel.app
├── qa@527d782                            Updated 1h ago
│   └── URL: https://finarif-dashboard-git-qa-xxx.vercel.app
└── uat@527d782                           Updated 2h ago
    └── URL: https://finarif-dashboard-git-uat-xxx.vercel.app
```

---

### 6.2 Analytics (Basic - Free)

**Access:** Project → Analytics

**Metrics available:**
- Page views
- Unique visitors
- Top pages
- Countries
- Devices
- Performance (Core Web Vitals)

**For FinArif:**
- Track board member visits
- Monitor dashboard performance
- See which pages are viewed most

---

### 6.3 Build Logs

**When deployment fails:**

1. Click on failed deployment
2. View "Build Logs" tab
3. See error details:

```
npm ERR! Build failed
Error: Module not found: '@/components/ui/button'
    at buildError (webpack:...)
```

**How to fix:**
1. Identify the error
2. Fix locally
3. Test: `npm run build`
4. Commit and push
5. Vercel auto-redeploys

---

## 🎯 Step 7: Deployment Workflow

### 7.1 Feature Development Flow

**Scenario:** Adding new feature to dashboard

```bash
# 1. Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/export-csv

# 2. Develop feature
# ... write code ...

# 3. Test locally
npm run dev
npm run build  # Ensure it builds

# 4. Commit and push
git add .
git commit -m "feat(transactions): add CSV export functionality"
git push origin feature/export-csv

# 5. Vercel auto-deploys preview
#    → https://finarif-dashboard-git-feature-export-csv-xxx.vercel.app

# 6. Test preview deployment
#    Click the URL and verify

# 7. Create PR to develop
#    Vercel adds deployment link to PR

# 8. Merge PR
#    Develop branch auto-deploys
#    → https://finarif-dashboard-git-develop-xxx.vercel.app
```

---

### 7.2 Promotion to Production

**Scenario:** Board-approved features ready for production

```bash
# 1. Merge develop → qa
git checkout qa
git merge develop
git push origin qa
# → Auto-deploys to https://finarif-dashboard-git-qa-xxx.vercel.app

# 2. QA team tests

# 3. Merge qa → uat
git checkout uat
git merge qa
git push origin uat
# → Auto-deploys to https://finarif-dashboard-git-uat-xxx.vercel.app

# 4. Board reviews UAT deployment

# 5. Merge uat → prod (after approval)
git checkout prod
git merge uat
git push origin prod
# → Auto-deploys to PRODUCTION https://finarif-dashboard.vercel.app

# 6. Tag release
git tag -a v1.0.0 -m "Release v1.0.0 - Board Demo"
git push origin v1.0.0
```

**Production deployment triggers:**
- CI/CD pipeline runs
- Vercel builds from `prod` branch
- Updates production URL
- Notifies team

---

### 7.3 Rollback Strategy

**If production deployment fails:**

**Method 1: Vercel Dashboard (Instant)**

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Confirm rollback

**Result:** Instant rollback to previous version

---

**Method 2: Git Revert**

```bash
# Find the bad commit
git log --oneline -5

# Revert it
git revert <commit-hash>
git push origin prod

# Vercel redeploys with revert
```

---

## 🔐 Step 8: Security & Performance

### 8.1 Security Headers

**Vercel automatically adds:**
- ✅ HTTPS/SSL certificates
- ✅ Strict-Transport-Security
- ✅ X-Content-Type-Options
- ✅ X-Frame-Options

**Add custom headers (optional):**

Create `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ],
      },
    ]
  },
}

export default nextConfig
```

---

### 8.2 Performance Optimization

**Vercel does automatically:**

1. **Image Optimization** - Next.js Image component
2. **Code Splitting** - Automatic route-based
3. **Caching** - CDN edge caching
4. **Compression** - Gzip/Brotli
5. **HTTP/2** - Multiplexing

**Monitor performance:**
- Vercel Analytics → Web Vitals
- Check Lighthouse scores
- Monitor Core Web Vitals (LCP, FID, CLS)

**For FinArif:**
- Target: < 2s page load
- Current: Likely < 1s (static pages)
- Dashboard loads fast for board demo

---

## 📱 Step 9: Mobile/Device Testing

### 9.1 Test Preview Deployments

**Use preview URLs to test on:**

- ✅ Desktop browsers (Chrome, Safari, Firefox)
- ✅ Mobile devices (iPhone, Android)
- ✅ Tablets (iPad)
- ✅ Different screen sizes

**Tools:**
- Vercel preview URL + BrowserStack
- Chrome DevTools device emulation
- Physical devices

---

### 9.2 Responsive Design Check

**For FinArif dashboard:**

Test these URLs on mobile:
```
https://finarif-dashboard.vercel.app/
https://finarif-dashboard.vercel.app/transactions
https://finarif-dashboard.vercel.app/risk
https://finarif-dashboard.vercel.app/capital
```

**Verify:**
- Tables are scrollable
- Charts render properly
- Navigation works
- Metrics cards stack vertically

---

## 🚨 Troubleshooting

### Common Issues

#### Issue 1: Build Fails

**Error:** `Error: Command "npm run build" exited with 1`

**Solution:**
```bash
# Test locally
npm run build

# Check the error
# Fix issues
# Push again

# Or check Vercel build logs
```

---

#### Issue 2: Environment Variables Not Working

**Error:** `undefined` for environment variables

**Solution:**
1. Ensure variables start with `NEXT_PUBLIC_` for client-side
2. Redeploy after adding variables
3. Check variable is in correct environment (Production/Preview)

---

#### Issue 3: Domain Not Propagating

**Error:** "DNS not configured"

**Solution:**
1. Wait 5-60 minutes for DNS propagation
2. Check DNS with: `nslookup finarif.com`
3. Verify DNS records at registrar
4. Clear browser DNS cache

---

#### Issue 4: Deployment Slow

**Error:** Build takes > 5 minutes

**Solution:**
1. Check build logs for what's slow
2. Optimize package.json (remove unused packages)
3. Use `.vercelignore` to skip unnecessary files
4. Enable caching (automatic for npm)

---

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] Code builds locally (`npm run build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No linting errors (`npm run lint`)
- [ ] Environment variables configured (if needed)
- [ ] Git committed and pushed

### Vercel Setup

- [ ] Vercel account created
- [ ] GitHub repository imported
- [ ] Production branch set to `prod`
- [ ] Build settings configured
- [ ] Preview deployments enabled

### Post-Deployment

- [ ] Production URL works: `https://finarif-dashboard.vercel.app`
- [ ] All pages load correctly
- [ ] Charts and data display properly
- [ ] Tested on mobile/desktop
- [ ] Custom domain configured (optional)
- [ ] Team notified of URLs

---

## 📚 Resources

### Vercel Documentation
- **Getting Started:** https://vercel.com/docs
- **Next.js on Vercel:** https://vercel.com/docs/frameworks/nextjs
- **Custom Domains:** https://vercel.com/docs/custom-domains
- **Environment Variables:** https://vercel.com/docs/environment-variables

### Monitoring
- **Analytics:** https://vercel.com/docs/analytics
- **Logs:** https://vercel.com/docs/observability/runtime-logs

### Support
- **Vercel Community:** https://github.com/vercel/vercel/discussions
- **Twitter:** @vercel
- **Documentation:** https://vercel.com/docs

---

## 🎯 Next Steps

After successful deployment:

1. **Share URLs with team:**
   ```
   Production:  https://finarif-dashboard.vercel.app
   UAT:         https://finarif-dashboard-git-uat-xxx.vercel.app
   QA:          https://finarif-dashboard-git-qa-xxx.vercel.app
   ```

2. **Test board presentation:**
   - Load dashboard on projector
   - Test all 5 pages
   - Verify metrics display correctly

3. **Monitor performance:**
   - Check Vercel Analytics
   - Review Web Vitals
   - Optimize if needed

4. **Plan Phase 2:**
   - Add real backend
   - Connect to APIs
   - Enable authentication

---

## 🏆 Success Metrics

**Deployment is successful when:**

- ✅ Dashboard loads in < 2 seconds
- ✅ All 5 pages work correctly
- ✅ Charts and data display properly
- ✅ Works on desktop and mobile
- ✅ HTTPS enabled with green padlock
- ✅ Preview URLs work for all branches
- ✅ Board can access UAT deployment

---

**You're now ready to deploy FinArif to Vercel!** 🚀

Start at: https://vercel.com/new
Import: `ak-eyther/FinArif`
Deploy! ✨

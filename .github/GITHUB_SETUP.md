# GitHub Repository Setup Guide

**Repository:** https://github.com/ak-eyther/FinArif

This guide will help you configure branch protection rules and GitHub settings for the FinArif project.

---

## ✅ Branches Pushed to GitHub

All environment branches have been successfully pushed:

- ✅ **`develop`** - Active development (default branch)
- ✅ **`qa`** - Quality assurance testing
- ✅ **`uat`** - User acceptance testing
- ✅ **`prod`** - Production releases
- ✅ **`main`** - Initial setup (archived)

**Current Status:** All branches tracking remote successfully.

---

## Step 1: Set Default Branch

1. Go to: https://github.com/ak-eyther/FinArif/settings
2. Click **"Branches"** in the left sidebar
3. Under **"Default branch"**, click the switch icon
4. Select **`develop`** as the default branch
5. Click **"Update"** and confirm

**Why:** All new work should start from `develop`, not `main`.

---

## Step 2: Configure Branch Protection Rules

### Protect `prod` Branch (Production)

1. Go to: https://github.com/ak-eyther/FinArif/settings/branches
2. Click **"Add branch protection rule"**
3. Branch name pattern: **`prod`**
4. Enable the following settings:

   **Require Pull Requests:**
   - ✅ Require a pull request before merging
   - ✅ Require approvals: **1** (or more for critical projects)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require review from Code Owners (optional)

   **Status Checks:**
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Add required status checks: `quality-checks`, `build`

   **Additional Rules:**
   - ✅ Require conversation resolution before merging
   - ✅ Require signed commits (optional, for security)
   - ✅ Include administrators (protect from accidental force pushes)
   - ❌ Allow force pushes: **DISABLED**
   - ❌ Allow deletions: **DISABLED**

5. Click **"Create"** to save

---

### Protect `uat` Branch (User Acceptance Testing)

1. Click **"Add branch protection rule"**
2. Branch name pattern: **`uat`**
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: **1**
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date
   - ✅ Require conversation resolution
   - ❌ Allow force pushes: **DISABLED**

4. Click **"Create"**

---

### Protect `qa` Branch (Quality Assurance)

1. Click **"Add branch protection rule"**
2. Branch name pattern: **`qa`**
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date
   - ⚠️ Approvals: Optional (can be 0 for faster QA iterations)
   - ❌ Allow force pushes: **DISABLED**

4. Click **"Create"**

---

### Protect `develop` Branch (Development)

1. Click **"Add branch protection rule"**
2. Branch name pattern: **`develop`**
3. Enable:
   - ✅ Require a pull request before merging
   - ⚠️ Approvals: Optional (0 for solo dev, 1+ for teams)
   - ⚠️ Require status checks to pass (optional, recommended)
   - ❌ Allow force pushes: **DISABLED**

4. Click **"Create"**

---

## Step 3: Configure GitHub Actions

### Enable Actions

1. Go to: https://github.com/ak-eyther/FinArif/settings/actions
2. Under **"Actions permissions"**, select:
   - ✅ **Allow all actions and reusable workflows**
   - OR ✅ **Allow [organization] and select non-[organization] actions** (more restrictive)

3. Under **"Workflow permissions"**, select:
   - ✅ **Read and write permissions** (needed for deployments)
   - ✅ **Allow GitHub Actions to create and approve pull requests** (optional)

4. Click **"Save"**

---

## Step 4: Add Repository Secrets

For CI/CD deployment (when ready):

1. Go to: https://github.com/ak-eyther/FinArif/settings/secrets/actions
2. Click **"New repository secret"**
3. Add the following secrets:

   **Vercel Deployment (Optional for now):**
   - `VERCEL_TOKEN` - Your Vercel API token
   - `VERCEL_ORG_ID` - Your Vercel organization ID
   - `VERCEL_PROJECT_ID` - Your Vercel project ID

   **Future API Keys:**
   - `VITRAYA_API_KEY` - Vitraya API credentials
   - `DATABASE_URL` - Database connection string
   - Any other sensitive credentials

---

## Step 5: Configure Environments

Create deployment environments matching branches:

1. Go to: https://github.com/ak-eyther/FinArif/settings/environments
2. Click **"New environment"**

### Create Environments:

**Production Environment:**
- Name: **`production`**
- Protection rules:
  - ✅ Required reviewers: Add your email/username
  - ✅ Wait timer: 0 minutes (or add delay for safety)
  - ✅ Deployment branches: Only `prod` branch
- Environment secrets: Add production-specific secrets

**UAT Environment:**
- Name: **`uat`**
- Protection rules:
  - ⚠️ Required reviewers: Optional
  - ✅ Deployment branches: Only `uat` branch
- Environment secrets: Add UAT-specific secrets

**QA Environment:**
- Name: **`qa`**
- Protection rules: Optional
- Deployment branches: Only `qa` branch

**Development Environment:**
- Name: **`development`**
- Protection rules: None
- Deployment branches: Only `develop` branch

---

## Step 6: Configure Issue Templates (Optional)

1. Go to: https://github.com/ak-eyther/FinArif/issues/templates/edit
2. Choose templates:
   - ✅ Bug report
   - ✅ Feature request
   - ✅ Custom template (for board questions)

3. Click **"Propose changes"** and commit

---

## Step 7: Add Collaborators

1. Go to: https://github.com/ak-eyther/FinArif/settings/access
2. Click **"Add people"**
3. Invite team members:
   - **Admin:** Full repository access (CTO, Tech Lead)
   - **Maintain:** Manage repository without destructive actions
   - **Write:** Push to non-protected branches
   - **Read:** View and clone repository

---

## Step 8: Enable Required Features

### Discussions (Optional)
1. Go to: https://github.com/ak-eyther/FinArif/settings
2. Under **"Features"**, check:
   - ✅ **Issues** (enabled by default)
   - ⚠️ **Discussions** (for team collaboration)
   - ✅ **Projects** (for project management)
   - ⚠️ **Wiki** (for additional documentation)

---

## Step 9: Create Initial Pull Requests

Now that branches are protected, create PRs to promote code:

### Promote to QA
```bash
# On GitHub, create PR: develop → qa
# URL: https://github.com/ak-eyther/FinArif/compare/qa...develop
```

### Promote to UAT
```bash
# After QA approval, create PR: qa → uat
# URL: https://github.com/ak-eyther/FinArif/compare/uat...qa
```

### Promote to Production
```bash
# After UAT/board approval, create PR: uat → prod
# URL: https://github.com/ak-eyther/FinArif/compare/prod...uat
```

---

## Step 10: Set Up Deployment (Vercel)

### Connect Vercel to GitHub

1. Go to: https://vercel.com/new
2. Import Git Repository: **ak-eyther/FinArif**
3. Configure Project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Environment Variables:** None needed for MVP

5. Configure Production Branch:
   - Production Branch: **`prod`**
   - Preview Branches: `develop`, `qa`, `uat`

6. Deploy!

### Vercel Environment URLs

After deployment, you'll get:
- **Production:** https://finarif-dashboard.vercel.app (from `prod` branch)
- **UAT Preview:** https://finarif-dashboard-git-uat-[username].vercel.app
- **QA Preview:** https://finarif-dashboard-git-qa-[username].vercel.app
- **Dev Preview:** https://finarif-dashboard-git-develop-[username].vercel.app

---

## Workflow Summary

```
feature/xyz → develop → qa → uat → prod
     ↓          ↓        ↓     ↓      ↓
   local      dev env  qa env uat  production
```

**Feature Development:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
# ... develop feature ...
git add .
git commit -m "feat(scope): description"
git push origin feature/my-feature
# Create PR on GitHub: feature/my-feature → develop
```

**Hotfix Process:**
```bash
git checkout prod
git pull origin prod
git checkout -b hotfix/critical-fix
# ... fix issue ...
git add .
git commit -m "hotfix: fix critical issue"
git push origin hotfix/critical-fix
# Create PRs: hotfix → prod, uat, qa, develop
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] Default branch set to `develop`
- [ ] Branch protection rules configured for `prod`, `uat`, `qa`, `develop`
- [ ] GitHub Actions enabled
- [ ] Environments created (production, uat, qa, development)
- [ ] Vercel connected (optional, can be done later)
- [ ] Team members invited (if applicable)
- [ ] CI/CD pipeline running on push

---

## Quick Links

| Resource | URL |
|----------|-----|
| Repository | https://github.com/ak-eyther/FinArif |
| Settings | https://github.com/ak-eyther/FinArif/settings |
| Branches | https://github.com/ak-eyther/FinArif/settings/branches |
| Actions | https://github.com/ak-eyther/FinArif/actions |
| Environments | https://github.com/ak-eyther/FinArif/settings/environments |
| Secrets | https://github.com/ak-eyther/FinArif/settings/secrets/actions |

---

## Getting Help

**Documentation:**
- GitHub Branch Protection: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- GitHub Actions: https://docs.github.com/en/actions
- Vercel Deployment: https://vercel.com/docs

**Issues:**
- Create an issue: https://github.com/ak-eyther/FinArif/issues/new

---

## Next Steps

1. ✅ Complete GitHub setup (this guide)
2. ⏳ Test the workflow by creating a feature branch
3. ⏳ Create first PR: `develop` → `qa`
4. ⏳ Set up Vercel deployment
5. ⏳ Practice board presentation
6. ⏳ Deploy to production for demo

---

**Setup complete! Your branching strategy is now live on GitHub.** 🚀

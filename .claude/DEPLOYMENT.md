# FinArif Deployment & CI/CD Guide

## 🚀 Deployment Strategy

### Branch → Environment Mapping

| Branch | Environment | URL | Auto-Deploy | Purpose |
|--------|-------------|-----|-------------|---------|
| `main` | Development | `dev-finarif.vercel.app` | ✅ Yes | Active development |
| `qa` | QA Testing | `qa-finarif.vercel.app` | ✅ Yes | QA team testing |
| `uat` | User Acceptance | `uat-finarif.vercel.app` | ✅ Yes | Stakeholder review |
| `prod` | Production | `finarif.vercel.app` | ⚠️ Manual | Live application |

---

## 🔧 Vercel CLI Setup

### Initial Project Setup

```bash
# Link project to Vercel (one-time setup)
vercel link

# Configure deployments for each branch
vercel env add ENVIRONMENT development  # for main
vercel env add ENVIRONMENT qa           # for qa
vercel env add ENVIRONMENT uat          # for uat
vercel env add ENVIRONMENT production   # for prod
```

### Manual Deployment Commands

```bash
# Deploy current branch to preview
vercel

# Deploy to production (from prod branch)
git checkout prod
vercel --prod

# Deploy specific branch
vercel --branch=qa

# Check deployment status
vercel list

# View deployment logs
vercel logs [deployment-url]
```

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# This will trigger auto-deploy to QA
git checkout qa
git merge main
git push origin qa
# → Vercel deploys to qa-finarif.vercel.app

# This will trigger auto-deploy to Production
git checkout prod
git merge uat
git push origin prod
# → Vercel deploys to finarif.vercel.app
```

---

## 🤖 CodeRabbit AI Code Review

### What CodeRabbit Does
- **Automatic PR Reviews**: AI-powered code review on every pull request
- **Security Scanning**: Identifies potential security issues
- **Best Practices**: Suggests improvements and optimizations
- **Bug Detection**: Catches common errors before merge

### How to Use

#### 1. Create Pull Request (triggers CodeRabbit)
```bash
# Example: Merge main → qa
git checkout main
git push origin main

# Go to GitHub and create PR: main → qa
# CodeRabbit will automatically review within 1-2 minutes
```

#### 2. Review CodeRabbit Comments
- Check PR on GitHub
- Review CodeRabbit's suggestions
- Address critical issues
- Respond to comments with `@coderabbitai` to ask questions

#### 3. CodeRabbit Commands (in PR comments)
```
@coderabbitai review         # Re-trigger full review
@coderabbitai summarize      # Get summary of changes
@coderabbitai help           # Show available commands
@coderabbitai pause          # Pause reviews on this PR
@coderabbitai resume         # Resume reviews
```

### CodeRabbit Configuration

Create `.coderabbit.yaml` in repo root for custom rules:

```yaml
reviews:
  auto_review: true
  request_changes_workflow: true
  high_level_summary: true

checks:
  - security
  - performance
  - best_practices
  - code_quality

ignore:
  - "*.md"  # Skip markdown files
  - "*.log"
```

---

## 📋 Recommended PR Workflow

### 1. Feature → Main
```bash
git checkout -b feature/new-calculator
# ... make changes ...
git push origin feature/new-calculator

# Create PR on GitHub: feature/new-calculator → main
# ✅ CodeRabbit reviews
# ✅ Make requested changes
# ✅ Merge when approved
```

### 2. Main → QA
```bash
# Create PR on GitHub: main → qa
# ✅ CodeRabbit reviews
# ✅ Auto-deploy preview link
# ✅ QA team tests
# ✅ Merge when QA passes
```

### 3. QA → UAT
```bash
# Create PR on GitHub: qa → uat
# ✅ CodeRabbit reviews
# ✅ Auto-deploy preview
# ✅ Stakeholders test
# ✅ Merge when approved
```

### 4. UAT → Prod
```bash
# Create PR on GitHub: uat → prod
# ✅ CodeRabbit reviews
# ⚠️ REQUIRE 2+ approvals
# ✅ Auto-deploy preview
# ✅ Final checks
# ✅ Merge to go LIVE
```

---

## 🔄 Complete Deployment Workflow

### Standard Feature Release

```bash
# 1. Develop feature
git checkout -b feature/roi-improvements main
# ... code ...
git commit -am "feat: Add ROI comparison chart"
git push origin feature/roi-improvements

# 2. Create PR: feature → main (GitHub)
#    - CodeRabbit reviews
#    - Address feedback
#    - Merge

# 3. Deploy to QA
git checkout qa
git pull origin main
git merge main
git push origin qa
# → Vercel auto-deploys to qa-finarif.vercel.app

# 4. QA Testing
#    - QA team tests on qa-finarif.vercel.app
#    - Files bugs if issues found
#    - Approves when ready

# 5. Deploy to UAT
git checkout uat
git pull origin qa
git merge qa
git push origin uat
# → Vercel auto-deploys to uat-finarif.vercel.app

# 6. UAT Testing
#    - Stakeholders review
#    - Business approval
#    - Sign-off

# 7. Deploy to Production
git checkout prod
git pull origin uat
git merge uat
git push origin prod
# → Vercel auto-deploys to finarif.vercel.app (LIVE!)

# 8. Verify & Monitor
vercel logs finarif.vercel.app
# Check analytics, errors, user feedback
```

---

## 🚨 Rollback Procedures

### Quick Rollback (Vercel)

```bash
# View recent deployments
vercel list

# Promote previous deployment to production
vercel promote [previous-deployment-id] --prod
```

### Git-based Rollback

```bash
# Option 1: Revert last commit
git checkout prod
git revert HEAD
git push origin prod

# Option 2: Hard reset (USE WITH CAUTION)
git checkout prod
git reset --hard [previous-commit-hash]
git push -f origin prod
# Then backport to other branches
```

---

## 📊 Monitoring & Logs

### Vercel Analytics
```bash
# View deployment analytics
vercel analytics

# Check function logs
vercel logs --follow
```

### GitHub Actions (if configured)
- Check `.github/workflows/` for CI/CD pipelines
- View action runs: https://github.com/ak-eyther/FinArif/actions

---

## 🔐 Environment Variables (if needed)

### Add to Vercel
```bash
# Add production secret
vercel env add API_KEY production

# Add to all environments
vercel env add DATABASE_URL

# List all env vars
vercel env ls
```

### Local Development
Create `.env.local`:
```env
ENVIRONMENT=development
API_URL=http://localhost:3000
```

---

## ✅ Pre-Production Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] CodeRabbit approved
- [ ] QA sign-off received
- [ ] UAT approval obtained
- [ ] Performance tested
- [ ] Security reviewed
- [ ] Documentation updated
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Monitoring configured

---

## 🎯 Quick Commands Reference

```bash
# Deploy preview
vercel

# Deploy to production
vercel --prod

# View deployments
vercel list

# View logs
vercel logs

# Check Vercel status
vercel whoami

# Link to Vercel project
vercel link

# Remove deployment
vercel remove [deployment-id]
```

---

## 🆘 Troubleshooting

### Deployment Failed
```bash
# Check deployment logs
vercel logs [deployment-url]

# Redeploy
vercel --force
```

### CodeRabbit Not Reviewing
1. Check GitHub App permissions
2. Ensure PR is not in draft mode
3. Manually trigger: Comment `@coderabbitai review`

### Environment Variable Issues
```bash
# List all env vars
vercel env ls

# Pull env vars locally
vercel env pull .env.local
```

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **CodeRabbit Docs**: https://docs.coderabbit.ai
- **GitHub Actions**: https://docs.github.com/actions
- **Team Contact**: [Your team chat/email]

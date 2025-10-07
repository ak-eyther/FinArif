# FinArif Branching Strategy & Workflow

## 🌳 Branch Structure

```
main (development)
  ↓ merge when feature ready
qa (QA testing)
  ↓ merge when QA passes
uat (User Acceptance Testing)
  ↓ merge when UAT passes
prod (Production - LIVE)
```

### Branch Purposes

| Branch | Purpose | Who Uses | Auto-Deploy To |
|--------|---------|----------|----------------|
| `main` | Active development | Developers | Dev environment (optional) |
| `qa` | QA testing | QA Team | QA environment |
| `uat` | User acceptance | Stakeholders/Users | UAT environment |
| `prod` | Production (live) | End users | Production (Vercel/GitHub Pages) |
| `feature/*` | New features | Developers | Local only |
| `hotfix/*` | Urgent fixes | Developers | Fast-track to prod |

---

## 🔄 Workflows

### 1. Normal Feature Development

```bash
# Step 1: Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/calculator-improvements

# Step 2: Work on feature
# ... make changes ...
git add .
git commit -m "Add risk score visualization"

# Step 3: Merge to main
git checkout main
git merge feature/calculator-improvements
git push origin main

# Step 4: Deploy to QA
git checkout qa
git merge main
git push origin qa
# → QA team tests

# Step 5: Deploy to UAT (after QA approval)
git checkout uat
git merge qa
git push origin uat
# → Stakeholders test

# Step 6: Deploy to Production (after UAT approval)
git checkout prod
git merge uat
git push origin prod
# → LIVE!

# Step 7: Clean up
git branch -d feature/calculator-improvements
```

---

### 2. Hotfix Workflow (Urgent Production Bug)

```bash
# Step 1: Create hotfix from prod
git checkout prod
git pull origin prod
git checkout -b hotfix/fix-calculation-error

# Step 2: Fix the bug
# ... make changes ...
git add .
git commit -m "Fix: Correct ROE calculation formula"

# Step 3: Merge to prod immediately
git checkout prod
git merge hotfix/fix-calculation-error
git push origin prod
# → LIVE fix deployed!

# Step 4: Backport to all other branches
git checkout uat
git merge prod
git push origin uat

git checkout qa
git merge prod
git push origin qa

git checkout main
git merge prod
git push origin main

# Step 5: Clean up
git branch -d hotfix/fix-calculation-error
```

---

### 3. Quick Reference Commands

#### Create a new feature
```bash
git checkout -b feature/my-new-feature main
```

#### Create a hotfix
```bash
git checkout -b hotfix/urgent-fix prod
```

#### Promote through environments
```bash
# main → qa
git checkout qa && git merge main && git push origin qa

# qa → uat
git checkout uat && git merge qa && git push origin uat

# uat → prod
git checkout prod && git merge uat && git push origin prod
```

#### Check branch status
```bash
git branch -vv  # Local branches
git branch -r   # Remote branches
```

---

## 🛡️ Branch Protection Rules (GitHub Settings)

### Recommended Protection for `prod`
1. Go to: https://github.com/ak-eyther/FinArif/settings/branches
2. Add rule for `prod`:
   - ✅ Require pull request before merging
   - ✅ Require approvals (1+)
   - ✅ Dismiss stale reviews
   - ✅ Require status checks (if CI/CD setup)
   - ✅ Require branches to be up to date
   - ❌ Do not allow force pushes
   - ❌ Do not allow deletions

### Recommended Protection for `uat`
- ✅ Require pull request
- ✅ Require 1 approval
- ❌ No force pushes

### Recommended Protection for `qa`
- ✅ Require pull request (optional)
- Can be more relaxed for testing

### `main` - No strict protection
- Developers can push directly
- This is the development playground

---

## 📊 Deployment Mapping

### Option 1: Vercel (Recommended)
```
prod → Vercel Production (finarif.vercel.app)
uat  → Vercel Preview (uat-finarif.vercel.app)
qa   → Vercel Preview (qa-finarif.vercel.app)
main → Vercel Preview (dev-finarif.vercel.app)
```

### Option 2: GitHub Pages
```
prod → GitHub Pages (ak-eyther.github.io/FinArif)
```

---

## 🚨 Golden Rules

1. **NEVER commit directly to `prod`** - always use pull requests
2. **NEVER force push to `prod`** - unless absolute emergency
3. **Always test in QA before UAT** - no skipping environments
4. **Hotfixes must be backported** - to all branches (prod → uat → qa → main)
5. **Feature branches from `main`** - always branch from latest main
6. **Delete feature branches** - after merging to keep repo clean
7. **Keep branches in sync** - regularly merge up the chain

---

## 🔍 Checking What's Where

### See commits in QA but not in PROD
```bash
git log prod..qa --oneline
```

### See commits in UAT but not in PROD
```bash
git log prod..uat --oneline
```

### See all branches and their status
```bash
git branch -vv
```

---

## 📝 Commit Message Format

```
<type>: <description>

[optional body]

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting, styling
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

**Examples:**
```
feat: Add currency selector for multi-currency support

fix: Correct ROE annualization formula

hotfix: Fix critical calculation error in profit margin
```

---

## 🎯 Quick Decision Tree

**I want to...**

- ✨ **Build a new feature** → `feature/*` branch from `main`
- 🐛 **Fix a bug in development** → Fix in `main`
- 🚨 **Fix urgent prod bug** → `hotfix/*` from `prod`
- 🧪 **Test something** → Merge to `qa`
- 👥 **Show stakeholders** → Merge to `uat`
- 🚀 **Go live** → Merge to `prod`

---

## 📞 Support

Questions about the branching strategy?
- Check this document first
- Review git history: `git log --graph --all --oneline`
- Ask the team lead

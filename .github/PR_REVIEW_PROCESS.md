# 🔒 MANDATORY PR Review Process - FinArif

**CRITICAL**: This process is MANDATORY for ALL code changes to production branches.

---

## ⚠️ GOLDEN RULE

> **DO NOT COMMIT TO `develop`, `qa`, `uat`, or `prod` BRANCHES WITHOUT CREATING A PULL REQUEST AND TAGGING REVIEWERS**

---

## 🚫 PROHIBITED Actions

### ❌ NEVER Do This:

```bash
# ❌ Direct push to protected branches
git checkout prod
git merge uat
git push origin prod

# ❌ Commit without PR
git checkout develop
git commit -m "quick fix"
git push origin develop

# ❌ Merge without review
git merge feature-branch --no-ff
git push
```

**Why?** This bypasses:
- Automated code review (CodeRabbit)
- Human review (@ak-eyther)
- Code quality checks
- Documentation requirements
- Team visibility

---

## ✅ REQUIRED Process

### Step 1: Feature Development ✓

Work on your feature branch:

```bash
# ✅ Correct way
git checkout -b feature/my-feature
# ... make changes ...
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

**This is fine** - feature branches can be pushed directly.

---

### Step 2: Create Pull Request (MANDATORY)

#### For ANY merge to: `develop`, `qa`, `uat`, or `prod`

**ALWAYS create a PR on GitHub:**

1. Go to: `https://github.com/ak-eyther/FinArif/pulls`
2. Click: **"New pull request"**
3. Select branches:
   - **Base**: `develop` (or `qa`, `uat`, `prod`)
   - **Compare**: Your feature branch (or source branch)
4. Click: **"Create pull request"**

---

### Step 3: Fill PR Template (MANDATORY TAGS)

**REQUIRED PR Description Format:**

```markdown
# [Feature/Fix Name]

## Summary
[Brief description]

## Changes
- Change 1
- Change 2

## Review Requests (MANDATORY - NEVER SKIP THIS)

### @coderabbitai - Automated Review
Please perform comprehensive review with focus on:
- Security vulnerabilities
- Code quality
- Performance issues
- Best practices
- [Specific areas to review]

### @codex - Architecture Review
Please validate:
- Architecture decisions
- Design patterns
- Code organization

### @ak-eyther - Final Approval
Please review and approve for:
- [environment: develop/qa/uat/prod]

## Testing
- [x] Unit tests passed
- [x] Integration tests passed
- [x] Manual testing completed

## Checklist
- [x] Code follows style guide
- [x] Documentation updated
- [x] No breaking changes (or documented)
```

---

### Step 4: Assign Reviewers (MANDATORY)

On the PR page, click **"Reviewers"** section on the right:

1. **Assign yourself**: `ak-eyther` ✓
2. CodeRabbit will auto-review (configured in `.coderabbit.yaml`)

**Screenshot location**: Right sidebar → Reviewers → Request reviewer

---

### Step 5: Add Required Tags in PR Comment (MANDATORY)

After creating the PR, **immediately add this comment**:

```markdown
@coderabbitai review

@coderabbitai please focus on:
- Financial calculations accuracy
- Security vulnerabilities
- Performance optimization
- TypeScript type safety
- React best practices

@codex analyze architecture

@ak-eyther ready for your review
```

**This triggers manual review in addition to auto-review.**

---

### Step 6: Wait for Approvals (MANDATORY)

**DO NOT MERGE until ALL approvals received:**

- ✅ CodeRabbit review: "Looks good to me!"
- ✅ @ak-eyther approval
- ✅ All CI/CD checks passed
- ✅ No merge conflicts

**Minimum required**: 1 human approval + CodeRabbit approval

---

### Step 7: Merge PR (Only After Approval)

Click **"Merge pull request"** on GitHub.

**NEVER use `git push` to bypass PR process.**

---

## 📋 Branch-Specific Requirements

### For `develop` Branch

**Required Reviews:**
- ✅ CodeRabbit automated
- ✅ @ak-eyther approval
- ✅ All tests passing

**Who can merge**: Developer (after approval)

---

### For `qa` Branch

**Required Reviews:**
- ✅ CodeRabbit automated
- ✅ @ak-eyther approval
- ✅ QA team sign-off

**Who can merge**: Tech lead or QA lead

**When to merge**: After all features for sprint are complete in `develop`

---

### For `uat` Branch

**Required Reviews:**
- ✅ CodeRabbit automated
- ✅ @ak-eyther approval
- ✅ QA sign-off complete
- ✅ Business stakeholder aware

**Who can merge**: Tech lead or Product Owner

**When to merge**: After QA testing passes

---

### For `prod` Branch (PRODUCTION)

**Required Reviews** (STRICTEST):
- ✅ CodeRabbit automated review
- ✅ @ak-eyther approval (MANDATORY)
- ✅ QA sign-off (documented)
- ✅ UAT sign-off (documented)
- ✅ Product Owner approval
- ✅ Deployment window scheduled
- ✅ Rollback plan documented in PR

**Who can merge**: @ak-eyther ONLY

**When to merge**: During approved deployment window

**Additional Requirements**:
- Release notes prepared
- Team notified
- Monitoring ready
- Support team aware

---

## 🎯 Quick Reference Card

Print this and keep at your desk:

```text
┌─────────────────────────────────────────────────┐
│   BEFORE EVERY PRODUCTION MERGE                 │
│                                                 │
│   1. Create PR on GitHub                        │
│   2. Fill PR template with @tags:               │
│      - @coderabbitai review                     │
│      - @codex validate                          │
│      - @ak-eyther approve                       │
│   3. Assign reviewers: ak-eyther                │
│   4. Wait for ALL approvals                     │
│   5. Merge via GitHub (not command line)        │
│                                                 │
│   ⚠️  NO DIRECT PUSHES TO:                     │
│   develop | qa | uat | prod                     │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Enforcement Mechanisms

### GitHub Branch Protection (Recommended Setup)

Configure these on GitHub:

1. Go to: `Settings` → `Branches` → `Add branch protection rule`

2. **For `prod` branch**:
   - ✅ Require pull request reviews before merging
   - ✅ Require review from Code Owners
   - ✅ Require status checks to pass
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings
   - ✅ Restrict who can push to matching branches: `ak-eyther` only

3. **For `uat`, `qa`, `develop` branches**:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass
   - ✅ Require conversation resolution before merging

---

## 🚨 Emergency Hotfix Process

For **critical production bugs** that need immediate fix:

### Still Requires PR, But Expedited:

```bash
# 1. Create hotfix branch from prod
git checkout prod
git pull origin prod
git checkout -b hotfix/critical-bug-description

# 2. Make fix
# ... fix the bug ...

# 3. Commit
git add .
git commit -m "hotfix: fix critical production bug [URGENT]"

# 4. Push
git push origin hotfix/critical-bug-description

# 5. Create URGENT PR
# Go to GitHub, create PR with [URGENT] in title

# 6. Tag reviewers in PR
@coderabbitai review [URGENT - SECURITY ISSUE]
@ak-eyther URGENT approval needed - production is down

# 7. After approval, merge immediately

# 8. Cherry-pick to other branches
git checkout develop
git cherry-pick <hotfix-commit-hash>
git push origin develop
```

**Even in emergencies, PR + review is required.**

Exception: Only if @ak-eyther explicitly approves bypassing PR for extreme emergency.

---

## ✅ Summary

### Before EVERY Merge to `develop`/`qa`/`uat`/`prod`:

1. ✅ Create PR on GitHub
2. ✅ Tag `@coderabbitai review` in PR description or comment
3. ✅ Tag `@codex` for architecture review
4. ✅ Assign `@ak-eyther` as reviewer
5. ✅ Wait for approvals
6. ✅ Merge via GitHub UI

### NEVER:
- ❌ Direct `git push` to protected branches
- ❌ Merge without PR
- ❌ Skip reviewer tags
- ❌ Merge without approval

---

**Remember**: Every PR is a deployment gate. Quality > Speed.

🤖 This process protects our codebase, our users, and our business.

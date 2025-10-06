# Pull Request

## Type of Change
<!-- Mark with 'x' -->
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 💥 Breaking change
- [ ] 📝 Documentation update
- [ ] 🚑 Hotfix (urgent production fix)
- [ ] ♻️ Refactoring
- [ ] 🎨 UI/UX improvement

---

## Summary
<!-- Provide a brief summary of your changes -->



---

## Changes Made
<!-- List the specific changes -->
-
-
-

---

## 🔍 Review Requests (⚠️ MANDATORY - DO NOT SKIP)

### @coderabbitai - Comprehensive Automated Review
<!-- CodeRabbit will auto-review, but you can add specific focus areas -->

Please perform comprehensive review with focus on:

**Code Quality & Security:**
- [ ] Security vulnerabilities and best practices
- [ ] Financial calculation accuracy (if applicable)
- [ ] TypeScript type safety (strict mode compliance)
- [ ] No `any` types or unsafe assertions
- [ ] Error handling and edge cases

**Architecture & Design:**
- [ ] Architecture decisions and patterns
- [ ] Code organization and structure
- [ ] Component composition and reusability
- [ ] Separation of concerns
- [ ] Scalability considerations

**Performance & Best Practices:**
- [ ] Performance optimization opportunities
- [ ] React best practices (hooks, memo, forwardRef)
- [ ] Unnecessary re-renders or memory leaks
- [ ] Bundle size impact

**Production Readiness:**
- [ ] Breaking changes identified
- [ ] Backward compatibility
- [ ] Documentation completeness

**Specific areas to review:**
<!-- Add any specific concerns or areas you want CodeRabbit to focus on -->

### @ak-eyther - Final Approval

**Target environment**: <!-- develop / qa / uat / prod -->

Please review and approve for deployment to: **[environment name]**

---

## 🧪 Testing

### Test Coverage

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Edge cases tested
- [ ] Browser compatibility tested (if UI changes)

### Test Results
<!-- Paste test results or describe manual testing -->



---

## 📚 Documentation

- [ ] Code comments added for complex logic
- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] User guide updated (if needed)
- [ ] JSDoc comments added for new functions

---

## 🚀 Deployment Notes

### Database Changes

- [ ] No database changes
- [ ] Database migrations included: <!-- describe -->

### Environment Variables

- [ ] No new environment variables
- [ ] New variables required: <!-- list them -->

### Breaking Changes

- [ ] No breaking changes
- [ ] Breaking changes (describe below):

<!-- If breaking changes, describe them and the migration path -->



### Dependencies
<!-- List any new dependencies added -->
- None
<!-- or -->
<!-- - package-name@version: reason -->

---

## 🔄 Rollback Plan

**How to rollback if issues occur:**

<!-- Example: -->
<!--
```bash
git revert HEAD
git push origin prod
```
-->



**Rollback triggers:**
<!-- When should this be rolled back? -->
- Production errors > X%
- Performance degradation > X%
- Critical bug discovered
<!-- Add specific triggers -->

---

## 📸 Screenshots (if applicable)

### Before
<!-- Add screenshot or remove this section -->


### After
<!-- Add screenshot or remove this section -->


---

## ✅ Pre-Submission Checklist

<!-- Mark ALL items with 'x' before submitting -->

### Code Quality

- [ ] My code follows the project's style guide
- [ ] I have performed a self-review of my code
- [ ] I have commented complex/critical code sections
- [ ] My changes generate no new warnings or errors
- [ ] No `any` types in TypeScript (strict mode compliant)

### Testing

- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing unit tests pass locally
- [ ] I have tested edge cases
- [ ] I have tested error scenarios

### Documentation

- [ ] I have updated relevant documentation
- [ ] I have added JSDoc comments for new functions
- [ ] Breaking changes are documented

### Review Process ⚠️ MANDATORY

- [ ] I have tagged `@coderabbitai` for automated review
- [ ] I have tagged `@codex` for architecture review
- [ ] I have assigned `@ak-eyther` as reviewer
- [ ] I understand this PR cannot be merged without approvals

### Deployment

- [ ] This PR has no merge conflicts
- [ ] All CI/CD checks are passing (or will pass)
- [ ] Rollback plan is documented above
- [ ] Team has been notified (if production deployment)

---

## 🔗 Related Links

<!-- Link to related issues, tickets, documentation -->

- **JIRA Ticket**: <!-- FINARIF-XXX -->
- **Related PR**: <!-- #XX -->
- **Design Mockup**: <!-- Figma/Design link -->
- **Documentation**: <!-- Link to docs -->

---

## 💬 Additional Context

<!-- Add any other context about the PR here -->



---

## 📊 Impact Assessment

**Which areas of the codebase are affected?**
<!-- Check all that apply -->
- [ ] Frontend (UI components)
- [ ] Backend (API/Server)
- [ ] Database
- [ ] Calculations (WACC, risk, etc.)
- [ ] Authentication/Authorization
- [ ] External integrations
- [ ] Build/Deploy configuration

**User-facing impact:**
<!-- Describe how this affects end users -->



---

## ⏱️ Deployment Timeline

**Target deployment date**: <!-- YYYY-MM-DD -->
**Deployment window**: <!-- e.g., 2:00 PM - 4:00 PM EST -->
**Estimated downtime**: <!-- None / X minutes -->

---

**🤖 Remember:**
- Do NOT merge without CodeRabbit + @ak-eyther approval
- Do NOT bypass the PR process with direct pushes
- Quality > Speed - take time to review properly

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

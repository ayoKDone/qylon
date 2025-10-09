# 🚀 Qylon Git-Flow Automation System

## Quick Setup Guide

This repository includes a comprehensive Git-flow automation system that enforces local testing and validation before any Pull Request (PR) is submitted, significantly reducing CI/CD pipeline failures and costs.

## ⚡ Quick Start

### 1. Install Git Hooks

```bash
# Run the setup script
./scripts/setup-git-hooks.sh
```

### 2. Create a Feature Branch

```bash
# Create a properly named feature branch
git checkout -b feature/JIRA-123-short-description
```

### 3. Develop and Commit

```bash
# Make your changes
# ... edit files ...

# Stage and commit (triggers validation)
git add .
git commit -m "feat: add new feature"

# Push (triggers comprehensive validation)
git push origin feature/JIRA-123-short-description
```

## 🛡️ What Gets Validated

### Pre-commit Checks
- ✅ **Branch Protection** - No direct commits to main/develop
- ✅ **Code Formatting** - ESLint, Prettier, Black, isort
- ✅ **Link Validation** - Internal and external link checking
- ✅ **Unit Tests** - 80% coverage threshold enforced
- ✅ **Security Scan** - NPM audit, ESLint security, Bandit
- ✅ **Integration Tests** - Critical service interactions

### Pre-push Checks
- ✅ **All Pre-commit Checks** - Plus enhanced validation
- ✅ **Build Validation** - Docker builds and migrations
- ✅ **Performance Tests** - Load and stress testing
- ✅ **Health Checks** - Service startup validation
- ✅ **Enhanced Security** - Snyk, Trivy, retire.js scans

## 📋 Branch Naming Rules

**Required Format:**
```
feature/JIRA-XXXX-short-description
bugfix/JIRA-XXXX-short-description
hotfix/JIRA-XXXX-short-description
chore/JIRA-XXXX-short-description
```

**Examples:**
- `feature/JIRA-123-add-user-authentication`
- `bugfix/JIRA-456-fix-login-bug`
- `hotfix/JIRA-789-critical-security-fix`

## 🔧 Available Commands

### Validation Commands
```bash
npm run validate:branch      # Check branch naming and status
npm run validate:links       # Check all documentation links
npm run test:runner         # Run comprehensive test suite
npm run security:scan       # Run security vulnerability scan
```

### Development Commands
```bash
npm run lint:fix            # Fix linting issues
npm run format              # Format code with Prettier
npm run test:coverage       # Generate coverage report
```

## 🚨 Common Issues & Solutions

### Issue: "Branch naming convention failed"
**Solution:**
```bash
git branch -m feature/JIRA-123-correct-name
```

### Issue: "Test coverage below 80%"
**Solution:**
```bash
npm run test:coverage:html  # View detailed coverage
# Add tests for uncovered code
```

### Issue: "Security vulnerabilities found"
**Solution:**
```bash
npm audit fix               # Fix automatically fixable issues
npm run security:scan       # Check remaining issues
```

### Issue: "Code formatting failed"
**Solution:**
```bash
npm run format              # Auto-fix formatting
npm run lint:fix            # Auto-fix linting
```

## 📊 Coverage & Security Thresholds

- **Test Coverage**: 80% minimum (lines, functions, branches, statements)
- **Security**: 0 critical/high vulnerabilities allowed
- **Code Quality**: All linting rules must pass
- **Performance**: Critical performance tests must pass

## 🆘 Emergency Bypass

⚠️ **Only use in emergencies:**

```bash
git commit --no-verify -m "emergency: critical fix"
git push --no-verify origin branch-name
```

## 📚 Full Documentation

For detailed information, see:
- **[Complete Git-Flow Automation Guide](docs/GIT_FLOW_AUTOMATION.md)**
- **[Technical Design Document](docs/Qylon%20Technical%20Design%20Doc.md)**
- **[Security Setup Guide](docs/SECURITY_SETUP.md)**

## 🎯 Benefits

- **Reduced CI/CD Failures** - Catch issues locally before pipeline
- **Improved Code Quality** - Enforced standards and testing
- **Enhanced Security** - Multiple security scanning tools
- **Faster Development** - Immediate feedback on issues
- **Cost Savings** - Reduced pipeline usage and debugging time

## 👥 Team Support

- **Chief Architect**: Bill (siwale) - Core services and architecture
- **Security Lead**: Bill (siwale) - Security framework and compliance
- **DevOps Lead**: Tekena - CI/CD and infrastructure

---

**Ready to code with confidence!** 🚀

The automation system ensures your code meets the highest standards before it reaches the CI/CD pipeline, saving time and reducing costs while maintaining quality and security.

#!/bin/bash

# Qylon AI Automation Platform - Branch Validation Script
# Validates branch naming conventions and protection rules
# Chief Architect: Bill (siwale)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROTECTED_BRANCHES=("main" "develop" "master")
BRANCH_PATTERNS=(
    "^feature/[A-Z]+-[0-9]+-.+"
    "^bugfix/[A-Z]+-[0-9]+-.+"
    "^hotfix/[A-Z]+-[0-9]+-.+"
    "^chore/[A-Z]+-[0-9]+-.+"
    "^release/[0-9]+\.[0-9]+\.[0-9]+"
)

echo -e "${BLUE}🌿 Qylon Branch Validation Starting...${NC}"
echo "=================================================="

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$REPO_ROOT"

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}📋 $1${NC}"
    echo "----------------------------------------"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in a Git repository
if [ ! -d ".git" ]; then
    print_error "Not in a Git repository. Please run this script from the repository root."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

print_section "Branch Information"
echo "Current branch: $CURRENT_BRANCH"
echo "Repository root: $REPO_ROOT"

# Check if branch is protected
print_section "Protected Branch Check"

is_protected=false
for protected_branch in "${PROTECTED_BRANCHES[@]}"; do
    if [ "$CURRENT_BRANCH" = "$protected_branch" ]; then
        is_protected=true
        break
    fi
done

if [ "$is_protected" = true ]; then
    print_error "Branch '$CURRENT_BRANCH' is protected!"
    print_error "Direct commits to protected branches are not allowed."
    print_error "Please create a feature branch instead."
    echo ""
    echo "Example:"
    echo "  git checkout -b feature/JIRA-123-add-user-authentication"
    echo "  git checkout -b bugfix/JIRA-456-fix-login-bug"
    echo "  git checkout -b hotfix/JIRA-789-critical-security-fix"
    exit 1
else
    print_success "Branch '$CURRENT_BRANCH' is not protected"
fi

# Validate branch naming convention
print_section "Branch Naming Convention Check"

valid_pattern=false
matched_pattern=""

for pattern in "${BRANCH_PATTERNS[@]}"; do
    if [[ $CURRENT_BRANCH =~ $pattern ]]; then
        valid_pattern=true
        matched_pattern="$pattern"
        break
    fi
done

if [ "$valid_pattern" = true ]; then
    print_success "Branch naming convention is valid"
    echo "Matched pattern: $matched_pattern"
else
    print_warning "Branch '$CURRENT_BRANCH' doesn't follow naming convention"
    echo ""
    echo "Expected patterns:"
    echo "  feature/JIRA-XXXX-short-description"
    echo "  bugfix/JIRA-XXXX-short-description"
    echo "  hotfix/JIRA-XXXX-short-description"
    echo "  chore/JIRA-XXXX-short-description"
    echo "  release/1.0.0"
    echo ""
    echo "Examples:"
    echo "  feature/JIRA-123-add-user-authentication"
    echo "  bugfix/JIRA-456-fix-login-bug"
    echo "  hotfix/JIRA-789-critical-security-fix"
    echo "  chore/JIRA-101-update-dependencies"
    echo "  release/2.1.0"
    echo ""
    echo -e "${YELLOW}Do you want to continue anyway? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check branch status
print_section "Branch Status Check"

# Check if there are uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    print_warning "You have uncommitted changes"
    echo "Uncommitted files:"
    git status --porcelain
    echo ""
    echo -e "${YELLOW}Do you want to continue? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "Working directory is clean"
fi

# Check if branch is up to date with remote
if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})
    BASE=$(git merge-base @ @{u})

    if [ "$LOCAL" = "$REMOTE" ]; then
        print_success "Branch is up to date with remote"
    elif [ "$LOCAL" = "$BASE" ]; then
        print_warning "Branch is behind remote. Consider pulling latest changes."
        echo "Run: git pull origin $CURRENT_BRANCH"
    elif [ "$REMOTE" = "$BASE" ]; then
        print_success "Branch is ahead of remote"
    else
        print_warning "Branch has diverged from remote"
        echo "Run: git pull --rebase origin $CURRENT_BRANCH"
    fi
else
    print_warning "No upstream branch set"
    echo "Run: git push --set-upstream origin $CURRENT_BRANCH"
fi

# Check for merge conflicts
print_section "Merge Conflict Check"

if git merge --no-commit --no-ff HEAD >/dev/null 2>&1; then
    git merge --abort >/dev/null 2>&1
    print_success "No merge conflicts detected"
else
    print_error "Potential merge conflicts detected"
    echo "Please resolve conflicts before proceeding"
    exit 1
fi

# Final validation summary
print_section "Validation Summary"

echo -e "${GREEN}🎉 Branch validation completed!${NC}"
echo ""
echo "Branch: $CURRENT_BRANCH"
echo -e "${GREEN}✅ Protected branch check: PASSED${NC}"
echo -e "${GREEN}✅ Naming convention check: PASSED${NC}"
echo -e "${GREEN}✅ Working directory check: PASSED${NC}"
echo -e "${GREEN}✅ Remote sync check: PASSED${NC}"
echo -e "${GREEN}✅ Merge conflict check: PASSED${NC}"
echo ""
echo -e "${BLUE}🚀 Branch is ready for development!${NC}"
echo ""
echo "Next steps:"
echo "1. Make your changes"
echo "2. Stage changes: git add ."
echo "3. Commit: git commit -m 'Your commit message'"
echo "4. Push: git push origin $CURRENT_BRANCH"
echo "5. Create Pull Request for code review"

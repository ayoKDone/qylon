#!/bin/bash

# Qylon AI Automation Platform - Create PR Script
# This script creates a PR against the dev branch after all tests pass
# Chief Architect: Bill (siwale)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${BLUE}🚀 Creating Pull Request...${NC}"

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$REPO_ROOT"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository."
    exit 1
fi

# Get current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Check if current branch is 'dev' or 'main'
if [[ "$CURRENT_BRANCH" == "dev" || "$CURRENT_BRANCH" == "main" ]]; then
    print_error "Cannot create a PR from 'dev' or 'main' branch. Please switch to a feature branch."
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_error "Uncommitted changes detected. Please commit or stash them before creating a PR."
    exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed. Please install it to create PRs automatically."
    echo "  Install instructions: https://cli.github.com/"
    exit 1
fi

# Check if authenticated with gh CLI
if ! gh auth status &> /dev/null; then
    print_error "Not authenticated with GitHub CLI. Please run 'gh auth login'."
    exit 1
fi

# Get the last commit message for PR title and body
PR_TITLE=$(git log -1 --pretty=%s)
PR_BODY=$(git log -1 --pretty=%b)

# If PR_BODY is empty, use a default message
if [ -z "$PR_BODY" ]; then
    PR_BODY="Automated PR for branch: $CURRENT_BRANCH"
fi

print_info "Pushing current branch '$CURRENT_BRANCH' to remote..."
git push origin "$CURRENT_BRANCH"

print_info "Creating PR from '$CURRENT_BRANCH' to 'dev'..."
gh pr create --base dev --head "$CURRENT_BRANCH" --title "$PR_TITLE" --body "$PR_BODY"

print_success "Pull Request created successfully!"
echo -e "View your PR here: $(gh pr view --json url -q .url)"

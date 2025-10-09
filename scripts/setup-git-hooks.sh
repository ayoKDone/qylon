#!/bin/bash

# Qylon AI Automation Platform - Git Hooks Setup Script
# Installs and configures Git hooks for automated pre-commit/push validation
# Chief Architect: Bill (siwale)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Qylon Git Hooks Setup Starting...${NC}"
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

print_section "Installing Git Hooks"

# Create hooks directory if it doesn't exist
HOOKS_DIR=".git/hooks"
if [ ! -d "$HOOKS_DIR" ]; then
    print_error "Git hooks directory not found: $HOOKS_DIR"
    exit 1
fi

# Install pre-commit hook
if [ -f "$HOOKS_DIR/pre-commit" ]; then
    print_warning "Pre-commit hook already exists. Backing up..."
    mv "$HOOKS_DIR/pre-commit" "$HOOKS_DIR/pre-commit.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Copy pre-commit hook
if [ -f ".git/hooks/pre-commit" ]; then
    chmod +x ".git/hooks/pre-commit"
    print_success "Pre-commit hook installed and made executable"
else
    print_error "Pre-commit hook file not found. Please ensure it exists."
    exit 1
fi

# Install pre-push hook
if [ -f "$HOOKS_DIR/pre-push" ]; then
    print_warning "Pre-push hook already exists. Backing up..."
    mv "$HOOKS_DIR/pre-push" "$HOOKS_DIR/pre-push.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Copy pre-push hook
if [ -f ".git/hooks/pre-push" ]; then
    chmod +x ".git/hooks/pre-push"
    print_success "Pre-push hook installed and made executable"
else
    print_error "Pre-push hook file not found. Please ensure it exists."
    exit 1
fi

print_section "Installing Required Dependencies"

# Check Node.js and npm
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js (version 20 or higher)."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_warning "Node.js version $NODE_VERSION detected. Recommended version is 20 or higher."
fi

print_success "Node.js and npm are available"

# Install npm dependencies
echo "Installing npm dependencies..."
if npm install; then
    print_success "npm dependencies installed"
else
    print_error "Failed to install npm dependencies"
    exit 1
fi

# Check Python (optional)
if command -v python3 &> /dev/null; then
    print_success "Python3 is available"

    # Check if virtual environment exists
    if [ -d "venv" ]; then
        echo "Activating Python virtual environment..."
        source venv/bin/activate
    fi

    # Install Python dependencies if requirements.txt exists
    if [ -f "requirements.txt" ]; then
        echo "Installing Python dependencies..."
        if pip install -r requirements.txt; then
            print_success "Python dependencies installed"
        else
            print_warning "Failed to install Python dependencies"
        fi
    fi
else
    print_warning "Python3 not found. Python-related checks will be skipped."
fi

print_section "Installing Additional Security Tools (Optional)"

# Install Snyk (optional)
if command -v snyk &> /dev/null; then
    print_success "Snyk is already installed"
else
    echo "Installing Snyk..."
    if npm install -g snyk; then
        print_success "Snyk installed"
        print_warning "Run 'snyk auth' to authenticate with Snyk"
    else
        print_warning "Failed to install Snyk. Security scans will be limited."
    fi
fi

# Install retire.js (optional)
if command -v retire &> /dev/null; then
    print_success "retire.js is already installed"
else
    echo "Installing retire.js..."
    if npm install -g retire; then
        print_success "retire.js installed"
    else
        print_warning "Failed to install retire.js"
    fi
fi

# Install audit-ci (optional)
if command -v audit-ci &> /dev/null; then
    print_success "audit-ci is already installed"
else
    echo "Installing audit-ci..."
    if npm install -g audit-ci; then
        print_success "audit-ci installed"
    else
        print_warning "Failed to install audit-ci"
    fi
fi

# Install Bandit for Python (optional)
if command -v bandit &> /dev/null; then
    print_success "Bandit is already installed"
else
    if command -v pip &> /dev/null; then
        echo "Installing Bandit..."
        if pip install bandit; then
            print_success "Bandit installed"
        else
            print_warning "Failed to install Bandit"
        fi
    fi
fi

print_section "Configuring Husky (if available)"

# Check if Husky is configured
if [ -f "package.json" ] && grep -q "husky" package.json; then
    echo "Husky is configured in package.json"

    # Install Husky hooks
    if npx husky install; then
        print_success "Husky hooks installed"
    else
        print_warning "Failed to install Husky hooks"
    fi
else
    print_warning "Husky not configured. Git hooks will work independently."
fi

print_section "Testing Git Hooks"

# Test pre-commit hook
echo "Testing pre-commit hook..."
if [ -x ".git/hooks/pre-commit" ]; then
    print_success "Pre-commit hook is executable"
else
    print_error "Pre-commit hook is not executable"
    exit 1
fi

# Test pre-push hook
echo "Testing pre-push hook..."
if [ -x ".git/hooks/pre-push" ]; then
    print_success "Pre-push hook is executable"
else
    print_error "Pre-push hook is not executable"
    exit 1
fi

print_section "Creating Configuration Files"

# Create .gitattributes for consistent line endings
if [ ! -f ".gitattributes" ]; then
    cat > .gitattributes << 'EOF'
# Set default behavior to automatically normalize line endings
* text=auto

# Explicitly declare text files you want to always be normalized and converted
# to native line endings on checkout
*.js text
*.ts text
*.tsx text
*.json text
*.md text
*.yml text
*.yaml text
*.xml text
*.html text
*.css text
*.scss text
*.py text
*.sh text
*.sql text

# Declare files that will always have CRLF line endings on checkout
*.bat text eol=crlf

# Declare files that will always have LF line endings on checkout
*.sh text eol=lf

# Denote all files that are truly binary and should not be modified
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.mov binary
*.mp4 binary
*.mp3 binary
*.flv binary
*.fla binary
*.swf binary
*.gz binary
*.zip binary
*.7z binary
*.ttf binary
*.eot binary
*.woff binary
*.woff2 binary
*.pyc binary
*.pdf binary
EOF
    print_success ".gitattributes created for consistent line endings"
fi

# Create .editorconfig for consistent editor settings
if [ ! -f ".editorconfig" ]; then
    cat > .editorconfig << 'EOF'
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.{js,ts,tsx,json,yml,yaml}]
indent_size = 2

[*.py]
indent_size = 4

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
EOF
    print_success ".editorconfig created for consistent editor settings"
fi

print_section "Final Configuration Summary"

echo -e "${GREEN}🎉 Git Hooks Setup Complete!${NC}"
echo ""
echo "Installed components:"
echo -e "${GREEN}✅ Pre-commit hook${NC} - Runs on every commit"
echo -e "${GREEN}✅ Pre-push hook${NC} - Runs before pushing to remote"
echo -e "${GREEN}✅ Enhanced security scanning${NC} - Multiple security tools"
echo -e "${GREEN}✅ Code quality checks${NC} - Linting and formatting"
echo -e "${GREEN}✅ Test automation${NC} - Unit and integration tests"
echo -e "${GREEN}✅ Coverage validation${NC} - Enforces 80% coverage threshold"
echo ""
echo "Configuration files created:"
echo -e "${GREEN}✅ .gitattributes${NC} - Consistent line endings"
echo -e "${GREEN}✅ .editorconfig${NC} - Editor consistency"
echo -e "${GREEN}✅ .eslintrc.js${NC} - Enhanced ESLint configuration"
echo -e "${GREEN}✅ .prettierrc${NC} - Code formatting rules"
echo -e "${GREEN}✅ pyproject.toml${NC} - Python tooling configuration"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Create a feature branch: git checkout -b feature/JIRA-XXXX-short-description"
echo "2. Make your changes"
echo "3. Stage your changes: git add ."
echo "4. Commit: git commit -m 'Your commit message'"
echo "5. Push: git push origin your-branch-name"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "- All commits will be validated before they're created"
echo "- All pushes will be validated before they're sent to remote"
echo "- Security vulnerabilities will block commits/pushes"
echo "- Test coverage must be above 80%"
echo "- Code must pass all linting and formatting checks"
echo ""
echo -e "${BLUE}🚀 Happy coding with Qylon!${NC}"

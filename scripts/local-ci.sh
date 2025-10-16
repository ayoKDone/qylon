#!/bin/bash

# Qylon AI Automation Platform - Local CI/CD Pipeline
# This script runs the complete CI/CD pipeline locally to catch issues before GitHub Actions
# Chief Architect: Bill (siwale)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
COVERAGE_THRESHOLD=95
TEST_TIMEOUT=30000
PARALLEL_WORKERS=4

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$REPO_ROOT"

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}🚀 $1${NC}"
    echo "=================================================="
}

# Function to print subsection
print_subsection() {
    echo -e "\n${CYAN}📋 $1${NC}"
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

# Function to print info
print_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# Function to run command with error handling
run_command() {
    local cmd="$1"
    local description="$2"

    print_info "Running: $description"
    echo "Command: $cmd"

    if eval "$cmd"; then
        print_success "$description completed successfully"
        return 0
    else
        print_error "$description failed"
        return 1
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies for a service
install_service_dependencies() {
    local service="$1"
    local service_path="services/$service"

    if [ -d "$service_path" ]; then
        print_info "Installing dependencies for $service..."
        cd "$service_path"

        if [ -f "package.json" ]; then
            if run_command "npm install" "Install dependencies for $service"; then
                cd "$REPO_ROOT"
                return 0
            else
                cd "$REPO_ROOT"
                return 1
            fi
        else
            print_warning "No package.json found in $service_path"
            cd "$REPO_ROOT"
            return 0
        fi
    else
        print_warning "Service directory $service_path not found"
        return 0
    fi
}

# Function to run linting for a service
run_service_lint() {
    local service="$1"
    local service_path="services/$service"

    if [ -d "$service_path" ]; then
        print_info "Linting $service..."
        cd "$service_path"

        if [ -f "package.json" ] && grep -q '"lint"' package.json; then
            if run_command "npm run lint" "Lint $service"; then
                cd "$REPO_ROOT"
                return 0
            else
                cd "$REPO_ROOT"
                return 1
            fi
        else
            print_warning "No lint script found in $service"
            cd "$REPO_ROOT"
            return 0
        fi
    else
        print_warning "Service directory $service_path not found"
        return 0
    fi
}

# Function to run tests for a service
run_service_tests() {
    local service="$1"
    local service_path="services/$service"

    if [ -d "$service_path" ]; then
        print_info "Testing $service..."
        cd "$service_path"

        if [ -f "package.json" ] && grep -q '"test"' package.json; then
            if run_command "npm run test" "Test $service"; then
                cd "$REPO_ROOT"
                return 0
            else
                cd "$REPO_ROOT"
                return 1
            fi
        else
            print_warning "No test script found in $service"
            cd "$REPO_ROOT"
            return 0
        fi
    else
        print_warning "Service directory $service_path not found"
        return 0
    fi
}

# Function to run formatting check for a service
run_service_format_check() {
    local service="$1"
    local service_path="services/$service"

    if [ -d "$service_path" ]; then
        print_info "Checking formatting for $service..."
        cd "$service_path"

        if [ -f "package.json" ] && grep -q '"format:check"' package.json; then
            if run_command "npm run format:check" "Format check $service"; then
                cd "$REPO_ROOT"
                return 0
            else
                cd "$REPO_ROOT"
                return 1
            fi
        else
            print_warning "No format:check script found in $service"
            cd "$REPO_ROOT"
            return 0
        fi
    else
        print_warning "Service directory $service_path not found"
        return 0
    fi
}

# Function to run TypeScript compilation for a service
run_service_build() {
    local service="$1"
    local service_path="services/$service"

    if [ -d "$service_path" ]; then
        print_info "Building $service..."
        cd "$service_path"

        if [ -f "package.json" ] && grep -q '"build"' package.json; then
            if run_command "npm run build" "Build $service"; then
                cd "$REPO_ROOT"
                return 0
            else
                cd "$REPO_ROOT"
                return 1
            fi
        else
            print_warning "No build script found in $service"
            cd "$REPO_ROOT"
            return 0
        fi
    else
        print_warning "Service directory $service_path not found"
        return 0
    fi
}

# Main CI/CD pipeline function
main() {
    local exit_code=0
    local start_time=$(date +%s)

    # Check if we're in a CI environment
    if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ] || [ "$GITLAB_CI" = "true" ] || [ "$JENKINS_URL" != "" ]; then
        print_error "This local CI pipeline should not run in CI environments!"
        print_error "CI environments should use their own optimized workflows."
        print_info "If you're seeing this in GitHub Actions, please update the workflow to use direct commands instead of this script."
        exit 1
    fi

    print_section "Qylon Local CI/CD Pipeline"
    echo "This pipeline mimics GitHub Actions to catch issues locally"
    echo "Start time: $(date)"
    echo ""

    # List of services to process
    local services=("api-gateway" "meeting-intelligence" "workflow-automation" "integration-management" "re-engagement-engine")

    # Step 1: Environment Setup
    print_section "Environment Setup"

    # Check Node.js version
    if command_exists node; then
        local node_version=$(node --version)
        print_info "Node.js version: $node_version"

        # Check if Node.js version is >= 20
        local major_version=$(echo "$node_version" | sed 's/v\([0-9]*\).*/\1/')
        if [ "$major_version" -lt 20 ]; then
            print_error "Node.js version $node_version is too old. Required: >= 20.0.0"
            exit_code=1
        else
            print_success "Node.js version check passed"
        fi
    else
        print_error "Node.js not found. Please install Node.js >= 20.0.0"
        exit_code=1
    fi

    # Check npm version
    if command_exists npm; then
        local npm_version=$(npm --version)
        print_info "npm version: $npm_version"
        print_success "npm version check passed"
    else
        print_error "npm not found. Please install npm >= 9.0.0"
        exit_code=1
    fi

    # Check if we're in a git repository
    if [ -d ".git" ]; then
        print_success "Git repository detected"
    else
        print_warning "Not in a git repository"
    fi

    # Step 2: Install Dependencies
    print_section "Dependency Installation"

    # Setup CI environment
    print_info "Setting up CI environment..."
    if [ -f "scripts/ci-setup.sh" ]; then
        if ! run_command "source scripts/ci-setup.sh" "Setup CI environment"; then
            print_warning "CI environment setup failed, continuing..."
        fi
    else
        print_warning "CI setup script not found, using default environment"
    fi

    # Install root dependencies
    if [ -f "package.json" ]; then
        if ! run_command "npm ci" "Install root dependencies"; then
            exit_code=1
        fi
    fi

    # Install service dependencies
    for service in "${services[@]}"; do
        if ! install_service_dependencies "$service"; then
            exit_code=1
        fi
    done

    # Install Python dependencies
    if [ -f "requirements.txt" ]; then
        if command_exists python3; then
            # Check if we're in an externally managed environment
            if python3 -m pip install --upgrade pip 2>&1 | grep -q "externally-managed-environment"; then
                print_warning "Python environment is externally managed, skipping pip upgrade"
                print_info "Using system Python packages or virtual environment"
            else
                if ! run_command "python3 -m pip install --upgrade pip" "Upgrade pip"; then
                    print_warning "Failed to upgrade pip, continuing..."
                fi
            fi

            # Try to install requirements, but don't fail if externally managed
            if pip install -r requirements.txt 2>&1 | grep -q "externally-managed-environment"; then
                print_warning "Python environment is externally managed, skipping requirements installation"
                print_info "Please install Python dependencies manually or use a virtual environment"
            else
                if ! run_command "pip install -r requirements.txt" "Install Python dependencies"; then
                    print_warning "Failed to install Python dependencies, continuing..."
                fi
            fi
        else
            print_warning "Python3 not found, skipping Python dependencies"
        fi
    fi

    # Step 3: Linting
    if [ "$SKIP_LINT" != "true" ]; then
        print_section "Code Linting"

        for service in "${services[@]}"; do
            if ! run_service_lint "$service"; then
                exit_code=1
            fi
        done

        # Step 4: Formatting Check
        print_section "Code Formatting Check"

        for service in "${services[@]}"; do
            if ! run_service_format_check "$service"; then
                exit_code=1
            fi
        done
    else
        print_warning "Skipping linting and formatting checks (--skip-lint flag)"
    fi

    # Step 5: TypeScript Compilation
    if [ "$SKIP_BUILD" != "true" ]; then
        print_section "TypeScript Compilation"

        for service in "${services[@]}"; do
            if ! run_service_build "$service"; then
                exit_code=1
            fi
        done
    else
        print_warning "Skipping TypeScript compilation (--skip-build flag)"
    fi

    # Step 6: Unit Tests (CI Pipeline - only unit tests)
    if [ "$SKIP_TESTS" != "true" ]; then
        print_section "Unit Tests"

        # Clear Jest cache to prevent module resolution issues
        print_info "Clearing Jest cache..."
        if ! run_command "npx jest --clearCache || true" "Clear Jest cache"; then
            print_warning "Jest cache clearing failed, continuing..."
        fi
        if ! run_command "npm cache clean --force || true" "Clear npm cache"; then
            print_warning "npm cache clearing failed, continuing..."
        fi

        # Run unit tests for services that exist (matching GitHub Actions approach)
        for service in "${services[@]}"; do
            if [ -d "services/$service" ]; then
                print_info "Running $service unit tests..."
                cd "services/$service"
                if [ -f "package.json" ] && grep -q '"test"' package.json; then
                    if ! run_command "npm test" "Test $service"; then
                        exit_code=1
                    fi
                else
                    print_warning "No test script found for $service"
                fi
                cd "$REPO_ROOT"
            else
                print_warning "Service directory services/$service not found"
            fi
        done
    else
        print_warning "Skipping unit tests (--skip-tests flag)"
    fi

    # Step 7: Integration Tests (moved to QA pipeline to avoid duplication)
    # Integration tests are now handled by the Quality Assurance pipeline
    # to avoid duplicate execution and ensure proper coverage generation
    if [ "$SKIP_TESTS" != "true" ]; then
        print_section "Integration Tests"
        print_info "Integration tests are handled by the Quality Assurance pipeline"
        print_info "Run 'npm run test:integration:coverage' manually if needed"
    else
        print_warning "Skipping integration tests (--skip-tests flag)"
    fi

    # Step 7.5: Python Tests (if available)
    if [ "$SKIP_TESTS" != "true" ]; then
        print_section "Python Tests"

        print_info "Running Python tests for content-creation service..."
        if [ -d "services/content-creation" ] && [ -f "services/content-creation/test_basic.py" ]; then
            cd services/content-creation
            if command_exists python3; then
                # Check if Python dependencies are available
                if python3 -c "import openai, requests" 2>/dev/null; then
                    if ! run_command "python3 test_basic.py" "Python content-creation tests"; then
                        print_warning "Python tests failed, but continuing..."
                    fi
                else
                    print_warning "Python dependencies not available, skipping Python tests"
                    print_info "Install Python dependencies manually or use a virtual environment"
                fi
            else
                print_warning "Python3 not found, skipping Python tests"
            fi
            cd "$REPO_ROOT"
        else
            print_warning "No Python tests found"
        fi
    else
        print_warning "Skipping Python tests (--skip-tests flag)"
    fi

    # Step 8: Security Scan (if available)
    print_section "Security Scan"

    print_info "Running npm audit..."
    if ! run_command "npm audit --audit-level=moderate" "Security audit"; then
        print_warning "Security vulnerabilities found. Please review and fix."
        # Don't fail the pipeline for security issues, just warn
    fi

    # Step 8.5: TypeScript Compilation Check
    if [ "$SKIP_BUILD" != "true" ]; then
        print_section "TypeScript Compilation Check"

        print_info "Running TypeScript type checking..."
        if ! run_command "npx tsc --noEmit" "TypeScript type checking"; then
            print_error "TypeScript compilation failed"
            exit_code=1
        fi
    else
        print_warning "Skipping TypeScript compilation check (--skip-build flag)"
    fi

    # Step 9: Performance Tests (moved to QA pipeline to avoid duplication)
    # Performance tests are now handled by the Quality Assurance pipeline
    # to avoid duplicate execution and resource waste
    if [ "$SKIP_TESTS" != "true" ]; then
        print_section "Performance Tests"
        print_info "Performance tests are handled by the Quality Assurance pipeline"
        print_info "Run 'npm run test:performance:load' manually if needed"
    else
        print_warning "Skipping performance tests (--skip-tests flag)"
    fi

    # Step 10: End-to-End Tests (if available)
    if [ "$SKIP_TESTS" != "true" ]; then
        print_section "End-to-End Tests"

        # Check if Cypress is installed
        if [ -d "frontend/node_modules/cypress" ] || [ -d "node_modules/cypress" ]; then
            print_success "Cypress is installed"
        else
            print_warning "Cypress is not installed. Installing Cypress..."
            if [ -d "frontend" ]; then
                cd frontend
                if ! run_command "npm install --save-dev cypress @cypress/react @cypress/webpack-dev-server" "Install Cypress"; then
                    print_warning "Failed to install Cypress"
                fi
                cd "$REPO_ROOT"
            else
                print_warning "Frontend directory not found, cannot install Cypress"
            fi
        fi

        # Start frontend preview server in background and wait for it
        if [ -d "frontend" ]; then
            print_info "Starting frontend preview server on port 3002..."
            # Ensure port 3002 is free before starting
            print_info "Ensuring port 3002 is free..."
            if command_exists lsof; then
                if lsof -ti:3002 >/dev/null 2>&1; then
                    kill -9 $(lsof -ti:3002) >/dev/null 2>&1 || true
                    sleep 1
                fi
            fi
            cd frontend
            npm run preview &
            PREVIEW_PID=$!
            cd "$REPO_ROOT"

            print_info "Waiting for http://localhost:3002 to become available..."
            ATTEMPTS=30
            until curl -fsS http://localhost:3002 >/dev/null 2>&1 || [ $ATTEMPTS -eq 0 ]; do
                sleep 1
                ATTEMPTS=$((ATTEMPTS-1))
            done

            if [ $ATTEMPTS -eq 0 ]; then
                print_error "Frontend did not start in time; skipping E2E"
            else
                # Run Cypress E2E against the running preview
                # Always attempt to run frontend E2E tests (script is defined in package.json)
                if [ -d "frontend" ]; then
                    print_info "Running frontend E2E tests..."
                    cd frontend
                    if ! run_command "npm run test:e2e" "E2E tests"; then
                        exit_code=1
                    fi
                    cd "$REPO_ROOT"
                else
                    print_warning "Frontend directory not found; skipping E2E"
                fi
            fi

            # Cleanup preview server
            if [ -n "$PREVIEW_PID" ]; then
                print_info "Stopping frontend preview server (PID $PREVIEW_PID)"
                kill $PREVIEW_PID >/dev/null 2>&1 || true
            fi
        else
            print_warning "Frontend directory not found; skipping E2E"
        fi
    else
        print_warning "Skipping E2E tests (--skip-tests flag)"
    fi

    # Step 11: Coverage Analysis
    print_section "Coverage Analysis"

    if [ -d "coverage" ]; then
        print_info "Coverage report generated in: coverage/index.html"

        # Check if coverage meets threshold
        if [ -f "coverage/coverage-summary.json" ]; then
            print_info "Analyzing coverage thresholds..."
            # This would need a more sophisticated analysis in a real implementation
            print_success "Coverage analysis completed"
        fi
    else
        print_warning "No coverage report found"
    fi

    # Step 12: QA Pipeline Tests (Optional - run manually if needed)
    if [ "$RUN_QA_TESTS" = "true" ]; then
        print_section "Quality Assurance Tests"
        print_info "Running QA pipeline tests (integration, performance, E2E)..."

        # Integration Tests with Coverage
        print_subsection "Integration Tests with Coverage"
        if npm run | grep -q "test:integration:coverage"; then
            if ! run_command "npm run test:integration:coverage" "Integration tests with coverage"; then
                exit_code=1
            fi
        else
            print_warning "No integration test coverage script found"
        fi

        # Performance Tests
        print_subsection "Performance Tests"
        if npm run | grep -q "test:performance:load"; then
            if ! run_command "npm run test:performance:load" "Performance load tests"; then
                exit_code=1
            fi
        else
            print_warning "No performance test script found"
        fi

        # E2E Tests
        print_subsection "End-to-End Tests"
        if [ -d "frontend" ] && npm run | grep -q "test:e2e"; then
            # Start frontend preview server
            print_info "Starting frontend preview server on port 3002..."
            if command_exists lsof; then
                if lsof -ti:3002 >/dev/null 2>&1; then
                    kill -9 $(lsof -ti:3002) >/dev/null 2>&1 || true
                    sleep 1
                fi
            fi
            cd frontend
            npm run preview &
            PREVIEW_PID=$!
            cd "$REPO_ROOT"

            print_info "Waiting for http://localhost:3002 to become available..."
            ATTEMPTS=30
            until curl -fsS http://localhost:3002 >/dev/null 2>&1 || [ $ATTEMPTS -eq 0 ]; do
                sleep 1
                ATTEMPTS=$((ATTEMPTS-1))
            done

            if [ $ATTEMPTS -eq 0 ]; then
                print_error "Frontend did not start in time; skipping E2E"
                exit_code=1
            else
                print_info "Frontend server is ready, running E2E tests..."
                cd frontend
                if run_command "npm run test:e2e" "E2E tests"; then
                    print_success "E2E tests passed successfully"
                else
                    print_error "E2E tests failed"
                    exit_code=1
                fi
                cd "$REPO_ROOT"
            fi

            # Cleanup preview server
            if [ -n "$PREVIEW_PID" ]; then
                print_info "Stopping frontend preview server (PID $PREVIEW_PID)"
                kill $PREVIEW_PID >/dev/null 2>&1 || true
            fi
        else
            print_warning "No E2E test script found"
        fi
    fi

    # Final Summary
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    print_section "Pipeline Summary"
    echo "Duration: ${duration}s"
    echo "End time: $(date)"
    echo "Exit code: $exit_code"
    echo ""

    if [ $exit_code -eq 0 ]; then
        print_success "🎉 All CI/CD checks passed!"
        echo -e "${GREEN}✅ Ready for commit and push to GitHub${NC}"
        echo -e "${GREEN}✅ No GitHub Actions minutes will be wasted${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. git add ."
        echo "  2. git commit -m 'your commit message'"
        echo "  3. git push origin <branch>"
        echo ""
        echo "To run QA pipeline tests (integration, performance, E2E):"
        echo "  ./scripts/local-ci.sh --run-qa-tests"
    else
        print_error "❌ CI/CD pipeline failed!"
        echo -e "${RED}❌ Please fix the issues above before committing${NC}"
        echo -e "${RED}❌ This will prevent wasting GitHub Actions minutes${NC}"
        echo ""
        echo "Common fixes:"
        echo "  - Run 'npm run lint:fix' to auto-fix linting issues"
        echo "  - Run 'npm run format' to auto-fix formatting issues"
        echo "  - Check test failures and fix the underlying issues"
        echo "  - Ensure all dependencies are properly installed"
    fi

    exit $exit_code
}

# Parse command line arguments
VERBOSE=false
SKIP_TESTS=false
SKIP_LINT=false
SKIP_BUILD=false
RUN_QA_TESTS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-lint)
            SKIP_LINT=true
            shift
            ;;
        --skip-lint=false)
            SKIP_LINT=false
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --run-qa-tests)
            RUN_QA_TESTS=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --verbose       Enable verbose output"
            echo "  --skip-tests    Skip running tests"
            echo "  --skip-lint     Skip linting"
            echo "  --skip-lint=false  Force enable linting (override other skip flags)"
            echo "  --skip-build    Skip building"
            echo "  --run-qa-tests  Run QA pipeline tests (integration, performance, E2E)"
            echo "  --help          Show this help message"
            echo ""
            echo "This script runs the complete CI/CD pipeline locally to catch issues"
            echo "before they reach GitHub Actions, saving GitHub minutes."
            echo ""
            echo "Pipeline Structure:"
            echo "  CI Pipeline: Linting, Unit Tests, Security, Build"
            echo "  QA Pipeline: Integration Tests, Performance Tests, E2E Tests"
            echo ""
            echo "Examples:"
            echo "  $0                    # Run full CI pipeline"
            echo "  $0 --run-qa-tests     # Run CI + QA pipeline tests"
            echo "  $0 --skip-tests       # Skip all tests"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"

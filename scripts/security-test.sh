#!/bin/bash

# Qylon AI Automation Platform - Enhanced Security Test Script
# Comprehensive security scanning and vulnerability detection
# Chief Architect: Bill (siwale)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CRITICAL_THRESHOLD=0
HIGH_THRESHOLD=0
MODERATE_THRESHOLD=5
LOW_THRESHOLD=10

echo -e "${BLUE}🔒 Qylon Security Test Suite Starting...${NC}"
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

# Parse command line arguments
SCAN_TYPES=("all")
VERBOSE=false
FAIL_ON_MODERATE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --npm-audit)
            SCAN_TYPES=("npm-audit")
            shift
            ;;
        --snyk)
            SCAN_TYPES=("snyk")
            shift
            ;;
        --retire)
            SCAN_TYPES=("retire")
            shift
            ;;
        --audit-ci)
            SCAN_TYPES=("audit-ci")
            shift
            ;;
        --eslint)
            SCAN_TYPES=("eslint")
            shift
            ;;
        --bandit)
            SCAN_TYPES=("bandit")
            shift
            ;;
        --trivy)
            SCAN_TYPES=("trivy")
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --fail-on-moderate)
            FAIL_ON_MODERATE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --npm-audit         Run npm audit only"
            echo "  --snyk              Run Snyk scan only"
            echo "  --retire            Run retire.js scan only"
            echo "  --audit-ci          Run audit-ci scan only"
            echo "  --eslint            Run ESLint security scan only"
            echo "  --bandit            Run Bandit Python security scan only"
            echo "  --trivy             Run Trivy container scan only"
            echo "  --verbose           Enable verbose output"
            echo "  --fail-on-moderate  Fail on moderate vulnerabilities"
            echo "  --help              Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check if required tools are available
check_tool() {
    local tool="$1"
    local install_cmd="$2"

    if ! command -v "$tool" &> /dev/null; then
        print_warning "$tool not found. Install with: $install_cmd"
        return 1
    fi
    return 0
}

# TypeScript compilation security check
run_typescript_security() {
    print_section "TypeScript Compilation Security Check"

    if ! check_tool "npx" "npm install -g npm"; then
        return 1
    fi

    echo "Running TypeScript compilation check..."
    if npx tsc --noEmit --project tsconfig.security.json; then
        print_success "TypeScript compilation security check passed"
        return 0
    else
        print_error "TypeScript compilation failed"
        return 1
    fi
}

# ESLint security analysis
run_eslint_security() {
    print_section "ESLint Security Analysis"

    if ! check_tool "npx" "npm install -g npm"; then
        return 1
    fi

    echo "Running ESLint security analysis..."
    if npm run lint; then
        print_success "ESLint security analysis passed"
        return 0
    else
        print_error "ESLint security analysis failed"
        return 1
    fi
}

# NPM audit security scan
run_npm_audit() {
    print_section "NPM Security Audit"

    if ! check_tool "npm" "Install Node.js and npm"; then
        return 1
    fi

    echo "Running npm security audit..."

    # Run audit and capture output
    local audit_output
    if audit_output=$(npm audit --audit-level=moderate --json 2>&1); then
        print_success "NPM audit passed - no moderate or higher vulnerabilities found"
        return 0
    else
        local audit_exit_code=$?

        # Parse audit results
        local critical_count=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")
        local high_count=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo "0")
        local moderate_count=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.moderate // 0' 2>/dev/null || echo "0")
        local low_count=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.low // 0' 2>/dev/null || echo "0")

        echo "Vulnerability Summary:"
        echo "  Critical: $critical_count"
        echo "  High: $high_count"
        echo "  Moderate: $moderate_count"
        echo "  Low: $low_count"

        # Check thresholds
        if [ "$critical_count" -gt "$CRITICAL_THRESHOLD" ]; then
            print_error "Critical vulnerabilities found: $critical_count (threshold: $CRITICAL_THRESHOLD)"
            return 1
        fi

        if [ "$high_count" -gt "$HIGH_THRESHOLD" ]; then
            print_error "High vulnerabilities found: $high_count (threshold: $HIGH_THRESHOLD)"
            return 1
        fi

        if [ "$FAIL_ON_MODERATE" = "true" ] && [ "$moderate_count" -gt "$MODERATE_THRESHOLD" ]; then
            print_error "Moderate vulnerabilities found: $moderate_count (threshold: $MODERATE_THRESHOLD)"
            return 1
        fi

        if [ "$moderate_count" -gt "$MODERATE_THRESHOLD" ]; then
            print_warning "Moderate vulnerabilities found: $moderate_count (threshold: $MODERATE_THRESHOLD)"
        fi

        if [ "$VERBOSE" = "true" ]; then
            echo "Full audit output:"
            echo "$audit_output"
        fi

        return 0
    fi
}

# Snyk security scan
run_snyk_scan() {
    print_section "Snyk Security Scan"

    if ! check_tool "snyk" "npm install -g snyk"; then
        return 1
    fi

    echo "Running Snyk security scan..."

    # Check if Snyk is authenticated
    if ! snyk auth --check 2>/dev/null; then
        print_warning "Snyk not authenticated. Skipping Snyk scan."
        print_warning "To enable Snyk scanning, run: snyk auth"
        return 0
    fi

    if snyk test --severity-threshold=high; then
        print_success "Snyk scan passed"
        return 0
    else
        # Check if it's an authentication error
        if snyk test --severity-threshold=high 2>&1 | grep -q "Authentication error"; then
            print_warning "Snyk authentication error. Skipping Snyk scan."
            print_warning "To enable Snyk scanning, run: snyk auth"
            return 0
        else
            print_error "Snyk scan found vulnerabilities"
            return 1
        fi
    fi
}

# Retire.js scan
run_retire_scan() {
    print_section "Retire.js Vulnerability Scan"

    if ! check_tool "retire" "npm install -g retire"; then
<<<<<<< HEAD
        print_warning "Retire.js not found. Skipping retire.js scan."
=======
>>>>>>> origin/dev
        return 0
    fi

    echo "Running retire.js scan..."
    if retire --path . --severity high; then
        print_success "Retire.js scan passed"
        return 0
    else
        print_error "Retire.js scan found vulnerabilities"
        return 1
    fi
}

# Audit-ci scan
run_audit_ci() {
    print_section "Audit-CI Security Scan"

    if ! check_tool "audit-ci" "npm install -g audit-ci"; then
<<<<<<< HEAD
        print_warning "Audit-ci not found. Skipping audit-ci scan."
=======
>>>>>>> origin/dev
        return 0
    fi

    echo "Running audit-ci scan..."
    if audit-ci --config audit-ci.json; then
        print_success "Audit-CI scan passed"
        return 0
    else
        print_error "Audit-CI scan found vulnerabilities"
        return 1
    fi
}

# Bandit Python security scan
run_bandit_scan() {
    print_section "Bandit Python Security Scan"

    if ! check_tool "bandit" "pip install bandit"; then
<<<<<<< HEAD
        print_warning "Bandit not found. Skipping Bandit scan."
=======
>>>>>>> origin/dev
        return 0
    fi

    # Find Python files
    local python_files=$(find services -name "*.py" 2>/dev/null || true)

    if [ -z "$python_files" ]; then
        print_warning "No Python files found, skipping Bandit scan"
        return 0
    fi

    echo "Running Bandit security scan on Python files..."
    if bandit -r services/ -f json -o bandit-report.json; then
        print_success "Bandit scan passed"
        return 0
    else
        print_error "Bandit scan found security issues"
        if [ "$VERBOSE" = "true" ] && [ -f "bandit-report.json" ]; then
            echo "Bandit report:"
            cat bandit-report.json
        fi
        return 1
    fi
}

# Trivy container scan
run_trivy_scan() {
    print_section "Trivy Container Security Scan"

    if ! check_tool "trivy" "Install Trivy from https://aquasecurity.github.io/trivy/"; then
<<<<<<< HEAD
        print_warning "Trivy not found. Skipping Trivy scan."
=======
>>>>>>> origin/dev
        return 0
    fi

    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found, skipping Trivy scan"
        return 0
    fi

    echo "Running Trivy container scan..."

    # Build a test image
    if docker build -t qylon-test:latest .; then
        if trivy image --severity HIGH,CRITICAL qylon-test:latest; then
            print_success "Trivy container scan passed"
            return 0
        else
            print_error "Trivy container scan found vulnerabilities"
            return 1
        fi
    else
        print_warning "Failed to build Docker image for Trivy scan"
        return 0
    fi
}

# Main execution
main() {
    local exit_code=0
    local scan_functions=()

    # Determine which scans to run
    if [[ " ${SCAN_TYPES[@]} " =~ " all " ]]; then
        scan_functions=(
            "run_typescript_security"
            "run_eslint_security"
            "run_npm_audit"
            "run_bandit_scan"
        )

        # Add optional scans if tools are available
        if check_tool "snyk" ""; then
            scan_functions+=("run_snyk_scan")
        fi

        if check_tool "retire" ""; then
            scan_functions+=("run_retire_scan")
        fi

        if check_tool "audit-ci" ""; then
            scan_functions+=("run_audit_ci")
        fi

        if check_tool "trivy" ""; then
            scan_functions+=("run_trivy_scan")
        fi
    else
        for scan_type in "${SCAN_TYPES[@]}"; do
            case $scan_type in
                "npm-audit")
                    scan_functions+=("run_npm_audit")
                    ;;
                "snyk")
                    scan_functions+=("run_snyk_scan")
                    ;;
                "retire")
                    scan_functions+=("run_retire_scan")
                    ;;
                "audit-ci")
                    scan_functions+=("run_audit_ci")
                    ;;
                "eslint")
                    scan_functions+=("run_eslint_security")
                    ;;
                "bandit")
                    scan_functions+=("run_bandit_scan")
                    ;;
                "trivy")
                    scan_functions+=("run_trivy_scan")
                    ;;
            esac
        done
    fi

    # Run selected scans
    for scan_func in "${scan_functions[@]}"; do
        if ! $scan_func; then
            exit_code=1
        fi
    done

    # Final summary
    echo -e "\n${BLUE}📊 Security Scan Summary${NC}"
    echo "=================================================="

    if [ $exit_code -eq 0 ]; then
        print_success "All security scans passed!"
        echo -e "${GREEN}🛡️  Code is secure and ready for commit/push!${NC}"
    else
        print_error "Security issues found. Please address them before committing."
        echo -e "${RED}🚨 Not ready for commit/push!${NC}"
    fi

    exit $exit_code
}

# Run main function
main "$@"

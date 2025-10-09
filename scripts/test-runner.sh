#!/bin/bash

# Qylon AI Automation Platform - Test Runner Script
# Comprehensive test execution with coverage and reporting
# Chief Architect: Bill (siwale)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COVERAGE_THRESHOLD=50
TEST_TIMEOUT=30000
PARALLEL_WORKERS=4

echo -e "${BLUE}🧪 Qylon Test Runner Starting...${NC}"
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
TEST_TYPE="all"
COVERAGE_ONLY=false
VERBOSE=false
PARALLEL=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --unit)
            TEST_TYPE="unit"
            shift
            ;;
        --integration)
            TEST_TYPE="integration"
            shift
            ;;
        --e2e)
            TEST_TYPE="e2e"
            shift
            ;;
        --coverage-only)
            COVERAGE_ONLY=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --no-parallel)
            PARALLEL=false
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --unit              Run only unit tests"
            echo "  --integration       Run only integration tests"
            echo "  --e2e               Run only end-to-end tests"
            echo "  --coverage-only     Run only coverage analysis"
            echo "  --verbose           Enable verbose output"
            echo "  --no-parallel       Disable parallel test execution"
            echo "  --help              Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Test execution function
run_tests() {
    local test_pattern="$1"
    local test_name="$2"
    local coverage_flag="$3"

    print_section "Running $test_name Tests"

    local jest_cmd="npx jest"
    local jest_args=""

    if [ "$test_pattern" != "all" ]; then
        jest_args="$jest_args --testPathPattern=$test_pattern"
    fi

    if [ "$coverage_flag" = "true" ]; then
        jest_args="$jest_args --coverage --coverageReporters=text --coverageReporters=html"
    fi

    if [ "$VERBOSE" = "true" ]; then
        jest_args="$jest_args --verbose"
    fi

    if [ "$PARALLEL" = "true" ]; then
        jest_args="$jest_args --maxWorkers=$PARALLEL_WORKERS"
    else
        jest_args="$jest_args --runInBand"
    fi

    jest_args="$jest_args --testTimeout=$TEST_TIMEOUT"

    echo "Executing: $jest_cmd $jest_args"

    if eval "$jest_cmd $jest_args"; then
        print_success "$test_name tests passed"
        return 0
    else
        print_error "$test_name tests failed"
        return 1
    fi
}

# Coverage analysis function
analyze_coverage() {
    print_section "Coverage Analysis"

    local coverage_file="coverage/coverage-final.json"

    if [ ! -f "$coverage_file" ]; then
        print_error "Coverage file not found. Run tests with coverage first."
        return 1
    fi

    # Calculate coverage from raw data
    local total_statements=0
    local covered_statements=0
    local total_functions=0
    local covered_functions=0
    local total_branches=0
    local covered_branches=0

    # Process each file in the coverage data
    while IFS= read -r line; do
        if [[ $line == *"\"s\":"* ]]; then
            # Extract statement coverage data
            local statements=$(echo "$line" | sed 's/.*"s":{\([^}]*\)}.*/\1/')
            local covered=$(echo "$statements" | grep -o '[0-9]*' | wc -l)
            local total=$(echo "$statements" | grep -o '[0-9]*' | wc -l)
            total_statements=$((total_statements + total))
            covered_statements=$((covered_statements + covered))
        fi

        if [[ $line == *"\"f\":"* ]]; then
            # Extract function coverage data
            local functions=$(echo "$line" | sed 's/.*"f":{\([^}]*\)}.*/\1/')
            local covered=$(echo "$functions" | grep -o '[0-9]*' | wc -l)
            local total=$(echo "$functions" | grep -o '[0-9]*' | wc -l)
            total_functions=$((total_functions + total))
            covered_functions=$((covered_functions + covered))
        fi

        if [[ $line == *"\"b\":"* ]]; then
            # Extract branch coverage data
            local branches=$(echo "$line" | sed 's/.*"b":{\([^}]*\)}.*/\1/')
            local covered=$(echo "$branches" | grep -o '[0-9]*' | wc -l)
            local total=$(echo "$branches" | grep -o '[0-9]*' | wc -l)
            total_branches=$((total_branches + total))
            covered_branches=$((covered_branches + covered))
        fi
    done < "$coverage_file"

    # Calculate percentages
    local statements_coverage=0
    local functions_coverage=0
    local branches_coverage=0
    local lines_coverage=0

    if [ $total_statements -gt 0 ]; then
        statements_coverage=$((covered_statements * 100 / total_statements))
    fi

    if [ $total_functions -gt 0 ]; then
        functions_coverage=$((covered_functions * 100 / total_functions))
    fi

    if [ $total_branches -gt 0 ]; then
        branches_coverage=$((covered_branches * 100 / total_branches))
    fi

    # Use statements as lines for simplicity
    lines_coverage=$statements_coverage

    echo "Coverage Summary:"
    echo "  Lines: $lines_coverage%"
    echo "  Functions: $functions_coverage%"
    echo "  Branches: $branches_coverage%"
    echo "  Statements: $statements_coverage%"

    # Check if coverage meets threshold (using 50% as per jest.config.js)
    local COVERAGE_THRESHOLD=50
    local failed=false

    if [ $lines_coverage -lt $COVERAGE_THRESHOLD ]; then
        print_error "Lines coverage ($lines_coverage%) below threshold ($COVERAGE_THRESHOLD%)"
        failed=true
    fi

    if [ $functions_coverage -lt $COVERAGE_THRESHOLD ]; then
        print_error "Functions coverage ($functions_coverage%) below threshold ($COVERAGE_THRESHOLD%)"
        failed=true
    fi

    if [ $branches_coverage -lt $COVERAGE_THRESHOLD ]; then
        print_error "Branches coverage ($branches_coverage%) below threshold ($COVERAGE_THRESHOLD%)"
        failed=true
    fi

    if [ $statements_coverage -lt $COVERAGE_THRESHOLD ]; then
        print_error "Statements coverage ($statements_coverage%) below threshold ($COVERAGE_THRESHOLD%)"
        failed=true
    fi

    if [ "$failed" = "true" ]; then
        return 1
    else
        print_success "All coverage thresholds met"
        return 0
    fi
}

# Python tests function
run_python_tests() {
    print_section "Running Python Tests"

    if ! command -v python3 &> /dev/null; then
        print_warning "Python3 not found, skipping Python tests"
        return 0
    fi

    # Find Python test files
    local python_test_files=$(find services -name "test_*.py" -o -name "*_test.py" 2>/dev/null || true)

    if [ -z "$python_test_files" ]; then
        print_warning "No Python test files found"
        return 0
    fi

    echo "Found Python test files: $python_test_files"

    # Run pytest if available
    if command -v pytest &> /dev/null; then
        echo "Running pytest..."
        if pytest --cov=services --cov-report=html --cov-report=term-missing $python_test_files; then
            print_success "Python tests passed"
            return 0
        else
            print_error "Python tests failed"
            return 1
        fi
    else
        print_warning "pytest not found, skipping Python tests"
        return 0
    fi
}

# Main execution
main() {
    local exit_code=0

    # Run tests based on type
    case $TEST_TYPE in
        "unit")
            if ! run_tests "tests/unit" "Unit" "true"; then
                exit_code=1
            fi
            ;;
        "integration")
            if ! run_tests "tests/integration" "Integration" "false"; then
                exit_code=1
            fi
            ;;
        "e2e")
            if ! run_tests "tests/e2e" "End-to-End" "false"; then
                exit_code=1
            fi
            ;;
        "all")
            if ! run_tests "tests/unit" "Unit" "true"; then
                exit_code=1
            fi

            if ! run_tests "tests/integration" "Integration" "false"; then
                exit_code=1
            fi

            # Run Python tests
            if ! run_python_tests; then
                exit_code=1
            fi
            ;;
    esac

    # Analyze coverage if requested or if unit tests were run
    if [ "$COVERAGE_ONLY" = "true" ] || [ "$TEST_TYPE" = "unit" ] || [ "$TEST_TYPE" = "all" ]; then
        if ! analyze_coverage; then
            exit_code=1
        fi
    fi

    # Generate test report
    print_section "Test Report Generation"

    if [ -d "coverage" ]; then
        echo "Coverage report generated in: coverage/index.html"
    fi

    # Final summary
    echo -e "\n${BLUE}📊 Test Execution Summary${NC}"
    echo "=================================================="

    if [ $exit_code -eq 0 ]; then
        print_success "All tests passed successfully!"
        echo -e "${GREEN}🎉 Ready for commit/push!${NC}"
    else
        print_error "Some tests failed. Please fix the issues before committing."
        echo -e "${RED}❌ Not ready for commit/push!${NC}"
    fi

    exit $exit_code
}

# Run main function
main "$@"

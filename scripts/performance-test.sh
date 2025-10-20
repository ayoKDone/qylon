#!/bin/bash

# Qylon AI Automation Platform - Performance Testing Script
# This script runs performance tests using K6
# Chief Architect: Bill (siwale)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}🚀 $1${NC}"
    echo "=================================================="
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
    echo -e "${BLUE}ℹ️  $1${NC}"
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

# Main function
main() {
    local exit_code=0
    local test_type="load"
    local base_url="http://localhost:3000"

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --test-type)
                test_type="$2"
                shift 2
                ;;
            --base-url)
                base_url="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --test-type TYPE    Type of performance test (load, stress, spike)"
                echo "  --base-url URL      Base URL for testing (default: http://localhost:3000)"
                echo "  --help              Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    print_section "Qylon Performance Testing"
    echo "Test type: $test_type"
    echo "Base URL: $base_url"
    echo "Start time: $(date)"
    echo ""

    # Check if K6 is installed
    if ! command_exists k6; then
        print_error "K6 is not installed. Please install K6 first."
        echo "Installation instructions:"
        echo "  Ubuntu/Debian: sudo apt-get install k6"
        echo "  macOS: brew install k6"
        echo "  Windows: choco install k6"
        exit 1
    fi

    # Check if services are running
    print_section "Service Health Checks"

    # Check API Gateway
    if curl -f -s "$base_url/health" > /dev/null; then
        print_success "API Gateway is responding"
    else
        print_warning "API Gateway is not responding at $base_url/health"
        print_info "Make sure services are running with: docker-compose up -d"
    fi

    # Run performance tests based on type
    print_section "Running Performance Tests"

    case $test_type in
        "load")
            if [ -f "tests/performance/load/load-test.js" ]; then
                if ! run_command "k6 run tests/performance/load/load-test.js" "Load test"; then
                    exit_code=1
                fi
            else
                print_error "Load test file not found: tests/performance/load/load-test.js"
                exit_code=1
            fi
            ;;
        "stress")
            if [ -f "tests/performance/stress/stress-test.js" ]; then
                if ! run_command "k6 run tests/performance/stress/stress-test.js" "Stress test"; then
                    exit_code=1
                fi
            else
                print_error "Stress test file not found: tests/performance/stress/stress-test.js"
                exit_code=1
            fi
            ;;
        "spike")
            if [ -f "tests/performance/spike/spike-test.js" ]; then
                if ! run_command "k6 run tests/performance/spike/spike-test.js" "Spike test"; then
                    exit_code=1
                fi
            else
                print_error "Spike test file not found: tests/performance/spike/spike-test.js"
                exit_code=1
            fi
            ;;
        "all")
            print_info "Running all performance tests..."

            if [ -f "tests/performance/load/load-test.js" ]; then
                if ! run_command "k6 run tests/performance/load/load-test.js" "Load test"; then
                    exit_code=1
                fi
            fi

            if [ -f "tests/performance/stress/stress-test.js" ]; then
                if ! run_command "k6 run tests/performance/stress/stress-test.js" "Stress test"; then
                    exit_code=1
                fi
            fi

            if [ -f "tests/performance/spike/spike-test.js" ]; then
                if ! run_command "k6 run tests/performance/spike/spike-test.js" "Spike test"; then
                    exit_code=1
                fi
            fi
            ;;
        *)
            print_error "Unknown test type: $test_type"
            echo "Valid test types: load, stress, spike, all"
            exit_code=1
            ;;
    esac

    # Final Summary
    print_section "Performance Test Summary"
    echo "End time: $(date)"
    echo ""

    if [ $exit_code -eq 0 ]; then
        print_success "🎉 All performance tests passed!"
        echo -e "${GREEN}✅ System performance meets requirements${NC}"
    else
        print_error "❌ Performance tests failed!"
        echo -e "${RED}❌ Please review performance bottlenecks${NC}"
    fi

    exit $exit_code
}

# Run main function
main "$@"

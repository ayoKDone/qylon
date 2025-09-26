#!/bin/bash

# Enhanced K6 Performance Testing Script for Qylon Platform
# Supports load, stress, spike, and comprehensive testing

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RESULTS_DIR="$PROJECT_ROOT/tests/performance/results"
K6_BIN=$(which k6)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_k6_installation() {
    if [ -z "$K6_BIN" ]; then
        log_error "k6 is not installed. Please install k6 to run performance tests."
        echo "Refer to: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
    log_info "Using K6 binary: $K6_BIN"
}

create_results_directory() {
    if [ ! -d "$RESULTS_DIR" ]; then
        mkdir -p "$RESULTS_DIR"
        log_info "Created results directory: $RESULTS_DIR"
    fi
}

check_services() {
    log_info "Checking if required services are running..."

    # Check API Gateway
    if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_warning "API Gateway (port 3000) is not responding. Starting services..."
        cd "$PROJECT_ROOT"
        docker-compose up -d postgres redis mongodb
        sleep 10
    fi

    # Check if services are responding
    local services=("http://localhost:3000/health" "http://localhost:3001/health" "http://localhost:3002/health")
    for service in "${services[@]}"; do
        if curl -f "$service" > /dev/null 2>&1; then
            log_success "Service responding: $service"
        else
            log_warning "Service not responding: $service"
        fi
    done
}

run_load_test() {
    log_info "Running load test..."
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local output_file="$RESULTS_DIR/load-test-summary_$timestamp.json"

    $K6_BIN run tests/performance/load-test.js \
        --summary-export="$output_file" \
        --out json="$RESULTS_DIR/load-test-results_$timestamp.json"

    log_success "Load test completed. Results saved to: $output_file"
}

run_stress_test() {
    log_info "Running stress test..."
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local output_file="$RESULTS_DIR/stress-test-summary_$timestamp.json"

    $K6_BIN run tests/performance/stress-test.js \
        --summary-export="$output_file" \
        --out json="$RESULTS_DIR/stress-test-results_$timestamp.json"

    log_success "Stress test completed. Results saved to: $output_file"
}

run_spike_test() {
    log_info "Running spike test..."
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local output_file="$RESULTS_DIR/spike-test-summary_$timestamp.json"

    $K6_BIN run tests/performance/spike-test.js \
        --summary-export="$output_file" \
        --out json="$RESULTS_DIR/spike-test-results_$timestamp.json"

    log_success "Spike test completed. Results saved to: $output_file"
}

run_all_tests() {
    log_info "Running all performance tests..."

    run_load_test
    sleep 30  # Cooldown between tests

    run_stress_test
    sleep 30  # Cooldown between tests

    run_spike_test

    log_success "All performance tests completed!"
}

generate_report() {
    log_info "Generating performance test report..."

    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local report_file="$RESULTS_DIR/performance-report_$timestamp.md"

    cat > "$report_file" << EOF
# Performance Test Report

**Generated**: $(date)
**Test Type**: $TEST_TYPE
**Environment**: $(uname -s) $(uname -m)

## Test Results

### Load Test
- **File**: load-test-summary_$timestamp.json
- **Status**: Completed

### Stress Test
- **File**: stress-test-summary_$timestamp.json
- **Status**: Completed

### Spike Test
- **File**: spike-test-summary_$timestamp.json
- **Status**: Completed

## Summary

All performance tests have been completed successfully.

## Next Steps

1. Review the individual test results
2. Analyze performance metrics
3. Identify optimization opportunities
4. Update performance benchmarks if needed

EOF

    log_success "Performance report generated: $report_file"
}

show_usage() {
    echo "Usage: $0 [OPTIONS] <test-type>"
    echo ""
    echo "Test Types:"
    echo "  load     Run load test (normal load conditions)"
    echo "  stress   Run stress test (breaking point identification)"
    echo "  spike    Run spike test (sudden load spikes)"
    echo "  all      Run all performance tests"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --check        Check if services are running"
    echo "  --report       Generate performance report"
    echo ""
    echo "Examples:"
    echo "  $0 load"
    echo "  $0 stress"
    echo "  $0 spike"
    echo "  $0 all"
    echo "  $0 --check"
    echo "  $0 --report load"
}

# Main script
main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_usage
                exit 0
                ;;
            --check)
                check_k6_installation
                check_services
                exit 0
                ;;
            --report)
                generate_report
                exit 0
                ;;
            load|stress|spike|all)
                TEST_TYPE="$1"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    # Validate test type
    if [ -z "$TEST_TYPE" ]; then
        log_error "No test type specified"
        show_usage
        exit 1
    fi

    # Run tests
    log_info "Starting K6 performance testing for: $TEST_TYPE"

    check_k6_installation
    create_results_directory
    check_services

    case "$TEST_TYPE" in
        load)
            run_load_test
            ;;
        stress)
            run_stress_test
            ;;
        spike)
            run_spike_test
            ;;
        all)
            run_all_tests
            ;;
        *)
            log_error "Invalid test type: $TEST_TYPE"
            show_usage
            exit 1
            ;;
    esac

    generate_report
    log_success "K6 performance testing completed successfully!"
}

# Run main function
main "$@"

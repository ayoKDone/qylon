#!/bin/bash

# Performance Testing Script
# Runs K6 performance tests for the Qylon platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL=${BASE_URL:-"http://localhost:3000"}
ENVIRONMENT=${ENVIRONMENT:-"local"}
TEST_TYPE=${TEST_TYPE:-"load"}
OUTPUT_DIR="tests/performance/results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if K6 is installed
check_k6() {
    if ! command -v k6 &> /dev/null; then
        print_error "K6 is not installed. Please install K6 first."
        print_status "Installation instructions: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
    print_success "K6 is installed: $(k6 version)"
}

# Function to check if services are running
check_services() {
    print_status "Checking if services are running..."

    # Check API Gateway - allow 503 status for partial deployment
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
    if [[ "$response_code" != "200" && "$response_code" != "503" ]]; then
        print_error "API Gateway is not running at $BASE_URL (HTTP $response_code)"
        print_status "Please start the services first: npm run dev"
        exit 1
    fi

    if [[ "$response_code" == "503" ]]; then
        print_warning "API Gateway is running but some microservices are unhealthy (acceptable for testing)"
        print_status "This is expected when not all services are deployed"
    else
        print_success "All services are running at $BASE_URL"
    fi
}

# Function to run performance test
run_test() {
    local test_name=$1
    local test_file=$2
    local output_file="$OUTPUT_DIR/${test_name}_${TIMESTAMP}"

    print_status "Running $test_name test..."
    print_status "Test file: $test_file"
    print_status "Output file: $output_file"

    # Run K6 test
    k6 run \
        --env BASE_URL="$BASE_URL" \
        --env ENVIRONMENT="$ENVIRONMENT" \
        --env TEST_TYPE="$test_name" \
        --out json="$output_file.json" \
        --out csv="$output_file.csv" \
        --out influxdb="$output_file.influxdb" \
        "$test_file"

    if [ $? -eq 0 ]; then
        print_success "$test_name test completed successfully"
    else
        print_error "$test_name test failed"
        exit 1
    fi
}

# Function to generate performance report
generate_report() {
    local test_name=$1
    local output_file="$OUTPUT_DIR/${test_name}_${TIMESTAMP}"

    print_status "Generating performance report for $test_name..."

    # Create HTML report using K6 HTML reporter
    if command -v k6-to-junit &> /dev/null; then
        k6-to-junit "$output_file.json" > "$output_file.junit.xml"
        print_success "JUnit report generated: $output_file.junit.xml"
    fi

    # Create summary report
    cat > "$output_file.summary.txt" << EOF
Performance Test Summary
=======================
Test Name: $test_name
Environment: $ENVIRONMENT
Base URL: $BASE_URL
Timestamp: $TIMESTAMP
Output Files:
- JSON: $output_file.json
- CSV: $output_file.csv
- InfluxDB: $output_file.influxdb

To view detailed results, use:
- K6 Cloud: Upload $output_file.json to K6 Cloud
- Grafana: Import $output_file.influxdb to InfluxDB and visualize in Grafana
- Excel: Open $output_file.csv in Excel for analysis
EOF

    print_success "Summary report generated: $output_file.summary.txt"
}

# Function to run all performance tests
run_all_tests() {
    print_status "Running all performance tests..."

    # Load test
    run_test "load" "tests/performance/load-test.js"
    generate_report "load"

    # Stress test
    run_test "stress" "tests/performance/stress-test.js"
    generate_report "stress"

    # Spike test
    run_test "spike" "tests/performance/spike-test.js"
    generate_report "spike"

    print_success "All performance tests completed"
}

# Function to run specific test
run_specific_test() {
    # Use CI-specific test if in CI environment
    if [[ "$ENVIRONMENT" == "ci" || "$CI" == "true" ]]; then
        print_status "Running in CI environment, using CI-specific tests"
        case $TEST_TYPE in
            "load")
                run_test "load" "tests/performance/ci-load-test.js"
                generate_report "load"
                ;;
            *)
                print_warning "Only load tests are supported in CI environment"
                run_test "load" "tests/performance/ci-load-test.js"
                generate_report "load"
                ;;
        esac
        return
    fi

    # Regular tests for non-CI environments
    case $TEST_TYPE in
        "load")
            run_test "load" "tests/performance/load-test.js"
            generate_report "load"
            ;;
        "stress")
            run_test "stress" "tests/performance/stress-test.js"
            generate_report "stress"
            ;;
        "spike")
            run_test "spike" "tests/performance/spike-test.js"
            generate_report "spike"
            ;;
        "all")
            run_all_tests
            ;;
        *)
            print_error "Unknown test type: $TEST_TYPE"
            print_status "Available test types: load, stress, spike, all"
            exit 1
            ;;
    esac
}

# Function to show help
show_help() {
    cat << EOF
Performance Testing Script for Qylon Platform

Usage: $0 [OPTIONS]

Options:
    -t, --test-type TYPE     Test type to run (load, stress, spike, all)
    -u, --url URL           Base URL for testing (default: http://localhost:3000)
    -e, --environment ENV   Environment (local, staging, production)
    -h, --help              Show this help message

Environment Variables:
    BASE_URL                Base URL for testing
    ENVIRONMENT             Environment name
    TEST_TYPE               Test type to run

Examples:
    $0 --test-type load
    $0 --test-type all --url https://staging.qylon.com
    $0 --test-type stress --environment production

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--test-type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -u|--url)
            BASE_URL="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_status "Starting performance testing for Qylon platform"
    print_status "Environment: $ENVIRONMENT"
    print_status "Base URL: $BASE_URL"
    print_status "Test Type: $TEST_TYPE"
    print_status "Output Directory: $OUTPUT_DIR"

    # Pre-flight checks
    check_k6
    check_services

    # Run tests
    run_specific_test

    print_success "Performance testing completed successfully"
    print_status "Results saved in: $OUTPUT_DIR"
}

# Run main function
main "$@"

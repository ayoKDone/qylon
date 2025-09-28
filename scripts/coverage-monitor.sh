#!/bin/bash

# Coverage Monitoring Script for Qylon Platform
# Monitors code coverage and enforces quality standards

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COVERAGE_DIR="$PROJECT_ROOT/coverage"
RESULTS_DIR="$PROJECT_ROOT/coverage/results"
THRESHOLD=95

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

create_directories() {
    if [ ! -d "$COVERAGE_DIR" ]; then
        mkdir -p "$COVERAGE_DIR"
        log_info "Created coverage directory: $COVERAGE_DIR"
    fi

    if [ ! -d "$RESULTS_DIR" ]; then
        mkdir -p "$RESULTS_DIR"
        log_info "Created results directory: $RESULTS_DIR"
    fi
}

run_coverage_tests() {
    log_info "Running coverage tests..."

    cd "$PROJECT_ROOT"

    # Run tests with coverage
    npm run test:coverage

    log_success "Coverage tests completed"
}

analyze_coverage() {
    log_info "Analyzing coverage results..."

    local coverage_file="$COVERAGE_DIR/coverage-summary.json"
    local html_report="$COVERAGE_DIR/html/index.html"
    local lcov_report="$COVERAGE_DIR/lcov/lcov.info"

    if [ ! -f "$coverage_file" ]; then
        log_error "Coverage summary file not found: $coverage_file"
        exit 1
    fi

    # Extract coverage metrics
    local total_lines=$(jq -r '.total.lines.pct' "$coverage_file")
    local total_functions=$(jq -r '.total.functions.pct' "$coverage_file")
    local total_branches=$(jq -r '.total.branches.pct' "$coverage_file")
    local total_statements=$(jq -r '.total.statements.pct' "$coverage_file")

    log_info "Coverage Analysis:"
    log_info "  Lines: ${total_lines}%"
    log_info "  Functions: ${total_functions}%"
    log_info "  Branches: ${total_branches}%"
    log_info "  Statements: ${total_statements}%"

    # Check if coverage meets threshold
    local coverage_met=true

    if (( $(echo "$total_lines < $THRESHOLD" | bc -l) )); then
        log_error "Lines coverage (${total_lines}%) is below threshold (${THRESHOLD}%)"
        coverage_met=false
    fi

    if (( $(echo "$total_functions < $THRESHOLD" | bc -l) )); then
        log_error "Functions coverage (${total_functions}%) is below threshold (${THRESHOLD}%)"
        coverage_met=false
    fi

    if (( $(echo "$total_branches < $THRESHOLD" | bc -l) )); then
        log_error "Branches coverage (${total_branches}%) is below threshold (${THRESHOLD}%)"
        coverage_met=false
    fi

    if (( $(echo "$total_statements < $THRESHOLD" | bc -l) )); then
        log_error "Statements coverage (${total_statements}%) is below threshold (${THRESHOLD}%)"
        coverage_met=false
    fi

    if [ "$coverage_met" = true ]; then
        log_success "All coverage metrics meet the ${THRESHOLD}% threshold"
        return 0
    else
        log_error "Coverage threshold not met"
        return 1
    fi
}

generate_coverage_report() {
    log_info "Generating coverage report..."

    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local report_file="$RESULTS_DIR/coverage-report_$timestamp.md"

    cat > "$report_file" << EOF
# Coverage Report

**Generated**: $(date)
**Threshold**: ${THRESHOLD}%
**Environment**: $(uname -s) $(uname -m)

## Coverage Summary

EOF

    # Add coverage metrics to report
    if [ -f "$COVERAGE_DIR/coverage-summary.json" ]; then
        local total_lines=$(jq -r '.total.lines.pct' "$COVERAGE_DIR/coverage-summary.json")
        local total_functions=$(jq -r '.total.functions.pct' "$COVERAGE_DIR/coverage-summary.json")
        local total_branches=$(jq -r '.total.branches.pct' "$COVERAGE_DIR/coverage-summary.json")
        local total_statements=$(jq -r '.total.statements.pct' "$COVERAGE_DIR/coverage-summary.json")

        cat >> "$report_file" << EOF
- **Lines**: ${total_lines}%
- **Functions**: ${total_functions}%
- **Branches**: ${total_branches}%
- **Statements**: ${total_statements}%

## Service Coverage

EOF

        # Add service-specific coverage
        for service in api-gateway security meeting-intelligence workflow-automation integration-management notification-service analytics-reporting; do
            if [ -d "services/$service" ]; then
                local service_coverage=$(jq -r ".\"services/$service/\" // empty" "$COVERAGE_DIR/coverage-summary.json" 2>/dev/null || echo "null")
                if [ "$service_coverage" != "null" ] && [ "$service_coverage" != "" ]; then
                    local service_lines=$(echo "$service_coverage" | jq -r '.lines.pct // "N/A"')
                    local service_functions=$(echo "$service_coverage" | jq -r '.functions.pct // "N/A"')
                    local service_branches=$(echo "$service_coverage" | jq -r '.branches.pct // "N/A"')
                    local service_statements=$(echo "$service_coverage" | jq -r '.statements.pct // "N/A"')

                    cat >> "$report_file" << EOF
### $service
- **Lines**: ${service_lines}%
- **Functions**: ${service_functions}%
- **Branches**: ${service_branches}%
- **Statements**: ${service_statements}%

EOF
                fi
            fi
        done
    fi

    cat >> "$report_file" << EOF
## Files with Low Coverage

EOF

    # Find files with low coverage
    if [ -f "$COVERAGE_DIR/lcov/lcov.info" ]; then
        local low_coverage_files=$(grep -E "^LF:[0-9]+" "$COVERAGE_DIR/lcov/lcov.info" | awk -F: '{if($2 < 95) print $0}' | head -10)
        if [ -n "$low_coverage_files" ]; then
            echo "$low_coverage_files" >> "$report_file"
        else
            echo "No files with low coverage found." >> "$report_file"
        fi
    fi

    cat >> "$report_file" << EOF

## Recommendations

1. Review files with low coverage
2. Add tests for uncovered code paths
3. Remove unused code
4. Improve test quality

## Next Steps

1. Address coverage gaps
2. Maintain coverage above ${THRESHOLD}%
3. Regular coverage monitoring
4. Continuous improvement

EOF

    log_success "Coverage report generated: $report_file"
}

upload_coverage() {
    log_info "Uploading coverage to external services..."

    # Upload to Codecov
    if command -v codecov &> /dev/null; then
        log_info "Uploading to Codecov..."
        codecov -f "$COVERAGE_DIR/lcov/lcov.info" -t "$CODECOV_TOKEN"
        log_success "Coverage uploaded to Codecov"
    else
        log_warning "Codecov CLI not found, skipping upload"
    fi

    # Upload to Coveralls
    if command -v coveralls &> /dev/null; then
        log_info "Uploading to Coveralls..."
        coveralls < "$COVERAGE_DIR/lcov/lcov.info"
        log_success "Coverage uploaded to Coveralls"
    else
        log_warning "Coveralls CLI not found, skipping upload"
    fi
}

check_coverage_trend() {
    log_info "Checking coverage trend..."

    local current_coverage="$COVERAGE_DIR/coverage-summary.json"
    local previous_coverage="$RESULTS_DIR/previous-coverage.json"

    if [ -f "$previous_coverage" ]; then
        local current_lines=$(jq -r '.total.lines.pct' "$current_coverage")
        local previous_lines=$(jq -r '.total.lines.pct' "$previous_coverage")

        local coverage_diff=$(echo "$current_lines - $previous_lines" | bc -l)

        if (( $(echo "$coverage_diff > 0" | bc -l) )); then
            log_success "Coverage improved by ${coverage_diff}%"
        elif (( $(echo "$coverage_diff < 0" | bc -l) )); then
            log_warning "Coverage decreased by ${coverage_diff}%"
        else
            log_info "Coverage remained the same"
        fi
    else
        log_info "No previous coverage data found"
    fi

    # Save current coverage for next comparison
    cp "$current_coverage" "$previous_coverage"
}

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h          Show this help message"
    echo "  --threshold, -t     Set coverage threshold (default: 95)"
    echo "  --upload, -u        Upload coverage to external services"
    echo "  --trend, -r         Check coverage trend"
    echo "  --report, -p        Generate coverage report only"
    echo ""
    echo "Examples:"
    echo "  $0                  Run full coverage monitoring"
    echo "  $0 --threshold 90   Set threshold to 90%"
    echo "  $0 --upload         Upload coverage to external services"
    echo "  $0 --trend          Check coverage trend"
    echo "  $0 --report         Generate report only"
}

# Main script
main() {
    local upload=false
    local trend=false
    local report_only=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_usage
                exit 0
                ;;
            --threshold|-t)
                THRESHOLD="$2"
                shift 2
                ;;
            --upload|-u)
                upload=true
                shift
                ;;
            --trend|-r)
                trend=true
                shift
                ;;
            --report|-p)
                report_only=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    log_info "Starting coverage monitoring with threshold: ${THRESHOLD}%"

    create_directories

    if [ "$report_only" = false ]; then
        run_coverage_tests
    fi

    if [ -f "$COVERAGE_DIR/coverage-summary.json" ]; then
        analyze_coverage
        generate_coverage_report

        if [ "$trend" = true ]; then
            check_coverage_trend
        fi

        if [ "$upload" = true ]; then
            upload_coverage
        fi

        log_success "Coverage monitoring completed successfully!"
    else
        log_error "Coverage analysis failed - no coverage data found"
        exit 1
    fi
}

# Run main function
main "$@"

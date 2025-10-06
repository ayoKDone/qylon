#!/bin/bash

# Qylon CI/CD Environment Setup Script
# This script sets up the CI environment for GitHub Actions
# It configures environment variables, database connections, and test settings

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[CI-SETUP]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[CI-SETUP]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[CI-SETUP]${NC} $1"
}

log_error() {
    echo -e "${RED}[CI-SETUP]${NC} $1"
}

# Main CI setup function
main() {
    log_info "Setting up CI environment for Qylon..."

    # Set CI environment variables
    export CI=true
    export NODE_ENV=test
    export ENVIRONMENT=ci

    # Database configuration for CI
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qylon_test"
    export DB_HOST=localhost
    export DB_PORT=5432
    export DB_NAME=qylon_test
    export DB_USER=postgres
    export DB_PASSWORD=postgres

    # Redis configuration for CI
    export REDIS_URL="redis://localhost:6379"

    # JWT and security configuration for CI
    export JWT_SECRET="ci-test-jwt-secret-key-for-testing-only"
    export ENCRYPTION_KEY="ci-test-encryption-key-32-chars"

    # Supabase configuration for CI (using placeholder values)
    export SUPABASE_URL="https://placeholder.supabase.co"
    export SUPABASE_ANON_KEY="placeholder-anon-key"
    export SUPABASE_SERVICE_ROLE_KEY="placeholder-service-role-key"

    # AI Services configuration for CI (using placeholder values)
    export OPENAI_API_KEY="sk-ci-test-placeholder-key"
    export ANTHROPIC_API_KEY="sk-ant-ci-test-placeholder-key"
    export RECALL_AI_API_KEY="ci-test-recall-ai-key"

    # Email and notification services (disabled for CI)
    export SENDGRID_API_KEY=""
    export TWILIO_ACCOUNT_SID=""
    export TWILIO_AUTH_TOKEN=""
    export SLACK_BOT_TOKEN=""

    # Cloud storage (disabled for CI)
    export DO_SPACES_KEY=""
    export DO_SPACES_SECRET=""
    export DO_SPACES_ENDPOINT=""
    export DO_SPACES_BUCKET=""

    # Service-specific ports for CI
    export API_GATEWAY_PORT=3000
    export SECURITY_SERVICE_PORT=3001
    export USER_MANAGEMENT_PORT=3002
    export MEETING_INTELLIGENCE_PORT=3003
    export CONTENT_CREATION_PORT=3004
    export WORKFLOW_AUTOMATION_PORT=3005
    export INTEGRATION_MANAGEMENT_PORT=3006
    export NOTIFICATION_SERVICE_PORT=3007
    export ANALYTICS_SERVICE_PORT=3008

    # Test configuration
    export TEST_TIMEOUT=30000
    export TEST_RETRIES=3
    export COVERAGE_THRESHOLD=80

    # Logging configuration for CI
    export LOG_LEVEL=error
    export LOG_FORMAT=json

    # Performance testing configuration
    export PERFORMANCE_TEST_DURATION=60
    export PERFORMANCE_TEST_VUS=10

    log_success "CI environment variables configured"

    # Database setup will be handled by GitHub Actions services
    log_info "Database setup will be handled by GitHub Actions services"
    log_success "Database configuration completed"

    # Create necessary directories for CI
    log_info "Creating CI directories..."
    mkdir -p logs
    mkdir -p coverage
    mkdir -p test-results
    mkdir -p security-results

    log_success "CI directories created"

    # Set up Python virtual environment for CI
    if [ -f requirements.txt ]; then
        log_info "Setting up Python virtual environment for CI..."
        python3 -m venv venv-ci
        source venv-ci/bin/activate
        pip install --upgrade pip
        pip install -r requirements.txt
        log_success "Python virtual environment setup completed"
    fi

    # Install additional CI dependencies
    log_info "Installing CI-specific dependencies..."
    npm install --save-dev @types/jest jest-junit

    # Make other scripts executable
    log_info "Setting up script permissions..."
    chmod +x scripts/*.sh 2>/dev/null || true

    log_success "CI environment setup completed successfully!"

    # Display environment summary
    log_info "Environment Summary:"
    echo "  - NODE_ENV: $NODE_ENV"
    echo "  - DATABASE_URL: $DATABASE_URL"
    echo "  - REDIS_URL: $REDIS_URL"
    echo "  - JWT_SECRET: [HIDDEN]"
    echo "  - CI: $CI"
    echo "  - ENVIRONMENT: $ENVIRONMENT"
}

# Run main function
main "$@"

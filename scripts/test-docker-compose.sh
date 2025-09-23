#!/bin/bash

# Qylon Docker Compose Test Script
# This script tests the Docker Compose configuration and services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Check if Docker is running
check_docker() {
    log_info "Checking Docker status..."

    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is not installed"
        return 1
    fi

    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running"
        return 1
    fi

    log_success "Docker is running"
    return 0
}

# Check if Docker Compose is available
check_docker_compose() {
    log_info "Checking Docker Compose availability..."

    if command -v docker-compose >/dev/null 2>&1; then
        local version=$(docker-compose --version)
        log_success "Docker Compose found: $version"
        return 0
    elif docker compose version >/dev/null 2>&1; then
        local version=$(docker compose version)
        log_success "Docker Compose (plugin) found: $version"
        return 0
    else
        log_error "Docker Compose not found"
        return 1
    fi
}

# Validate Docker Compose files
validate_compose_files() {
    log_info "Validating Docker Compose files..."

    local compose_files=("docker-compose.yml" "docker-compose.supabase.yml" "docker-compose.supabase-local.yml" "docker-compose.test.yml")
    local valid_files=()

    for file in "${compose_files[@]}"; do
        if [ -f "$file" ]; then
            log_info "Validating $file..."
            if docker-compose -f "$file" config >/dev/null 2>&1; then
                log_success "$file is valid"
                valid_files+=("$file")
            else
                log_error "$file has syntax errors"
            fi
        else
            log_warning "$file not found"
        fi
    done

    if [ ${#valid_files[@]} -eq 0 ]; then
        log_error "No valid Docker Compose files found"
        return 1
    fi

    log_success "Found ${#valid_files[@]} valid Docker Compose files"
    return 0
}

# Test database services
test_database_services() {
    log_info "Testing database services..."

    # Start database services
    log_info "Starting database services..."
    docker-compose up -d postgres redis mongodb

    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 10

    # Test PostgreSQL
    if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
        log_success "PostgreSQL is ready"
    else
        log_error "PostgreSQL is not ready"
        return 1
    fi

    # Test Redis
    if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        log_success "Redis is ready"
    else
        log_error "Redis is not ready"
        return 1
    fi

    # Test MongoDB
    if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" >/dev/null 2>&1; then
        log_success "MongoDB is ready"
    else
        log_error "MongoDB is not ready"
        return 1
    fi

    return 0
}

# Test service builds
test_service_builds() {
    log_info "Testing service builds..."

    local services=("api-gateway" "security" "meeting-intelligence" "content-creation" "workflow-automation" "event-sourcing" "infrastructure-monitoring")
    local built_services=()
    local failed_services=()

    for service in "${services[@]}"; do
        if [ -f "services/$service/Dockerfile" ]; then
            log_info "Building $service..."
            if docker-compose build "$service" >/dev/null 2>&1; then
                log_success "$service built successfully"
                built_services+=("$service")
            else
                log_error "$service build failed"
                failed_services+=("$service")
            fi
        else
            log_warning "No Dockerfile found for $service"
        fi
    done

    log_info "Build Summary:"
    log_info "  Built successfully: ${#built_services[@]}"
    log_info "  Failed: ${#failed_services[@]}"

    if [ ${#failed_services[@]} -ne 0 ]; then
        log_warning "Failed services: ${failed_services[*]}"
        return 1
    fi

    return 0
}

# Test service startup
test_service_startup() {
    log_info "Testing service startup..."

    # Start all services
    log_info "Starting all services..."
    docker-compose up -d

    # Wait for services to start
    log_info "Waiting for services to start..."
    sleep 15

    # Test service health endpoints
    local services=("api-gateway:3000" "security:3001" "meeting-intelligence:3003" "content-creation:3004" "workflow-automation:3005" "event-sourcing:3006" "infrastructure-monitoring:3007")
    local healthy_services=()
    local unhealthy_services=()

    for service_port in "${services[@]}"; do
        local service_name=$(echo "$service_port" | cut -d: -f1)
        local port=$(echo "$service_port" | cut -d: -f2)
        local health_url="http://localhost:$port/health"

        log_info "Testing $service_name health endpoint..."
        if curl -s "$health_url" >/dev/null 2>&1; then
            log_success "$service_name is healthy"
            healthy_services+=("$service_name")
        else
            log_warning "$service_name is not responding"
            unhealthy_services+=("$service_name")
        fi
    done

    log_info "Health Check Summary:"
    log_info "  Healthy services: ${#healthy_services[@]}"
    log_info "  Unhealthy services: ${#unhealthy_services[@]}"

    if [ ${#unhealthy_services[@]} -ne 0 ]; then
        log_warning "Unhealthy services: ${unhealthy_services[*]}"
        log_info "Check logs with: docker-compose logs <service-name>"
    fi

    return 0
}

# Show container status
show_container_status() {
    log_info "Container Status:"
    echo "=================="

    docker-compose ps
}

# Clean up test environment
cleanup() {
    log_info "Cleaning up test environment..."

    # Stop all services
    docker-compose down

    # Remove unused images (optional)
    if [ "${1:-}" = "--clean-images" ]; then
        log_info "Removing unused images..."
        docker image prune -f
    fi

    log_success "Cleanup completed"
}

# Run comprehensive test
run_comprehensive_test() {
    echo "🐳 Qylon Docker Compose Test"
    echo "============================"
    echo ""

    local test_passed=true

    # Run all tests
    check_docker || test_passed=false
    check_docker_compose || test_passed=false
    validate_compose_files || test_passed=false
    test_database_services || test_passed=false
    test_service_builds || test_passed=false
    test_service_startup || test_passed=false

    echo ""
    show_container_status

    echo ""
    if [ "$test_passed" = true ]; then
        log_success "All tests passed! Docker Compose configuration is working correctly."
    else
        log_error "Some tests failed. Check the output above for details."
        return 1
    fi
}

# Main function
main() {
    case "${1:-}" in
        "validate")
            check_docker
            check_docker_compose
            validate_compose_files
            ;;
        "databases")
            check_docker
            test_database_services
            ;;
        "build")
            check_docker
            test_service_builds
            ;;
        "startup")
            check_docker
            test_service_startup
            ;;
        "status")
            show_container_status
            ;;
        "cleanup")
            cleanup "${2:-}"
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  (no args)     Run comprehensive test suite"
            echo "  validate      Validate Docker Compose files"
            echo "  databases     Test database services only"
            echo "  build         Test service builds only"
            echo "  startup       Test service startup only"
            echo "  status        Show container status"
            echo "  cleanup       Stop services and clean up"
            echo "  help          Show this help message"
            echo ""
            echo "Options:"
            echo "  cleanup --clean-images    Also remove unused images"
            ;;
        *)
            run_comprehensive_test
            ;;
    esac
}

# Run main function
main "$@"

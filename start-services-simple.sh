#!/bin/bash

# Qylon Services Startup Script (Simplified - No Docker)
# This script starts all Qylon microservices for local development

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

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

# Service configuration
declare -A SERVICES=(
    ["api-gateway"]="3000"
    ["security"]="3001"
    ["user-management"]="3002"
    ["meeting-intelligence"]="3003"
    ["workflow-automation"]="3005"
    ["integration-management"]="3006"
    ["notification-service"]="3007"
)

# Check if service is running
is_service_running() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Start a Node.js service
start_node_service() {
    local service_name=$1
    local port=$2
    local service_dir="services/$service_name"

    if [ ! -d "$service_dir" ]; then
        log_warning "Service directory $service_dir not found, skipping"
        return
    fi

    if [ ! -f "$service_dir/package.json" ]; then
        log_warning "package.json not found in $service_dir, skipping"
        return
    fi

    if is_service_running $port; then
        log_warning "$service_name is already running on port $port"
        return
    fi

    log_info "Starting $service_name on port $port..."

    cd "$service_dir"

    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        log_info "Installing dependencies for $service_name..."
        npm install
    fi

    # Start the service in background
    if [ -f "src/index.ts" ] || [ -f "src/index.js" ]; then
        npm run dev > "../../logs/$service_name.log" 2>&1 &
    else
        log_warning "No index file found in $service_dir/src/"
        cd - > /dev/null
        return
    fi

    local pid=$!
    echo $pid > "../../logs/$service_name.pid"

    cd - > /dev/null

    # Wait a moment and check if service started
    sleep 2
    if is_service_running $port; then
        log_success "$service_name started successfully (PID: $pid)"
    else
        log_error "Failed to start $service_name"
    fi
}

# Start all services
start_all_services() {
    log_info "Starting all Qylon services..."

    # Create logs directory if it doesn't exist
    mkdir -p logs

    # Start services in order
    for service_name in "${!SERVICES[@]}"; do
        local port=${SERVICES[$service_name]}
        start_node_service "$service_name" "$port"
        # Small delay between service starts
        sleep 1
    done
}

# Check service health
check_service_health() {
    log_info "Checking service health..."

    local healthy_services=()
    local unhealthy_services=()

    for service_name in "${!SERVICES[@]}"; do
        local port=${SERVICES[$service_name]}
        local health_url="http://localhost:$port/health"

        if curl -s "$health_url" >/dev/null 2>&1; then
            healthy_services+=("$service_name")
            log_success "$service_name is healthy"
        else
            unhealthy_services+=("$service_name")
            log_warning "$service_name is not responding"
        fi
    done

    echo ""
    log_info "Health Check Summary:"
    log_info "Healthy services: ${#healthy_services[@]}"
    log_info "Unhealthy services: ${#unhealthy_services[@]}"

    if [ ${#unhealthy_services[@]} -ne 0 ]; then
        log_warning "Unhealthy services: ${unhealthy_services[*]}"
        log_info "Check logs in the logs/ directory for more information"
    fi
}

# Show service status
show_status() {
    echo ""
    log_info "Service Status:"
    echo "=================="

    for service_name in "${!SERVICES[@]}"; do
        local port=${SERVICES[$service_name]}
        local status="❌ Stopped"

        if is_service_running $port; then
            status="✅ Running"
        fi

        printf "%-25s %-10s (Port: %s)\n" "$service_name" "$status" "$port"
    done
}

# Main function
main() {
    echo "🚀 Starting Qylon Services (Simplified)"
    echo "======================================="
    echo ""

    start_all_services

    # Wait a moment for services to fully start
    sleep 3

    show_status
    check_service_health

    echo ""
    log_success "Services startup completed!"
    echo ""
    echo "Service URLs:"
    echo "  API Gateway: http://localhost:3000"
    echo "  Security Service: http://localhost:3001"
    echo "  User Management: http://localhost:3002"
    echo "  Meeting Intelligence: http://localhost:3003"
    echo "  Workflow Automation: http://localhost:3005"
    echo "  Integration Management: http://localhost:3006"
    echo "  Notification Service: http://localhost:3007"
    echo ""
    echo "Useful commands:"
    echo "  View logs: tail -f logs/<service-name>.log"
    echo "  Check health: curl http://localhost:3000/health"
    echo ""
}

# Handle script arguments
case "${1:-}" in
    "status")
        show_status
        ;;
    "health")
        check_service_health
        ;;
    *)
        main
        ;;
esac

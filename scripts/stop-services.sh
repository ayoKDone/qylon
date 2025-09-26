#!/bin/bash

# Qylon Services Stop Script
# This script stops all Qylon microservices

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

# Service configuration
declare -A SERVICES=(
    ["api-gateway"]="3000"
    ["security"]="3001"
    ["meeting-intelligence"]="3003"
    ["content-creation"]="3004"
    ["workflow-automation"]="3005"
    ["event-sourcing"]="3006"
    ["infrastructure-monitoring"]="3007"
)

# Stop service by PID file
stop_service_by_pid() {
    local service_name=$1
    local pid_file="logs/$service_name.pid"

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            log_info "Stopping $service_name (PID: $pid)..."
            kill "$pid"

            # Wait for graceful shutdown
            local count=0
            while kill -0 "$pid" 2>/dev/null && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done

            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                log_warning "Force killing $service_name (PID: $pid)..."
                kill -9 "$pid"
            fi

            log_success "$service_name stopped"
        else
            log_warning "$service_name PID file exists but process is not running"
        fi
        rm -f "$pid_file"
    else
        log_warning "No PID file found for $service_name"
    fi
}

# Stop service by port
stop_service_by_port() {
    local service_name=$1
    local port=$2

    local pids=$(lsof -ti :$port 2>/dev/null || true)

    if [ -n "$pids" ]; then
        log_info "Stopping $service_name on port $port..."
        for pid in $pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid"
                log_info "Stopped process $pid for $service_name"
            fi
        done

        # Wait for graceful shutdown
        sleep 2

        # Force kill if still running
        local remaining_pids=$(lsof -ti :$port 2>/dev/null || true)
        if [ -n "$remaining_pids" ]; then
            log_warning "Force killing remaining processes for $service_name..."
            for pid in $remaining_pids; do
                kill -9 "$pid" 2>/dev/null || true
            done
        fi

        log_success "$service_name stopped"
    else
        log_info "$service_name is not running on port $port"
    fi
}

# Stop all services
stop_all_services() {
    log_info "Stopping all Qylon services..."

    # Stop services in reverse order
    local services_reverse=("infrastructure-monitoring" "event-sourcing" "workflow-automation" "content-creation" "meeting-intelligence" "security" "api-gateway")

    for service_name in "${services_reverse[@]}"; do
        local port=${SERVICES[$service_name]}

        # Try to stop by PID file first, then by port
        stop_service_by_pid "$service_name"
        stop_service_by_port "$service_name" "$port"

        # Small delay between stops
        sleep 1
    done
}

# Stop specific service
stop_specific_service() {
    local service_name=$1

    if [ -z "${SERVICES[$service_name]}" ]; then
        log_error "Unknown service: $service_name"
        log_info "Available services: ${!SERVICES[*]}"
        exit 1
    fi

    local port=${SERVICES[$service_name]}
    log_info "Stopping $service_name..."

    stop_service_by_pid "$service_name"
    stop_service_by_port "$service_name" "$port"
}

# Show service status
show_status() {
    echo ""
    log_info "Service Status:"
    echo "=================="

    for service_name in "${!SERVICES[@]}"; do
        local port=${SERVICES[$service_name]}
        local status="❌ Stopped"

        if lsof -i :$port >/dev/null 2>&1; then
            status="✅ Running"
        fi

        printf "%-25s %-10s (Port: %s)\n" "$service_name" "$status" "$port"
    done
}

# Clean up logs
cleanup_logs() {
    log_info "Cleaning up log files..."

    if [ -d "logs" ]; then
        # Remove PID files
        find logs -name "*.pid" -delete 2>/dev/null || true

        # Optionally truncate log files (keep last 100 lines)
        for log_file in logs/*.log; do
            if [ -f "$log_file" ]; then
                local lines=$(wc -l < "$log_file" 2>/dev/null || echo "0")
                if [ "$lines" -gt 100 ]; then
                    tail -n 100 "$log_file" > "${log_file}.tmp" && mv "${log_file}.tmp" "$log_file"
                fi
            fi
        done

        log_success "Log cleanup completed"
    fi
}

# Main function
main() {
    echo "🛑 Stopping Qylon Services"
    echo "========================="
    echo ""

    stop_all_services

    # Wait a moment for all processes to stop
    sleep 2

    show_status
    cleanup_logs

    echo ""
    log_success "All services stopped!"
    echo ""
    echo "To start services again, run: ./scripts/start-services.sh"
}

# Handle script arguments
case "${1:-}" in
    "status")
        show_status
        ;;
    "clean")
        cleanup_logs
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (no args)  Stop all services"
        echo "  status     Show service status"
        echo "  clean      Clean up log files"
        echo "  help       Show this help message"
        echo ""
        echo "Available services:"
        for service_name in "${!SERVICES[@]}"; do
            echo "  $service_name (port ${SERVICES[$service_name]})"
        done
        ;;
    *)
        if [ -n "$1" ]; then
            stop_specific_service "$1"
        else
            main
        fi
        ;;
esac

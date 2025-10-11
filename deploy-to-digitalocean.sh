#!/bin/bash

# DigitalOcean App Platform Deployment Script for Qylon
# This script helps deploy the Qylon application to DigitalOcean App Platform

set -e

echo "🚀 Qylon DigitalOcean Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if doctl is installed
check_doctl() {
    if ! command -v doctl &> /dev/null; then
        print_error "doctl is not installed. Please install it first:"
        echo "curl -sL https://github.com/digitalocean/doctl/releases/download/v1.101.0/doctl-1.101.0-linux-amd64.tar.gz | tar -xzv"
        echo "sudo mv doctl /usr/local/bin"
        exit 1
    fi
    print_success "doctl is installed"
}

# Check authentication
check_auth() {
    if ! doctl auth list &> /dev/null; then
        print_error "Not authenticated with DigitalOcean. Please run:"
        echo "doctl auth init"
        exit 1
    fi
    print_success "Authenticated with DigitalOcean"
}

# Get current app info
get_app_info() {
    print_status "Getting current app information..."
    APP_ID="8ef0ecb5-75fe-414c-a962-b9d4a62bf433"

    if doctl apps get $APP_ID &> /dev/null; then
        print_success "App found: $APP_ID"
        doctl apps get $APP_ID --format ID,Spec.Name,DefaultIngress
    else
        print_error "App not found. Please check the app ID."
        exit 1
    fi
}

# Deploy with minimal spec (frontend + API Gateway only)
deploy_minimal() {
    print_status "Deploying with minimal configuration (Frontend + API Gateway)..."

    if [ -f ".do/app-spec-minimal.json" ]; then
        print_status "Using minimal app spec..."
        doctl apps update 8ef0ecb5-75fe-414c-a962-b9d4a62bf433 --spec .do/app-spec-minimal.json
        print_success "Minimal deployment initiated"
    else
        print_error "Minimal app spec not found: .do/app-spec-minimal.json"
        exit 1
    fi
}

# Deploy with full spec (all services)
deploy_full() {
    print_status "Deploying with full configuration (All services)..."

    if [ -f ".do/app-spec-fixed.json" ]; then
        print_status "Using full app spec..."
        doctl apps update 8ef0ecb5-75fe-414c-a962-b9d4a62bf433 --spec .do/app-spec-fixed.json
        print_success "Full deployment initiated"
    else
        print_error "Full app spec not found: .do/app-spec-fixed.json"
        exit 1
    fi
}

# Check deployment status
check_deployment() {
    print_status "Checking deployment status..."
    APP_ID="8ef0ecb5-75fe-414c-a962-b9d4a62bf433"

    # Get deployment logs
    print_status "Build logs:"
    doctl apps logs $APP_ID --type build --follow=false | tail -20

    print_status "Runtime logs:"
    doctl apps logs $APP_ID --type run --follow=false | tail -20
}

# Show app URL
show_app_url() {
    print_status "Getting app URL..."
    APP_ID="8ef0ecb5-75fe-414c-a962-b9d4a62bf433"

    URL=$(doctl apps get $APP_ID --format DefaultIngress --no-header)
    if [ ! -z "$URL" ]; then
        print_success "App URL: $URL"
        print_status "Health check: $URL/api/health"
    else
        print_warning "Could not get app URL"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "Select deployment option:"
    echo "1) Deploy minimal (Frontend + API Gateway only)"
    echo "2) Deploy full (All services)"
    echo "3) Check deployment status"
    echo "4) Show app URL"
    echo "5) Exit"
    echo ""
    read -p "Enter your choice [1-5]: " choice
}

# Main execution
main() {
    check_doctl
    check_auth
    get_app_info

    while true; do
        show_menu
        case $choice in
            1)
                deploy_minimal
                check_deployment
                show_app_url
                ;;
            2)
                deploy_full
                check_deployment
                show_app_url
                ;;
            3)
                check_deployment
                ;;
            4)
                show_app_url
                ;;
            5)
                print_status "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main

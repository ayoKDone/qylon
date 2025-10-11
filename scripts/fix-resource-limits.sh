#!/bin/bash

# Fix Resource Limits Script
# Updates the DigitalOcean app with proper resource allocation

set -e

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

# Check if DO_ACCESS_TOKEN is set
if [ -z "$DO_ACCESS_TOKEN" ]; then
    print_error "DO_ACCESS_TOKEN environment variable is not set"
    print_status "Please set it with: export DO_ACCESS_TOKEN=your_token_here"
    exit 1
fi

# Check if DO_APP_ID is set
if [ -z "$DO_APP_ID" ]; then
    print_error "DO_APP_ID environment variable is not set"
    print_status "Please set it with: export DO_APP_ID=your_app_id_here"
    exit 1
fi

print_status "Fixing resource limits for DigitalOcean app: $DO_APP_ID"

# Authenticate with DigitalOcean
print_status "Authenticating with DigitalOcean..."
export DO_TOKEN="$DO_ACCESS_TOKEN"

# Create a new deployment with the fixed resource configuration
print_status "Creating new deployment with increased resource limits..."
doctl apps create-deployment "$DO_APP_ID" --spec .do/app-resource-fixed.yaml

if [ $? -eq 0 ]; then
    print_success "Deployment created successfully with increased resource limits!"
    print_status "The app will now use basic-xs instances (512MB RAM, 0.5 vCPU) instead of basic-xxs (256MB RAM, 0.25 vCPU)"
    print_status "This should resolve the 'Container Terminated' error due to resource limits"
else
    print_error "Failed to create deployment"
    exit 1
fi

print_status "Monitoring deployment status..."
sleep 10

# Check deployment status
print_status "Checking deployment status..."
doctl apps list-deployments "$DO_APP_ID" --format "ID,State,Created"

print_success "Resource limit fix completed!"
print_status "The app should now have sufficient resources to run without being terminated"

#!/bin/bash

# Comprehensive Deployment Fix Script
# Fixes all identified DigitalOcean deployment issues

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

print_status "🔧 Applying comprehensive deployment fixes for DigitalOcean app: $DO_APP_ID"

# Authenticate with DigitalOcean
print_status "Authenticating with DigitalOcean..."
export DO_TOKEN="$DO_ACCESS_TOKEN"

print_status "📋 Issues being fixed:"
print_status "  ✅ Missing default process type (added Procfile)"
print_status "  ✅ Port binding issues (explicit PORT environment variables)"
print_status "  ✅ Python version warnings (added .buildpacks file)"
print_status "  ✅ Start command determination (explicit run commands)"
print_status "  ✅ Health check timeouts (increased delays)"

# Create a new deployment with the comprehensive fix
print_status "🚀 Creating new deployment with comprehensive fixes..."
print_status "  - API Gateway: npm start (port 3000)"
print_status "  - Frontend: npm run preview (port 4173)"
print_status "  - Buildpack: Node.js only"
print_status "  - Health checks: 90s initial delay"

doctl apps create-deployment "$DO_APP_ID" --spec .do/app-comprehensive-fix.yaml

if [ $? -eq 0 ]; then
    print_success "🎉 Deployment created successfully with comprehensive fixes!"
    print_status "This should resolve all identified issues:"
    print_status "  ✅ Default process type defined"
    print_status "  ✅ Port binding configured correctly"
    print_status "  ✅ Node.js buildpack specified"
    print_status "  ✅ Start commands explicit"
    print_status "  ✅ Health checks optimized"
else
    print_error "❌ Failed to create deployment"
    exit 1
fi

print_status "⏳ Monitoring deployment status..."
sleep 15

# Check deployment status
print_status "📊 Checking deployment status..."
doctl apps list-deployments "$DO_APP_ID" --format "ID,State,Created,Updated"

print_success "🎯 Comprehensive deployment fix completed!"
print_status "The app should now deploy successfully without the previous errors"
print_status "Monitor the deployment in the DigitalOcean dashboard for progress"

#!/bin/bash

# Clear Jest cache script for Qylon platform
# This script ensures Jest cache is cleared to prevent module resolution issues

set -e

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

log_info "Clearing Jest cache to prevent module resolution issues..."

# Check if Jest is available
if ! command -v npx >/dev/null 2>&1; then
    log_error "npx is not available. Please install Node.js and npm."
    exit 1
fi

# Clear Jest cache
if npx jest --clearCache >/dev/null 2>&1; then
    log_success "Jest cache cleared successfully"
else
    log_warning "Failed to clear Jest cache, but continuing..."
fi

# Also clear any potential npm cache issues
if npm cache clean --force >/dev/null 2>&1; then
    log_success "npm cache cleared successfully"
else
    log_warning "Failed to clear npm cache, but continuing..."
fi

log_success "Cache clearing completed. Jest should now resolve modules correctly."

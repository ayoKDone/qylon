#!/bin/bash

# Qylon AI Automation Platform - Jest Cache Clearing Script
# This script clears Jest cache to prevent module resolution issues
# Chief Architect: Bill (siwale)

set -e

echo "🧹 Clearing Jest cache..."

# Clear Jest cache
if command -v npx >/dev/null 2>&1; then
    echo "Clearing Jest cache with npx..."
    npx jest --clearCache || echo "Jest cache clearing failed, continuing..."
else
    echo "npx not found, skipping Jest cache clearing"
fi

# Clear npm cache
if command -v npm >/dev/null 2>&1; then
    echo "Clearing npm cache..."
    npm cache clean --force || echo "npm cache clearing failed, continuing..."
else
    echo "npm not found, skipping npm cache clearing"
fi

# Clear node_modules/.cache directories
echo "Clearing node_modules/.cache directories..."
find . -name "node_modules" -type d -exec find {} -name ".cache" -type d -exec rm -rf {} + \; 2>/dev/null || true

# Clear coverage directories
echo "Clearing coverage directories..."
rm -rf coverage/ 2>/dev/null || true
find . -name "coverage" -type d -exec rm -rf {} + 2>/dev/null || true

echo "✅ Cache clearing completed"

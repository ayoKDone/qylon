#!/bin/bash

# Script to run flake8 on existing Python services only
# This prevents errors when directories don't exist

echo "🔍 Running flake8 on Python services..."

# Check which services exist and have Python files
SERVICES_TO_CHECK=()

if [ -d "services/content-creation" ] && [ -n "$(find services/content-creation -name '*.py' -type f 2>/dev/null)" ]; then
    SERVICES_TO_CHECK+=("services/content-creation")
    echo "✅ Found content-creation service with Python files"
fi

if [ -d "services/meeting-intelligence" ] && [ -n "$(find services/meeting-intelligence -name '*.py' -type f -not -path '*/node_modules/*' 2>/dev/null)" ]; then
    SERVICES_TO_CHECK+=("services/meeting-intelligence")
    echo "✅ Found meeting-intelligence service with Python files"
fi

if [ -d "services/analytics-reporting" ] && [ -n "$(find services/analytics-reporting -name '*.py' -type f 2>/dev/null)" ]; then
    SERVICES_TO_CHECK+=("services/analytics-reporting")
    echo "✅ Found analytics-reporting service with Python files"
fi

# Run flake8 on existing services
if [ ${#SERVICES_TO_CHECK[@]} -eq 0 ]; then
    echo "ℹ️  No Python services found to check"
    exit 0
fi

echo "🔧 Running flake8 on: ${SERVICES_TO_CHECK[*]}"
flake8 "${SERVICES_TO_CHECK[@]}"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All Python services pass flake8 validation"
else
    echo "❌ Some Python services have flake8 issues"
fi

exit $EXIT_CODE

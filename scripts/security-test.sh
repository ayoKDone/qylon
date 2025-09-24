#!/bin/bash

echo "🔒 Starting Security Tests..."

# Check if TypeScript is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js and npm."
    exit 1
fi

echo "📝 Running TypeScript compilation check..."
npx tsc --noEmit --project tsconfig.security.json
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi

echo "🔍 Running ESLint security analysis..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ ESLint security analysis failed"
    exit 1
fi

echo "🛡️ Running npm security audit..."
npm audit --audit-level=moderate
if [ $? -ne 0 ]; then
    echo "⚠️ Security vulnerabilities found"
    echo "📦 Checking for vulnerable dependencies..."
    npm audit --json
    exit 1
fi

echo "📦 Checking for vulnerable dependencies..."
npm audit --json

echo "✅ Security tests completed successfully!"

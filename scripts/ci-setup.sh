#!/bin/bash

# Qylon AI Automation Platform - CI Environment Setup
# This script sets up the CI environment with required environment variables
# Chief Architect: Bill (siwale)

set -e

echo "Setting up CI environment..."

# Set required environment variables
export NODE_ENV=test
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/qylon_test
export REDIS_URL=redis://localhost:6379
export MONGODB_URL=mongodb://root:password@localhost:27017/qylon_test
export JWT_SECRET=ci-test-jwt-secret-key-for-testing-only
export SUPABASE_URL=https://placeholder.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=placeholder-service-role-key
export OPENAI_API_KEY=mock-openai-api-key
export RECALL_AI_API_KEY=mock-recall-ai-api-key

# Set CI-specific flags
export CI=true
export ENVIRONMENT=ci

echo "CI environment setup complete"
echo "Environment variables set:"
echo "  NODE_ENV=$NODE_ENV"
echo "  DATABASE_URL=$DATABASE_URL"
echo "  REDIS_URL=$REDIS_URL"
echo "  JWT_SECRET=***"
echo "  SUPABASE_URL=$SUPABASE_URL"
echo "  CI=$CI"
echo "  ENVIRONMENT=$ENVIRONMENT"

#!/bin/bash

# Supabase Quick Start Script
# Run this after Docker is installed and running

echo "🚀 Starting Supabase Local Development Environment..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first:"
    echo "   sudo systemctl start docker"
    exit 1
fi

# Navigate to project directory
cd /home/bill/Documents/kdsquares/qylon

# Start Supabase
echo "📦 Starting Supabase services..."
./supabase-binary start

echo ""
echo "🎉 Supabase is starting up!"
echo ""
echo "📊 Service URLs:"
echo "   Supabase Studio: http://localhost:54323"
echo "   API Gateway: http://localhost:54321"
echo "   PostgreSQL: localhost:54322"
echo ""
echo "🔍 Check status with: ./supabase-binary status"
echo "🛑 Stop with: ./supabase-binary stop"

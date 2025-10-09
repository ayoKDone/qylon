#!/bin/bash

# Check Supabase Status and Fix Migration Issues
# Run this with sudo: sudo bash check-supabase-status.sh

echo "🔍 Checking Supabase Status..."

# Navigate to project directory
cd /home/bill/Documents/kdsquares/qylon

# Check if Supabase containers are running
echo "📦 Checking Docker containers..."
docker ps --filter "name=supabase" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 Testing Supabase endpoints..."

# Test Supabase Studio
if wget -qO- http://localhost:54323 >/dev/null 2>&1; then
    echo "✅ Supabase Studio: http://localhost:54323 (accessible)"
else
    echo "❌ Supabase Studio: http://localhost:54323 (not accessible)"
fi

# Test API Gateway
if wget -qO- http://localhost:54321 >/dev/null 2>&1; then
    echo "✅ API Gateway: http://localhost:54321 (accessible)"
else
    echo "❌ API Gateway: http://localhost:54321 (not accessible)"
fi

echo ""
echo "🗄️ Database Status:"
echo "   Host: localhost"
echo "   Port: 54322"
echo "   Database: postgres"
echo "   Username: postgres"
echo "   Password: postgres"

echo ""
echo "🔧 To fix migration issues, run:"
echo "   sudo ./supabase-binary db reset"
echo ""
echo "🔍 To view database, open Supabase Studio:"
echo "   http://localhost:54323"

#!/bin/bash

# Restart Supabase with Fixed Migrations
# This script restarts Supabase and applies migrations in the correct order

echo "🚀 Restarting Supabase with Fixed Migrations..."

# Navigate to project directory
cd /home/bill/Documents/kdsquares/qylon

# Stop any existing Supabase containers
echo "🛑 Stopping existing Supabase containers..."
sudo ./supabase-binary stop 2>/dev/null || echo "No containers to stop"

# Wait a moment
sleep 3

# Start Supabase fresh
echo "🔄 Starting Supabase fresh..."
sudo ./supabase-binary start

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 20

# Check if services are running
echo "🔍 Checking service status..."
if wget -qO- http://localhost:54323 >/dev/null 2>&1; then
    echo "✅ Supabase Studio: http://localhost:54323 (accessible)"
else
    echo "❌ Supabase Studio: http://localhost:54323 (not accessible)"
fi

if wget -qO- http://localhost:54321 >/dev/null 2>&1; then
    echo "✅ API Gateway: http://localhost:54321 (accessible)"
else
    echo "❌ API Gateway: http://localhost:54321 (not accessible)"
fi

echo ""
echo "🎉 Supabase restart completed!"
echo ""
echo "📊 Supabase Services:"
echo "   🌐 Supabase Studio: http://localhost:54323"
echo "   🔗 API Gateway: http://localhost:54321"
echo "   🗄️ PostgreSQL: localhost:54322"
echo ""
echo "🔑 Database Credentials:"
echo "   Host: localhost"
echo "   Port: 54322"
echo "   Database: postgres"
echo "   Username: postgres"
echo "   Password: postgres"
echo ""
echo "🔍 Open Supabase Studio to view your database:"
echo "   http://localhost:54323"

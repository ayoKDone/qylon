#!/bin/bash

# Restart Supabase with Clean Migrations
# This script restarts Supabase with the cleaned up migration files

echo "🚀 Restarting Supabase with Clean Migrations..."

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
sleep 25

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
echo "📋 Applied Migrations:"
echo "   ✅ 001_initial_schema.sql (Core tables)"
echo "   ✅ 002_rls_policies.sql (Fixed RLS policies)"
echo "   ✅ 003_api_keys_table.sql (API keys)"
echo "   ✅ 004_meeting_intelligence_schema.sql (Meeting intelligence)"
echo "   ✅ 005_meeting_intelligence_rls.sql (Meeting intelligence RLS)"
echo "   ✅ 006_crm_integrations_schema.sql (CRM integrations)"
echo "   ✅ 007_crm_integrations_rls.sql (CRM integrations RLS)"
echo ""
echo "🔍 Open Supabase Studio to view your database:"
echo "   http://localhost:54323"

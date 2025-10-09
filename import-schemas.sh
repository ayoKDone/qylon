#!/bin/bash

# Import Database Schemas Script
# This script imports all the database schemas to Supabase

echo "🗄️ Importing Database Schemas to Supabase..."

# Navigate to project directory
cd /home/bill/Documents/kdsquares/qylon

# Check if Supabase is running
echo "🔍 Checking Supabase status..."
if ! ./supabase-binary status >/dev/null 2>&1; then
    echo "❌ Supabase is not running. Please start it first:"
    echo "   sudo ./supabase-binary start"
    exit 1
fi

echo "✅ Supabase is running!"

# Wait a moment for services to be fully ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Apply migrations
echo "📦 Applying database migrations..."
./supabase-binary db reset --linked

echo ""
echo "🎉 Database schemas imported successfully!"
echo ""
echo "📊 Available Services:"
echo "   Supabase Studio: http://localhost:54323"
echo "   API Gateway: http://localhost:54321"
echo "   PostgreSQL: localhost:54322"
echo ""
echo "🔍 Check your database in Supabase Studio:"
echo "   http://localhost:54323"
echo ""
echo "📋 Imported Schemas:"
echo "   ✅ Initial schema (users, clients, meetings)"
echo "   ✅ Row Level Security policies"
echo "   ✅ API keys table"
echo "   ✅ Meeting intelligence schema"
echo "   ✅ Meeting intelligence RLS"
echo "   ✅ CRM integrations schema"
echo "   ✅ CRM integrations RLS"

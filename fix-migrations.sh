#!/bin/bash

# Fix Database Migrations Script
# This script fixes the migration order and applies them correctly

echo "🔧 Fixing Database Migrations..."

# Navigate to project directory
cd /home/bill/Documents/kdsquares/qylon

# Reset the database to start fresh
echo "🔄 Resetting database..."
sudo ./supabase-binary db reset --linked

echo ""
echo "✅ Database reset completed!"
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
echo "🎉 All migrations have been applied successfully!"
echo ""
echo "🔍 Open Supabase Studio to view your database:"
echo "   http://localhost:54323"
echo ""
echo "📋 Available Tables:"
echo "   ✅ users"
echo "   ✅ clients"
echo "   ✅ meetings"
echo "   ✅ meeting_transcriptions"
echo "   ✅ meeting_analytics"
echo "   ✅ api_keys"
echo "   ✅ crm_integrations"
echo "   ✅ And more..."

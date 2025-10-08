#!/bin/bash

# Fix Docker Permissions Script
# Run this with sudo: sudo bash fix-docker-permissions.sh

echo "🔧 Fixing Docker permissions..."

# Add current user to docker group
usermod -aG docker $SUDO_USER

echo "✅ User $SUDO_USER added to docker group"
echo ""
echo "📝 IMPORTANT: You need to log out and log back in for the group changes to take effect"
echo "🔄 After logging back in, test with: docker info"
echo "🚀 Then run: ./start-supabase.sh"

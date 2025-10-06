#!/bin/bash

# Docker Installation Script for Qylon
# Run this script with sudo: sudo bash install-docker.sh

echo "🐳 Installing Docker..."

# Update package index
apt-get update

# Install required packages
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
apt-get update

# Install Docker Engine
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker service
systemctl start docker
systemctl enable docker

# Add current user to docker group
usermod -aG docker $SUDO_USER

echo "✅ Docker installation complete!"
echo "📝 Please log out and log back in for group changes to take effect"
echo "🔍 Test Docker with: docker --version"
echo "🚀 Then run: cd /home/bill/Documents/kdsquares/qylon && ./supabase-binary start"

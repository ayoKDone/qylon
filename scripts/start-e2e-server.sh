#!/bin/bash

echo "🚀 Starting server for E2E testing..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Start the database services
echo "📦 Starting database services..."
docker-compose -f docker-compose.test.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Start the API Gateway
echo "🌐 Starting API Gateway..."
cd services/api-gateway

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing API Gateway dependencies..."
    npm install
fi

# Build the service
echo "🔨 Building API Gateway..."
npm run build

# Start the service in the background
echo "🚀 Starting API Gateway server..."
npm start &
API_PID=$!

# Wait for the server to start
echo "⏳ Waiting for API Gateway to start..."
sleep 15

# Check if the server is running (allow 503 status for E2E testing)
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ API Gateway is running on http://localhost:3000"
    echo "🔧 Server PID: $API_PID"
    echo "📝 To stop the server, run: kill $API_PID"
    echo "⚠️  Note: Health check may show unhealthy status due to missing microservices (expected for E2E testing)"
else
    echo "❌ Failed to start API Gateway"
    kill $API_PID 2>/dev/null
    exit 1
fi

echo "🎯 E2E test server is ready!"

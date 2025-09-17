#!/usr/bin/env node

/**
 * Qylon Project Initialization Script
 * Chief Architect: Bill (siwale)
 * 
 * This script initializes the Qylon project with all necessary configurations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Initializing Qylon Project...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created. Please update the values with your actual credentials.\n');
  } else {
    console.log('⚠️  No .env.example file found. Please create a .env file manually.\n');
  }
} else {
  console.log('✅ .env file already exists.\n');
}

// Create necessary directories
const directories = [
  'logs',
  'services/api-gateway/logs',
  'services/meeting-intelligence/logs',
  'services/workflow-automation/logs',
  'services/content-creation/logs',
  'services/analytics-reporting/logs',
  'services/user-management/logs',
  'services/client-management/logs',
  'services/integration-management/logs',
  'services/notification-service/logs',
  'database/backups',
  'infrastructure/terraform/state',
  'tests/coverage',
  'docs/generated'
];

console.log('📁 Creating project directories...');
directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`   ✅ Created: ${dir}`);
  } else {
    console.log(`   ⚠️  Already exists: ${dir}`);
  }
});
console.log('');

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Node.js dependencies installed.\n');
} catch (error) {
  console.error('❌ Failed to install Node.js dependencies:', error.message);
  process.exit(1);
}

// Install Python dependencies
console.log('🐍 Installing Python dependencies...');
try {
  execSync('pip install -r requirements.txt', { stdio: 'inherit' });
  console.log('✅ Python dependencies installed.\n');
} catch (error) {
  console.error('❌ Failed to install Python dependencies:', error.message);
  console.log('   Please ensure Python 3.11+ is installed and pip is available.\n');
}

// Check for required tools
console.log('🔧 Checking required tools...');
const requiredTools = [
  { name: 'Node.js', command: 'node --version', minVersion: 'v20.0.0' },
  { name: 'npm', command: 'npm --version' },
  { name: 'Python', command: 'python --version', minVersion: '3.11' },
  { name: 'Docker', command: 'docker --version' },
  { name: 'Docker Compose', command: 'docker-compose --version' },
  { name: 'Git', command: 'git --version' }
];

requiredTools.forEach(tool => {
  try {
    const version = execSync(tool.command, { encoding: 'utf8' }).trim();
    console.log(`   ✅ ${tool.name}: ${version}`);
  } catch (error) {
    console.log(`   ❌ ${tool.name}: Not found`);
    if (tool.name === 'Docker' || tool.name === 'Docker Compose') {
      console.log(`      Please install Docker and Docker Compose for containerized development.`);
    }
  }
});
console.log('');

// Initialize Git hooks
console.log('🪝 Setting up Git hooks...');
const hooksDir = path.join(process.cwd(), '.git/hooks');
if (fs.existsSync(hooksDir)) {
  const preCommitHook = `#!/bin/sh
# Pre-commit hook for Qylon project
echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed. Please fix the issues before committing."
  exit 1
fi

# Run tests
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Please fix the issues before committing."
  exit 1
fi

echo "✅ Pre-commit checks passed."
`;

  const preCommitPath = path.join(hooksDir, 'pre-commit');
  fs.writeFileSync(preCommitPath, preCommitHook);
  fs.chmodSync(preCommitPath, '755');
  console.log('   ✅ Pre-commit hook installed.');
} else {
  console.log('   ⚠️  Git repository not found. Please run "git init" first.');
}
console.log('');

// Create development configuration
console.log('⚙️  Creating development configuration...');
const devConfig = {
  project: {
    name: 'Qylon',
    version: '1.0.0',
    description: 'AI Automation Platform',
    author: 'KD Squares Development Team',
    architect: 'Bill (siwale)'
  },
  services: {
    'api-gateway': { port: 3000, health: '/health' },
    'user-management': { port: 3001, health: '/health' },
    'client-management': { port: 3002, health: '/health' },
    'meeting-intelligence': { port: 3003, health: '/health' },
    'content-creation': { port: 3004, health: '/health' },
    'workflow-automation': { port: 3005, health: '/health' },
    'integration-management': { port: 3006, health: '/health' },
    'notification-service': { port: 3007, health: '/health' },
    'analytics-reporting': { port: 3008, health: '/health' }
  },
  databases: {
    postgres: { port: 5432, database: 'qylon_dev' },
    redis: { port: 6379 },
    mongodb: { port: 27017, database: 'qylon_analytics' }
  },
  infrastructure: {
    provider: 'DigitalOcean',
    platform: 'App Platform',
    database: 'Supabase',
    monitoring: 'DigitalOcean Monitoring + Supabase Analytics'
  }
};

const configPath = path.join(process.cwd(), 'qylon.config.json');
fs.writeFileSync(configPath, JSON.stringify(devConfig, null, 2));
console.log('   ✅ Development configuration created.');

// Create startup script
const startupScript = `#!/bin/bash
# Qylon Development Startup Script

echo "🚀 Starting Qylon Development Environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it from env.example"
    exit 1
fi

# Start services with Docker Compose
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
curl -f http://localhost:3000/health || echo "❌ API Gateway not ready"
curl -f http://localhost:3001/health || echo "❌ User Management not ready"
curl -f http://localhost:3003/health || echo "❌ Meeting Intelligence not ready"

echo "✅ Qylon development environment is ready!"
echo "📊 API Gateway: http://localhost:3000"
echo "🔧 Health Check: http://localhost:3000/health"
echo "📚 API Documentation: http://localhost:3000/docs"
`;

const startupPath = path.join(process.cwd(), 'start-dev.sh');
fs.writeFileSync(startupPath, startupScript);
fs.chmodSync(startupPath, '755');
console.log('   ✅ Development startup script created.');

// Final instructions
console.log('🎉 Qylon project initialization complete!\n');
console.log('📋 Next steps:');
console.log('   1. Update .env file with your actual credentials');
console.log('   2. Set up Supabase project and get your keys');
console.log('   3. Configure DigitalOcean API token');
console.log('   4. Run: ./start-dev.sh to start development environment');
console.log('   5. Visit: http://localhost:3000/health to verify setup');
console.log('');
console.log('📚 Documentation:');
console.log('   - Architecture: docs/architecture/system-architecture.md');
console.log('   - API Docs: docs/api/');
console.log('   - Database: database/schemas/');
console.log('   - Infrastructure: infrastructure/terraform/');
console.log('');
console.log('👥 Team Responsibilities:');
console.log('   - Bill (Chief Architect): Core architecture, infrastructure, security');
console.log('   - Wilson: User management, client operations, onboarding');
console.log('   - King: Frontend dashboard, meeting intelligence UI');
console.log('   - Ayo: Video platform integrations, real-time communication');
console.log('   - John: CRM integrations, communication platforms, analytics');
console.log('   - Favour: UI/UX design, branding, user experience');
console.log('   - Tekena: Quality assurance, testing, infrastructure support');
console.log('');
console.log('🚀 Happy coding!');
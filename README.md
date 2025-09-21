# Qylon - AI Automation Platform

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](https://github.com/KD-Squares/qylon)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

**Chief Architect:** Bill (siwale)
**Repository:** [https://github.com/KD-Squares/qylon](https://github.com/KD-Squares/qylon)
**Status:** Development Phase 1 - Foundation

## 🎯 Project Overview

Qylon is an advanced AI automation platform that transforms manual business processes into intelligent, self-running systems. This platform captures meeting content, processes it through sophisticated AI workflows, and automatically generates business assets.

### Key Features

- **Meeting Intelligence**: Real-time transcription, speaker diarization, and action item extraction
- **Workflow Automation**: State machine-based workflow execution with compensation logic
- **Security Framework**: Comprehensive authentication, authorization, and API key management
- **Microservices Architecture**: 8 independent services with clear boundaries
- **AI Integration**: OpenAI GPT-4, Anthropic Claude 3, and Recall.ai integration

## 🏗️ Architecture Overview

### Technology Stack

- **Frontend:** React 18.2+ with Next.js 14+ and TypeScript 5.0+
- **Backend:** Node.js 20+ with Express.js and Python 3.11+ with FastAPI
- **Databases:** Supabase PostgreSQL (relational) and MongoDB (analytics)
- **Cloud:** DigitalOcean App Platform with Supabase Backend-as-a-Service
- **AI Services:** OpenAI GPT-4, Anthropic Claude 3, OpenAI Whisper
- **Monitoring:** DigitalOcean Monitoring, Supabase Analytics, and custom dashboards

### Microservices Architecture

```
Frontend (React/Next.js)
    ↓
API Gateway (Port 3000) ← ✅ COMPLETE
    ↓
Microservices Layer:
├── Security Service (3001) ← ✅ COMPLETE
├── User Management (3002) ← 🚧 PENDING (Wilson)
├── Client Management (3003) ← 🚧 PENDING (Wilson)
├── Meeting Intelligence (3004) ← ✅ COMPLETE (Bill)
├── Content Creation (3005) ← 🚧 PENDING (Bill)
├── Workflow Automation (3006) ← ✅ COMPLETE (Bill)
├── Integration Management (3007) ← 🚧 PENDING (Ayo)
├── Notification Service (3008) ← 🚧 PENDING (John)
└── Analytics & Reporting (3009) ← 🚧 PENDING (John)
    ↓
Data Layer:
├── Supabase PostgreSQL ← ✅ SCHEMA COMPLETE
├── MongoDB (Analytics) ← ✅ CONFIGURED
└── Redis Cache ← ✅ CONFIGURED
```

## 🚀 Quick Start

### Prerequisites

Before setting up Qylon locally, ensure you have the following installed:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **Python** >= 3.11 ([Download](https://www.python.org/downloads/))
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** ([Download](https://git-scm.com/downloads))
- **PostgreSQL** >= 15 (for local development)
- **Redis** >= 7 (for caching)
- **MongoDB** >= 6 (for analytics)

### 1. Clone the Repository

```bash
# Clone from your GitHub repository
git clone https://github.com/Siwale/qylon.git
cd qylon

# Or clone from the original repository
git clone https://github.com/KD-Squares/qylon.git
cd qylon
```

### 2. Automated Setup (Recommended)

We provide an automated setup script that handles everything for you:

```bash
# Make the setup script executable
chmod +x scripts/setup-local.sh

# Run the automated setup
./scripts/setup-local.sh
```

This script will:

- ✅ Check all prerequisites
- ✅ Create environment files
- ✅ Set up databases
- ✅ Install all dependencies
- ✅ Configure services
- ✅ Run database migrations
- ✅ Verify port availability

### 3. Manual Setup (Alternative)

If you prefer manual setup or need to customize the configuration:

#### Step 1: Environment Configuration

```bash
# Copy the comprehensive environment file
cp env.local.example .env

# Copy service-specific environment files
cp env.services.example services/api-gateway/.env
cp env.services.example services/user-management/.env
cp env.services.example services/client-management/.env
cp env.services.example services/meeting-intelligence/.env
cp env.services.example services/content-creation/.env
cp env.services.example services/workflow-automation/.env
cp env.services.example services/integration-management/.env
cp env.services.example services/notification-service/.env
cp env.services.example services/analytics-reporting/.env
```

#### Step 2: Configure Environment Variables

Edit `.env` file with your actual configuration values:

```bash
# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
DATABASE_URL=postgresql://postgres:password@localhost:5432/qylon_dev
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# =============================================================================
# AI SERVICES CONFIGURATION
# =============================================================================
OPENAI_API_KEY=sk-your-openai-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
RECALL_AI_API_KEY=your-recall-ai-api-key-here

# =============================================================================
# AUTHENTICATION & SECURITY
# =============================================================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ENCRYPTION_KEY=your-32-character-encryption-key-here

# =============================================================================
# CLOUD STORAGE & CDN
# =============================================================================
DO_SPACES_KEY=your-spaces-access-key
DO_SPACES_SECRET=your-spaces-secret-key
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=qylon-storage

# =============================================================================
# EMAIL & NOTIFICATIONS
# =============================================================================
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
```

#### Step 3: Database Setup

**Option A: Using Docker (Recommended)**

```bash
# Start all required databases
docker-compose up -d postgres redis mongodb

# Wait for databases to be ready
sleep 10

# Create databases
createdb qylon_dev
createdb qylon_test
```

**Option B: Local Installation**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib redis-server mongodb

# macOS
brew install postgresql redis mongodb-community

# Start services
sudo systemctl start postgresql redis mongod  # Linux
brew services start postgresql redis mongodb-community  # macOS
```

#### Step 4: Install Dependencies

```bash
# Install root dependencies
npm install

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install service-specific dependencies
for service in services/*/; do
    if [ -f "$service/package.json" ]; then
        echo "Installing dependencies for $(basename "$service")..."
        cd "$service" && npm install && cd - >/dev/null
    fi
    if [ -f "$service/requirements.txt" ]; then
        echo "Installing Python dependencies for $(basename "$service")..."
        pip install -r "$service/requirements.txt"
    fi
done

deactivate
```

#### Step 5: Database Migrations

```bash
# Activate virtual environment
source venv/bin/activate

# Run database migrations
for migration in database/migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "Running migration: $(basename "$migration")"
        psql -d qylon_dev -f "$migration"
    fi
done

# Seed initial data
for seed in database/seeds/*.sql; do
    if [ -f "$seed" ]; then
        echo "Seeding data: $(basename "$seed")"
        psql -d qylon_dev -f "$seed"
    fi
done

deactivate
```

### 4. Start Development Environment

#### Option A: Automated Service Management

```bash
# Start all services
chmod +x scripts/start-services.sh
./scripts/start-services.sh

# Stop all services
chmod +x scripts/stop-services.sh
./scripts/stop-services.sh
```

#### Option B: Docker Compose (Recommended for Production-like Environment)

```bash
# Build and start all services
docker-compose up --build

# Or start in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f
```

#### Option C: Manual Service Startup

```bash
# Start services individually (in separate terminals)

# Terminal 1: API Gateway
cd services/api-gateway && npm run dev

# Terminal 2: User Management
cd services/user-management && npm run dev

# Terminal 3: Client Management
cd services/client-management && npm run dev

# Terminal 4: Meeting Intelligence
cd services/meeting-intelligence && npm run dev

# Terminal 5: Content Creation
cd services/content-creation && source ../../venv/bin/activate && python src/index.py

# Terminal 6: Workflow Automation
cd services/workflow-automation && npm run dev

# Terminal 7: Integration Management
cd services/integration-management && npm run dev

# Terminal 8: Notification Service
cd services/notification-service && npm run dev

# Terminal 9: Analytics Reporting
cd services/analytics-reporting && npm run dev
```

### 5. Verify Installation

Visit the following endpoints to verify services are running:

- **API Gateway**: http://localhost:3000/health
- **User Management**: http://localhost:3001/health
- **Client Management**: http://localhost:3002/health
- **Meeting Intelligence**: http://localhost:3003/health
- **Content Creation**: http://localhost:3004/health
- **Workflow Automation**: http://localhost:3005/health
- **Integration Management**: http://localhost:3006/health
- **Notification Service**: http://localhost:3007/health
- **Analytics Reporting**: http://localhost:3008/health

### 6. Frontend Setup (When Available)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp env.frontend.example .env.local

# Configure frontend environment variables
# Edit .env.local with your configuration

# Start development server
npm run dev
```

**Frontend Environment Variables:**

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key-here
NEXT_PUBLIC_ZOOM_CLIENT_ID=your-zoom-client-id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🛠️ Development Setup

### Frontend Development

The frontend is built with React 18.2+ and Next.js 14+. To set up the frontend:

```bash
# Navigate to frontend directory (when created)
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

**Frontend Environment Variables:**

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Backend Services Development

Each microservice can be developed independently:

#### API Gateway (Port 3000)

```bash
cd services/api-gateway
npm install
npm run dev
```

#### Security Service (Port 3001)

```bash
cd services/security
npm install
npm run dev
```

#### Meeting Intelligence Service (Port 3004)

```bash
cd services/meeting-intelligence
npm install
npm run dev
```

#### Workflow Automation Service (Port 3006)

```bash
cd services/workflow-automation
npm install
npm run dev
```

### Database Development

#### Running Migrations

```bash
# Run all migrations
npm run db:migrate

# Create new migration
npm run db:create-migration <migration-name>

# Rollback migration
npm run db:rollback
```

#### Database Seeding

```bash
# Seed initial data
npm run db:seed

# Reset database
npm run db:reset
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### Service-Specific Testing

```bash
# Test individual services
cd services/security && npm test
cd services/meeting-intelligence && npm test
cd services/workflow-automation && npm test
```

## 🐳 Docker Development

### Building Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build api-gateway
```

### Running with Docker

```bash
# Start all services
docker-compose up

# Start specific services
docker-compose up api-gateway security

# View logs
docker-compose logs -f api-gateway
```

### Docker Commands

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Rebuild and restart
docker-compose up --build --force-recreate
```

## 🔧 Available Scripts

### Root Level Scripts

```bash
# Development
npm run dev                    # Start all services in development mode
npm run dev:api-gateway       # Start API Gateway only
npm run dev:security          # Start Security Service only
npm run dev:meeting-intelligence # Start Meeting Intelligence only
npm run dev:workflow-automation # Start Workflow Automation only

# Building
npm run build                 # Build all services
npm run build:api-gateway     # Build API Gateway
npm run build:security        # Build Security Service
npm run build:meeting-intelligence # Build Meeting Intelligence
npm run build:workflow-automation # Build Workflow Automation

# Testing
npm test                      # Run all tests
npm run test:unit            # Run unit tests
npm run test:integration     # Run integration tests
npm run test:e2e             # Run E2E tests

# Database
npm run db:migrate           # Run database migrations
npm run db:seed              # Seed database with initial data
npm run db:reset             # Reset database

# Docker
npm run docker:build         # Build Docker images
npm run docker:up            # Start Docker containers
npm run docker:down          # Stop Docker containers
npm run docker:logs          # View Docker logs

# Code Quality
npm run lint                 # Run ESLint
npm run lint:fix             # Fix ESLint issues
npm run format               # Format code with Prettier
```

## 📁 Project Structure

```
qylon/
├── services/                    # Microservices
│   ├── api-gateway/            # API Gateway (Port 3000)
│   ├── security/               # Security Service (Port 3001)
│   ├── user-management/        # User Management (Port 3002)
│   ├── client-management/      # Client Management (Port 3003)
│   ├── meeting-intelligence/   # Meeting Intelligence (Port 3004)
│   ├── content-creation/       # Content Creation (Port 3005)
│   ├── workflow-automation/    # Workflow Automation (Port 3006)
│   ├── integration-management/ # Integration Management (Port 3007)
│   ├── notification-service/   # Notification Service (Port 3008)
│   └── analytics-reporting/    # Analytics & Reporting (Port 3009)
├── database/                   # Database files
│   ├── migrations/            # Database migrations
│   ├── schemas/               # Database schemas
│   └── seeds/                 # Seed data
├── infrastructure/            # Infrastructure as Code
│   ├── terraform/             # Terraform configurations
│   └── docker/                # Docker configurations
├── docs/                      # Documentation
├── tests/                     # Test files
├── scripts/                   # Utility scripts
├── docker-compose.yml         # Docker Compose configuration
├── package.json               # Root package.json
└── README.md                  # This file
```

## 🔐 Security Configuration

### API Key Management

The Security Service provides comprehensive API key management:

```bash
# Create API key
curl -X POST http://localhost:3001/api-keys \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "My API Key", "permissions": ["read", "write"]}'

# List API keys
curl -X GET http://localhost:3001/api-keys \
  -H "Authorization: Bearer <jwt-token>"

# Validate API key
curl -X POST http://localhost:3001/api-keys/validate \
  -H "Content-Type: application/json" \
  -d '{"api_key": "your-api-key"}'
```

### Row Level Security (RLS)

All database tables have RLS policies enabled. Users can only access data they're authorized to see.

## 🤝 Team Development

### Team Responsibilities

- **Bill (Chief Architect)**: Security Framework, Meeting Intelligence, Workflow Automation
- **Wilson**: User Management, Client Management
- **King**: Frontend Dashboard and UI Components
- **Ayo**: Integration Management, Video Platform Integrations
- **John**: Notification Service, Analytics & Reporting
- **Favour**: UI/UX Design and User Experience
- **Tekena**: Quality Assurance and Testing Infrastructure

### Development Workflow

1. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
2. **Make Changes**: Follow the coding standards in `.cursorrules`
3. **Test Changes**: Run tests and ensure all services build
4. **Commit Changes**: Use conventional commit format
5. **Create Pull Request**: Submit PR for code review
6. **Merge to Main**: After approval, merge to main branch

### Code Standards

- Follow TypeScript best practices
- Use proper error handling and logging
- Write comprehensive tests
- Follow the microservice boundaries
- Use proper authentication and authorization
- Implement proper input validation

## 🚀 Deployment

### Staging Deployment

```bash
# Deploy to staging
npm run deploy:staging
```

### Production Deployment

```bash
# Deploy to production
npm run deploy:production
```

### Infrastructure Management

```bash
# Plan infrastructure changes
npm run infrastructure:plan

# Apply infrastructure changes
npm run infrastructure:apply

# Destroy infrastructure (WARNING: This will delete all resources)
npm run infrastructure:destroy
```

## 📊 Monitoring and Logging

### Health Checks

All services provide health check endpoints:

- **API Gateway**: `GET /health`
- **Security Service**: `GET /health`
- **Meeting Intelligence**: `GET /health`
- **Workflow Automation**: `GET /health`

### Logging

All services use structured logging with Winston. Logs are available in:

- **Development**: Console output
- **Docker**: `docker-compose logs -f <service-name>`
- **Production**: Centralized logging system

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use

**Problem**: Service fails to start because port is already in use.

**Solution**:

```bash
# Find process using port
lsof -i :3000

# Kill process by PID
kill -9 <PID>

# Or kill all processes on a port
sudo fuser -k 3000/tcp

# Check all Qylon ports
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008; do
    echo "Port $port:"
    lsof -i :$port || echo "  Available"
done
```

#### 2. Database Connection Issues

**Problem**: Services can't connect to databases.

**Solution**:

```bash
# Check if PostgreSQL is running
docker-compose ps postgres
# OR
sudo systemctl status postgresql

# Check PostgreSQL connection
psql -h localhost -U postgres -d qylon_dev -c "SELECT 1;"

# Restart database
docker-compose restart postgres
# OR
sudo systemctl restart postgresql

# Check Redis connection
redis-cli ping

# Check MongoDB connection
mongosh --eval "db.runCommand('ping')"
```

#### 3. Service Not Starting

**Problem**: Individual services fail to start.

**Solution**:

```bash
# Check service logs
docker-compose logs <service-name>

# Check local service logs
cd services/<service-name>
npm run dev  # Check for error messages

# Rebuild service
docker-compose build <service-name>

# Check environment variables
cd services/<service-name>
cat .env  # Verify configuration
```

#### 4. Python Virtual Environment Issues

**Problem**: Python services fail to start or import errors.

**Solution**:

```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# Install service-specific dependencies
for service in services/*/; do
    if [ -f "$service/requirements.txt" ]; then
        pip install -r "$service/requirements.txt"
    fi
done

# Check Python path
echo $PYTHONPATH
```

#### 5. Node.js Dependency Issues

**Problem**: Node.js services fail to start or module not found errors.

**Solution**:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For individual services
cd services/<service-name>
rm -rf node_modules package-lock.json
npm install
```

#### 6. Environment Variable Issues

**Problem**: Services can't read environment variables.

**Solution**:

```bash
# Check if .env file exists
ls -la .env

# Check environment variable loading
cd services/<service-name>
cat .env | grep -v '^#' | head -5

# Test environment variable
echo $DATABASE_URL

# Reload environment
source .env
```

#### 7. Database Migration Issues

**Problem**: Database migrations fail or tables don't exist.

**Solution**:

```bash
# Check database connection
psql -d qylon_dev -c "\dt"

# Run migrations manually
source venv/bin/activate
for migration in database/migrations/*.sql; do
    echo "Running: $migration"
    psql -d qylon_dev -f "$migration"
done

# Reset database
dropdb qylon_dev
createdb qylon_dev
# Then run migrations again
```

#### 8. Docker Issues

**Problem**: Docker containers fail to start or build.

**Solution**:

```bash
# Check Docker status
docker --version
docker-compose --version

# Clean up Docker
docker system prune -a

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up

# Check container logs
docker-compose logs <service-name>
```

#### 9. Permission Issues

**Problem**: Scripts are not executable or permission denied.

**Solution**:

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Fix file permissions
sudo chown -R $USER:$USER .

# Check script permissions
ls -la scripts/
```

#### 10. Network Connectivity Issues

**Problem**: Services can't communicate with each other.

**Solution**:

```bash
# Check if services are listening
netstat -tlnp | grep :300

# Test service connectivity
curl http://localhost:3000/health
curl http://localhost:3001/health

# Check firewall
sudo ufw status
```

### Debugging Commands

#### Service Health Checks

```bash
# Check all service health endpoints
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008; do
    echo "Testing port $port:"
    curl -s http://localhost:$port/health || echo "  Service not responding"
done
```

#### Database Status

```bash
# Check all database connections
echo "PostgreSQL:"
psql -d qylon_dev -c "SELECT version();" 2>/dev/null || echo "  Not connected"

echo "Redis:"
redis-cli ping 2>/dev/null || echo "  Not connected"

echo "MongoDB:"
mongosh --eval "db.runCommand('ping')" 2>/dev/null || echo "  Not connected"
```

#### Process Monitoring

```bash
# Monitor all Qylon processes
ps aux | grep -E "(node|python)" | grep -v grep

# Monitor port usage
lsof -i :3000-3008
```

#### Log Analysis

```bash
# View recent logs
tail -f logs/*.log

# Search for errors
grep -r "ERROR" logs/
grep -r "error" services/*/logs/
```

### Performance Issues

#### High Memory Usage

```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head -10

# Check Node.js memory
node --max-old-space-size=4096 services/api-gateway/src/index.js
```

#### Slow Database Queries

```bash
# Enable PostgreSQL query logging
echo "log_statement = 'all'" >> /etc/postgresql/*/main/postgresql.conf
sudo systemctl restart postgresql

# Monitor slow queries
tail -f /var/log/postgresql/postgresql-*.log
```

### Getting Help

1. **Check the Issues Page**: [GitHub Issues](https://github.com/Siwale/qylon/issues)
2. **Review Documentation**: Check the `docs/` directory for detailed guides
3. **Run Diagnostic Script**: `./scripts/diagnose.sh` (when available)
4. **Contact the Team**: Reach out to the development team
5. **Check Logs**: Always check service logs first for error messages

### Emergency Reset

If everything is broken and you need to start fresh:

```bash
# Stop all services
./scripts/stop-services.sh

# Clean up Docker
docker-compose down -v
docker system prune -a

# Reset databases
dropdb qylon_dev qylon_test 2>/dev/null || true
createdb qylon_dev
createdb qylon_test

# Clean dependencies
rm -rf node_modules package-lock.json
rm -rf venv
rm -rf services/*/node_modules
rm -rf services/*/package-lock.json

# Reinstall everything
./scripts/setup-local.sh
```

## 📚 Additional Resources

- [System Architecture Documentation](docs/architecture/)
- [API Documentation](docs/api/)
- [Database Schema](database/schemas/)
- [Infrastructure Guide](infrastructure/)
- [Development Guide](AI_DEVELOPMENT_GUIDE.md)
- [Cursor Rules](.cursorrules)

## 📄 License

This project is proprietary software owned by KD Squares. All rights reserved.

## 🤝 Contributing

This is a private project. Only authorized team members can contribute. Please follow the development workflow and coding standards outlined in this README and the `.cursorrules` file.

---

**Ready to build the future of AI automation? Let's get started! 🚀**

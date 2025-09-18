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

### 1. Clone the Repository

```bash
git clone https://github.com/KD-Squares/qylon.git
cd qylon
```

### 2. Environment Setup

#### Create Environment Files

```bash
# Copy the example environment file
cp env.example .env

# Copy service-specific environment files
cp services/api-gateway/.env.example services/api-gateway/.env
cp services/security/.env.example services/security/.env
cp services/meeting-intelligence/.env.example services/meeting-intelligence/.env
cp services/workflow-automation/.env.example services/workflow-automation/.env
```

#### Configure Environment Variables

Edit `.env` file with your configuration:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/qylon_dev
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Services
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
RECALL_AI_API_KEY=your-recall-ai-api-key

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Redis Configuration
REDIS_URL=redis://localhost:6379
```

### 3. Database Setup

#### Option A: Local PostgreSQL (Recommended for Development)

```bash
# Start PostgreSQL and Redis using Docker
docker-compose up -d postgres redis mongodb

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

#### Option B: Portable Supabase Setup (For Testing)

For a complete local Supabase setup, you can use Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase project
supabase init

# Start local Supabase stack
supabase start

# This will start:
# - PostgreSQL database
# - Supabase Studio (dashboard)
# - Auth service
# - Storage service
# - Edge Functions
```

The local Supabase will be available at:

- **API URL**: `http://localhost:54321`
- **Studio**: `http://localhost:54323`
- **Database**: `postgresql://postgres:postgres@localhost:54322/postgres`

### 4. Install Dependencies

```bash
# Install root dependencies
npm install

# Install service dependencies
npm run install:all
```

### 5. Start Development Environment

#### Option A: Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Or start in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f
```

#### Option B: Local Development

```bash
# Start all services locally
npm run dev

# Or start individual services
npm run dev:api-gateway
npm run dev:security
npm run dev:meeting-intelligence
npm run dev:workflow-automation
```

### 6. Verify Installation

Visit the following endpoints to verify services are running:

- **API Gateway**: http://localhost:3000/health
- **Security Service**: http://localhost:3001/health
- **Meeting Intelligence**: http://localhost:3004/health
- **Workflow Automation**: http://localhost:3006/health

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

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart database
docker-compose restart postgres
```

#### Service Not Starting

```bash
# Check service logs
docker-compose logs <service-name>

# Rebuild service
docker-compose build <service-name>
```

### Getting Help

1. Check the [Issues](https://github.com/KD-Squares/qylon/issues) page
2. Review the documentation in the `docs/` directory
3. Contact the development team

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

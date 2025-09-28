# Qylon - AI Automation Platform

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](https://github.com/KD-Squares/qylon)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

**Chief Architect:** Bill (siwale)
**Repository:** [https://github.com/KD-Squares/KDS-Development](https://github.com/KD-Squares/KDS-Development)
**Status:** Development Phase 1 - Foundation

## 🎯 Project Overview

Qylon is an advanced AI automation platform that transforms manual business processes into intelligent, self-running systems. This platform captures meeting content, processes it through sophisticated AI workflows, and automatically generates business assets.

### Key Features

- **Meeting Intelligence**: Real-time transcription, speaker diarization, and action item extraction
- **Workflow Automation**: State machine-based workflow execution with compensation logic
- **Security Framework**: Comprehensive authentication, authorization, and API key management
- **Microservices Architecture**: 7 core services with clear boundaries
- **AI Integration**: OpenAI GPT-4, Anthropic Claude 3, and Recall.ai integration
- **Event Sourcing**: Distributed event handling and saga pattern implementation
- **Infrastructure Monitoring**: Comprehensive system health and performance monitoring

## 🏗️ Architecture Overview

### Technology Stack

- **Frontend:** React 18.3+ with Vite 5.4+ and TypeScript 5.5+ (Port 3002)
- **Backend:** Node.js 20+ with Express.js and Python 3.11+ with FastAPI
- **Databases:** Supabase PostgreSQL (relational) and MongoDB (analytics)
- **Cloud:** DigitalOcean App Platform with Supabase Backend-as-a-Service
- **AI Services:** OpenAI GPT-4, Anthropic Claude 3, OpenAI Whisper
- **Monitoring:** DigitalOcean Monitoring, Supabase Analytics, and custom dashboards

### Microservices Architecture

```
Frontend (React/Vite) ← ✅ COMPLETE (Port 3002)
    ↓
API Gateway (Port 3000) ← ✅ COMPLETE
    ↓
Microservices Layer:
├── Security Service (Port 3001) ← ✅ COMPLETE
├── Meeting Intelligence (Port 3003) ← ✅ COMPLETE (Bill)
├── Content Creation (Port 3004) ← ✅ COMPLETE (Bill)
├── Workflow Automation (Port 3005) ← ✅ COMPLETE (Bill)
├── Event Sourcing (Port 3006) ← ✅ COMPLETE (Bill)
└── Infrastructure Monitoring (Port 3007) ← ✅ COMPLETE (Bill)
    ↓
Data Layer:
├── Supabase PostgreSQL ← ✅ SCHEMA COMPLETE
├── MongoDB (Analytics) ← ✅ CONFIGURED
└── Redis Cache ← ✅ CONFIGURED
```

### Service Status

| Service                   | Port | Status      | Owner | Description                             |
| ------------------------- | ---- | ----------- | ----- | --------------------------------------- |
| Frontend                  | 3002 | ✅ Complete | King  | React-based user interface              |
| API Gateway               | 3000 | ✅ Complete | Bill  | Routes requests to microservices        |
| Security                  | 3001 | ✅ Complete | Bill  | Authentication, authorization, API keys |
| Meeting Intelligence      | 3003 | ✅ Complete | Bill  | AI-powered meeting analysis             |
| Content Creation          | 3004 | ✅ Complete | Bill  | AI content generation                   |
| Workflow Automation       | 3005 | ✅ Complete | Bill  | Business process automation             |
| Event Sourcing            | 3006 | ✅ Complete | Bill  | Event handling and sagas                |
| Infrastructure Monitoring | 3007 | ✅ Complete | Bill  | System health monitoring                |

### Planned Services (Future Development)

| Service                | Port | Status     | Owner  | Description                         |
| ---------------------- | ---- | ---------- | ------ | ----------------------------------- |
| User Management        | 3002 | 🚧 Planned | Wilson | User registration and management    |
| Client Management      | 3008 | 🚧 Planned | Wilson | Client onboarding and management    |
| Integration Management | 3009 | 🚧 Planned | Ayo    | Third-party integrations            |
| Notification Service   | 3010 | 🚧 Planned | John   | Email, SMS, push notifications      |
| Analytics & Reporting  | 3011 | 🚧 Planned | John   | Business intelligence and reporting |

## 🚀 Quick Start

### 📋 Prerequisites

Before setting up Qylon locally, ensure you have the following installed on your platform:

#### 🖥️ Platform-Specific Installation

##### 🐧 Linux (Ubuntu/Debian)

```bash
# Update package manager
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource repository for latest LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python and pip
sudo apt install -y python3 python3-pip python3-venv python3-dev

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Install Git and other dependencies
sudo apt install -y git build-essential

# Install PostgreSQL client (optional, for direct database access)
sudo apt install -y postgresql-client

# Logout and login again to apply Docker group changes
# Or run: newgrp docker
```

##### 🪟 Windows

**Option 1: Using Chocolatey (Recommended)**

```powershell
# Install Chocolatey (run as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install dependencies
choco install nodejs python docker-desktop git -y

# Enable WSL2 (required for Docker Desktop)
wsl --install
```

**Option 2: Manual Installation**

1. **Node.js**: Download from [nodejs.org](https://nodejs.org/) (LTS version)
2. **Python**: Download from [python.org](https://python.org/) (3.11+)
3. **Docker Desktop**: Download from [docker.com](https://docker.com/)
4. **Git**: Download from [git-scm.com](https://git-scm.com/)

**Windows-specific setup:**

```powershell
# Set execution policy for PowerShell scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verify installations
node --version
python --version
docker --version
git --version
```

##### 🍎 macOS

**Option 1: Using Homebrew (Recommended)**

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node python@3.11 docker docker-compose git

# Start Docker Desktop
open /Applications/Docker.app
```

**Option 2: Manual Installation**

1. **Node.js**: Download from [nodejs.org](https://nodejs.org/)
2. **Python**: Download from [python.org](https://python.org/) or use `brew install python@3.11`
3. **Docker Desktop**: Download from [docker.com](https://docker.com/)
4. **Git**: Usually pre-installed, or download from [git-scm.com](https://git-scm.com/)

**macOS-specific setup:**

```bash
# Verify installations
node --version
python3 --version
docker --version
git --version

# If Python is not found, create symlink
sudo ln -s /usr/bin/python3 /usr/local/bin/python
```

#### 🔧 Minimum Requirements

- **Node.js** >= 20.0.0
- **Python** >= 3.11
- **Docker** & **Docker Compose**
- **Git**
- **8GB RAM** (recommended)
- **10GB free disk space**

### 📥 Clone the Repository

```bash
# Clone from the official repository
git clone https://github.com/KD-Squares/qylon.git
cd qylon
```

### 🤖 Automated Setup (Recommended)

We provide platform-specific automated setup scripts:

#### Linux/macOS

```bash
# Make the setup script executable
chmod +x scripts/setup-local.sh

# Run the automated setup
./scripts/setup-local.sh
```

#### Windows (PowerShell)

```powershell
# Set execution policy (if not already set)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run the automated setup
.\scripts\setup-local.ps1
```

The automated setup script will:

- ✅ Check all prerequisites
- ✅ Create environment files
- ✅ Set up databases
- ✅ Install all dependencies
- ✅ Configure services
- ✅ Run database migrations
- ✅ Verify port availability
- ✅ Start services

**Note**: If the automated setup fails, follow the manual setup steps below.

### 🔧 Manual Setup (Alternative)

If you prefer manual setup or need to customize the configuration:

#### Step 1: Environment Configuration

**Linux/macOS:**

```bash
# Copy the comprehensive environment file
cp env.local.example .env

# Copy service-specific environment files for existing services
cp env.services.example services/api-gateway/.env
cp env.services.example services/security/.env
cp env.services.example services/meeting-intelligence/.env
cp env.services.example services/content-creation/.env
cp env.services.example services/workflow-automation/.env
cp env.services.example services/event-sourcing/.env
cp env.services.example services/infrastructure-monitoring/.env
```

**Windows:**

```powershell
# Copy the comprehensive environment file
Copy-Item env.local.example .env

# Copy service-specific environment files for existing services
Copy-Item env.services.example services\api-gateway\.env
Copy-Item env.services.example services\security\.env
Copy-Item env.services.example services\meeting-intelligence\.env
Copy-Item env.services.example services\content-creation\.env
Copy-Item env.services.example services\workflow-automation\.env
Copy-Item env.services.example services\event-sourcing\.env
Copy-Item env.services.example services\infrastructure-monitoring\.env
```

#### Step 2: Install Dependencies

**Root Dependencies:**

```bash
# Linux/macOS/Windows
npm install
```

**Service-Specific Dependencies:**

```bash
# API Gateway
cd services/api-gateway && npm install && cd ../..

# Security Service
cd services/security && npm install && cd ../..

# Meeting Intelligence
cd services/meeting-intelligence && npm install && cd ../..

# Content Creation
cd services/content-creation && npm install && cd ../..

# Workflow Automation
cd services/workflow-automation && npm install && cd ../..

# Event Sourcing
cd services/event-sourcing && npm install && cd ../..

# Infrastructure Monitoring
cd services/infrastructure-monitoring && npm install && cd ../..
```

#### Step 3: Set Up Python Environment

**Linux/macOS:**

```bash
# Create virtual environment
python3 -m venv test_env
source test_env/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

**Windows:**

```powershell
# Create virtual environment
python -m venv test_env
test_env\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

#### Step 4: Start Databases

```bash
# Start all database services
docker-compose up -d

# Verify containers are running
docker ps
```

#### Step 5: Run Database Migrations

```bash
# PostgreSQL migrations
docker exec -i qylon-postgres psql -U postgres -d qylon_dev < database/migrations/001_initial_schema.sql
docker exec -i qylon-postgres psql -U postgres -d qylon_dev < database/migrations/002_rls_policies.sql
docker exec -i qylon-postgres psql -U postgres -d qylon_dev < database/migrations/003_api_keys_table.sql
docker exec -i qylon-postgres psql -U postgres -d qylon_dev < database/migrations/004_meeting_intelligence_schema.sql
docker exec -i qylon-postgres psql -U postgres -d qylon_dev < database/migrations/005_meeting_intelligence_rls.sql
```

#### Step 6: Start Services

```bash
# Start all services
npm run dev

# Or start individual services
npm run dev:api-gateway
npm run dev:security
npm run dev:meeting-intelligence
npm run dev:content-creation
npm run dev:workflow-automation
npm run dev:event-sourcing
npm run dev:infrastructure-monitoring
```

#### Step 7: Configure Environment Variables

**IMPORTANT**: You must configure these environment variables before starting the services.

Edit `.env` file with your actual configuration values:

```bash
# =============================================================================
# MINIMUM REQUIRED CONFIGURATION FOR LOCAL DEVELOPMENT
# =============================================================================

# Database Configuration (Required)
DATABASE_URL=postgresql://postgres:password@localhost:5432/qylon_dev
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# AI Services Configuration (Required for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
RECALL_AI_API_KEY=your-recall-ai-api-key-here

# Authentication & Security (Required)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Redis Configuration (Required)
REDIS_URL=redis://localhost:6379

# =============================================================================
# OPTIONAL CONFIGURATION (Can be left as defaults for local development)
# =============================================================================

# Cloud Storage & CDN (Optional - for file uploads)
DO_SPACES_KEY=your-spaces-access-key
DO_SPACES_SECRET=your-spaces-secret-key
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=qylon-storage

# Email & Notifications (Optional - for notifications)
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
```

**Quick Start Configuration**: For immediate local development, you only need to set:

1. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (get from Supabase dashboard)
2. `OPENAI_API_KEY` (get from OpenAI dashboard)
3. `JWT_SECRET` (generate a random string)
4. `ENCRYPTION_KEY` (generate a 32-character random string)

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

# Terminal 2: Security Service
cd services/security && npm run dev

# Terminal 3: Meeting Intelligence
cd services/meeting-intelligence && npm run dev

# Terminal 4: Content Creation
cd services/content-creation && source ../../venv/bin/activate && python src/index.py

# Terminal 5: Workflow Automation
cd services/workflow-automation && npm run dev

# Terminal 6: Event Sourcing
cd services/event-sourcing && npm run dev

# Terminal 7: Infrastructure Monitoring
cd services/infrastructure-monitoring && npm run dev
```

### 5. Verify Installation

Visit the following endpoints to verify services are running:

- **Frontend**: http://localhost:3002
- **API Gateway**: http://localhost:3000/health
- **Security Service**: http://localhost:3001/health
- **Meeting Intelligence**: http://localhost:3003/health
- **Content Creation**: http://localhost:3004/health
- **Workflow Automation**: http://localhost:3005/health
- **Event Sourcing**: http://localhost:3006/health
- **Infrastructure Monitoring**: http://localhost:3007/health

You can also run the health check script:

```bash
# Check all service health endpoints
npm run health:check
```

### 6. Frontend Setup

The Qylon frontend is a modern React application built with TypeScript, Vite, and Tailwind CSS. It provides the user interface for the Qylon AI automation platform.

#### 🚀 Quick Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local

# Edit .env.local with your configuration (see below)
# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3002`

#### 📋 Frontend Prerequisites

- **Node.js** >= 20.0.0
- **npm** or **yarn**
- **Git** for version control
- **IDE** with TypeScript support (VS Code recommended)

#### 🔧 Frontend Environment Configuration

**Required Environment Variables:**

```bash
# .env.local - MINIMUM REQUIRED CONFIGURATION
VITE_API_BASE_URL=http://localhost:3000
VITE_API_GATEWAY_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

**Optional Environment Variables:**

```bash
# .env.local - OPTIONAL CONFIGURATION
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_ZOOM_CLIENT_ID=your-zoom-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_DEV_TOOLS=true
```

#### 🪟 Windows Developer Setup

For Windows developers, we provide detailed setup instructions:

```powershell
# Install Chocolatey (run as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install required software
choco install nodejs python git vscode -y

# Verify installations
node --version    # Should be >= 20.0.0
python --version  # Should be >= 3.11
git --version
```

**Having Windows setup issues?** See our comprehensive troubleshooting guide:
- **`WINDOWS_SETUP_TROUBLESHOOTING.md`** - Quick fixes for common Windows issues

#### 📚 Comprehensive Frontend Guides

For detailed frontend setup instructions, including Windows-specific troubleshooting, see:

- **`FRONTEND_DEVELOPER_SETUP.md`** - Complete setup guide for frontend developers
- **`FRONTEND_SETUP_SUMMARY.md`** - Quick reference and troubleshooting guide
- **`frontend/README.md`** - Frontend-specific documentation
- **`frontend/DEVELOPMENT.md`** - Development workflow and best practices

#### 🚀 Automated Setup Scripts

We provide automated setup scripts for all platforms:

**Windows:**

```powershell
# Run from Qylon root directory
.\scripts\setup-frontend-windows.ps1
```

**Linux/macOS:**

```bash
# Run from Qylon root directory
./scripts/setup-frontend.sh
```

**Verification:**

```bash
# Verify your setup is working
./scripts/verify-frontend-setup.sh
```

#### 🏗️ Frontend Architecture

The frontend follows a modern, scalable architecture:

```
frontend/
├── src/
│   ├── components/          # React components + tests
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service layer
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Utility functions + tests
│   ├── test/               # Test setup and utilities
│   └── contexts/           # React contexts
├── vitest.config.ts        # Testing configuration
├── DEVELOPMENT.md          # Comprehensive dev guide
└── TEAM_ONBOARDING.md      # Team onboarding guide
```

#### 🎯 Frontend Features

- **Modern React 18.3+** with hooks and concurrent features
- **TypeScript 5.5+** for type safety
- **Vite 5.4+** for fast development and building
- **Tailwind CSS 3.4+** for utility-first styling
- **React Router 7.9+** for client-side routing
- **Comprehensive Testing** with Vitest and React Testing Library
- **Error Boundaries** for graceful error handling
- **API Integration** with proper service layer
- **Theme Support** with light/dark mode
- **Responsive Design** mobile-first approach

#### 🧪 Frontend Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run linting
npm run lint
```

#### 📚 Frontend Documentation

- **`frontend/README.md`** - Basic setup and overview
- **`frontend/DEVELOPMENT.md`** - Comprehensive development guide
- **`frontend/TEAM_ONBOARDING.md`** - Team onboarding guide for new developers

#### 🔧 Frontend Development Workflow

1. **Start the backend services** (API Gateway on port 3000)
2. **Start the frontend development server:**
   ```bash
   cd frontend && npm run dev
   ```
3. **Make changes** to components in `src/components/`
4. **Write tests** for new features
5. **Test changes** in the browser at `http://localhost:3002`

#### 🎨 Frontend Development Standards

- **TypeScript**: Always use TypeScript interfaces and strict mode
- **Components**: Use functional components with hooks
- **Testing**: Write tests for all new components
- **Styling**: Use Tailwind CSS utility classes
- **Error Handling**: Implement proper error boundaries
- **Accessibility**: Follow WCAG 2.1 guidelines

# Edit .env.local with your configuration

# Start development server

npm run dev

````

The frontend will be available at `http://localhost:3002`

**Frontend Environment Variables:**

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000
VITE_API_GATEWAY_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_ZOOM_CLIENT_ID=your-zoom-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id
````

## 🛠️ Development Setup

### Frontend Development

The frontend is built with React 18.3+ and Vite 5.4+. To set up the frontend:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3002`

**Frontend Environment Variables:**

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000
VITE_API_GATEWAY_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Frontend Features:**

- Landing page with marketing content
- Admin dashboard for system management
- Main application UI for users
- Product demonstration interface
- Dark/light theme support
- Responsive design with Tailwind CSS

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

#### Meeting Intelligence Service (Port 3003)

```bash
cd services/meeting-intelligence
npm install
npm run dev
```

#### Content Creation Service (Port 3004)

```bash
cd services/content-creation
source ../../venv/bin/activate
pip install -r requirements.txt
python src/index.py
```

#### Workflow Automation Service (Port 3005)

```bash
cd services/workflow-automation
npm install
npm run dev
```

#### Event Sourcing Service (Port 3006)

```bash
cd services/event-sourcing
npm install
npm run dev
```

#### Infrastructure Monitoring Service (Port 3007)

```bash
cd services/infrastructure-monitoring
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
npm run dev:frontend          # Start Frontend only (Port 3002)
npm run dev:api-gateway       # Start API Gateway only
npm run dev:security          # Start Security Service only
npm run dev:meeting-intelligence # Start Meeting Intelligence only
npm run dev:workflow-automation # Start Workflow Automation only

# Building
npm run build                 # Build all services
npm run build:frontend        # Build Frontend
npm run build:api-gateway     # Build API Gateway
npm run build:security        # Build Security Service
npm run build:meeting-intelligence # Build Meeting Intelligence
npm run build:workflow-automation # Build Workflow Automation

# Testing
npm test                      # Run all tests
npm run test:unit            # Run unit tests
npm run test:integration     # Run integration tests
npm run test:e2e             # Run E2E tests
npm run test:frontend        # Run frontend tests

# Database
npm run db:migrate           # Run database migrations
npm run db:seed              # Seed database with initial data
npm run db:reset             # Reset database

# Docker
npm run docker:build         # Build Docker images
npm run docker:up            # Start Docker containers
npm run docker:down          # Stop Docker containers
npm run docker:logs          # View Docker logs

# Health Checks
npm run health:check         # Check all service health endpoints

# Code Quality
npm run lint                 # Run ESLint
npm run lint:fix             # Fix ESLint issues
npm run format               # Format code with Prettier
```

### Frontend Scripts

```bash
# Navigate to frontend directory first
cd frontend

# Development
npm run dev                  # Start development server (Port 3002)
npm run build               # Build for production
npm run preview             # Preview production build

# Testing
npm run test                # Run tests with Vitest
npm run test:ui             # Run tests with UI

# Code Quality
npm run lint                # Run ESLint
```

## 📁 Project Structure

```
qylon/
├── frontend/                   # React Frontend (Port 3002)
│   ├── src/                   # Source code
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── lib/              # Utility libraries
│   │   └── App.tsx           # Main App component
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── README.md             # Frontend documentation
├── services/                  # Microservices
│   ├── api-gateway/          # API Gateway (Port 3000)
│   ├── security/             # Security Service (Port 3001)
│   ├── meeting-intelligence/ # Meeting Intelligence (Port 3003)
│   ├── content-creation/     # Content Creation (Port 3004)
│   ├── workflow-automation/  # Workflow Automation (Port 3005)
│   ├── event-sourcing/       # Event Sourcing (Port 3006)
│   └── infrastructure-monitoring/ # Infrastructure Monitoring (Port 3007)
├── database/                 # Database files
│   ├── migrations/          # Database migrations
│   ├── schemas/             # Database schemas
│   └── seeds/               # Seed data
├── infrastructure/          # Infrastructure as Code
│   └── terraform/           # Terraform configurations
├── docs/                    # Documentation
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
├── scripts/                 # Utility scripts
│   ├── setup-local.sh       # Local development setup
│   ├── start-services.sh    # Start all services
│   ├── stop-services.sh     # Stop all services
│   └── db-migrate.sh        # Database migration script
├── docker-compose.yml       # Docker Compose configuration
├── package.json             # Root package.json
├── requirements.txt         # Python dependencies
├── env.local.example        # Environment configuration template
├── env.services.example     # Service environment template
└── README.md                # This file
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

#### 🏗️ Backend & Infrastructure Team

- **Bill (Chief Architect)**: Security Framework, Meeting Intelligence, Workflow Automation, System Architecture
- **Wilson**: User Management, Client Management, User Onboarding
- **Ayo**: Integration Management, Video Platform Integrations, Third-party APIs
- **John**: Notification Service, Analytics & Reporting, CRM Integrations

#### 🎨 Frontend & Design Team

- **King**: Frontend Development, React Components, User Interface
- **Favour**: UI/UX Design, User Experience, Design System, Brand Guidelines

#### 🔧 Quality & DevOps Team

- **Tekena**: Quality Assurance, Testing Infrastructure, CI/CD Pipeline, Infrastructure Support

### 🚀 Frontend Team Onboarding

The frontend team can get started immediately with the enhanced frontend setup:

#### Quick Start for Frontend Developers

```bash
# 1. Clone the repository
git clone https://github.com/KD-Squares/KDS-Development.git
cd KDS-Development

# 2. Set up frontend
cd frontend
npm install
cp env.example .env.local

# 3. Start development
npm run dev
```

#### Frontend Team Resources

- **📚 Documentation**: `frontend/README.md` - Basic setup and overview
- **🛠️ Development Guide**: `frontend/DEVELOPMENT.md` - Comprehensive development guide
- **👥 Team Onboarding**: `frontend/TEAM_ONBOARDING.md` - Complete onboarding guide for new developers
- **🧪 Testing**: Full test suite with Vitest and React Testing Library
- **🎨 Design System**: Tailwind CSS with custom components

#### Frontend Development Standards

- **TypeScript**: Strict mode with comprehensive type definitions
- **Testing**: Write tests for all new components and features
- **Components**: Functional components with hooks and proper error handling
- **Styling**: Tailwind CSS utility classes with responsive design
- **Accessibility**: WCAG 2.1 compliant components
- **Performance**: Optimized with Vite and modern React patterns

#### Frontend Team Workflow

1. **Start Backend Services**: Ensure API Gateway (port 3000) is running
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Develop Features**: Create components in `src/components/`
4. **Write Tests**: Add tests in `src/components/__tests__/`
5. **Test Integration**: Verify API integration works correctly
6. **Submit PR**: Follow the standard development workflow

### 🌐 Remote Development Ready

The frontend is now **fully prepared for remote development** with:

#### ✅ Production-Ready Features

- **Complete Testing Framework**: 15+ passing tests with Vitest and React Testing Library
- **Type Safety**: Comprehensive TypeScript coverage with strict mode
- **Error Handling**: Error boundaries and proper API error handling
- **Service Layer**: Clean API integration with proper abstraction
- **Development Tools**: ESLint, Prettier, and development configurations
- **Documentation**: Comprehensive guides for team onboarding

#### ✅ Team Collaboration Features

- **Clear Architecture**: Well-organized code structure with separation of concerns
- **Coding Standards**: Established patterns and conventions
- **Testing Standards**: Test-driven development approach
- **Documentation**: Multiple levels of documentation for different needs
- **Onboarding Guide**: Step-by-step guide for new team members

#### ✅ Ready for Immediate Development

- **Clone and Start**: New developers can start coding in minutes
- **Hot Reload**: Fast development with Vite
- **API Integration**: Ready to connect to backend services
- **Component Library**: Reusable components with proper patterns
- **Responsive Design**: Mobile-first approach with Tailwind CSS

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

- **Frontend**: `GET http://localhost:3002` (Main application)
- **API Gateway**: `GET /health`
- **Security Service**: `GET /health`
- **Meeting Intelligence**: `GET /health`
- **Content Creation**: `GET /health`
- **Workflow Automation**: `GET /health`
- **Event Sourcing**: `GET /health`
- **Infrastructure Monitoring**: `GET /health`

### Logging

All services use structured logging with Winston. Logs are available in:

- **Development**: Console output
- **Docker**: `docker-compose logs -f <service-name>`
- **Production**: Centralized logging system

## 🐛 Troubleshooting

### Quick Setup Verification

Before diving into specific issues, run this quick verification script:

```bash
# Quick system check
echo "=== QYLON SETUP VERIFICATION ==="
echo "Node.js version: $(node --version)"
echo "Python version: $(python3 --version)"
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"
echo ""

echo "=== CHECKING SERVICES ==="
# Check frontend
if curl -s http://localhost:3002 >/dev/null 2>&1; then
    echo "✅ Port 3002: Frontend is running"
else
    echo "❌ Port 3002: Frontend is not responding"
fi

# Check backend services
for port in 3000 3001 3003 3004 3005 3006 3007; do
    if curl -s http://localhost:$port/health >/dev/null 2>&1; then
        echo "✅ Port $port: Service is running"
    else
        echo "❌ Port $port: Service is not responding"
    fi
done
echo ""

echo "=== CHECKING DATABASES ==="
if docker-compose ps postgres | grep -q "Up"; then
    echo "✅ PostgreSQL: Running"
else
    echo "❌ PostgreSQL: Not running"
fi

if docker-compose ps redis | grep -q "Up"; then
    echo "✅ Redis: Running"
else
    echo "❌ Redis: Not running"
fi

if docker-compose ps mongodb | grep -q "Up"; then
    echo "✅ MongoDB: Running"
else
    echo "❌ MongoDB: Not running"
fi
```

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
for port in 3000 3001 3003 3004 3005 3006 3007; do
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

#### 10. Frontend Issues

**Problem**: Frontend not loading or API calls failing.

**Solution**:

```bash
# Check if frontend is running
curl http://localhost:3002

# Check frontend logs
cd frontend
npm run dev  # Check for error messages

# Check environment variables
cat .env.local | grep VITE_

# Rebuild frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 11. Network Connectivity Issues

**Problem**: Services can't communicate with each other.

**Solution**:

```bash
# Check if services are listening
netstat -tlnp | grep :300

# Test service connectivity
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002  # Frontend

# Check firewall
sudo ufw status
```

### Debugging Commands

#### Service Health Checks

```bash
# Check frontend
echo "Testing frontend:"
curl -s http://localhost:3002 || echo "  Frontend not responding"

# Check all service health endpoints
for port in 3000 3001 3003 3004 3005 3006 3007; do
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

# Monitor port usage (including frontend)
lsof -i :3000-3007

# Monitor frontend specifically
lsof -i :3002
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

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 🐧 Linux-Specific Issues

**Docker Permission Denied**

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo (not recommended)
sudo docker-compose up -d
```

**Node.js Version Issues**

```bash
# Install Node Version Manager (NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

**Python Virtual Environment Issues**

```bash
# Install python3-venv if missing
sudo apt install python3-venv

# Create virtual environment with specific Python version
python3.11 -m venv test_env
```

**Port Already in Use**

```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or use different port
export PORT=3001
```

#### 🪟 Windows-Specific Issues

**PowerShell Execution Policy**

```powershell
# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

**Docker Desktop Not Starting**

```powershell
# Enable WSL2
wsl --install
wsl --set-default-version 2

# Restart Docker Desktop
# Check Windows Features: Hyper-V, Windows Subsystem for Linux
```

**Node.js Path Issues**

```powershell
# Add Node.js to PATH
$env:PATH += ";C:\Program Files\nodejs"

# Or reinstall Node.js with "Add to PATH" option
```

**Python Not Found**

```powershell
# Add Python to PATH
$env:PATH += ";C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python311"

# Or use py launcher
py -m venv test_env
py -m pip install -r requirements.txt
```

#### 🍎 macOS-Specific Issues

**Homebrew Installation Issues**

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add to PATH (Apple Silicon)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**Docker Desktop Issues**

```bash
# Start Docker Desktop
open /Applications/Docker.app

# Check Docker status
docker info

# Reset Docker Desktop if needed
# Docker Desktop > Troubleshoot > Reset to factory defaults
```

**Python Version Conflicts**

```bash
# Use specific Python version
python3.11 -m venv test_env
source test_env/bin/activate

# Or use pyenv
brew install pyenv
pyenv install 3.11.0
pyenv local 3.11.0
```

### Service-Specific Issues

#### API Gateway Issues

**TypeScript Path Mapping Errors**

```bash
# Install tsconfig-paths
cd services/api-gateway
npm install --save-dev tsconfig-paths

# Update package.json dev script
# "dev": "nodemon -r tsconfig-paths/register src/index.ts"
```

**Supabase Connection Issues**

```bash
# Check environment variables
cat .env | grep SUPABASE

# Use local Supabase setup
docker-compose -f docker-compose.supabase-local.yml up -d
```

#### Database Issues

**PostgreSQL Connection Failed**

```bash
# Check if container is running
docker ps | grep postgres

# Restart PostgreSQL container
docker restart qylon-postgres

# Check logs
docker logs qylon-postgres
```

**Migration Failures**

```bash
# Connect to database directly
docker exec -it qylon-postgres psql -U postgres -d qylon_dev

# Check if tables exist
\dt

# Run migrations manually
\i database/migrations/001_initial_schema.sql
```

#### Docker Issues

**Container Won't Start**

```bash
# Check Docker daemon
docker info

# Restart Docker service
sudo systemctl restart docker  # Linux
# Or restart Docker Desktop on Windows/macOS

# Clean up containers
docker system prune -f
```

**Port Conflicts**

```bash
# Check what's using ports
netstat -tulpn | grep :3000  # Linux
netstat -an | findstr :3000  # Windows
lsof -i :3000                # macOS

# Stop conflicting services
sudo systemctl stop <service-name>  # Linux
```

### Performance Issues

**High Memory Usage**

```bash
# Check memory usage
docker stats

# Limit container memory
docker run -m 512m <container-name>

# Or in docker-compose.yml
services:
  api-gateway:
    deploy:
      resources:
        limits:
          memory: 512M
```

**Slow Startup**

```bash
# Use Docker BuildKit
export DOCKER_BUILDKIT=1

# Build with cache
docker-compose build --parallel

# Use .dockerignore to exclude unnecessary files
```

### Network Issues

**Services Can't Communicate**

```bash
# Check Docker network
docker network ls
docker network inspect qylon_default

# Restart network
docker-compose down
docker-compose up -d
```

**CORS Issues**

```bash
# Check CORS configuration in services
# Update CORS_ORIGIN in .env files
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Quick Setup Verification

Run this script to verify your setup:

```bash
#!/bin/bash
echo "🔍 Qylon Setup Verification"
echo "=========================="

# Check prerequisites
echo "📋 Prerequisites:"
node --version && echo "✅ Node.js" || echo "❌ Node.js"
python3 --version && echo "✅ Python" || echo "❌ Python"
docker --version && echo "✅ Docker" || echo "❌ Docker"
git --version && echo "✅ Git" || echo "❌ Git"

# Check services
echo ""
echo "🚀 Services:"
curl -s http://localhost:3000/health | jq .status && echo "✅ API Gateway" || echo "❌ API Gateway"
curl -s http://localhost:3001/health | jq .status && echo "✅ Security" || echo "❌ Security"

# Check databases
echo ""
echo "🗄️  Databases:"
docker ps | grep postgres && echo "✅ PostgreSQL" || echo "❌ PostgreSQL"
docker ps | grep redis && echo "✅ Redis" || echo "❌ Redis"
docker ps | grep mongodb && echo "✅ MongoDB" || echo "❌ MongoDB"

echo ""
echo "🎉 Verification complete!"
```

### Getting Help

If you're still experiencing issues:

1. **Check the logs**: `docker logs <container-name>`
2. **Verify environment variables**: `cat .env`
3. **Test individual services**: `npm run dev:api-gateway`
4. **Check port availability**: `netstat -tulpn | grep :3000`
5. **Restart everything**: `docker-compose down && docker-compose up -d`

For additional support, please:

- Check the [GitHub Issues](https://github.com/KD-Squares/qylon/issues)
- Review the [API Documentation](docs/api/)
- Contact the development team

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

## 🎯 Getting Started Checklist

### For New Developers

1. **✅ Prerequisites Installed**
   - Node.js >= 20.0.0
   - Python >= 3.11
   - Docker & Docker Compose
   - Git

2. **✅ Repository Cloned**

   ```bash
   git clone https://github.com/KD-Squares/KDS-Development.git
   cd KDS-Development
   ```

3. **✅ Environment Configured**
   - Copy `env.local.example` to `.env`
   - Set required environment variables (see Step 2 above)

4. **✅ Services Started**

   ```bash
   # Option 1: Automated setup
   chmod +x scripts/setup-local.sh
   ./scripts/setup-local.sh

   # Option 2: Docker Compose
   docker-compose up -d

   # Option 3: Manual startup
   npm run dev
   ```

5. **✅ Verification Complete**
   - Frontend accessible at http://localhost:3002
   - All health endpoints responding
   - Databases running
   - No port conflicts

### Common First-Time Issues

- **Port conflicts**: Use `lsof -i :PORT` to check port usage
- **Missing environment variables**: Ensure `.env` file is properly configured
- **Database connection issues**: Verify Docker containers are running
- **Permission issues**: Make scripts executable with `chmod +x scripts/*.sh`

### Need Help?

1. **Check the troubleshooting section** below for common issues
2. **Run the verification script** to identify problems
3. **Check service logs** with `docker-compose logs -f <service-name>`
4. **Contact the team** for assistance

---

**Ready to build the future of AI automation? Let's get started! 🚀**

# Qylon AI Automation Platform

[![CI/CD Pipeline](https://github.com/KD-Squares/qylon/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/KD-Squares/qylon/actions/workflows/ci-cd.yml)
[![Coverage Status](https://coveralls.io/repos/github/KD-Squares/qylon/badge.svg?branch=main)](https://coveralls.io/github/KD-Squares/qylon?branch=main)

**Chief Architect:** Bill (siwale)
**Repository:** https://github.com/KD-Squares/KDS-Development
**Last Updated:** October 2025

## 🎯 Project Overview

Qylon is an AI automation platform that transforms manual business processes into intelligent, self-running systems. Built with a microservices architecture on DigitalOcean + Supabase, featuring 8 core services with event-driven communication.

## 🏗️ Architecture

### Core Services
- **API Gateway (3000)** - Central routing and authentication
- **Security Service (3001)** - Authentication and authorization
- **Frontend (3002)** - React-based user interface
- **Meeting Intelligence (3003)** - AI-powered meeting analysis
- **Content Creation (3004)** - Automated content generation (Python)
- **Workflow Automation (3005)** - Business process automation
- **Integration Management (3006)** - Third-party integrations
- **Notification Service (3007)** - Multi-channel notifications
- **Analytics & Reporting (3008)** - Business intelligence

### Technology Stack
- **Backend:** Node.js 22.x, TypeScript, Express.js
- **Frontend:** React 18, Vite, Tailwind CSS
- **Database:** Supabase PostgreSQL with Row Level Security, MongoDB for analytics
- **Cache:** Redis 7
- **AI/ML:** OpenAI GPT-4, Recall.ai, Whisper
- **Infrastructure:** DigitalOcean App Platform, Docker, Kubernetes
- **Monitoring:** Custom health checks, structured logging
- **Testing:** Jest, Supertest, Vitest, Cypress, K6 (performance)
- **CI/CD:** GitHub Actions, Local CI pipeline

## 🚀 Quick Start

### Prerequisites
- **Node.js 22.x** (required by package.json engines)
- **npm >=9.0.0** (required by package.json engines)
- **Git** (for version control)
- **Docker & Docker Compose** (for local development and testing)
- **Python 3.11** (for content-creation service)
- **PostgreSQL 15** (for local database)
- **Redis 7** (for caching and session management)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KD-Squares/qylon.git
   cd qylon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   # Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
   ```

4. **Install all dependencies**
   ```bash
   npm install
   # Install service dependencies
   cd services/api-gateway && npm install && cd ../..
   cd services/meeting-intelligence && npm install && cd ../..
   cd services/workflow-automation && npm install && cd ../..
   cd services/integration-management && npm install && cd ../..
   cd frontend && npm install && cd ../..
   ```

5. **Start local development with Docker**
   ```bash
   # Start all services with Docker Compose
   docker-compose up -d

   # Or start individual services
   npm run start:api-gateway  # Starts API Gateway on port 3000
   ```

6. **Access the application**
   - **Frontend:** http://localhost:3002
   - **API Gateway:** http://localhost:3000
   - **Supabase Studio:** http://localhost:54323 (if using local Supabase)

## 🧪 Local CI/CD Pipeline

### Overview
Our local CI/CD pipeline mimics GitHub Actions to catch issues before pushing to remote, saving CI/CD minutes and ensuring faster feedback.

### Running the Local CI/CD Pipeline

#### Manual Execution
```bash
# Run the complete local CI/CD pipeline
npm run ci:local
```

#### Automatic Execution on PR Events

The local CI/CD pipeline is automatically triggered using Git hooks:

##### 1. Pre-commit Hook (Automatic)
The pre-commit hook automatically runs basic checks before each commit:

```bash
# The hook runs automatically on git commit
git commit -m "your commit message"
```

**What it checks:**
- Branch naming convention validation
- Code formatting (Prettier, Black, isort)
- Basic linting (ESLint, flake8)
- TypeScript compilation
- Unit tests with coverage
- Security scan
- Integration tests (critical subset)

##### 2. Pre-push Hook (Automatic)
The pre-push hook runs the full CI/CD pipeline before pushing:

```bash
# The hook runs automatically on git push
git push origin <branch>
```

**What it checks:**
- Enhanced branch management validation
- Comprehensive code quality checks
- Full test suite execution
- Enhanced security scan (npm audit)
- Build validation
- Performance tests (critical subset)
- Docker build test
- Database migration test
- Health check validation

##### 3. Manual Pre-PR Validation
Before creating a PR, run the full pipeline manually:

```bash
# Run complete validation
npm run ci:local

# If all checks pass, create your PR
git push origin feature/your-feature-branch
```

### Pipeline Stages

The local CI/CD pipeline includes the following stages:

1. **Environment Setup**
   - Node.js version validation (requires 22.x)
   - npm version validation (requires >=9.0.0)
   - Git repository validation

2. **Dependency Installation**
   - Root dependencies (`npm install`)
   - Service-specific dependencies (api-gateway, meeting-intelligence, workflow-automation, integration-management)
   - Frontend dependencies

3. **Code Quality Checks**
   - ESLint linting across all services
   - Prettier formatting validation
   - TypeScript compilation for all services

4. **Testing**
   - Unit tests with coverage (Jest)
   - Integration tests (placeholder scripts)
   - Performance tests (K6, placeholder scripts)
   - End-to-end tests (Cypress, placeholder scripts)

5. **Security**
   - npm audit for vulnerabilities (moderate level)
   - Dependency security scan

6. **Coverage Analysis**
   - Test coverage reports generated in `coverage/` directory
   - Coverage threshold validation (currently set to 1% for development)

### Bypassing Hooks (Emergency Only)

If you need to bypass the hooks in an emergency:

```bash
# Bypass pre-commit hook
git commit --no-verify -m "emergency fix"

# Bypass pre-push hook
git push --no-verify origin <branch>
```

⚠️ **Warning:** Only use `--no-verify` in genuine emergencies. The hooks are there to prevent broken code from reaching the repository.

### Troubleshooting

#### Common Issues

1. **Hook Permission Denied**
   ```bash
   chmod +x .git/hooks/pre-commit
   chmod +x .git/hooks/pre-push
   chmod +x scripts/local-ci.sh
   ```

2. **Node Version Mismatch**
   ```bash
   # The project requires Node.js 22.x (not 20.x)
   # Use Node Version Manager
   nvm install 22
   nvm use 22
   ```

3. **Dependency Issues**
   ```bash
   # Clean install for all services
   rm -rf node_modules package-lock.json
   rm -rf services/*/node_modules services/*/package-lock.json
   rm -rf frontend/node_modules frontend/package-lock.json
   npm install
   ```

4. **Test Failures**
   ```bash
   # Run tests individually
   npm run test:unit
   npm run test:integration
   # Or run specific service tests
   cd services/meeting-intelligence && npm test
   ```

5. **Docker Issues**
   ```bash
   # Restart Docker services
   docker-compose down
   docker-compose up -d
   ```

6. **Environment Variables**
   ```bash
   # Ensure all required environment variables are set
   cp env.example .env
   # Edit .env with your actual values
   ```

#### Getting Help

- Check the [CI/CD Troubleshooting Guide](docs/CI-CD-TROUBLESHOOTING.md)
- Review the [Development Status](DEVELOPMENT_STATUS.md)
- Contact the development team

## 📁 Project Structure

```
qylon/
├── services/                 # Microservices
│   ├── api-gateway/         # Central API gateway
│   ├── meeting-intelligence/ # AI meeting analysis
│   ├── integration-management/ # Third-party integrations
│   └── ...                  # Other services
├── frontend/                # React frontend
├── database/                # Database schemas and migrations
├── docs/                    # Documentation
├── scripts/                 # Automation scripts
├── tests/                   # Test suites
└── infrastructure/          # Terraform configurations
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance

# Run tests for specific services
npm run test:unit:meeting-intelligence
npm run test:unit:integration-management

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

Current test coverage status:
- **Unit Tests:** Meeting Intelligence (137 tests), Integration Management (57 tests)
- **Coverage Threshold:** Currently set to 1% for development (temporarily lowered)
- **Integration Tests:** Placeholder scripts (not yet implemented)
- **E2E Tests:** Placeholder scripts (not yet implemented)
- **Performance Tests:** Placeholder scripts (not yet implemented)

## 🚀 Deployment

### Local Development
```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start individual services
npm run start:api-gateway  # Starts API Gateway on port 3000
```

### Staging Deployment
```bash
# Deploy to DigitalOcean App Platform (staging)
# Requires DO_ACCESS_TOKEN and DO_APP_ID environment variables
npm run deploy:staging
```

### Production Deployment
```bash
# Deploy to DigitalOcean App Platform (production)
# Only triggered from main branch
npm run deploy:production
```

### Build Process
```bash
# Build all services
npm run build

# Build individual services
npm run build:frontend
npm run build:api-gateway
npm run build:meeting-intelligence
npm run build:workflow-automation
npm run build:integration-management
```

See [Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed instructions.

## ⚠️ Current Development Status

### ✅ Completed
- **API Gateway Service** - Complete with authentication and routing
- **Meeting Intelligence Service** - AI-powered meeting analysis with 137 passing tests
- **Integration Management Service** - Third-party integrations with 57 passing tests
- **Local CI/CD Pipeline** - Comprehensive testing and validation
- **Docker Setup** - Multi-service containerization
- **Database Schema** - PostgreSQL with Row Level Security
- **Git Hooks** - Pre-commit and pre-push validation

### 🚧 In Progress
- **Workflow Automation Service** - Business process automation
- **Content Creation Service** - Python-based content generation
- **Notification Service** - Multi-channel notifications
- **Analytics & Reporting Service** - Business intelligence

### 📋 Known Issues
- **Node.js Version Mismatch**: CI shows Node.js 20.x but project requires 22.x
- **Test Coverage**: Coverage thresholds temporarily lowered to 1% for development
- **Integration Tests**: Placeholder scripts (not yet implemented)
- **E2E Tests**: Placeholder scripts (not yet implemented)
- **Performance Tests**: Placeholder scripts (not yet implemented)
- **Security Vulnerability**: 1 moderate severity vulnerability in integration-management service

### 🔧 Required Environment Variables
```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services
OPENAI_API_KEY=your-openai-api-key
RECALL_AI_API_KEY=your-recall-ai-api-key

# Authentication
JWT_SECRET=your-jwt-secret-key

# DigitalOcean (for deployment)
DO_ACCESS_TOKEN=your-digitalocean-token
DO_APP_ID=your-app-id
```

## 📚 Documentation

- [AI Development Guide](AI_DEVELOPMENT_GUIDE.md) - AI tool usage guidelines
- [Technical Design Document](docs/Qylon%20Technical%20Design%20Doc.md)
- [Feature Work Assignment](docs/Feature%20Work%20Assignment%20.md)
- [Development Status](DEVELOPMENT_STATUS.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [CI/CD Troubleshooting](docs/CI-CD-TROUBLESHOOTING.md)
- [Supabase Setup Guide](SUPABASE_SETUP_GUIDE.md)

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run the local CI/CD pipeline**
   ```bash
   npm run ci:local
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Branch Naming Convention
- `feature/JIRA-XXXX-short-description`
- `bugfix/JIRA-XXXX-short-description`
- `hotfix/JIRA-XXXX-short-description`

## 🔒 Security

- All code is scanned for vulnerabilities
- Dependencies are regularly updated
- Secrets are managed through environment variables
- Row Level Security (RLS) is enforced on all database operations

## 📊 Monitoring

- Health checks for all services
- Structured logging with correlation IDs
- Performance monitoring
- Error tracking and alerting

## 🆘 Support

- **Technical Issues:** Create an issue in the repository
- **Security Issues:** Contact the security team directly
- **General Questions:** Check the documentation or contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the KD-Squares team**

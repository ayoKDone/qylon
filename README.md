# 🚀 Qylon AI Automation Platform

[![Coverage Status](https://coveralls.io/repos/github/supabase/cli/badge.svg?branch=main)](https://coveralls.io/github/supabase/cli?branch=main) [![Bitbucket Pipelines](https://img.shields.io/bitbucket/pipelines/supabase-cli/setup-cli/master?style=flat-square&label=Bitbucket%20Canary)](https://bitbucket.org/supabase-cli/setup-cli/pipelines) [![Gitlab Pipeline Status](https://img.shields.io/gitlab/pipeline-status/sweatybridge%2Fsetup-cli?label=Gitlab%20Canary)
](https://gitlab.com/sweatybridge/setup-cli/-/pipelines)

**Qylon** is an AI automation platform that transforms manual business processes into intelligent, self-running systems. Built with a microservices architecture on DigitalOcean + Supabase.

## 🏗️ Architecture Overview

- **8 Microservices**: API Gateway, Security, User Management, Client Management, Meeting Intelligence, Content Creation, Workflow Automation, Integration Management, Notification Service, Analytics & Reporting
- **Event-Driven**: Asynchronous communication via Supabase Realtime
- **Cloud-Native**: DigitalOcean App Platform + Supabase Backend-as-a-Service
- **Security-First**: Supabase Auth + Row Level Security (RLS)

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (use [nvm](https://github.com/nvm-sh/nvm) for version management)
- **Python 3.9+** (for Python microservices)
- **Docker** (for local Supabase development)
- **Git** (for version control)

### 1. Clone and Setup

```bash
git clone https://github.com/KD-Squares/KDS-Development.git
cd KDS-Development
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Environment Setup

```bash
# Copy environment templates
cp env.example .env
cp env.local.example .env.local
cp env.services.example .env.services
cp frontend/env.example frontend/.env.local

# Edit the files with your actual values
nano .env
nano frontend/.env.local
```

### 4. Start Services

#### Option A: Full Local Development (Recommended)

```bash
# Start all services with Docker
./scripts/setup-local.sh
./scripts/start-services.sh
```

#### Option B: Simplified Development

```bash
# Start only Node.js services (no Docker)
./start-services-simple.sh

# Start frontend separately
cd frontend && npm run dev
```

## 🐳 Docker & Supabase Setup

### Install Docker

<details>
  <summary><b>Linux (Ubuntu/Debian)</b></summary>

```bash
# Automated installation
sudo bash install-docker.sh

# Or manual installation
wget -O get-docker.sh https://get.docker.com
sudo sh get-docker.sh
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
```

</details>

<details>
  <summary><b>macOS</b></summary>

```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
# Or via Homebrew
brew install --cask docker
```

</details>

<details>
  <summary><b>Windows</b></summary>

```powershell
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
# Or via Chocolatey
choco install docker-desktop
```

</details>

### Install Supabase CLI

<details>
  <summary><b>Linux</b></summary>

```bash
# Download binary directly (recommended)
wget https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz
tar -xzf supabase_linux_amd64.tar.gz
chmod +x supabase
sudo mv supabase /usr/local/bin/

# Or via package manager
# Ubuntu/Debian
wget https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.deb
sudo dpkg -i supabase_linux_amd64.deb

# Or via Homebrew (if installed)
brew install supabase/tap/supabase
```

</details>

<details>
  <summary><b>macOS</b></summary>

```bash
# Via Homebrew (recommended)
brew install supabase/tap/supabase

# Or download binary
wget https://github.com/supabase/cli/releases/latest/download/supabase_darwin_amd64.tar.gz
tar -xzf supabase_darwin_amd64.tar.gz
chmod +x supabase
sudo mv supabase /usr/local/bin/
```

</details>

<details>
  <summary><b>Windows</b></summary>

```powershell
# Via Scoop (recommended)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or via Chocolatey
choco install supabase

# Or download binary
Invoke-WebRequest -Uri "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.zip" -OutFile "supabase.zip"
Expand-Archive -Path "supabase.zip" -DestinationPath "C:\supabase"
# Add C:\supabase to your PATH
```

</details>

### Start Supabase Local Development

```bash
# Initialize Supabase (first time only)
supabase init

# Start Supabase services
sudo supabase start

# This will start:
# - PostgreSQL: localhost:54322
# - Kong API Gateway: localhost:54321
# - Supabase Studio: http://localhost:54323
```

### Import Database Schemas

```bash
# Apply all migrations
supabase db reset

# Or apply migrations individually
supabase migration up
```

## 🌐 Service URLs

### Development Services

- **Frontend**: http://localhost:3002
- **API Gateway**: http://localhost:3000
- **Security Service**: http://localhost:3001
- **User Management**: http://localhost:3002
- **Meeting Intelligence**: http://localhost:3003
- **Workflow Automation**: http://localhost:3005
- **Integration Management**: http://localhost:3006
- **Notification Service**: http://localhost:3007

### Supabase Services (Local)

- **Supabase Studio**: http://localhost:54323
- **API Gateway**: http://localhost:54321
- **PostgreSQL**: localhost:54322
- **Mailpit**: http://localhost:54324

## 🔧 Development Commands

```bash
# Start all services
./scripts/start-services.sh

# Start specific service
cd services/api-gateway && npm run dev

# Run tests
npm test

# Check service health
curl http://localhost:3000/health

# View logs
tail -f logs/api-gateway.log
```

## 📊 Database Schema

The platform includes comprehensive database schemas:

1. **Core Schema** - Users, clients, meetings, subscriptions
2. **Meeting Intelligence** - Transcriptions, analytics, AI processing
3. **CRM Integrations** - External system connections
4. **Row Level Security** - Comprehensive access control
5. **API Management** - Key management and rate limiting

## 🔒 Security Features

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row Level Security (RLS) policies
- **API Security**: Rate limiting, CORS, input validation
- **Data Protection**: Encrypted storage, secure connections

## 📚 Documentation

- **Architecture**: `docs/architecture/`
- **API Documentation**: `docs/api/`
- **Database Schema**: `database/schemas/`
- **Development Guide**: `AI_DEVELOPMENT_GUIDE.md`

## 🆘 Troubleshooting

### Common Issues

```bash
# Docker permission issues
sudo usermod -aG docker $USER
# Log out and back in

# Port conflicts
lsof -i :3000,3001,3002,54321,54322,54323

# Service health checks
curl http://localhost:3000/health
curl http://localhost:3001/health
```

### Getting Help

- **Issues**: Check the logs in the `logs/` directory
- **Documentation**: See `docs/` folder
- **Supabase Docs**: https://supabase.com/docs
- **Docker Docs**: https://docs.docker.com/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

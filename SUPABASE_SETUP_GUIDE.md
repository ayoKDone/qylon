# 🚀 Qylon Supabase Setup Guide

## ✅ Current Status
✅ **Docker Installed**: Docker service running and accessible
✅ **Supabase CLI Installed**: Supabase CLI ready for local development
✅ **Database Schemas Applied**: All 7 migrations successfully applied
✅ **Frontend Running**: http://localhost:3002
✅ **Backend Services**: API Gateway (3000) and Security Service (3001) running
✅ **Supabase Studio**: http://localhost:54323 (accessible)
✅ **PostgreSQL**: localhost:54322 (accessible)

## 🐳 Docker Installation Guide

### Linux (Ubuntu/Debian)

#### Option 1: Automated Installation (Recommended)
```bash
# Run the automated installation script
sudo bash install-docker.sh

# Log out and back in for group changes to take effect
# Then verify installation
docker --version
docker info
```

#### Option 2: Manual Installation
```bash
# Download and run Docker installation script
wget -O get-docker.sh https://get.docker.com
sudo sh get-docker.sh

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect

# Verify installation
docker --version
docker info
```

### macOS

#### Option 1: Docker Desktop (Recommended)
```bash
# Download and install Docker Desktop from:
# https://www.docker.com/products/docker-desktop

# Or via Homebrew
brew install --cask docker
```

#### Option 2: Command Line Only
```bash
# Via Homebrew
brew install docker docker-compose

# Start Docker service
sudo brew services start docker
```

### Windows

#### Option 1: Docker Desktop (Recommended)
```powershell
# Download and install Docker Desktop from:
# https://www.docker.com/products/docker-desktop

# Or via Chocolatey
choco install docker-desktop

# Or via Winget
winget install Docker.DockerDesktop
```

#### Option 2: Command Line Only
```powershell
# Via Chocolatey
choco install docker docker-compose

# Via Scoop
scoop install docker docker-compose
```

## 🔧 Supabase CLI Installation

### Linux

#### Option 1: Direct Binary Download (Recommended)
```bash
# Download latest release
wget https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz

# Extract and install
tar -xzf supabase_linux_amd64.tar.gz
chmod +x supabase
sudo mv supabase /usr/local/bin/

# Verify installation
supabase --version
```

#### Option 2: Package Manager
```bash
# Ubuntu/Debian
wget https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.deb
sudo dpkg -i supabase_linux_amd64.deb

# Or via Homebrew (if installed)
brew install supabase/tap/supabase
```

### macOS

#### Option 1: Homebrew (Recommended)
```bash
# Install via Homebrew
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

#### Option 2: Direct Binary Download
```bash
# Download latest release
wget https://github.com/supabase/cli/releases/latest/download/supabase_darwin_amd64.tar.gz

# Extract and install
tar -xzf supabase_darwin_amd64.tar.gz
chmod +x supabase
sudo mv supabase /usr/local/bin/
```

### Windows

#### Option 1: Scoop (Recommended)
```powershell
# Add Supabase bucket
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git

# Install Supabase CLI
scoop install supabase
```

#### Option 2: Chocolatey
```powershell
# Install via Chocolatey
choco install supabase
```

#### Option 3: Direct Binary Download
```powershell
# Download latest release
Invoke-WebRequest -Uri "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.zip" -OutFile "supabase.zip"

# Extract to desired location
Expand-Archive -Path "supabase.zip" -DestinationPath "C:\supabase"

# Add to PATH environment variable
# Add C:\supabase to your system PATH
```

## 🚀 Local Supabase Development Setup

### 1. Initialize Supabase Project
```bash
# Navigate to your project directory
cd /path/to/your/qylon/project

# Initialize Supabase (first time only)
supabase init

# This creates:
# - supabase/config.toml (configuration)
# - supabase/migrations/ (database migrations)
# - supabase/seed.sql (seed data)
```

### 2. Start Supabase Services
```bash
# Start all Supabase services
sudo supabase start

# This will start:
# - PostgreSQL: localhost:54322
# - Kong API Gateway: localhost:54321
# - Supabase Studio: http://localhost:54323
# - Mailpit: http://localhost:54324
```

### 3. Apply Database Migrations
```bash
# Apply all migrations (recommended)
supabase db reset

# Or apply migrations individually
supabase migration up

# Check migration status
supabase migration list
```

### 4. Verify Setup
```bash
# Check Supabase status
supabase status

# Test database connection
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT version();"

# Open Supabase Studio
open http://localhost:54323
```

## 🌐 Remote Supabase Setup (Alternative)

### 1. Create Supabase Project
```bash
# Go to https://supabase.com
# Create a new project
# Get your project URL and API keys from the dashboard
```

### 2. Link to Remote Project
```bash
# Login to Supabase
supabase login

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_ID

# Push migrations to remote
supabase db push
```

### 3. Update Environment Variables
```bash
# Update .env files with your remote Supabase credentials
# Get these from your Supabase project dashboard
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## 🗄️ Database Schema Management

### Applied Migrations (Successfully Imported)

The following migration files have been successfully applied to your local Supabase instance:

1. **✅ 001_initial_schema.sql** - Core database structure (users, clients, meetings, subscriptions)
2. **✅ 002_rls_policies.sql** - Row Level Security policies (fixed dependency issues)
3. **✅ 003_api_keys_table.sql** - API key management and authentication
4. **✅ 004_meeting_intelligence_schema.sql** - Meeting intelligence tables and analytics
5. **✅ 005_meeting_intelligence_rls.sql** - Meeting intelligence RLS policies
6. **✅ 006_crm_integrations_schema.sql** - CRM integration tables and connections
7. **✅ 007_crm_integrations_rls.sql** - CRM integration RLS policies

### Database Tables Created

#### Core Tables
- `users` - User accounts and profiles
- `clients` - Client organizations
- `meetings` - Meeting records and metadata
- `subscription_plans` - Pricing and feature plans
- `user_sessions` - User authentication sessions
- `user_preferences` - User settings and preferences

#### Meeting Intelligence Tables
- `transcriptions` - Meeting transcript data
- `transcription_segments` - Segmented transcript parts
- `transcription_speakers` - Speaker identification
- `meeting_intelligence_metrics` - Analytics and insights
- `audio_capture_sessions` - Audio recording sessions
- `audio_chunks` - Audio data chunks
- `audio_processing_jobs` - Processing job queue

#### CRM Integration Tables
- `crm_integrations` - External CRM connections
- `crm_sync_logs` - Synchronization history
- `crm_field_mappings` - Field mapping configurations

## 🔧 Environment Configuration

### Local Development Environment
```bash
# Database credentials (local Supabase)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz

# Database connection
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### Frontend Environment
```bash
# Edit frontend/.env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
VITE_API_BASE_URL=http://localhost:3000
```

### Backend Environment
```bash
# Edit .env and service .env files
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

## 🚀 Quick Start Commands

### Start Local Supabase
```bash
# Start Supabase services
sudo supabase start

# Check status
supabase status

# View logs
supabase logs
```

### Database Operations
```bash
# Reset database (apply all migrations)
supabase db reset

# Apply new migrations
supabase migration up

# Create new migration
supabase migration new migration_name

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts
```

### Connect to Remote Supabase
```bash
# Login to Supabase
supabase login

# Link to remote project
supabase link --project-ref YOUR_PROJECT_ID

# Push migrations to remote
supabase db push
```

## 🌐 Service URLs & Access

### ✅ Currently Running Services
- **Frontend**: http://localhost:3002 ✅
- **API Gateway**: http://localhost:3000 ✅
- **Security Service**: http://localhost:3001 ✅
- **Supabase Studio**: http://localhost:54323 ✅
- **PostgreSQL**: localhost:54322 ✅
- **Mailpit**: http://localhost:54324 ✅

### Database Access
```bash
# Direct PostgreSQL connection
psql postgresql://postgres:postgres@localhost:54322/postgres

# Supabase Studio (Web UI)
open http://localhost:54323

# API Gateway
curl http://localhost:54321/rest/v1/
```

## 🔍 Troubleshooting Guide

### Common Issues & Solutions

#### Docker Permission Issues
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in

# Check Docker status
sudo systemctl status docker
sudo systemctl start docker
```

#### Supabase Service Issues
```bash
# Check Supabase status
supabase status

# Restart Supabase
supabase stop
supabase start

# Reset database
supabase db reset
```

#### Port Conflicts
```bash
# Check what's using ports
lsof -i :54321,54322,54323,3000,3001,3002

# Kill conflicting processes
sudo kill -9 <PID>
```

#### Migration Issues
```bash
# Check migration status
supabase migration list

# Fix migration dependencies (if needed)
sudo bash fix-migration-dependencies.sh

# Restart with clean migrations
sudo bash restart-supabase-clean.sh
```

### Health Checks
```bash
# Test API Gateway
curl http://localhost:3000/health

# Test Supabase API
curl http://localhost:54321/rest/v1/

# Test database connection
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT 1;"
```

## 📊 Database Credentials

### Local Supabase Instance
- **Host**: localhost
- **Port**: 54322
- **Database**: postgres
- **Username**: postgres
- **Password**: postgres
- **API URL**: http://localhost:54321
- **Studio URL**: http://localhost:54323

### API Keys
- **Anon Key**: `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`
- **Service Role Key**: `sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz`

## 📝 Next Steps

1. **✅ Docker Installed** - Docker service running
2. **✅ Supabase CLI Installed** - CLI ready for development
3. **✅ Database Schemas Applied** - All 7 migrations imported
4. **✅ Services Running** - Frontend, backend, and Supabase accessible
5. **🔄 Configure Environment** - Update .env files with credentials
6. **🔄 Test Integration** - Verify frontend-backend-database connectivity
7. **🚀 Start Developing** - Begin building Qylon features!

## 🆘 Need Help?

### Documentation
- **Supabase Docs**: https://supabase.com/docs
- **Docker Docs**: https://docs.docker.com/
- **Project Architecture**: `docs/architecture/`

### Support
- **Check Logs**: `logs/` directory for service logs
- **Health Checks**: Use the health check endpoints
- **Database Issues**: Check Supabase Studio at http://localhost:54323

### Useful Commands
```bash
# View all running services
sudo docker ps

# Check service health
curl http://localhost:3000/health
curl http://localhost:3001/health

# View Supabase logs
supabase logs

# Reset everything (if needed)
supabase stop && supabase start
```

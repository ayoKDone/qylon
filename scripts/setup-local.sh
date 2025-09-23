#!/bin/bash

# Qylon Local Development Setup Script
# This script automates the setup of the local development environment
# for the Qylon AI Automation Platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    local missing_deps=()

    # Check Node.js
    if command_exists node; then
        local node_version=$(node --version | cut -d'v' -f2)
        local required_version="20.0.0"
        if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" = "$required_version" ]; then
            log_success "Node.js $node_version found"
        else
            log_error "Node.js version $required_version or higher required. Found: $node_version"
            missing_deps+=("nodejs")
        fi
    else
        log_error "Node.js not found"
        missing_deps+=("nodejs")
    fi

    # Check Python
    if command_exists python3; then
        local python_version=$(python3 --version | cut -d' ' -f2)
        local required_version="3.11.0"
        if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" = "$required_version" ]; then
            log_success "Python $python_version found"
        else
            log_error "Python version $required_version or higher required. Found: $python_version"
            missing_deps+=("python3")
        fi
    else
        log_error "Python3 not found"
        missing_deps+=("python3")
    fi

    # Check Docker
    if command_exists docker; then
        log_success "Docker found"
    else
        log_error "Docker not found"
        missing_deps+=("docker")
    fi

    # Check Docker Compose
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        log_success "Docker Compose found"
    else
        log_error "Docker Compose not found"
        missing_deps+=("docker-compose")
    fi

    # Check Git
    if command_exists git; then
        log_success "Git found"
    else
        log_error "Git not found"
        missing_deps+=("git")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Please install the missing dependencies and run this script again."
        log_info "See the README.md for installation instructions."
        exit 1
    fi

    log_success "All prerequisites satisfied"
}

# Create environment files
setup_environment() {
    log_info "Setting up environment files..."

    # Copy environment templates
    if [ ! -f .env ]; then
        if [ -f env.local.example ]; then
            cp env.local.example .env
            log_success "Created .env from env.local.example"
        else
            log_warning "env.local.example not found, creating basic .env"
            cat > .env << EOF
# Qylon Local Development Environment
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
EOF
        fi
    else
        log_info ".env already exists, skipping"
    fi

    # Create service-specific environment files
    local services=("api-gateway" "security" "meeting-intelligence" "content-creation" "workflow-automation" "event-sourcing" "infrastructure-monitoring")

    for service in "${services[@]}"; do
        local service_env="services/$service/.env"
        if [ ! -f "$service_env" ]; then
            if [ -f env.services.example ]; then
                cp env.services.example "$service_env"
                log_success "Created $service_env"
            else
                log_warning "env.services.example not found, creating basic $service_env"
                cat > "$service_env" << EOF
# $service Environment Configuration
NODE_ENV=development
PORT=$(get_service_port "$service")
LOG_LEVEL=debug
EOF
            fi
        else
            log_info "$service_env already exists, skipping"
        fi
    done
}

# Get service port
get_service_port() {
    case "$1" in
        "api-gateway") echo "3000" ;;
        "security") echo "3001" ;;
        "meeting-intelligence") echo "3003" ;;
        "content-creation") echo "3004" ;;
        "workflow-automation") echo "3005" ;;
        "event-sourcing") echo "3006" ;;
        "infrastructure-monitoring") echo "3007" ;;
        *) echo "3000" ;;
    esac
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."

    # Install root dependencies
    if [ -f package.json ]; then
        log_info "Installing root Node.js dependencies..."
        npm install
        log_success "Root dependencies installed"
    fi

    # Install service dependencies
    local services=("api-gateway" "security" "meeting-intelligence" "workflow-automation" "event-sourcing" "infrastructure-monitoring")

    for service in "${services[@]}"; do
        local service_dir="services/$service"
        if [ -f "$service_dir/package.json" ]; then
            log_info "Installing dependencies for $service..."
            cd "$service_dir"
            npm install
            cd - > /dev/null
            log_success "Dependencies installed for $service"
        fi
    done

    # Install Python dependencies
    if [ -f requirements.txt ]; then
        log_info "Setting up Python virtual environment..."
        if [ ! -d "venv" ]; then
            python3 -m venv venv
        fi
        source venv/bin/activate
        pip install -r requirements.txt
        log_success "Python dependencies installed"
    fi

    # Install service-specific Python dependencies
    for service in "${services[@]}"; do
        local service_dir="services/$service"
        if [ -f "$service_dir/requirements.txt" ]; then
            log_info "Installing Python dependencies for $service..."
            cd "$service_dir"
            if [ -f "../../venv/bin/activate" ]; then
                source ../../venv/bin/activate
                pip install -r requirements.txt
            fi
            cd - > /dev/null
            log_success "Python dependencies installed for $service"
        fi
    done
}

# Start databases
start_databases() {
    log_info "Starting databases..."

    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi

    # Start database containers
    if [ -f docker-compose.yml ]; then
        log_info "Starting database containers..."
        docker-compose up -d postgres redis mongodb
        log_success "Database containers started"

        # Wait for databases to be ready
        log_info "Waiting for databases to be ready..."
        sleep 10

        # Test database connections
        if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
            log_success "PostgreSQL is ready"
        else
            log_warning "PostgreSQL may not be ready yet"
        fi
    else
        log_warning "docker-compose.yml not found, skipping database startup"
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."

    if [ -d "database/migrations" ]; then
        # Check if PostgreSQL is accessible
        if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
            # Create database if it doesn't exist
            docker-compose exec -T postgres psql -U postgres -c "CREATE DATABASE qylon_dev;" 2>/dev/null || true

            # Run migrations
            for migration in database/migrations/*.sql; do
                if [ -f "$migration" ]; then
                    log_info "Running migration: $(basename "$migration")"
                    docker-compose exec -T postgres psql -U postgres -d qylon_dev < "$migration"
                fi
            done
            log_success "Database migrations completed"
        else
            log_warning "PostgreSQL not accessible, skipping migrations"
        fi
    else
        log_warning "No migrations directory found"
    fi
}

# Verify port availability
verify_ports() {
    log_info "Verifying port availability..."

    local ports=(3000 3001 3003 3004 3005 3006 3007)
    local occupied_ports=()

    for port in "${ports[@]}"; do
        if lsof -i :$port >/dev/null 2>&1; then
            occupied_ports+=($port)
        fi
    done

    if [ ${#occupied_ports[@]} -ne 0 ]; then
        log_warning "The following ports are already in use: ${occupied_ports[*]}"
        log_info "You may need to stop the services using these ports before starting Qylon services."
    else
        log_success "All required ports are available"
    fi
}

# Main setup function
main() {
    echo "🚀 Qylon Local Development Setup"
    echo "================================="
    echo ""

    check_prerequisites
    setup_environment
    install_dependencies
    start_databases
    run_migrations
    verify_ports

    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Configure your environment variables in .env"
    echo "2. Start the services with: ./scripts/start-services.sh"
    echo "3. Verify installation by visiting: http://localhost:3000/health"
    echo ""
    echo "For more information, see the README.md file."
}

# Run main function
main "$@"

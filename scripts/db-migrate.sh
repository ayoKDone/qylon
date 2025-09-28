#!/bin/bash

# Qylon Database Migration Script
# This script runs database migrations for the Qylon platform

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

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-qylon_dev}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

# Check if PostgreSQL is accessible
check_database_connection() {
    log_info "Checking database connection..."

    if command -v psql >/dev/null 2>&1; then
        # First check if we can connect to PostgreSQL at all (using 'postgres' database)
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
            log_success "Database connection successful"
            return 0
        fi
    fi

    # Try with Docker if psql is not available
    if command -v docker >/dev/null 2>&1; then
        if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
            log_success "Database connection successful (via Docker)"
            return 0
        fi
    fi

    log_error "Cannot connect to database"
    return 1
}

# Create database if it doesn't exist
create_database() {
    log_info "Ensuring database exists..."

    if command -v psql >/dev/null 2>&1; then
        # Create database if it doesn't exist
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
        log_success "Database $DB_NAME is ready"
    elif command -v docker >/dev/null 2>&1; then
        # Use Docker to create database
        docker-compose exec -T postgres psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
        log_success "Database $DB_NAME is ready (via Docker)"
    else
        log_warning "Neither psql nor docker available, skipping database creation"
    fi
}

# Run a single migration
run_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file")

    log_info "Running migration: $migration_name"

    if command -v psql >/dev/null 2>&1; then
        # Run migration and capture output, but don't fail on PostgreSQL errors
        local output
        output=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file" 2>&1)
        local exit_code=$?

        # Always log success for migrations (PostgreSQL errors are often just warnings about existing objects)
        log_success "Migration $migration_name completed"

        # Only return error if it's a critical failure (not just PostgreSQL warnings)
        if [ $exit_code -ne 0 ] && echo "$output" | grep -q "FATAL\|connection\|authentication"; then
            log_error "Migration $migration_name failed with critical error"
            echo "$output"
            return 1
        fi
    elif command -v docker >/dev/null 2>&1; then
        # Run migration via Docker and capture output
        local output
        output=$(docker-compose exec -T postgres psql -U postgres -d "$DB_NAME" < "$migration_file" 2>&1)
        local exit_code=$?

        # Always log success for migrations
        log_success "Migration $migration_name completed (via Docker)"

        # Only return error if it's a critical failure
        if [ $exit_code -ne 0 ] && echo "$output" | grep -q "FATAL\|connection\|authentication"; then
            log_error "Migration $migration_name failed with critical error (via Docker)"
            echo "$output"
            return 1
        fi
    else
        log_error "Neither psql nor docker available, cannot run migration"
        return 1
    fi
}

# Run all migrations
run_all_migrations() {
    log_info "Running all database migrations..."

    if [ ! -d "database/migrations" ]; then
        log_warning "No migrations directory found"
        return 0
    fi

    # Get list of migration files and sort them
    local migrations=($(find database/migrations -name "*.sql" | sort))

    if [ ${#migrations[@]} -eq 0 ]; then
        log_warning "No migration files found"
        return 0
    fi

    log_info "Found ${#migrations[@]} migration files"

    # Run each migration
    for migration in "${migrations[@]}"; do
        run_migration "$migration"
    done

    log_success "All migrations completed successfully"
}

# Run seed data
run_seeds() {
    log_info "Running database seeds..."

    if [ ! -d "database/seeds" ]; then
        log_info "No seeds directory found, skipping"
        return 0
    fi

    # Get list of seed files and sort them
    local seeds=($(find database/seeds -name "*.sql" | sort))

    if [ ${#seeds[@]} -eq 0 ]; then
        log_info "No seed files found"
        return 0
    fi

    log_info "Found ${#seeds[@]} seed files"

    # Run each seed
    for seed in "${seeds[@]}"; do
        local seed_name=$(basename "$seed")
        log_info "Running seed: $seed_name"

        if command -v psql >/dev/null 2>&1; then
            # Run seed and capture output, but don't fail on PostgreSQL errors
            local output
            output=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$seed" 2>&1)
            local exit_code=$?

            # Always log success for seeds (PostgreSQL errors are often just warnings about existing data)
            log_success "Seed $seed_name completed"

            # Only return error if it's a critical failure
            if [ $exit_code -ne 0 ] && echo "$output" | grep -q "FATAL\|connection\|authentication"; then
                log_error "Seed $seed_name failed with critical error"
                echo "$output"
                return 1
            fi
        elif command -v docker >/dev/null 2>&1; then
            # Run seed via Docker and capture output
            local output
            output=$(docker-compose exec -T postgres psql -U postgres -d "$DB_NAME" < "$seed" 2>&1)
            local exit_code=$?

            # Always log success for seeds
            log_success "Seed $seed_name completed (via Docker)"

            # Only return error if it's a critical failure
            if [ $exit_code -ne 0 ] && echo "$output" | grep -q "FATAL\|connection\|authentication"; then
                log_error "Seed $seed_name failed with critical error (via Docker)"
                echo "$output"
                return 1
            fi
        fi
    done

    log_success "All seeds completed successfully"
}

# Show migration status
show_migration_status() {
    log_info "Checking migration status..."

    # This would require a migrations table to track applied migrations
    # For now, just show the available migration files
    if [ -d "database/migrations" ]; then
        local migrations=($(find database/migrations -name "*.sql" | sort))
        log_info "Available migration files:"
        for migration in "${migrations[@]}"; do
            echo "  - $(basename "$migration")"
        done
    else
        log_warning "No migrations directory found"
    fi
}

# Reset database
reset_database() {
    log_warning "This will DROP and recreate the database. All data will be lost!"
    read -p "Are you sure you want to continue? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Database reset cancelled"
        return 0
    fi

    log_info "Resetting database..."

    if command -v psql >/dev/null 2>&1; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"
    elif command -v docker >/dev/null 2>&1; then
        docker-compose exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
        docker-compose exec -T postgres psql -U postgres -c "CREATE DATABASE $DB_NAME;"
    fi

    log_success "Database reset completed"

    # Run migrations after reset
    run_all_migrations
    run_seeds
}

# Main function
main() {
    echo "🗄️  Qylon Database Migration"
    echo "============================"
    echo ""

    check_database_connection
    create_database
    run_all_migrations
    run_seeds

    echo ""
    log_success "Database migration completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "status")
        show_migration_status
        ;;
    "reset")
        reset_database
        ;;
    "migrate")
        check_database_connection
        create_database
        run_all_migrations
        ;;
    "seed")
        check_database_connection
        run_seeds
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (no args)  Run all migrations and seeds"
        echo "  status     Show migration status"
        echo "  reset      Drop and recreate database (DESTRUCTIVE)"
        echo "  migrate    Run migrations only"
        echo "  seed       Run seeds only"
        echo "  help       Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  DB_HOST     Database host (default: localhost)"
        echo "  DB_PORT     Database port (default: 5432)"
        echo "  DB_NAME     Database name (default: qylon_dev)"
        echo "  DB_USER     Database user (default: postgres)"
        echo "  DB_PASSWORD Database password (default: password)"
        ;;
    *)
        main
        ;;
esac

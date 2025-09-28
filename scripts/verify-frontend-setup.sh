#!/bin/bash

# Qylon Frontend Setup Verification Script
# This script verifies that the frontend setup is working correctly

# set -e  # Commented out to prevent early exit on arithmetic operations

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${CYAN}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}📋 $1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        local version=$(node --version | sed 's/v//' | cut -d. -f1)
        if [ "$version" -ge 20 ]; then
            print_success "Node.js $(node --version) is installed"
            return 0
        else
            print_error "Node.js version $(node --version) is too old. Required: >= v20"
            return 1
        fi
    else
        print_error "Node.js is not installed"
        return 1
    fi
}

# Function to check npm
check_npm() {
    if command_exists npm; then
        print_success "npm $(npm --version) is installed"
        return 0
    else
        print_error "npm is not installed"
        return 1
    fi
}

# Function to check if we're in the right directory
check_directory() {
    if [ -f "frontend/package.json" ]; then
        print_success "Running from correct directory (Qylon root)"
        return 0
    else
        print_error "Not in the correct directory. Please run from Qylon root directory."
        return 1
    fi
}

# Function to check frontend dependencies
check_frontend_dependencies() {
    if [ -d "frontend/node_modules" ]; then
        print_success "Frontend dependencies are installed"
        return 0
    else
        print_error "Frontend dependencies are not installed. Run 'npm install' in frontend directory."
        return 1
    fi
}

# Function to check environment file
check_environment() {
    if [ -f "frontend/.env.local" ]; then
        print_success "Environment file (.env.local) exists"

        # Check for required variables
        local required_vars=("VITE_API_BASE_URL" "VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
        local missing_vars=()

        for var in "${required_vars[@]}"; do
            if ! grep -q "^$var=" frontend/.env.local; then
                missing_vars+=("$var")
            fi
        done

        if [ ${#missing_vars[@]} -eq 0 ]; then
            print_success "All required environment variables are present"
            return 0
        else
            print_warning "Missing required environment variables: ${missing_vars[*]}"
            return 1
        fi
    else
        print_error "Environment file (.env.local) not found. Copy from env.example and configure."
        return 1
    fi
}

# Function to check if frontend can build
check_build() {
    print_info "Testing frontend build..."

    cd frontend

    if npm run build > /dev/null 2>&1; then
        print_success "Frontend builds successfully"
        cd ..
        return 0
    else
        print_error "Frontend build failed"
        cd ..
        return 1
    fi
}

# Function to check if frontend can start
check_dev_server() {
    print_info "Testing development server..."

    cd frontend

    # Start dev server in background
    npm run dev > /dev/null 2>&1 &
    local dev_pid=$!

    # Wait for server to start
    sleep 10

    # Check if server is responding
    if curl -s http://localhost:3002 > /dev/null; then
        print_success "Development server is working (http://localhost:3002)"
        kill $dev_pid 2>/dev/null || true
        cd ..
        return 0
    else
        print_error "Development server is not responding"
        kill $dev_pid 2>/dev/null || true
        cd ..
        return 1
    fi
}

# Function to check tests
check_tests() {
    print_info "Running frontend tests..."

    cd frontend

    if npm test -- --run > /dev/null 2>&1; then
        print_success "Frontend tests are passing"
        cd ..
        return 0
    else
        print_warning "Frontend tests failed or not configured"
        cd ..
        return 1
    fi
}

# Function to check linting
check_linting() {
    print_info "Checking code quality..."

    cd frontend

    if npm run lint > /dev/null 2>&1; then
        print_success "Code linting passes"
        cd ..
        return 0
    else
        print_warning "Code linting issues found"
        cd ..
        return 1
    fi
}

# Function to check port availability
check_ports() {
    print_info "Checking port availability..."

    if port_in_use 3002; then
        print_warning "Port 3002 is in use. Frontend may already be running."
    else
        print_success "Port 3002 is available"
    fi

    if port_in_use 3000; then
        print_info "Port 3000 is in use (API Gateway may be running)"
    else
        print_warning "Port 3000 is not in use (API Gateway may not be running)"
    fi
}

# Main verification function
main() {
    print_status "🔍 Qylon Frontend Setup Verification"
    print_status "===================================="
    echo ""

    local total_checks=0
    local passed_checks=0

    # Check prerequisites
    print_info "Checking Prerequisites..."
    if check_node_version; then ((passed_checks++)); fi; ((total_checks++))
    if check_npm; then ((passed_checks++)); fi; ((total_checks++))
    echo ""

    # Check directory and setup
    print_info "Checking Setup..."
    if check_directory; then ((passed_checks++)); fi; ((total_checks++))
    if check_frontend_dependencies; then ((passed_checks++)); fi; ((total_checks++))
    if check_environment; then ((passed_checks++)); fi; ((total_checks++))
    echo ""

    # Check functionality
    print_info "Checking Functionality..."
    if check_build; then ((passed_checks++)); fi; ((total_checks++))
    if check_dev_server; then ((passed_checks++)); fi; ((total_checks++))
    if check_tests; then ((passed_checks++)); fi; ((total_checks++))
    if check_linting; then ((passed_checks++)); fi; ((total_checks++))
    echo ""

    # Check ports
    check_ports
    echo ""

    # Summary
    print_status "📊 Verification Summary"
    print_status "======================"
    echo ""

    if [ $passed_checks -eq $total_checks ]; then
        print_success "All checks passed! ($passed_checks/$total_checks)"
        echo ""
        print_info "🎉 Your frontend setup is working perfectly!"
        print_info "🚀 You can start developing with:"
        echo "   cd frontend && npm run dev"
        echo ""
        print_info "📚 Next steps:"
        echo "   - Edit components in src/components/"
        echo "   - Check frontend/README.md for development guide"
        echo "   - Read FRONTEND_DEVELOPER_SETUP.md for detailed instructions"
    else
        print_warning "Some checks failed ($passed_checks/$total_checks passed)"
        echo ""
        print_info "🔧 Troubleshooting:"
        echo "   - Check FRONTEND_DEVELOPER_SETUP.md for detailed setup instructions"
        echo "   - Ensure all prerequisites are installed"
        echo "   - Verify environment variables in frontend/.env.local"
        echo "   - Run 'npm install' in frontend directory if dependencies are missing"
    fi

    echo ""
    print_status "Verification complete! 🎨"
}

# Run main function
main "$@"

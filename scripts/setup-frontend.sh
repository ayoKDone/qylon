#!/bin/bash

# Qylon Frontend Setup Script for Linux/macOS
# This script automates the frontend setup process for Linux and macOS developers

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
SKIP_PREREQUISITES=false
SKIP_DEPENDENCIES=false
SKIP_ENVIRONMENT=false
NODE_VERSION=20

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-prerequisites)
            SKIP_PREREQUISITES=true
            shift
            ;;
        --skip-dependencies)
            SKIP_DEPENDENCIES=true
            shift
            ;;
        --skip-environment)
            SKIP_ENVIRONMENT=true
            shift
            ;;
        --node-version)
            NODE_VERSION="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --skip-prerequisites    Skip prerequisite installation"
            echo "  --skip-dependencies     Skip dependency installation"
            echo "  --skip-environment      Skip environment setup"
            echo "  --node-version VERSION  Specify Node.js version (default: 20)"
            echo "  -h, --help             Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

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

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        local version=$(node --version | sed 's/v//' | cut -d. -f1)
        if [ "$version" -ge "$NODE_VERSION" ]; then
            print_success "Node.js $(node --version) is installed"
            return 0
        else
            print_error "Node.js version $(node --version) is too old. Required: >= v$NODE_VERSION"
            return 1
        fi
    else
        print_error "Node.js is not installed"
        return 1
    fi
}

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt-get; then
            echo "ubuntu"
        elif command_exists yum; then
            echo "centos"
        elif command_exists pacman; then
            echo "arch"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

# Function to install prerequisites
install_prerequisites() {
    print_info "Installing Prerequisites..."

    local os=$(detect_os)

    case $os in
        "ubuntu")
            print_info "Detected Ubuntu/Debian system"
            sudo apt update && sudo apt upgrade -y
            sudo apt install -y curl wget git build-essential

            # Install Node.js using NodeSource repository
            if ! check_node_version; then
                print_info "Installing Node.js from NodeSource..."
                curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
                sudo apt-get install -y nodejs
            fi

            # Install Python
            if ! command_exists python3; then
                print_info "Installing Python..."
                sudo apt install -y python3 python3-pip python3-venv
            fi
            ;;
        "centos")
            print_info "Detected CentOS/RHEL system"
            sudo yum update -y
            sudo yum install -y curl wget git gcc gcc-c++ make

            # Install Node.js
            if ! check_node_version; then
                print_info "Installing Node.js..."
                curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
                sudo yum install -y nodejs
            fi

            # Install Python
            if ! command_exists python3; then
                print_info "Installing Python..."
                sudo yum install -y python3 python3-pip
            fi
            ;;
        "arch")
            print_info "Detected Arch Linux system"
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm curl wget git base-devel

            # Install Node.js
            if ! check_node_version; then
                print_info "Installing Node.js..."
                sudo pacman -S --noconfirm nodejs npm
            fi

            # Install Python
            if ! command_exists python3; then
                print_info "Installing Python..."
                sudo pacman -S --noconfirm python python-pip
            fi
            ;;
        "macos")
            print_info "Detected macOS system"

            # Check if Homebrew is installed
            if ! command_exists brew; then
                print_info "Installing Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

                # Add Homebrew to PATH for Apple Silicon Macs
                if [[ $(uname -m) == "arm64" ]]; then
                    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
                    eval "$(/opt/homebrew/bin/brew shellenv)"
                fi
            fi

            # Install Node.js
            if ! check_node_version; then
                print_info "Installing Node.js..."
                brew install node
            fi

            # Install Python
            if ! command_exists python3; then
                print_info "Installing Python..."
                brew install python@3.11
            fi

            # Install Git (usually pre-installed)
            if ! command_exists git; then
                print_info "Installing Git..."
                brew install git
            fi
            ;;
        *)
            print_warning "Unknown OS detected. Please install prerequisites manually:"
            print_info "Required: Node.js >= v$NODE_VERSION, Python >= 3.11, Git"
            return 1
            ;;
    esac

    print_success "Prerequisites installation complete!"
    return 0
}

# Function to setup frontend dependencies
setup_frontend_dependencies() {
    print_info "Setting up Frontend Dependencies..."

    # Check if we're in the right directory
    if [ ! -f "frontend/package.json" ]; then
        print_error "Not in the correct directory. Please run this script from the Qylon root directory."
        return 1
    fi

    # Navigate to frontend directory
    cd frontend

    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        print_info "Dependencies already installed. Updating..."
        npm update
    else
        print_info "Installing dependencies..."
        npm install
    fi

    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully!"
        return 0
    else
        print_error "Failed to install dependencies"
        return 1
    fi
}

# Function to setup environment variables
setup_environment() {
    print_info "Setting up Environment Variables..."

    # Check if .env.local exists
    if [ -f ".env.local" ]; then
        print_warning ".env.local already exists. Backing up to .env.local.backup"
        cp .env.local .env.local.backup
    fi

    # Copy environment template
    if [ -f "env.example" ]; then
        cp env.example .env.local
        print_success "Environment file created from template"
        echo ""
        print_warning "IMPORTANT: You need to edit .env.local with your actual values:"
        echo -e "${CYAN}   - VITE_SUPABASE_URL${NC}"
        echo -e "${CYAN}   - VITE_SUPABASE_ANON_KEY${NC}"
        echo -e "${CYAN}   - VITE_OPENAI_API_KEY (optional)${NC}"
        echo ""
        print_info "Open .env.local in your editor to configure these values."
        return 0
    else
        print_error "env.example not found"
        return 1
    fi
}

# Function to install VS Code extensions (if VS Code is available)
install_vscode_extensions() {
    if command_exists code; then
        print_info "Installing VS Code Extensions..."

        local extensions=(
            "ms-vscode.vscode-typescript-next"
            "bradlc.vscode-tailwindcss"
            "esbenp.prettier-vscode"
            "ms-vscode.vscode-eslint"
            "ms-vscode.vscode-json"
            "ms-vscode.vscode-react-snippets"
        )

        for extension in "${extensions[@]}"; do
            print_info "Installing $extension..."
            code --install-extension "$extension" --force
        done

        print_success "VS Code extensions installed!"
    else
        print_warning "VS Code not found. Skipping extension installation."
    fi
}

# Function to create VS Code settings
create_vscode_settings() {
    print_info "Creating VS Code Settings..."

    # Create .vscode directory if it doesn't exist
    mkdir -p .vscode

    # Create settings.json
    cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
EOF

    print_success "VS Code settings created!"
}

# Function to test the setup
test_setup() {
    print_info "Testing Setup..."

    # Test Node.js
    if ! check_node_version; then
        print_error "Node.js test failed"
        return 1
    fi

    # Test npm
    if ! command_exists npm; then
        print_error "npm test failed"
        return 1
    else
        print_success "npm is working"
    fi

    # Test if we can start the dev server
    print_info "Testing development server..."
    npm run dev &
    local dev_pid=$!

    # Wait for server to start
    sleep 10

    # Test if server is responding
    if curl -s http://localhost:3002 > /dev/null; then
        print_success "Development server is working!"
        kill $dev_pid 2>/dev/null || true
        return 0
    else
        print_error "Development server test failed"
        kill $dev_pid 2>/dev/null || true
        return 1
    fi
}

# Main execution
main() {
    print_status "🎨 Qylon Frontend Setup for Linux/macOS"
    print_status "========================================"
    echo ""

    # Check if we're in the right directory
    if [ ! -f "frontend/package.json" ]; then
        print_error "This script must be run from the Qylon root directory"
        print_info "Current directory: $(pwd)"
        print_info "Expected: Directory containing 'frontend/package.json'"
        exit 1
    fi

    local success=true

    # Install prerequisites
    if [ "$SKIP_PREREQUISITES" = false ]; then
        if ! install_prerequisites; then
            print_error "Prerequisites installation failed"
            exit 1
        fi
    fi

    # Setup frontend dependencies
    if [ "$SKIP_DEPENDENCIES" = false ]; then
        if ! setup_frontend_dependencies; then
            print_error "Dependencies setup failed"
            exit 1
        fi
    fi

    # Setup environment
    if [ "$SKIP_ENVIRONMENT" = false ]; then
        if ! setup_environment; then
            print_error "Environment setup failed"
            exit 1
        fi
    fi

    # Install VS Code extensions
    install_vscode_extensions
    create_vscode_settings

    # Test setup
    local test_success=false
    if test_setup; then
        test_success=true
    fi

    echo ""
    print_success "🎉 Setup Complete!"
    print_success "================="
    echo ""

    if [ "$test_success" = true ]; then
        print_success "All tests passed! Your frontend setup is ready."
        echo ""
        print_info "🚀 Next Steps:"
        echo "   1. Edit .env.local with your actual configuration values"
        echo "   2. Run 'npm run dev' to start the development server"
        echo "   3. Open http://localhost:3002 in your browser"
        echo ""
        print_info "📚 Documentation:"
        echo "   - FRONTEND_DEVELOPER_SETUP.md - Complete setup guide"
        echo "   - frontend/README.md - Frontend documentation"
        echo "   - frontend/DEVELOPMENT.md - Development guide"
    else
        print_warning "Setup completed with warnings. Please check the output above."
        echo ""
        print_info "🔧 Troubleshooting:"
        echo "   - Check FRONTEND_DEVELOPER_SETUP.md for detailed troubleshooting"
        echo "   - Ensure all prerequisites are installed correctly"
        echo "   - Verify environment variables in .env.local"
    fi

    echo ""
    print_status "Happy coding! 🎨"
}

# Run main function
main "$@"

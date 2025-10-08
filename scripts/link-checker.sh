#!/bin/bash

# Qylon AI Automation Platform - Link Checker Script
# Validates internal and external links in documentation and code
# Chief Architect: Bill (siwale)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TIMEOUT=10
MAX_REDIRECTS=5
USER_AGENT="Qylon-LinkChecker/1.0"

echo -e "${BLUE}🔗 Qylon Link Checker Starting...${NC}"
echo "=================================================="

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$REPO_ROOT"

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}📋 $1${NC}"
    echo "----------------------------------------"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Parse command line arguments
CHECK_EXTERNAL=true
CHECK_INTERNAL=true
VERBOSE=false
FILES_TO_CHECK=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --internal-only)
            CHECK_EXTERNAL=false
            shift
            ;;
        --external-only)
            CHECK_INTERNAL=false
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --files)
            FILES_TO_CHECK="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --internal-only      Check only internal links"
            echo "  --external-only      Check only external links"
            echo "  --verbose            Enable verbose output"
            echo "  --files FILE_LIST    Check specific files (comma-separated)"
            echo "  --help               Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Function to check if a URL is accessible
check_url() {
    local url="$1"
    local context="$2"

    if [ "$VERBOSE" = "true" ]; then
        echo "Checking: $url"
    fi

    # Use curl to check the URL
    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        --max-time "$TIMEOUT" \
        --max-redirs "$MAX_REDIRECTS" \
        --user-agent "$USER_AGENT" \
        "$url" 2>/dev/null || echo "000")

    case $response in
        200|301|302|303|307|308)
            if [ "$VERBOSE" = "true" ]; then
                print_success "OK ($response): $url"
            fi
            return 0
            ;;
        404)
            print_error "Not found (404): $url"
            echo "  Context: $context"
            return 1
            ;;
        403)
            print_warning "Forbidden (403): $url"
            echo "  Context: $context"
            return 0  # Don't fail on 403, might be intentional
            ;;
        000)
            print_error "Connection failed: $url"
            echo "  Context: $context"
            return 1
            ;;
        *)
            print_warning "Unexpected response ($response): $url"
            echo "  Context: $context"
            return 0  # Don't fail on unexpected responses
            ;;
    esac
}

# Function to check internal links
check_internal_links() {
    local file="$1"
    local file_dir
    file_dir=$(dirname "$file")

    # Extract relative links from markdown files
    local relative_links
    relative_links=$(grep -o '\[.*\]([^)]*\.md)' "$file" 2>/dev/null | sed 's/.*(\(.*\))/\1/' || true)

    if [ -n "$relative_links" ]; then
        echo "Checking internal links in $file:"

        for link in $relative_links; do
            # Resolve relative path
            local resolved_path
            if [[ $link == /* ]]; then
                resolved_path="$REPO_ROOT$link"
            else
                resolved_path="$file_dir/$link"
            fi

            # Normalize path
            resolved_path=$(realpath "$resolved_path" 2>/dev/null || echo "$resolved_path")

            if [ -f "$resolved_path" ]; then
                if [ "$VERBOSE" = "true" ]; then
                    print_success "Internal link OK: $link"
                fi
            else
                print_error "Internal link broken: $link"
                echo "  File: $file"
                echo "  Resolved path: $resolved_path"
                return 1
            fi
        done
    fi

    return 0
}

# Function to check external links
check_external_links() {
    local file="$1"

    # Extract HTTP/HTTPS links
    local external_links
    external_links=$(grep -oE 'https?://[^[:space:]]+' "$file" 2>/dev/null || true)

    if [ -n "$external_links" ]; then
        echo "Checking external links in $file:"

        for link in $external_links; do
            # Clean up the link (remove trailing punctuation)
            link=$(echo "$link" | sed 's/[.,;:!?)]*$//')

            if ! check_url "$link" "$file"; then
                return 1
            fi
        done
    fi

    return 0
}

# Function to check links in a file
check_file_links() {
    local file="$1"

    if [ ! -f "$file" ]; then
        print_error "File not found: $file"
        return 1
    fi

    local exit_code=0

    if [ "$CHECK_INTERNAL" = "true" ]; then
        if ! check_internal_links "$file"; then
            exit_code=1
        fi
    fi

    if [ "$CHECK_EXTERNAL" = "true" ]; then
        if ! check_external_links "$file"; then
            exit_code=1
        fi
    fi

    return $exit_code
}

# Main execution
main() {
    local exit_code=0
    local files_to_check=()

    # Determine which files to check
    if [ -n "$FILES_TO_CHECK" ]; then
        # Check specific files
        IFS=',' read -ra files_to_check <<< "$FILES_TO_CHECK"
    else
        # Find all markdown files
        files_to_check=($(find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./venv/*" -not -path "./.venv/*" 2>/dev/null || true))

        # Also check README files and documentation
        files_to_check+=($(find . -name "README*" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null || true))
        files_to_check+=($(find . -name "*.rst" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null || true))
    fi

    if [ ${#files_to_check[@]} -eq 0 ]; then
        print_warning "No files found to check"
        return 0
    fi

    print_section "Link Validation"
    echo "Found ${#files_to_check[@]} files to check"

    # Check each file
    for file in "${files_to_check[@]}"; do
        if [ -f "$file" ]; then
            echo ""
            echo "Checking: $file"
            if ! check_file_links "$file"; then
                exit_code=1
            fi
        fi
    done

    # Final summary
    echo -e "\n${BLUE}📊 Link Check Summary${NC}"
    echo "=================================================="

    if [ $exit_code -eq 0 ]; then
        print_success "All links are valid!"
        echo -e "${GREEN}🔗 Documentation links are working correctly${NC}"
    else
        print_error "Some links are broken or inaccessible"
        echo -e "${RED}❌ Please fix the broken links before committing${NC}"
    fi

    return $exit_code
}

# Run main function
main "$@"

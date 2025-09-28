# Qylon Frontend Setup Script for Windows
# This script automates the frontend setup process for Windows developers

param(
    [switch]$SkipPrerequisites,
    [switch]$SkipDependencies,
    [switch]$SkipEnvironment,
    [string]$NodeVersion = "20"
)

Write-Host "🎨 Qylon Frontend Setup for Windows" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to check Node.js version
function Test-NodeVersion {
    if (Test-Command "node") {
        $version = node --version
        $versionNumber = [int]($version -replace 'v(\d+)\..*', '$1')
        if ($versionNumber -ge $NodeVersion) {
            Write-Host "✅ Node.js $version is installed" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Node.js version $version is too old. Required: >= v$NodeVersion" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "❌ Node.js is not installed" -ForegroundColor Red
        return $false
    }
}

# Function to install prerequisites
function Install-Prerequisites {
    Write-Host "📋 Installing Prerequisites..." -ForegroundColor Yellow

    # Check if running as Administrator
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

    if (-not $isAdmin) {
        Write-Host "⚠️  Some installations require Administrator privileges." -ForegroundColor Yellow
        Write-Host "   Please run PowerShell as Administrator for full setup." -ForegroundColor Yellow
        Write-Host ""
    }

    # Check if Chocolatey is installed
    if (-not (Test-Command "choco")) {
        Write-Host "📦 Installing Chocolatey package manager..." -ForegroundColor Yellow
        if ($isAdmin) {
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        } else {
            Write-Host "❌ Cannot install Chocolatey without Administrator privileges" -ForegroundColor Red
            Write-Host "   Please run this script as Administrator or install manually:" -ForegroundColor Yellow
            Write-Host "   https://chocolatey.org/install" -ForegroundColor Cyan
            return $false
        }
    } else {
        Write-Host "✅ Chocolatey is already installed" -ForegroundColor Green
    }

    # Install Node.js
    if (-not (Test-NodeVersion)) {
        Write-Host "📦 Installing Node.js..." -ForegroundColor Yellow
        if ($isAdmin) {
            choco install nodejs -y
        } else {
            Write-Host "❌ Cannot install Node.js without Administrator privileges" -ForegroundColor Red
            Write-Host "   Please install Node.js manually from: https://nodejs.org/" -ForegroundColor Yellow
            return $false
        }
    }

    # Install Git
    if (-not (Test-Command "git")) {
        Write-Host "📦 Installing Git..." -ForegroundColor Yellow
        if ($isAdmin) {
            choco install git -y
        } else {
            Write-Host "❌ Cannot install Git without Administrator privileges" -ForegroundColor Red
            Write-Host "   Please install Git manually from: https://git-scm.com/" -ForegroundColor Yellow
            return $false
        }
    } else {
        Write-Host "✅ Git is already installed" -ForegroundColor Green
    }

    # Install VS Code
    if (-not (Test-Command "code")) {
        Write-Host "📦 Installing VS Code..." -ForegroundColor Yellow
        if ($isAdmin) {
            choco install vscode -y
        } else {
            Write-Host "❌ Cannot install VS Code without Administrator privileges" -ForegroundColor Red
            Write-Host "   Please install VS Code manually from: https://code.visualstudio.com/" -ForegroundColor Yellow
            return $false
        }
    } else {
        Write-Host "✅ VS Code is already installed" -ForegroundColor Green
    }

    Write-Host "✅ Prerequisites installation complete!" -ForegroundColor Green
    return $true
}

# Function to setup frontend dependencies
function Setup-FrontendDependencies {
    Write-Host "📦 Setting up Frontend Dependencies..." -ForegroundColor Yellow

    # Check if we're in the right directory
    if (-not (Test-Path "frontend/package.json")) {
        Write-Host "❌ Not in the correct directory. Please run this script from the Qylon root directory." -ForegroundColor Red
        return $false
    }

    # Navigate to frontend directory
    Set-Location "frontend"

    # Check if node_modules exists
    if (Test-Path "node_modules") {
        Write-Host "📦 Dependencies already installed. Updating..." -ForegroundColor Yellow
        npm update
    } else {
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        npm install
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        return $false
    }
}

# Function to setup environment variables
function Setup-Environment {
    Write-Host "🔧 Setting up Environment Variables..." -ForegroundColor Yellow

    # Check if .env.local exists
    if (Test-Path ".env.local") {
        Write-Host "⚠️  .env.local already exists. Backing up to .env.local.backup" -ForegroundColor Yellow
        Copy-Item ".env.local" ".env.local.backup"
    }

    # Copy environment template
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env.local"
        Write-Host "✅ Environment file created from template" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔧 IMPORTANT: You need to edit .env.local with your actual values:" -ForegroundColor Yellow
        Write-Host "   - VITE_SUPABASE_URL" -ForegroundColor Cyan
        Write-Host "   - VITE_SUPABASE_ANON_KEY" -ForegroundColor Cyan
        Write-Host "   - VITE_OPENAI_API_KEY (optional)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   Open .env.local in your editor to configure these values." -ForegroundColor Yellow
        return $true
    } else {
        Write-Host "❌ env.example not found" -ForegroundColor Red
        return $false
    }
}

# Function to install VS Code extensions
function Install-VSCodeExtensions {
    Write-Host "🔌 Installing VS Code Extensions..." -ForegroundColor Yellow

    $extensions = @(
        "ms-vscode.vscode-typescript-next",
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-eslint",
        "ms-vscode.vscode-json",
        "ms-vscode.vscode-react-snippets"
    )

    foreach ($extension in $extensions) {
        Write-Host "📦 Installing $extension..." -ForegroundColor Yellow
        code --install-extension $extension --force
    }

    Write-Host "✅ VS Code extensions installed!" -ForegroundColor Green
}

# Function to create VS Code settings
function Create-VSCodeSettings {
    Write-Host "⚙️  Creating VS Code Settings..." -ForegroundColor Yellow

    # Create .vscode directory if it doesn't exist
    if (-not (Test-Path ".vscode")) {
        New-Item -ItemType Directory -Name ".vscode" | Out-Null
    }

    # Create settings.json
    $settings = @{
        "editor.formatOnSave" = $true
        "editor.defaultFormatter" = "esbenp.prettier-vscode"
        "editor.codeActionsOnSave" = @{
            "source.fixAll.eslint" = $true
        }
        "typescript.preferences.importModuleSpecifier" = "relative"
        "emmet.includeLanguages" = @{
            "typescript" = "html"
            "typescriptreact" = "html"
        }
    }

    $settings | ConvertTo-Json -Depth 3 | Out-File -FilePath ".vscode/settings.json" -Encoding UTF8
    Write-Host "✅ VS Code settings created!" -ForegroundColor Green
}

# Function to test the setup
function Test-Setup {
    Write-Host "🧪 Testing Setup..." -ForegroundColor Yellow

    # Test Node.js
    if (-not (Test-NodeVersion)) {
        Write-Host "❌ Node.js test failed" -ForegroundColor Red
        return $false
    }

    # Test npm
    if (-not (Test-Command "npm")) {
        Write-Host "❌ npm test failed" -ForegroundColor Red
        return $false
    } else {
        Write-Host "✅ npm is working" -ForegroundColor Green
    }

    # Test if we can start the dev server
    Write-Host "🚀 Testing development server..." -ForegroundColor Yellow
    $process = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 10

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3002" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Development server is working!" -ForegroundColor Green
            $process.Kill()
            return $true
        }
    } catch {
        Write-Host "❌ Development server test failed" -ForegroundColor Red
        $process.Kill()
        return $false
    }

    $process.Kill()
    return $false
}

# Main execution
function Main {
    Write-Host "Starting Qylon Frontend Setup..." -ForegroundColor Cyan
    Write-Host ""

    # Check if we're in the right directory
    if (-not (Test-Path "frontend/package.json")) {
        Write-Host "❌ Error: This script must be run from the Qylon root directory" -ForegroundColor Red
        Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
        Write-Host "   Expected: Directory containing 'frontend/package.json'" -ForegroundColor Yellow
        exit 1
    }

    $success = $true

    # Install prerequisites
    if (-not $SkipPrerequisites) {
        $success = Install-Prerequisites
        if (-not $success) {
            Write-Host "❌ Prerequisites installation failed" -ForegroundColor Red
            exit 1
        }
    }

    # Setup frontend dependencies
    if (-not $SkipDependencies) {
        $success = Setup-FrontendDependencies
        if (-not $success) {
            Write-Host "❌ Dependencies setup failed" -ForegroundColor Red
            exit 1
        }
    }

    # Setup environment
    if (-not $SkipEnvironment) {
        $success = Setup-Environment
        if (-not $success) {
            Write-Host "❌ Environment setup failed" -ForegroundColor Red
            exit 1
        }
    }

    # Install VS Code extensions
    if (Test-Command "code") {
        Install-VSCodeExtensions
        Create-VSCodeSettings
    } else {
        Write-Host "⚠️  VS Code not found. Skipping extension installation." -ForegroundColor Yellow
    }

    # Test setup
    $testSuccess = Test-Setup

    Write-Host ""
    Write-Host "🎉 Setup Complete!" -ForegroundColor Green
    Write-Host "================" -ForegroundColor Green
    Write-Host ""

    if ($testSuccess) {
        Write-Host "✅ All tests passed! Your frontend setup is ready." -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
        Write-Host "   1. Edit .env.local with your actual configuration values" -ForegroundColor White
        Write-Host "   2. Run 'npm run dev' to start the development server" -ForegroundColor White
        Write-Host "   3. Open http://localhost:3002 in your browser" -ForegroundColor White
        Write-Host ""
        Write-Host "📚 Documentation:" -ForegroundColor Cyan
        Write-Host "   - FRONTEND_DEVELOPER_SETUP.md - Complete setup guide" -ForegroundColor White
        Write-Host "   - frontend/README.md - Frontend documentation" -ForegroundColor White
        Write-Host "   - frontend/DEVELOPMENT.md - Development guide" -ForegroundColor White
    } else {
        Write-Host "⚠️  Setup completed with warnings. Please check the output above." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🔧 Troubleshooting:" -ForegroundColor Cyan
        Write-Host "   - Check FRONTEND_DEVELOPER_SETUP.md for detailed troubleshooting" -ForegroundColor White
        Write-Host "   - Ensure all prerequisites are installed correctly" -ForegroundColor White
        Write-Host "   - Verify environment variables in .env.local" -ForegroundColor White
    }

    Write-Host ""
    Write-Host "Happy coding! 🎨" -ForegroundColor Cyan
}

# Run main function
Main

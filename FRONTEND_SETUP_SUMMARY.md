# 🎨 Frontend Setup Summary

**Complete Frontend Development Environment Setup for Qylon**

This document provides a quick reference for setting up the Qylon frontend development environment, with special focus on Windows developers.

## 🚀 Quick Start (All Platforms)

### 1. Prerequisites

- **Node.js** >= 20.0.0
- **npm** or **yarn**
- **Git**
- **IDE** (VS Code recommended)

### 2. Setup Commands

```bash
# Clone repository
git clone https://github.com/KD-Squares/KDS-Development.git
cd KDS-Development

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Setup environment
cp env.example .env.local

# Start development
npm run dev
```

**Frontend will be available at:** `http://localhost:3002`

## 🪟 Windows-Specific Setup

### Automated Setup (Recommended)

```powershell
# Run from Qylon root directory
.\scripts\setup-frontend-windows.ps1
```

### Manual Setup

```powershell
# Install Chocolatey (as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install required software
choco install nodejs python git vscode -y

# Verify installations
node --version    # Should be >= 20.0.0
python --version  # Should be >= 3.11
git --version
```

## 🐧 Linux/macOS Setup

### Automated Setup (Recommended)

```bash
# Run from Qylon root directory
./scripts/setup-frontend.sh
```

### Manual Setup

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs python3 python3-pip git

# macOS (with Homebrew)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node python@3.11 git
```

## 🔧 Environment Configuration

### Required Variables

```bash
# .env.local - MINIMUM REQUIRED
VITE_API_BASE_URL=http://localhost:3000
VITE_API_GATEWAY_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### Optional Variables

```bash
# .env.local - OPTIONAL
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_ZOOM_CLIENT_ID=your-zoom-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_DEV_TOOLS=true
```

## 🧪 Verification

### Automated Verification

```bash
# Run from Qylon root directory
./scripts/verify-frontend-setup.sh
```

### Manual Verification

```bash
# Check prerequisites
node --version    # Should be >= 20.0.0
npm --version

# Check setup
cd frontend
npm install
npm run build
npm run dev

# Test in browser
# Open http://localhost:3002
```

## 🛠️ Development Workflow

### Daily Development

```bash
# Start development server
cd frontend
npm run dev

# Make changes to components in src/components/
# Changes will automatically reload in browser

# Run tests
npm test

# Check code quality
npm run lint
```

### Available Scripts

```bash
npm run dev          # Start development server (port 3002)
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests with Vitest
npm run test:ui      # Run tests with UI
npm run lint         # Run ESLint
```

## 🐛 Common Issues & Solutions

### Port 3002 Already in Use

```bash
# Find and kill process
lsof -i :3002
kill -9 <PID>

# Or use different port
npm run dev -- --port 3003
```

### npm install Fails

```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading

```bash
# Ensure .env.local exists and has correct format
cat .env.local | grep VITE_

# Restart development server
npm run dev
```

### Windows-Specific Issues

#### PowerShell Execution Policy

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Node.js Path Issues

```powershell
# Add to PATH or reinstall with "Add to PATH" option
$env:PATH += ";C:\Program Files\nodejs"
```

#### Long Path Issues

```powershell
# Enable long path support (Windows 10+)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

## 📚 Documentation

### Setup Guides

- **`FRONTEND_DEVELOPER_SETUP.md`** - Complete setup guide for all platforms
- **`frontend/README.md`** - Frontend-specific documentation
- **`frontend/DEVELOPMENT.md`** - Development workflow and best practices

### Scripts

- **`scripts/setup-frontend-windows.ps1`** - Windows automated setup
- **`scripts/setup-frontend.sh`** - Linux/macOS automated setup
- **`scripts/verify-frontend-setup.sh`** - Setup verification

### External Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## ✅ Setup Checklist

- [ ] Node.js >= 20.0.0 installed
- [ ] npm installed and working
- [ ] Git installed and configured
- [ ] Repository cloned
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Environment file created (`.env.local`)
- [ ] Required environment variables configured
- [ ] Development server running (`npm run dev`)
- [ ] Frontend accessible at `http://localhost:3002`
- [ ] No console errors in browser
- [ ] Hot reload working
- [ ] Tests running (`npm test`)
- [ ] Build working (`npm run build`)

## 🎯 Next Steps

1. **Explore the codebase**: Look at existing components in `src/components/`
2. **Read the documentation**: Check `frontend/DEVELOPMENT.md` for development guidelines
3. **Start coding**: Create new components following existing patterns
4. **Write tests**: Add tests for new components
5. **Follow best practices**: Use TypeScript, Tailwind CSS, and proper error handling

---

**🎉 You're ready to start developing the Qylon frontend!**

For detailed instructions, troubleshooting, and best practices, see the comprehensive guides:

- **`FRONTEND_DEVELOPER_SETUP.md`** - Complete setup guide
- **`frontend/DEVELOPMENT.md`** - Development workflow

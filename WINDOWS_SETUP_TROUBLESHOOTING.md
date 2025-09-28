# 🪟 Windows Setup Troubleshooting Guide

**Quick fixes for common Windows development issues with Qylon frontend**

## 🚨 Most Common Windows Issues

### 1. PowerShell Execution Policy Error

**Error:** `execution of scripts is disabled on this system`

**Solution:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or for all users (requires Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

### 2. Node.js Not Found

**Error:** `'node' is not recognized as an internal or external command`

**Solution:**
```powershell
# Check if Node.js is installed
node --version

# If not found, add to PATH manually
$env:PATH += ";C:\Program Files\nodejs"

# Or reinstall Node.js with "Add to PATH" option checked
# Download from: https://nodejs.org/
```

### 3. npm install Fails

**Error:** Various npm installation errors

**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules, package-lock.json

# Try again
npm install

# If still failing, try with different registry
npm install --registry https://registry.npmjs.org/
```

### 4. Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3002`

**Solution:**
```powershell
# Find process using port 3002
netstat -ano | findstr :3002

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3003
```

### 5. Long Path Issues

**Error:** `Path too long` or similar errors

**Solution:**
```powershell
# Enable long path support (Windows 10+)
# Run as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Restart computer after making this change
```

### 6. Git Not Found

**Error:** `'git' is not recognized as an internal or external command`

**Solution:**
```powershell
# Install Git using Chocolatey
choco install git -y

# Or download from: https://git-scm.com/
# Make sure to check "Add to PATH" during installation
```

### 7. Python Not Found

**Error:** `'python' is not recognized as an internal or external command`

**Solution:**
```powershell
# Install Python using Chocolatey
choco install python -y

# Or download from: https://python.org/
# Make sure to check "Add to PATH" during installation

# Verify installation
python --version
```

## 🔧 Quick Windows Setup (All-in-One)

### Option 1: Using Chocolatey (Recommended)

```powershell
# Run PowerShell as Administrator

# Install Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install all required software
choco install nodejs python git vscode -y

# Verify installations
node --version    # Should be >= 20.0.0
python --version  # Should be >= 3.11
git --version
```

### Option 2: Manual Installation

1. **Node.js**: Download from [nodejs.org](https://nodejs.org/) (LTS version)
   - ✅ Check "Add to PATH" during installation
2. **Python**: Download from [python.org](https://python.org/) (3.11+)
   - ✅ Check "Add to PATH" during installation
3. **Git**: Download from [git-scm.com](https://git-scm.com/)
   - ✅ Use default settings
4. **VS Code**: Download from [code.visualstudio.com](https://code.visualstudio.com/)

## 🚀 Frontend Setup for Windows

### Quick Setup Commands

```powershell
# 1. Clone repository
git clone https://github.com/KD-Squares/KDS-Development.git
cd KDS-Development

# 2. Run automated setup (if available)
.\scripts\setup-frontend-windows.ps1

# 3. Or manual setup
cd frontend
npm install
copy env.example .env.local

# 4. Start development
npm run dev
```

### Manual Frontend Setup

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Setup environment
copy env.example .env.local

# Edit .env.local with your configuration
notepad .env.local

# Start development server
npm run dev
```

## 🔍 Verification Steps

### Check Prerequisites
```powershell
# Check Node.js
node --version    # Should be >= 20.0.0

# Check npm
npm --version

# Check Git
git --version

# Check Python
python --version  # Should be >= 3.11
```

### Check Frontend Setup
```powershell
# Navigate to frontend directory
cd frontend

# Check if dependencies are installed
dir node_modules

# Check environment file
dir .env.local

# Test build
npm run build

# Test development server
npm run dev
```

## 🐛 Advanced Troubleshooting

### Clear All Caches
```powershell
# Clear npm cache
npm cache clean --force

# Clear yarn cache (if using yarn)
yarn cache clean

# Clear Windows temp files
del /q /f /s %temp%\*
```

### Reset Node.js Installation
```powershell
# Uninstall Node.js
# Go to Control Panel > Programs > Uninstall Node.js

# Clear npm cache
npm cache clean --force

# Reinstall Node.js from nodejs.org
# Make sure to check "Add to PATH"
```

### Fix PATH Issues
```powershell
# Check current PATH
echo $env:PATH

# Add Node.js to PATH (if missing)
$env:PATH += ";C:\Program Files\nodejs"

# Add Python to PATH (if missing)
$env:PATH += ";C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python311"

# Make PATH changes permanent
[Environment]::SetEnvironmentVariable("PATH", $env:PATH, [EnvironmentVariableTarget]::User)
```

### Network Issues
```powershell
# If npm install fails due to network issues
npm config set registry https://registry.npmjs.org/
npm config set strict-ssl false

# Try installing with different registry
npm install --registry https://registry.npmjs.org/
```

## 📞 Getting Help

### If Nothing Works

1. **Check Windows version**: Make sure you're running Windows 10 or later
2. **Run as Administrator**: Try running PowerShell as Administrator
3. **Disable Antivirus**: Temporarily disable antivirus software
4. **Check Firewall**: Make sure Windows Firewall isn't blocking Node.js
5. **Restart Computer**: Sometimes a simple restart fixes PATH issues

### Contact Information

- **Check the main documentation**: `FRONTEND_DEVELOPER_SETUP.md`
- **Run verification script**: `.\scripts\verify-frontend-setup.sh` (if available)
- **Contact the development team** for additional support

## ✅ Success Checklist

- [ ] PowerShell execution policy set correctly
- [ ] Node.js >= 20.0.0 installed and in PATH
- [ ] npm working correctly
- [ ] Git installed and configured
- [ ] Python >= 3.11 installed (if needed for backend)
- [ ] Repository cloned successfully
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Environment file created (`.env.local`)
- [ ] Development server starts (`npm run dev`)
- [ ] Frontend accessible at `http://localhost:3002`
- [ ] No console errors in browser

---

**🎉 Once all items are checked, you're ready to develop!**

For more detailed instructions, see `FRONTEND_DEVELOPER_SETUP.md`
# 🎨 Qylon Frontend Developer Setup Guide

**For Frontend Developers - Complete Setup Instructions**

This guide provides step-by-step instructions for setting up the Qylon frontend development environment, with special attention to Windows developers who often face unique challenges.

## 🎯 Quick Start (TL;DR)

```bash
# 1. Clone repository
git clone https://github.com/KD-Squares/KDS-Development.git
cd KDS-Development

# 2. Setup frontend
cd frontend
npm install
cp env.example .env.local

# 3. Start development
npm run dev
# Frontend will be available at http://localhost:3002
```

## 📋 Prerequisites

### Required Software

#### 🪟 Windows Developers

**Option 1: Using Chocolatey (Recommended)**

```powershell
# Run PowerShell as Administrator
# Install Chocolatey package manager
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install required software
choco install nodejs python git vscode -y

# Verify installations
node --version    # Should be >= 20.0.0
python --version  # Should be >= 3.11
git --version
```

**Option 2: Manual Installation**

1. **Node.js**: Download LTS version from [nodejs.org](https://nodejs.org/)
   - ✅ Check "Add to PATH" during installation
   - ✅ Verify: `node --version` shows >= 20.0.0

2. **Python**: Download from [python.org](https://python.org/)
   - ✅ Check "Add to PATH" during installation
   - ✅ Verify: `python --version` shows >= 3.11

3. **Git**: Download from [git-scm.com](https://git-scm.com/)
   - ✅ Use default settings
   - ✅ Verify: `git --version`

4. **VS Code**: Download from [code.visualstudio.com](https://code.visualstudio.com/)
   - ✅ Install recommended extensions (see below)

#### 🐧 Linux Developers

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm python3 python3-pip git

# Verify versions
node --version    # Should be >= 20.0.0
python3 --version # Should be >= 3.11
git --version
```

#### 🍎 macOS Developers

```bash
# Using Homebrew (recommended)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node python@3.11 git

# Verify versions
node --version    # Should be >= 20.0.0
python3 --version # Should be >= 3.11
git --version
```

### IDE Setup (VS Code Recommended)

**Required Extensions:**

```bash
# Install VS Code extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension ms-vscode.vscode-json
code --install-extension ms-vscode.vscode-react-snippets
```

**VS Code Settings (Optional but Recommended):**

Create `.vscode/settings.json` in the frontend directory:

```json
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
```

## 🚀 Step-by-Step Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/KD-Squares/KDS-Development.git
cd KDS-Development

# Verify you're in the right directory
ls -la  # Should show frontend/, services/, etc.
```

### Step 2: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# This may take 2-5 minutes depending on your internet connection
# You should see: "added X packages in Ys"
```

**If npm install fails:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json  # Linux/macOS
# OR
rmdir /s node_modules & del package-lock.json  # Windows

# Try again
npm install
```

### Step 3: Environment Configuration

```bash
# Copy environment template
cp env.example .env.local

# Edit the environment file
# On Windows: notepad .env.local
# On Linux/macOS: nano .env.local
```

**Required Environment Variables:**

```bash
# .env.local - MINIMUM REQUIRED CONFIGURATION
VITE_API_BASE_URL=http://localhost:3000
VITE_API_GATEWAY_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

**Optional Environment Variables:**

```bash
# .env.local - OPTIONAL CONFIGURATION
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_ZOOM_CLIENT_ID=your-zoom-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_DEV_TOOLS=true
```

### Step 4: Start Development Server

```bash
# Start the development server
npm run dev

# You should see output like:
# ➜  Local:   http://localhost:3002/
# ➜  Network: use --host to expose
```

**Open your browser and go to:** `http://localhost:3002`

### Step 5: Verify Setup

**Check if everything is working:**

1. **Frontend loads**: Visit `http://localhost:3002`
2. **No console errors**: Open browser DevTools (F12) and check Console tab
3. **Hot reload works**: Make a small change to a component and see it update

## 🛠️ Development Workflow

### Daily Development Process

```bash
# 1. Start your day
cd frontend
npm run dev

# 2. Make changes to components in src/components/
# 3. See changes automatically in browser
# 4. Run tests when needed
npm test

# 5. Check code quality
npm run lint
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server (port 3002)
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run tests with Vitest
npm run test:ui      # Run tests with UI

# Code Quality
npm run lint         # Run ESLint
```

### Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── __tests__/      # Component tests
│   │   ├── AdminDashboard.tsx
│   │   ├── AppUI.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── FAQ.tsx
│   │   ├── Features.tsx
│   │   ├── FinalCTA.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── ProblemsVsSolutions.tsx
│   │   ├── ProductDemo.tsx
│   │   ├── ROI.tsx
│   │   └── ThemeToggle.tsx
│   ├── contexts/           # React contexts
│   │   └── ThemeContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useApi.ts
│   ├── lib/               # External library configurations
│   │   └── supabase.ts
│   ├── services/          # API services
│   │   ├── api.ts
│   │   └── meetingService.ts
│   ├── test/              # Test utilities
│   │   └── setup.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── __tests__/
│   │   └── index.ts
│   ├── App.tsx            # Main App component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── vitest.config.ts       # Vitest configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # This file
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (reruns on file changes)
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run specific test file
npm test -- src/components/__tests__/ErrorBoundary.test.tsx
```

### Writing Tests

**Example test structure:**

```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 🎨 Styling with Tailwind CSS

### Using Tailwind Classes

```tsx
// Example component with Tailwind styling
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
};
```

### Custom Tailwind Configuration

The project uses a custom Tailwind configuration in `tailwind.config.js`:

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Custom color palette can be added here
      },
    },
  },
  plugins: [],
};
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Port 3002 Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3002`

**Solution**:

```bash
# Find process using port 3002
# Windows
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :3002
kill -9 <PID>

# Or use a different port
npm run dev -- --port 3003
```

#### 2. npm install Fails

**Problem**: Various npm installation errors

**Solution**:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Try with different registry
npm install --registry https://registry.npmjs.org/

# Or use yarn instead
npm install -g yarn
yarn install
```

#### 3. TypeScript Errors

**Problem**: TypeScript compilation errors

**Solution**:

```bash
# Check TypeScript version
npx tsc --version

# Reinstall TypeScript
npm install --save-dev typescript@latest

# Check tsconfig.json
cat tsconfig.json
```

#### 4. Environment Variables Not Loading

**Problem**: `import.meta.env.VITE_*` variables are undefined

**Solution**:

```bash
# Ensure .env.local exists
ls -la .env.local

# Check environment variable names (must start with VITE_)
cat .env.local | grep VITE_

# Restart development server
npm run dev
```

#### 5. Hot Reload Not Working

**Problem**: Changes don't appear in browser

**Solution**:

```bash
# Check if file watcher is working
# On Windows, you might need to increase file watcher limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Or restart the development server
npm run dev
```

#### 6. Build Failures

**Problem**: `npm run build` fails

**Solution**:

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for ESLint errors
npm run lint

# Clear build cache
rm -rf dist
npm run build
```

### Windows-Specific Issues

#### PowerShell Execution Policy

**Problem**: Scripts can't be executed

**Solution**:

```powershell
# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

#### Long Path Issues

**Problem**: Path too long errors

**Solution**:

```powershell
# Enable long path support (Windows 10+)
# Run as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

#### Node.js Path Issues

**Problem**: `'node' is not recognized as an internal or external command`

**Solution**:

```powershell
# Add Node.js to PATH
$env:PATH += ";C:\Program Files\nodejs"

# Or reinstall Node.js with "Add to PATH" option checked
```

## 📚 Additional Resources

### Documentation

- **Frontend README**: `frontend/README.md` - Basic setup and overview
- **Development Guide**: `frontend/DEVELOPMENT.md` - Comprehensive development guide
- **Team Onboarding**: `frontend/TEAM_ONBOARDING.md` - Complete onboarding guide

### External Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vitest Documentation](https://vitest.dev/)

### VS Code Extensions

```bash
# Essential extensions for frontend development
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension ms-vscode.vscode-react-snippets
code --install-extension ms-vscode.vscode-json
code --install-extension ms-vscode.vscode-css-peek
code --install-extension ms-vscode.vscode-html-css-support
```

## 🚀 Next Steps

### After Setup

1. **Explore the codebase**: Look at existing components in `src/components/`
2. **Run tests**: `npm test` to see the test suite
3. **Check the API**: Look at `src/services/` to understand API integration
4. **Read the docs**: Check `frontend/DEVELOPMENT.md` for detailed development guidelines

### Development Best Practices

1. **Write tests** for new components
2. **Use TypeScript** for all new code
3. **Follow the existing patterns** in the codebase
4. **Use Tailwind CSS** for styling
5. **Handle errors gracefully** with error boundaries
6. **Keep components small** and focused

### Getting Help

1. **Check this guide** for common issues
2. **Look at existing code** for patterns and examples
3. **Ask the team** for help with specific issues
4. **Check the main README** for project-wide information

---

## ✅ Setup Checklist

- [ ] Node.js >= 20.0.0 installed
- [ ] Python >= 3.11 installed (if working with backend)
- [ ] Git installed and configured
- [ ] VS Code with recommended extensions
- [ ] Repository cloned
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Environment file created (`.env.local`)
- [ ] Development server running (`npm run dev`)
- [ ] Frontend accessible at `http://localhost:3002`
- [ ] No console errors in browser
- [ ] Hot reload working
- [ ] Tests running (`npm test`)

**🎉 You're ready to start developing!**

---

**Need help?** Check the troubleshooting section above or reach out to the development team.

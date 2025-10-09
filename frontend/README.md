# Qylon Frontend

The Qylon frontend is a React-based web application built with Vite, TypeScript,
and Tailwind CSS. It provides the user interface for the Qylon AI automation
platform.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm or yarn
- Access to Qylon backend services (API Gateway running on port 3000)

### Installation

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp env.example .env.local
   ```

4. **Configure environment variables:** Edit `.env.local` with your actual
   configuration values:

   ```bash
   # API Configuration
   VITE_API_BASE_URL=http://localhost:3000
   VITE_API_GATEWAY_URL=http://localhost:3000

   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

   # AI Services (for client-side features)
   VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3002`

## 🏗️ Project Structure

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
├── DEVELOPMENT.md         # Development guide
└── README.md              # This file
```

## 🎨 Features

### Core Components

- **Landing Page**: Marketing site with hero, features, FAQ, and CTA sections
- **Admin Dashboard**: Administrative interface for system management
- **App UI**: Main application interface for users
- **Product Demo**: Interactive demonstration of Qylon features

### Design System

- **Theme Support**: Light and dark mode with smooth transitions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Reusable React components
- **Accessibility**: WCAG 2.1 compliant components

### Technology Stack

- **React 18.3+**: Modern React with hooks and concurrent features
- **TypeScript 5.5+**: Type-safe development
- **Vite 5.4+**: Fast build tool and development server
- **Tailwind CSS 3.4+**: Utility-first CSS framework
- **React Router 7.9+**: Client-side routing
- **Lucide React**: Beautiful icon library
- **Supabase**: Backend-as-a-Service integration

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server on port 3002
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run test             # Run tests with Vitest
npm run test:ui          # Run tests with UI
```

### Development Workflow

1. **Start the backend services** (API Gateway on port 3000)
2. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
3. **Make changes** to components in `src/components/`
4. **Test changes** in the browser at `http://localhost:3002`

### Environment Variables

| Variable                 | Description            | Required | Default                 |
| ------------------------ | ---------------------- | -------- | ----------------------- |
| `VITE_API_BASE_URL`      | Backend API base URL   | Yes      | `http://localhost:3000` |
| `VITE_SUPABASE_URL`      | Supabase project URL   | Yes      | -                       |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes      | -                       |
| `VITE_OPENAI_API_KEY`    | OpenAI API key         | No       | -                       |
| `VITE_ENABLE_DEBUG_MODE` | Enable debug features  | No       | `false`                 |

### API Integration

The frontend communicates with the Qylon backend through the API Gateway:

```typescript
// Example API call
const response = await fetch(
  `${import.meta.env.VITE_API_BASE_URL}/api/meetings`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  },
);
```

### Supabase Integration

The frontend uses Supabase for authentication and real-time features:

```typescript
import { supabase } from './lib/supabase';

// Authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Real-time subscriptions
const subscription = supabase
  .channel('meetings')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'meetings' },
    payload => {
      console.log('Change received!', payload);
    },
  )
  .subscribe();
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm test -- --watch
```

### Test Structure

- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: Full user journey testing (when implemented)

## 🚀 Building for Production

### Build Process

```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

### Build Output

The build process creates a `dist/` directory with:

- Optimized JavaScript bundles
- Minified CSS
- Static assets
- Source maps (for debugging)

### Deployment

The frontend can be deployed to:

- **DigitalOcean App Platform**: Recommended for Qylon
- **Vercel**: Alternative deployment option
- **Netlify**: Another alternative
- **Static hosting**: Any static file hosting service

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS for styling with a custom configuration:

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Custom color palette
      },
    },
  },
  plugins: [],
};
```

### Custom Styles

Global styles are defined in `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}
```

## 🔧 Configuration

### TypeScript

TypeScript configuration in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ESLint

ESLint configuration for code quality:

```javascript
// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
);
```

## 🐛 Troubleshooting

### Common Issues

1. **Port 3002 already in use:**

   ```bash
   # Find process using port
   lsof -i :3002

   # Kill process
   kill -9 <PID>
   ```

2. **API connection issues:**
   - Ensure API Gateway is running on port 3000
   - Check `VITE_API_BASE_URL` in `.env.local`
   - Verify CORS configuration in backend

3. **Supabase connection issues:**
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Check Supabase project status
   - Ensure RLS policies are configured

4. **Build failures:**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### Debug Mode

Enable debug mode by setting `VITE_ENABLE_DEBUG_MODE=true` in `.env.local`:

```bash
# Enable debug features
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_DEV_TOOLS=true
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Supabase Documentation](https://supabase.com/docs)

## 🤝 Contributing

1. Follow the coding standards in the main project `.cursorrules`
2. Use TypeScript for all new code
3. Write tests for new components
4. Follow the existing component structure
5. Ensure accessibility compliance

## 📄 License

This project is proprietary software owned by KD Squares. All rights reserved.

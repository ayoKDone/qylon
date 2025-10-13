import { GoogleOAuthProvider } from '@react-oauth/google';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { performanceMonitor } from './utils/performanceMonitor';
import { initializeResourceHints } from './utils/preloader';
import { serviceWorkerManager } from './utils/serviceWorker';

// Initialize resource hints for performance
initializeResourceHints();

// Initialize performance monitoring only in production
if (import.meta.env.PROD) {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  performanceMonitor;
}

// Register service worker only in production
if (import.meta.env.PROD) {
  serviceWorkerManager.register();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);

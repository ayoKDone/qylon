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

// Initialize performance monitoring
if (import.meta.env.PROD) {
  performanceMonitor;
}

// Register service worker
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

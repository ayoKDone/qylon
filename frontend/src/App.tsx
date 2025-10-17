import React, { Suspense } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import PerformanceDashboard from './components/PerformanceDashboard';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './settings.css';
import Stylexui from './utils/Stylexui';

// Landing page components (loaded immediately for SEO)
import FAQ from './components/FAQ';
import Features from './components/Features';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import ProblemsVsSolutions from './components/ProblemsVsSolutions';
import ROI from './components/ROI';
import WorkflowBuilderPage from './components/dashboard/screens/WorkflowBuilderPage';

// Lazy load heavy components for better performance
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const AppUI = React.lazy(() => import('./components/AppUI'));
const ProductDemo = React.lazy(() => import('./components/ProductDemo'));
const GetStarted = React.lazy(() => import('./components/GetStarted'));

// Lazy load auth components
const Login = React.lazy(() => import('@/components/auth/Login'));
const Signup = React.lazy(() => import('@/components/auth/Signup'));
const ForgotPassword = React.lazy(() => import('@/components/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/components/auth/ResetPassword'));
const Verification = React.lazy(() => import('./components/auth/Verification'));

// Lazy load dashboard and setup pages
const DashboardPage = React.lazy(() => import('@/pages/Dashboard'));
const Setup = React.lazy(() => import('./pages/Setup'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className='flex items-center justify-center min-h-screen'>
    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
  </div>
);

const AppContent: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <Router>
      <Stylexui />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Landing page - loaded immediately for SEO */}
          <Route
            path='/'
            element={
              <div
                className={`min-h-screen transition-colors duration-300 ${
                  isDark ? 'bg-black text-white' : 'bg-white text-gray-900'
                }`}
              >
                <Header />
                <Hero />
                <Features />
                <ProblemsVsSolutions />
                <HowItWorks />
                <FAQ />
                <ROI />
                <FinalCTA />
                <Footer />
              </div>
            }
          />

          {/* Lazy loaded routes */}
          <Route path='/admin' element={<AdminDashboard />} />
          <Route path='/app' element={<AppUI />} />
          <Route path='/demo' element={<ProductDemo />} />
          <Route path='/get-started' element={<GetStarted />} />

          {/* 🔑 Auth routes */}
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/verify' element={<Verification />} />
          <Route path='/reset-password' element={<ResetPassword />} />

          {/* Dashboard routes */}
          <Route path='/dashboard/*' element={<DashboardPage />} />

          {/* Setup routes */}
          <Route path='/setup/*' element={<Setup />} />

          {/* Fallback */}
          <Route path='*' element={<Navigate to='/' replace />} />

          {/* Workflow routes */}
          <Route path='/workflow/edit' element={<WorkflowBuilderPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
        {/* Performance Dashboard - only in development */}
        {import.meta.env.DEV && <PerformanceDashboard />}
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

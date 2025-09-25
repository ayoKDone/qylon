import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AppUI from './components/AppUI';
import { ErrorBoundary } from './components/ErrorBoundary';
import FAQ from './components/FAQ';
import Features from './components/Features';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import ProblemsVsSolutions from './components/ProblemsVsSolutions';
import ProductDemo from './components/ProductDemo';
import ROI from './components/ROI';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const AppContent: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/app" element={<AppUI />} />
        <Route path="/demo" element={<ProductDemo />} />
        <Route
          path="/"
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
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

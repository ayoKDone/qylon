import React from "react";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

// Existing imports
import AdminDashboard from "./components/AdminDashboard";
import AppUI from "./components/AppUI";
import ProductDemo from "./components/ProductDemo";
import FAQ from "./components/FAQ";
import Features from "./components/Features";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import ProblemsVsSolutions from "./components/ProblemsVsSolutions";
import ROI from "./components/ROI";

// New placeholder imports (to be implemented)
import Login from "@/components/auth/Login";
import Signup from "@/components/auth/Signup";
import ForgotPassword from "@/components/auth/ForgotPassword";
import ResetPassword from "@/components/auth/ResetPassword";
import ProfileSetup from "@/components/auth/ProfileSetup";
import ProtectedRoute from "@/components/layouts/ProtectedRoute";

const AppContent: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <Router>
      <Routes>
        {/* Existing routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/app" element={<AppUI />} />
        <Route path="/demo" element={<ProductDemo />} />

        {/* 🔑 Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />

        {/* Landing page */}
        <Route
          path="/"
          element={
            <div
              className={`min-h-screen transition-colors duration-300 ${
                isDark ? "bg-black text-white" : "bg-white text-gray-900"
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
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

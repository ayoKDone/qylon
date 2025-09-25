import React, { useState, useEffect } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const { isDark } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass-heavy border-b border-white/20'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 via-pink-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col hidden sm:block">
                <span className="text-2xl font-bold text-white drop-shadow-lg">
                  Qylon
                </span>
                <span className="text-xs text-white/60 italic -mt-1">
                  (Pronounced as KEE-LON)
                </span>
              </div>
              <div className="flex flex-col sm:hidden">
                <span className="text-xl font-bold text-white drop-shadow-lg">
                  Qylon
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <ThemeToggle />
            <a
              href="/demo"
              className="font-medium transition-colors duration-200 text-white/80 hover:text-white"
            >
              Live Demo
            </a>
            <a
              href="#features"
              className="font-medium transition-colors duration-200 text-white/80 hover:text-white"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="font-medium transition-colors duration-200 text-white/80 hover:text-white"
            >
              How it works
            </a>
            <a href="#waitlist" className="px-6 py-3 bg-gradient-to-r from-cyan-400 via-pink-500 to-violet-600 text-white font-medium rounded-2xl hover:scale-105 transition-all duration-200 inline-block text-center shadow-lg">
              Join waitlist
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden transition-colors duration-200 text-white/80 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 glass-heavy rounded-2xl">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
              <a
                href="/demo"
                className="font-medium transition-colors duration-200 text-white/80 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Live Demo
              </a>
              <a
                href="#features"
                className="font-medium transition-colors duration-200 text-white/80 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="font-medium transition-colors duration-200 text-white/80 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How it works
              </a>
              <a
                href="#waitlist"
                className="px-6 py-3 bg-gradient-to-r from-cyan-400 via-pink-500 to-violet-600 text-white font-medium rounded-2xl hover:scale-105 transition-all duration-200 shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Join waitlist
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
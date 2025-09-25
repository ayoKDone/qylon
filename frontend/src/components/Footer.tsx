import { FileText, Mail, Shield, Zap } from 'lucide-react';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Liquid Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-t to-transparent ${'from-indigo-900/50 via-purple-900/30'}`}
      ></div>

      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 to-indigo-900/50"></div>

      <div className="container mx-auto px-6 py-12 relative z-10 glass-heavy border-t border-white/20">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 via-pink-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-violet-600 rounded-2xl blur opacity-30"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white drop-shadow-lg">
                Qylon
              </span>
              <span className="hidden sm:block text-xs text-white/60 italic -mt-1">
                (Pronounced as KEE-LON)
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center space-x-4 md:space-x-8 text-sm">
            <a
              href="#privacy"
              className="flex items-center space-x-2 transition-colors duration-200 text-white/70 hover:text-white"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy Policy</span>
              <span className="sm:hidden">Privacy</span>
            </a>
            <a
              href="#terms"
              className="flex items-center space-x-2 transition-colors duration-200 text-white/70 hover:text-white"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Terms of Service</span>
              <span className="sm:hidden">Terms</span>
            </a>
            <a
              href="mailto:hello@qylon.com"
              className="flex items-center space-x-2 transition-colors duration-200 text-white/70 hover:text-white"
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs md:text-sm text-white/70">
            © 2025 Qylon. All rights reserved.
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="mt-8 pt-8 border-t border-white/20 text-center">
          <p className="text-xs md:text-sm text-white/60">
            Built with ⚡ for the future of productive meetings
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleNavClick = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-light-border/40 dark:border-dark-border/40 bg-light-bg/60 dark:bg-dark-bg/60 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-sm shadow-md shadow-accent-primary/20">
            A
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-base text-light-text dark:text-dark-text tracking-tight">AskDB</span>
              <span className="text-[8px] font-bold text-accent-secondary bg-accent-secondary/10 px-1 py-0.5 rounded">
                AI
              </span>
            </div>
            <span className="text-[9px] font-medium text-light-muted dark:text-dark-muted block mt-0.5">
              AI Data Analyst
            </span>
          </div>
        </Link>

        {/* Marketing Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          <button onClick={() => handleNavClick('hero')} className="hover:text-accent-primary transition-colors">
            Product
          </button>
          <button onClick={() => handleNavClick('how-it-works')} className="hover:text-accent-primary transition-colors">
            How It Works
          </button>
          <button onClick={() => handleNavClick('features')} className="hover:text-accent-primary transition-colors">
            Features
          </button>
          <button onClick={() => handleNavClick('technology')} className="hover:text-accent-primary transition-colors">
            Technology
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Theme switcher */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="!p-2 rounded-lg text-light-muted dark:text-dark-muted hover:bg-light-hover dark:hover:bg-dark-hover"
          >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </Button>

          {isAuthenticated ? (
            <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Log In
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

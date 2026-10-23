import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, Zap, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Login = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('demo@askdb.ai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Incorrect email or password. You can use 1-Click Demo Login below or click "Get Started for free" to create an account.');
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    const success = await login(demoEmail, demoPassword);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg transition-colors duration-200 p-6 relative overflow-hidden">
      {/* Decorative gradient radial bubbles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 mx-auto">
            <div className="w-9.5 h-9.5 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-base shadow-md">
              A
            </div>
            <div className="text-left">
              <span className="block font-bold text-lg text-light-text dark:text-dark-text tracking-tight leading-none">
                AskDB
              </span>
              <span className="block text-[10px] text-light-muted dark:text-dark-muted font-medium mt-0.5">
                AI Data Analyst
              </span>
            </div>
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-light-text dark:text-dark-text mt-4">
            Welcome back to AskDB
          </h2>
          <p className="text-xs text-light-muted dark:text-dark-muted">
            Enter your credentials or use 1-Click Demo Login to access the analytics workspace
          </p>
        </div>

        {/* 1-Click Demo Login Quick Access Card */}
        <Card variant="default" className="p-4 border-2 border-accent-secondary/30 bg-accent-secondary/5 dark:bg-accent-secondary/10">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles size={14} className="text-accent-secondary animate-pulse" />
            <span className="text-xs font-bold text-light-text dark:text-dark-text uppercase tracking-wider">
              1-Click Demo Access
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('demo@askdb.ai', 'password123')}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 p-2 bg-white dark:bg-dark-card hover:bg-light-hover dark:hover:bg-dark-hover border border-light-border dark:border-dark-border rounded-lg text-xs font-semibold text-light-text dark:text-dark-text hover:border-accent-secondary transition-all shadow-sm"
            >
              <Zap size={12} className="text-accent-secondary" />
              <span>Demo Analyst</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@askdb.ai', 'admin123')}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 p-2 bg-white dark:bg-dark-card hover:bg-light-hover dark:hover:bg-dark-hover border border-light-border dark:border-dark-border rounded-lg text-xs font-semibold text-light-text dark:text-dark-text hover:border-accent-primary transition-all shadow-sm"
            >
              <ShieldCheck size={12} className="text-accent-primary" />
              <span>Administrator</span>
            </button>
          </div>
        </Card>

        {/* Card Form */}
        <Card variant="glass" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-accent-error/10 border border-accent-error/20 text-accent-error rounded-lg text-xs font-semibold leading-relaxed">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="demo@askdb.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={true}
              icon={Mail}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={true}
                icon={Lock}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[38px] text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center shadow-md shadow-accent-primary/10 mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Prompt signup */}
          <div className="text-center mt-6 text-xs text-light-muted dark:text-dark-muted border-t border-light-border/40 dark:border-dark-border/40 pt-4">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-bold text-accent-primary hover:text-accent-primaryHover transition-colors"
            >
              Get Started for free
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;

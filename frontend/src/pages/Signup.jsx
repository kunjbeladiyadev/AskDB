import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Signup = () => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [strength, setStrength] = useState(0); // 0 to 4

  // Real-time password strength validation
  useEffect(() => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setStrength(score);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const success = await signup(name, email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-accent-error', 'bg-accent-warning', 'bg-accent-secondary', 'bg-accent-success'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg transition-colors duration-200 p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-5 z-10">
        {/* Brand Header */}
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
            Create your account
          </h2>
          <p className="text-xs text-light-muted dark:text-dark-muted">
            Start transforming natural language queries into instant SQL database insights
          </p>
        </div>

        {/* Signup Card */}
        <Card variant="glass" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-accent-error/10 border border-accent-error/20 text-accent-error rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={true}
              icon={User}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={true}
              icon={Mail}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
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

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="space-y-1.5 px-0.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-light-muted dark:text-dark-muted">
                  <span>PASSWORD STRENGTH</span>
                  <span className="text-[11px] font-extrabold uppercase">
                    {strengthLabels[Math.max(0, strength - 1)]}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-full rounded-full transition-all duration-300 ${
                        i < strength 
                          ? strengthColors[strength - 1] 
                          : 'bg-light-border dark:bg-dark-border'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required={true}
              icon={Lock}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center shadow-md shadow-accent-primary/10 mt-4"
              isLoading={isLoading}
            >
              Register Account
            </Button>
          </form>

          {/* Prompt login */}
          <div className="text-center mt-6 text-xs text-light-muted dark:text-dark-muted border-t border-light-border/40 dark:border-dark-border/40 pt-4">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-accent-primary hover:text-accent-primaryHover transition-colors"
            >
              Sign In here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;

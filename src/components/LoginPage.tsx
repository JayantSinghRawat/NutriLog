import React, { useState } from 'react';
import {
  Activity,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';

export function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        await register(cleanEmail, name.trim(), cleanPassword);
      } else {
        await login(cleanEmail, cleanPassword);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setEmail('jayant@example.com');
    setPassword('password123');
    setIsLoading(true);
    try {
      await login('jayant@example.com', 'password123');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Top right theme toggle */}
      <div className="login-top-bar">
        <button
          className="theme-toggle-btn login-theme-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'black' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'black' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      <div className="login-card-container">
        {/* Brand identity */}
        <div className="login-brand-header">
          <div className="login-logo-badge">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <h1 className="login-title">
            NutriLog
            <span className="brand-tag">Tracker</span>
          </h1>
          <p className="login-subtitle">
            Real-time AI Nutrient & Macro Tracker. Your personal logs stay saved across sessions.
          </p>
        </div>

        {/* Mode switcher: Sign In vs Create Account */}
        <div className="login-mode-tabs">
          <button
            type="button"
            className={`login-mode-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setError(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`login-mode-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setError(null);
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-error-alert" role="alert">
            <AlertCircle size={16} className="login-error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="login-field-group">
              <label className="login-field-label">Full Name</label>
              <div className="login-input-wrapper">
                <User size={17} className="login-field-icon" />
                <input
                  type="text"
                  placeholder="e.g. Jayant Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="login-input"
                  autoFocus={mode === 'register'}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="login-field-group">
            <label className="login-field-label">Email Address</label>
            <div className="login-input-wrapper">
              <Mail size={17} className="login-field-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                autoFocus={mode === 'login'}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="login-field-group">
            <label className="login-field-label">Password</label>
            <div className="login-input-wrapper">
              <Lock size={17} className="login-field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input login-password-input"
                disabled={isLoading}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={17} className="login-spinner" />
                <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to NutriLog' : 'Create Account & Start Tracking'}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Demo Account shortcut */}
        {mode === 'login' && (
          <div className="login-demo-section">
            <div className="login-divider">
              <span>or quick start</span>
            </div>
            <button
              type="button"
              className="login-demo-btn"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              <Sparkles size={15} />
              <span>Sign In as Demo User (Jayant)</span>
            </button>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="login-features-list">
          <div className="login-feature-item">
            <span className="login-feature-dot">✦</span>
            <span>Natural language food logging powered by Gemini AI</span>
          </div>
          <div className="login-feature-item">
            <span className="login-feature-dot">✦</span>
            <span>Real-time dynamic calorie, protein, carb & fat tracking</span>
          </div>
          <div className="login-feature-item">
            <span className="login-feature-dot">✦</span>
            <span>Stays logged in securely until you click Log Out</span>
          </div>
        </div>
      </div>
    </div>
  );
}

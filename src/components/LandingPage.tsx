import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTasks,
  FaMoon, FaSun, FaGithub, FaTwitter, FaLinkedin 
} from 'react-icons/fa';
import AuthForm from './auth/AuthForm';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const { login, register, error: authError, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  const handleAuthSubmit = async (data: { email: string; password: string; name?: string }) => {
    try {
      if (authMode === 'login') {
        await login(data.email, data.password);
      } else {
        if (!data.name) throw new Error('Name is required');
        await register(data.email, data.password, data.name);
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  return (
    <div className={`landing-container ${isDarkMode ? 'dark' : 'light'}`}>
      <nav className="nav-bar">
        <div className="nav-logo">
          <FaTasks className="nav-logo-icon" />
          <span>Taskify</span>
        </div>
        <div className="nav-links">
          <button 
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </nav>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="gradient-text">Taskify</span>
              <span className="hero-subtitle">Smart Task Management</span>
            </h1>
            <p className="hero-description">
              Transform your productivity with our intelligent task management platform.
              Organize, track, and accomplish your goals efficiently.
            </p>
            <div className="hero-cta">
              <button className="cta-button primary" onClick={() => setAuthMode('register')}>
                Get Started
              </button>
              <button className="cta-button secondary" onClick={() => setAuthMode('login')}>
                Sign In
              </button>
            </div>
          </div>
        </section>

        <section className="auth-section">
          <div className="auth-container glass-morphism">
            <AuthForm
              mode={authMode}
              onSubmit={handleAuthSubmit}
              error={authError}
              isLoading={isLoading}
              onModeSwitch={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Taskify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 
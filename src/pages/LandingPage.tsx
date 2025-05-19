import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="nav-content">
          <h1 className="logo">Taskify</h1>
          <div className="nav-links">
            <Link to="/login" className="nav-button login">Login</Link>
            <Link to="/register" className="nav-button signup">Sign Up</Link>
          </div>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Organize Your Tasks, Boost Your Productivity</h1>
          <p>A simple and intuitive task management app to help you stay organized and focused.</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-button primary">Get Started</Link>
            <Link to="/login" className="cta-button secondary">Sign In</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/task-management.svg" alt="Task Management Illustration" />
        </div>
      </main>

      <section className="features-section">
        <h2>Why Choose Taskify?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Simple Task Management</h3>
            <p>Create, organize, and track your tasks with ease.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Stay Focused</h3>
            <p>Prioritize your work and achieve your goals faster.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Access Anywhere</h3>
            <p>Use Taskify on any device, anywhere, anytime.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; 2024 Taskify. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 
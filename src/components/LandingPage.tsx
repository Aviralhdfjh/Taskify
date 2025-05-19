import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="logo">Taskify</div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="nav-button">Get Started</Link>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Organize Your Tasks, Boost Your Productivity</h1>
          <p className="hero-subtitle">
            Taskify helps you manage your tasks efficiently, collaborate with your team,
            and achieve your goals faster.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-primary">Start Free Trial</Link>
            <Link to="/login" className="cta-secondary">Sign In</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/task-management.svg" alt="Task Management" />
        </div>
      </main>

      <section className="features-section">
        <h2>Why Choose Taskify?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Simple Task Management</h3>
            <p>Create, organize, and track your tasks with an intuitive interface</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Team Collaboration</h3>
            <p>Work together seamlessly with your team members</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Tracking</h3>
            <p>Monitor your progress with visual analytics and reports</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Smart Notifications</h3>
            <p>Stay updated with real-time notifications and reminders</p>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"Taskify has transformed how our team manages projects. It's simple yet powerful."</p>
            <div className="testimonial-author">- Sarah Johnson, Project Manager</div>
          </div>
          <div className="testimonial-card">
            <p>"The best task management tool I've used. Clean interface and great features."</p>
            <div className="testimonial-author">- Michael Chen, Developer</div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Taskify</h4>
            <p>Making task management simple and efficient</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/about">About</Link>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>support@taskify.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Taskify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 
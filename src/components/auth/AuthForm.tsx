import React, { useState } from 'react';
import './AuthForm.css';

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: { email: string; password: string; name?: string }) => Promise<void>;
  error: string | null;
  isLoading: boolean;
  onModeSwitch: () => void;
}


const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, error, isLoading, onModeSwitch }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
  }>({});

  const validateForm = () => {
    const errors: typeof validationErrors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (mode === 'register' && !formData.name) {
      errors.name = 'Name is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {mode === 'register' && (
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required={mode === 'register'}
              placeholder="Enter your name"
              disabled={isLoading}
              className={validationErrors.name ? 'error' : ''}
            />
            {validationErrors.name && (
              <span className="field-error">{validationErrors.name}</span>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            disabled={isLoading}
            className={validationErrors.email ? 'error' : ''}
          />
          {validationErrors.email && (
            <span className="field-error">{validationErrors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            minLength={6}
            disabled={isLoading}
            className={validationErrors.password ? 'error' : ''}
          />
          {validationErrors.password && (
            <span className="field-error">{validationErrors.password}</span>
          )}
        </div>

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? (
            <span className="loading-spinner"></span>
          ) : (
            mode === 'login' ? 'Sign In' : 'Create Account'
          )}
        </button>

        <div className="auth-switch">
          <p>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button type="button" className="switch-link" onClick={onModeSwitch}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default AuthForm; 
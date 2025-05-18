import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register: React.FC = () => {
  const { register, error, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (data: { email: string; password: string; name?: string }) => {
    if (!data.name) {
      return;
    }
    
    try {
      await register(data.name, data.email, data.password);
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Create Account</h1>
        <AuthForm mode="register" onSubmit={handleSubmit} error={error} />
        <div className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 
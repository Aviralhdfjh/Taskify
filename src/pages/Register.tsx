import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register: React.FC = () => {
  const { register, error, isLoading, user } = useAuth();
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
      await register(data.email, data.password, data.name);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Create Account</h1>
        <AuthForm 
          mode="register" 
          onSubmit={handleSubmit} 
          error={error}
          isLoading={isLoading}
          onModeSwitch={() => navigate('/login')} 
        />
      </div>
    </div>
  );
};

export default Register; 
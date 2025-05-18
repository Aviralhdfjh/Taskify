import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login: React.FC = () => {
  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Welcome Back</h1>
        <AuthForm 
          mode="login" 
          onSubmit={handleSubmit} 
          error={error}
          isLoading={isLoading}
          onModeSwitch={() => navigate('/register')} 
        />
      </div>
    </div>
  );
};

export default Login; 
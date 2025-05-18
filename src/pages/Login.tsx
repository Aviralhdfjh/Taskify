import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: { email: string; password: string }) => {
    await login(data.email, data.password);
    if (!error) {
      navigate('/');
    }
  };

  return (
    <div>
      <AuthForm mode="login" onSubmit={handleSubmit} error={error} />
      <div className="auth-switch">
        Don't have an account? <a href="/register">Register here</a>
      </div>
    </div>
  );
};

export default Login; 
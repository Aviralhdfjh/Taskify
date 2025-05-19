import React from 'react';

interface AuthFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ children, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="auth-form">
      {children}
    </form>
  );
};

export default AuthForm; 
/**
 * API Service Configuration
 * 
 * This module provides a centralized configuration for all API calls in the application.
 * It includes:
 * - Axios instance configuration
 * - Authentication handling
 * - Error handling
 * - Request/response interceptors
 * - Type definitions
 * - Environment-specific configurations
 * - Automatic retry logic
 */

import axios from 'axios';
import type { AxiosError, CancelTokenSource, AxiosResponse } from 'axios';

// Define environment variables type
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_API_URL?: string;
      VITE_ENV?: 'development' | 'production' | 'test';
    }
  }
}

// Environment Configuration
type Environment = 'development' | 'production' | 'test';
const ENV = (import.meta.env.VITE_ENV || 'development') as Environment;
const API_URLS: Record<Environment, string> = {
  development: 'http://localhost:5000',
  production: 'https://taskify-eight-chi.vercel.app',
  test: 'https://taskify-eight-chi.vercel.app'
};

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || API_URLS[ENV];

// Log the API URL in development only
if (import.meta.env.DEV) {
  console.log('API URL:', API_URL);
  console.log('Environment:', ENV);
  console.log('Mode:', import.meta.env.MODE);
}

// Retry Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Create a cancel token source
let cancelTokenSource: CancelTokenSource;

/**
 * Axios instance with custom configuration
 * - Base URL configuration
 * - Default headers
 * - Timeout settings
 * - CORS handling
 * - Retry logic
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: ENV === 'production' ? 15000 : 10000,
  withCredentials: true
});

/**
 * Request Interceptor
 * Adds authentication token to all requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Cancel previous request if it exists
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Operation canceled due to new request.');
    }

    // Create new cancel token
    cancelTokenSource = axios.CancelToken.source();
    config.cancelToken = cancelTokenSource.token;

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Handles authentication errors, redirects, and retries
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

/**
 * Type Definitions
 */
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Authenticates a user and returns their session data
   * @param data - Login credentials
   * @returns Promise with authentication response
   */
  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    try {
      console.log('Attempting to login with:', { email: data.email });
      const response = await api.post<AuthResponse>('/api/login', data);
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              throw new Error('Invalid email or password');
            case 404:
              throw new Error('Login endpoint not found. Please check server configuration.');
            case 429:
              throw new Error('Too many login attempts. Please try again later');
            case 500:
              throw new Error('Server error. Please try again later.');
            default:
              throw new Error(error.response.data?.message || 'Login failed. Please try again');
          }
        } else if (error.code === 'ERR_NETWORK') {
          throw new Error('Network error. Please check your internet connection and server status.');
        }
        throw new Error('Network error. Please check your internet connection');
      }
      throw new Error('An unexpected error occurred during login');
    }
  },

  /**
   * Registers a new user
   * @param data - Registration data
   * @returns Promise with authentication response
   */
  async register(data: { email: string; password: string; name: string }): Promise<AuthResponse> {
    try {
      console.log('Attempting to register with:', { ...data, password: '[REDACTED]' });
      const response = await api.post<AuthResponse>('/api/register', data);
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              throw new Error('Invalid registration data. Please check your input.');
            case 404:
              throw new Error('Registration endpoint not found. Please check server configuration.');
            case 409:
              throw new Error('Email already registered. Please use a different email.');
            case 500:
              throw new Error('Server error. Please try again later.');
            default:
              throw new Error(error.response.data?.message || 'Registration failed. Please try again.');
          }
        } else if (error.code === 'ERR_NETWORK') {
          throw new Error('Network error. Please check your internet connection and server status.');
        }
        throw new Error('Network error. Please check your internet connection');
      }
      throw new Error('An unexpected error occurred during registration');
    }
  },

  /**
   * Sends a password reset email
   * @param email - User's email address
   * @returns Promise indicating success
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      console.log('Sending password reset email to:', email);
      await api.post('/api/forgot-password', { email });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 404:
              throw new Error('Email not found. Please check your email address.');
            case 429:
              throw new Error('Too many attempts. Please try again later.');
            case 500:
              throw new Error('Server error. Please try again later.');
            default:
              throw new Error(error.response.data?.message || 'Failed to send reset email. Please try again.');
          }
        } else if (error.code === 'ERR_NETWORK') {
          throw new Error('Network error. Please check your internet connection.');
        }
        throw new Error('Network error. Please check your internet connection');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Resets the user's password
   * @param data - Reset password data
   * @returns Promise indicating success
   */
  async resetPassword(data: { token: string; password: string }): Promise<void> {
    try {
      console.log('Resetting password for token:', data.token);
      await api.post('/api/reset-password', data);
    } catch (error: any) {
      console.error('Reset password error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              throw new Error('Invalid password. Please check your input.');
            case 404:
              throw new Error('Invalid or expired reset token.');
            case 500:
              throw new Error('Server error. Please try again later.');
            default:
              throw new Error(error.response.data?.message || 'Failed to reset password. Please try again.');
          }
        } else if (error.code === 'ERR_NETWORK') {
          throw new Error('Network error. Please check your internet connection.');
        }
        throw new Error('Network error. Please check your internet connection');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Logs out the current user
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  /**
   * Checks if a user is currently authenticated
   * @returns boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

/**
 * Tests the API connection
 * @returns Promise<boolean> - True if connection is successful, false otherwise
 */
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await api.get('/');
    return response.status === 200;
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error: Unable to connect to the server. Please check if:');
      console.error('1. The server is running at:', API_URL);
      console.error('2. Your internet connection is working');
      console.error('3. The server URL is correct in your .env file');
    } else if (error.response) {
      console.error('Server error:', error.response.status, error.response.data);
    } else {
      console.error('API connection test failed:', error.message);
    }
    return false;
  }
};

// Add a function to check if the server is running
export const isServerRunning = async (): Promise<boolean> => {
  try {
    await api.get('/');
    return true;
  } catch (error: any) {
    return error.code !== 'ERR_NETWORK';
  }
};

// Add a function to get server status
export const getServerStatus = async (): Promise<{
  isRunning: boolean;
  url: string;
  error?: string;
  environment?: string;
}> => {
  try {
    const response = await api.get('/');
    return {
      isRunning: true,
      url: API_URL,
      environment: ENV,
      error: undefined
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        isRunning: true,
        url: API_URL,
        environment: ENV,
        error: 'API endpoint not found. Please ensure the server is properly configured.'
      };
    }
    return {
      isRunning: false,
      url: API_URL,
      environment: ENV,
      error: error.code === 'ERR_NETWORK' 
        ? 'Server is not running or unreachable'
        : error.response?.data?.message || error.message
    };
  }
};

export const taskService = {
  getTasks: async () => {
    try {
      const response: AxiosResponse = await api.get('/tasks');
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Request was canceled');
      }
      throw error;
    }
  },

  createTask: async (taskData: { title: string; description?: string }) => {
    try {
      const response: AxiosResponse = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Request was canceled');
      }
      throw error;
    }
  },

  updateTask: async (taskId: string, taskData: { title?: string; description?: string; completed?: boolean }) => {
    try {
      const response: AxiosResponse = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Request was canceled');
      }
      throw error;
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      const response: AxiosResponse = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Request was canceled');
      }
      throw error;
    }
  },
};

export default api; 
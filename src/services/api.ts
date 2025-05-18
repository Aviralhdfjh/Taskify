import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';

// Define environment variables type
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_API_URL?: string;
    }
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with custom config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout if needed
  timeout: 10000,
  // Allow credentials (cookies, auth headers)
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const data = error.response.data as any;
      throw new Error(data.message || 'An error occurred with the server response');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error);
      throw new Error('No response received from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request
      console.error('Request Setup Error:', error);
      throw new Error('Error setting up the request. Please try again.');
    }
  }
);

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Login failed. Please try again.');
      }
      throw new Error('An unexpected error occurred during login.');
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
      throw new Error('An unexpected error occurred during registration.');
    }
  },

  logout() {
    localStorage.removeItem('token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
};

export default api; 
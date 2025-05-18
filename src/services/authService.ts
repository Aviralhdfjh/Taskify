import { api } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
}

class AuthService {
  private tokenKey = 'token';
  private readonly baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  private async checkServerConnectivity(): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      await fetch(this.baseUrl, { 
        method: 'HEAD',
        signal: controller.signal
      });
      return true;
    } catch (error) {
      console.error('Server connectivity check failed:', error);
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const isConnected = await this.checkServerConnectivity();
      if (!isConnected) {
        throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
      }

      const response = await api.post<AuthResponse>('/auth/login', data);
      this.setToken(response.data.token);
      return response.data;
    } catch (error: any) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const isConnected = await this.checkServerConnectivity();
      if (!isConnected) {
        throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
      }

      const response = await api.post<AuthResponse>('/auth/register', data);
      this.setToken(response.data.token);
      return response.data;
    } catch (error: any) {
      this.handleAuthError(error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private handleAuthError(error: any): never {
    if (error.response) {
      // Server responded with an error
      const message = error.response.data?.message || 'Authentication failed';
      console.error('Server Error:', error.response.data);
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error);
      throw new Error('Unable to reach the server. Please check your internet connection and try again.');
    } else {
      // Error in request setup
      console.error('Request Setup Error:', error);
      throw new Error('Failed to process authentication request. Please try again.');
    }
  }
}

export const authService = new AuthService(); 
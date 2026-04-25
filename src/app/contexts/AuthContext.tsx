import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('AuthProvider render, isLoading:', isLoading);

  useEffect(() => {
    const validateStoredSession = async () => {
      const storedUser = localStorage.getItem('cms_user');
      const storedToken = localStorage.getItem('cms_token');

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        // Validate token with backend
        await api.validateToken();

        // If validation succeeds, restore the session
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.warn('Stored session is invalid, clearing:', error);
        // Clear invalid session data
        localStorage.removeItem('cms_user');
        localStorage.removeItem('cms_token');
        localStorage.removeItem('selected_website');
      } finally {
        setIsLoading(false);
      }
    };

    validateStoredSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);

      console.log('Login response received:', response);

      if (response.status !== 'success') {
        throw new Error(response.message || 'Login failed');
      }

      const loggedUser: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        status: response.user.status,
        avatar: response.user.avatar || '',
        createdAt: new Date(),
      };

      setUser(loggedUser);
      setToken(response.token);
      localStorage.setItem('cms_user', JSON.stringify(loggedUser));
      localStorage.setItem('cms_token', response.token);

      console.log('User logged in successfully:', loggedUser);
    } catch (error) {
      console.error('Login failed in AuthContext:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cms_user');
    localStorage.removeItem('cms_token');
    localStorage.removeItem('selected_website');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

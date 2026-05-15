import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { SessionManager } from '../services/sessionManager';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('AuthProvider render, isLoading:', isLoading);

  useEffect(() => {
    const validateStoredSession = async () => {
      try {
        // Check stored session
        const session = SessionManager.get();

        if (!session || !session.token) {
          console.log('[AuthContext] No stored session found');
          setIsLoading(false);
          return;
        }

        console.log(
          '[AuthContext] Found stored session for:',
          session.user.email
        );

        console.log(
          '[AuthContext] Session time remaining:',
          SessionManager.getTimeRemaining(),
          'seconds'
        );

        try {
          // Validate token with backend
          console.log(
            '[AuthContext] Validating stored session with backend...'
          );

          await api.validateToken();

          console.log('[AuthContext] Session validation successful');

          // Restore session
          setUser(session.user);
          setToken(session.token);

          // Extend session
          SessionManager.extend();

          console.log(
            '[AuthContext] Session restored for user:',
            session.user.email
          );
        } catch (validationError) {
          console.warn(
            '[AuthContext] Session validation failed:',
            validationError
          );

          SessionManager.clear();
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error(
          '[AuthContext] Error during session restoration:',
          error
        );

        SessionManager.clear();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateStoredSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting login for:', email);

      const response = await api.login(email, password);

      console.log(
        '[AuthContext] Login response received:',
        response
      );

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

      // Update state
      setUser(loggedUser);
      setToken(response.token);

      // Store session
      SessionManager.save({
        user: loggedUser,
        token: response.token,
        sessionId: response.sessionId,
      });

      // Optional backup storage
      localStorage.setItem('token', response.token);

      if (response.sessionId) {
        localStorage.setItem(
          'cms_session_id',
          response.sessionId
        );
      }

      console.log(
        '[AuthContext] User logged in successfully:',
        loggedUser.email
      );
    } catch (error) {
      console.error(
        '[AuthContext] Login failed in AuthContext:',
        error
      );

      throw error;
    }
  };

  const logout = () => {
    console.log('[AuthContext] Logging out user');

    setUser(null);
    setToken(null);

    SessionManager.clear();

    localStorage.removeItem('selected_website');
    localStorage.removeItem('token');
    localStorage.removeItem('cms_session_id');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
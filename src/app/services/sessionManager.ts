// Session management utilities for persistent authentication
import { User } from '../types';

export interface StoredSession {
  user: User;
  token: string;
  sessionId?: string;
  expiresAt?: number;
}

const SESSION_STORAGE_KEY = 'cms_session';
const TOKEN_KEY = 'cms_token';
const USER_KEY = 'cms_user';
const SESSION_ID_KEY = 'cms_session_id';

export const SessionManager = {
  /**
   * Save session to localStorage
   */
  save(session: StoredSession): void {
    try {
      const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
      const data = { ...session, expiresAt };
      
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(TOKEN_KEY, session.token);
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
      if (session.sessionId) {
        localStorage.setItem(SESSION_ID_KEY, session.sessionId);
      }
      
      console.log('[SessionManager] Session saved successfully');
    } catch (error) {
      console.error('[SessionManager] Failed to save session:', error);
    }
  },

  /**
   * Get session from localStorage
   */
  get(): StoredSession | null {
    try {
      const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!sessionData) {
        console.log('[SessionManager] No session data found in localStorage');
        return null;
      }

      const session = JSON.parse(sessionData);
      
      // Check if session is expired
      if (session.expiresAt && Date.now() > session.expiresAt) {
        console.log('[SessionManager] Session expired, clearing');
        SessionManager.clear();
        return null;
      }

      return session;
    } catch (error) {
      console.error('[SessionManager] Failed to get session:', error);
      return null;
    }
  },

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get user from localStorage
   */
  getUser() {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('[SessionManager] Failed to parse user data:', error);
      return null;
    }
  },

  /**
   * Clear session from localStorage
   */
  clear(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(SESSION_ID_KEY);
      localStorage.removeItem('selected_website');
      console.log('[SessionManager] Session cleared');
    } catch (error) {
      console.error('[SessionManager] Failed to clear session:', error);
    }
  },

  /**
   * Check if session exists and is valid
   */
  isValid(): boolean {
    const session = this.get();
    return !!session && !!session.token;
  },

  /**
   * Get remaining time (in seconds) until session expires
   */
  getTimeRemaining(): number {
    try {
      const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!sessionData) return 0;

      const session = JSON.parse(sessionData);
      if (!session.expiresAt) return 0;

      const remaining = Math.floor((session.expiresAt - Date.now()) / 1000);
      return Math.max(0, remaining);
    } catch (error) {
      console.error('[SessionManager] Failed to get time remaining:', error);
      return 0;
    }
  },

  /**
   * Extend session expiration
   */
  extend(): void {
    try {
      const session = this.get();
      if (session) {
        this.save(session);
        console.log('[SessionManager] Session extended');
      }
    } catch (error) {
      console.error('[SessionManager] Failed to extend session:', error);
    }
  }
};

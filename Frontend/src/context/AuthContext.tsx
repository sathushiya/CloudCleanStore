import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthUser } from '../services/authService';
import { refreshSession, clearAuthStorage } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true while checking token on startup

  // On app load there is never an access token in memory. Try a silent refresh
  // using the HttpOnly refresh cookie; if that yields a token, fetch the user.
  // refreshSession() is de-duplicated, so StrictMode's double-run effect still
  // sends only ONE /auth/refresh request. Both calls are bounded by the axios
  // 20s timeout, so the loading spinner can't hang.
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await refreshSession();
        if (token) {
          setUser(await authService.me());
        } else {
          clearAuthStorage();
          setUser(null);
        }
      } catch {
        clearAuthStorage();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (user: AuthUser) => {
    setUser(user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const fetchedUser = await authService.me();
    setUser(fetchedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
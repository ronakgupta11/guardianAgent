'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useJwtContext } from '@lit-protocol/vincent-app-sdk/react';
import { useBackend } from '@/hooks/useBackend';

interface User {
  id: number;
  name: string;
  email: string;
  wallet_address: string;
  vincent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (walletAddress: string) => Promise<void>;
  register: (userData: { name: string; email: string; wallet_address: string; vincent_id?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected } = useAccount();
  const { authInfo } = useJwtContext();
  const { loginUser, registerUser, getCurrentUser, verifyToken } = useBackend();

  const isAuthenticated = !!user;

  // Check authentication status on mount and when authInfo changes
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        if (authInfo?.jwt) {
          // For Vincent JWTs, we don't need to verify with backend
          // The JWT itself is proof of authentication
          // Just check if we have a stored user from registration
          if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('guardian_user');
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser));
              } catch (e) {
                localStorage.removeItem('guardian_user');
                setUser(null);
              }
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } else {
          // If no JWT token, check if we have a user in localStorage as fallback
          if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('guardian_user');
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser));
              } catch (e) {
                localStorage.removeItem('guardian_user');
                setUser(null);
              }
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [authInfo?.jwt, verifyToken]);

  const login = async (walletAddress: string) => {
    try {
      setIsLoading(true);
      const response = await loginUser(walletAddress);
      
      // Store the JWT token (Vincent SDK handles this)
      if (response.access_token) {
        // The JWT will be handled by Vincent SDK
        setUser(response.user);
        // Also store user in localStorage as fallback
        if (typeof window !== 'undefined') {
          localStorage.setItem('guardian_user', JSON.stringify(response.user));
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; wallet_address: string; vincent_id?: string }) => {
    try {
      setIsLoading(true);
      const newUser = await registerUser(userData);
      setUser(newUser);
      // Store user in localStorage as fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('guardian_user', JSON.stringify(newUser));
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guardian_user');
    }
    // Vincent SDK will handle JWT cleanup
  };

  const refreshUser = async () => {
    if (!authInfo?.jwt) return;
    
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

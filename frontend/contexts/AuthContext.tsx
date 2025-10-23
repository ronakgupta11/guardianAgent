'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount } from 'wagmi';
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
  register: (userData: { name: string; email: string; wallet_address: string }) => Promise<User>;
  logout: () => void;
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
  const [isClient, setIsClient] = useState(false);
  const { address, isConnected } = useAccount();
  const { loginUser, registerUser, getCurrentUser, verifyToken } = useBackend();

  const isAuthenticated = !!user;

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    if (!isClient) return;

    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Check if we have a stored user from localStorage
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
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isClient]);

  const login = async (walletAddress: string) => {
    try {
      setIsLoading(true);
      const response = await loginUser(walletAddress) as { access_token: string; user: User };
      
      // Store the JWT token and user data
      if (response.access_token) {
        setUser(response.user);
        // Store user in localStorage as fallback
        if (isClient) {
          localStorage.setItem('guardian_user', JSON.stringify(response.user));
          
          // Verify JWT was stored by useBackend.loginUser, if not store it manually
          if (!localStorage.getItem('GUARDIAN_BACKEND_JWT')) {
            localStorage.setItem('GUARDIAN_BACKEND_JWT', response.access_token);
          }
        }
      }
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; wallet_address: string }) => {
    try {
      setIsLoading(true);
      const newUser = await registerUser(userData) as User;
      setUser(newUser);
      // Store user in localStorage as fallback
      if (isClient) {
        localStorage.setItem('guardian_user', JSON.stringify(newUser));
      }
      return newUser;
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
    if (isClient) {
      localStorage.removeItem('guardian_user');
      localStorage.removeItem('GUARDIAN_BACKEND_JWT');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

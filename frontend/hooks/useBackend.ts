'use client';

import { useCallback } from 'react';
import { env } from '@/lib/env';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const useBackend = () => {

  const sendRequest = useCallback(
    async <T>(endpoint: string, method: HTTPMethod, body?: unknown): Promise<T> => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add backend JWT token if available
      if (typeof window !== 'undefined') {
        const backendJwt = localStorage.getItem('GUARDIAN_BACKEND_JWT');
        if (backendJwt) {
          headers.Authorization = `Bearer ${backendJwt}`;
        }
      }

      try {
        const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
          method,
          headers,
          ...(body ? { body: JSON.stringify(body) } : {}),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return response.json() as T;
      } catch (error) {
        // Handle network errors or backend not running
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Backend server is not running. Please start the backend server.');
        }
        throw error;
      }
    },
    []
  );

  // Authentication methods
  const registerUser = useCallback(
    async (userData: { name: string; email: string; wallet_address: string }) => {
      return sendRequest('/api/v1/auth/register', 'POST', userData);
    },
    [sendRequest]
  );

  const loginUser = useCallback(
    async (walletAddress: string) => {
      console.log('🔐 useBackend: Starting login request for:', walletAddress);
      console.log('🔐 useBackend: Backend URL:', env.NEXT_PUBLIC_BACKEND_URL);
      
      // Call login endpoint directly without requiring auth
      const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet_address: walletAddress }),
      });

      console.log('🔐 useBackend: Response status:', response.status);
      console.log('🔐 useBackend: Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ useBackend: Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      
      // Store backend JWT token
      if (data.access_token && typeof window !== 'undefined') {
        localStorage.setItem('GUARDIAN_BACKEND_JWT', data.access_token);
      }
      
      return data;
    },
    []
  );

  const verifyToken = useCallback(
    async () => {
      return sendRequest('/api/v1/auth/verify-token', 'POST');
    },
    [sendRequest]
  );

  // User methods
  const getCurrentUser = useCallback(
    async () => {
      return sendRequest('/api/v1/users/me', 'GET');
    },
    [sendRequest]
  );

  const updateUser = useCallback(
    async (userData: { name?: string; email?: string; vincent_id?: string }) => {
      return sendRequest('/api/v1/users/me', 'PUT', userData);
    },
    [sendRequest]
  );

  // Position methods
  const getPositions = useCallback(
    async () => {
      return sendRequest('/api/v1/positions/', 'GET');
    },
    [sendRequest]
  );

  const discoverPositions = useCallback(
    async (chainIds: string[]) => {
      return sendRequest('/api/v1/positions/discover', 'POST', chainIds);
    },
    [sendRequest]
  );

  const getPosition = useCallback(
    async (positionId: number) => {
      return sendRequest(`/api/v1/positions/${positionId}`, 'GET');
    },
    [sendRequest]
  );

  // Alert methods
  const getAlerts = useCallback(
    async (resolved?: boolean, severity?: string) => {
      const params = new URLSearchParams();
      if (resolved !== undefined) params.append('resolved', resolved.toString());
      if (severity) params.append('severity', severity);
      
      const queryString = params.toString();
      const endpoint = `/api/v1/alerts/${queryString ? `?${queryString}` : ''}`;
      return sendRequest(endpoint, 'GET');
    },
    [sendRequest]
  );

  const getActiveAlerts = useCallback(
    async () => {
      return sendRequest('/api/v1/alerts/active', 'GET');
    },
    [sendRequest]
  );

  const resolveAlert = useCallback(
    async (alertId: number) => {
      return sendRequest(`/api/v1/alerts/${alertId}/resolve`, 'POST');
    },
    [sendRequest]
  );

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('GUARDIAN_BACKEND_JWT');
    }
  }, []);

  return {
    // Authentication
    registerUser,
    loginUser,
    logout,
    verifyToken,
    
    // Users
    getCurrentUser,
    updateUser,
    
    // Positions
    getPositions,
    discoverPositions,
    getPosition,
    
    // Alerts
    getAlerts,
    getActiveAlerts,
    resolveAlert,
  };
};
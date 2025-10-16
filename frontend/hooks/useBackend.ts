'use client';

import { useCallback } from 'react';
import { useJwtContext, useVincentWebAuthClient } from '@lit-protocol/vincent-app-sdk/react';
import { env } from '@/lib/env';


type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const useBackend = () => {
  const { authInfo } = useJwtContext();
  const vincentWebAuthClient = useVincentWebAuthClient(env.NEXT_PUBLIC_APP_ID);
  
  // Temporary mock data for testing
//   const authInfo = { jwt: null };
//   const vincentWebAuthClient = {
//     redirectToConnectPage: (options: any) => {
//       console.log('Mock redirect to connect page:', options);
//     }
//   };

  const getJwt = useCallback(() => {
    vincentWebAuthClient.redirectToConnectPage({
      // Redirect to dedicated callback route so we can finalize auth
      // per Vincent docs: redirectToConnectPage -> app gets JWT in URL
      redirectUri: env.NEXT_PUBLIC_REDIRECT_URI || `${window.location.origin}/login/callback`,
    });
  }, [vincentWebAuthClient]);

  const sendRequest = useCallback(
    async <T>(endpoint: string, method: HTTPMethod, body?: unknown): Promise<T> => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add JWT token if available
      if (authInfo?.jwt) {
        headers.Authorization = `Bearer ${authInfo.jwt}`;
      } else if (typeof window !== 'undefined') {
        // Fallback to Vincent JWT stored locally by callback handler
        const storedJwt = localStorage.getItem('VINCENT_AUTH_JWT');
        if (storedJwt) {
          headers.Authorization = `Bearer ${storedJwt}`;
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
    [authInfo]
  );

  // Authentication methods
  const registerUser = useCallback(
    async (userData: { name: string; email: string; wallet_address: string; vincent_id?: string }) => {
      return sendRequest('/api/v1/auth/register', 'POST', userData);
    },
    [sendRequest]
  );

  const loginUser = useCallback(
    async (walletAddress: string) => {
      return sendRequest('/api/v1/auth/login', 'POST', { wallet_address: walletAddress });
    },
    [sendRequest]
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
    async () => {
      return sendRequest('/api/v1/positions/discover', 'POST');
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

  return {
    // Authentication
    registerUser,
    loginUser,
    verifyToken,
    getJwt,
    authInfo,
    
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
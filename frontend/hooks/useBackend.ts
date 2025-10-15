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
      redirectUri: env.NEXT_PUBLIC_REDIRECT_URI,
    });
  }, [vincentWebAuthClient]);

  const sendRequest = useCallback(
    async <T>(endpoint: string, method: HTTPMethod, body?: unknown): Promise<T> => {
      if (!authInfo?.jwt) {
        throw new Error('No JWT to query backend');
      }

      const headers: HeadersInit = {
        Authorization: `Bearer ${authInfo.jwt}`,
      };
      if (body != null) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = (await response.json()) as { data: T; success: boolean };

      if (!json.success) {
        throw new Error(`Backend error: ${json.data}`);
      }

      return json.data;
    },
    [authInfo]
  );

  // Add your specific API methods here
  const createSomething = useCallback(
    async (data: any) => {
      return sendRequest('/api/endpoint', 'POST', data);
    },
    [sendRequest]
  );

  const getSomething = useCallback(async () => {
    return sendRequest('/api/endpoint', 'GET');
  }, [sendRequest]);

  return {
    createSomething,
    getSomething,
    getJwt,
    authInfo,
  };
};
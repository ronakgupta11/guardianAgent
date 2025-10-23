"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useJwtContext } from "@lit-protocol/vincent-app-sdk/react"
import { env } from "@/lib/env"
import { useBackend } from "@/hooks/useBackend"
import { useAuth } from "@/contexts/AuthContext"
import { getWebAuthClient } from '@lit-protocol/vincent-app-sdk/webAuthClient'
import { isExpired } from '@lit-protocol/vincent-app-sdk/jwt';

export default function VincentCallbackPage() {
  const router = useRouter()
  const vincentAppClient = getWebAuthClient({ appId: env.NEXT_PUBLIC_APP_ID });
  const { authInfo } = useJwtContext()
  const { registerUser } = useBackend()
  const { register } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 Vincent callback page loaded');
      console.log('📍 Current URL:', window.location.href);
      console.log('🔧 Expected audience:', env.NEXT_PUBLIC_EXPECTED_AUDIENCE);
      console.log('🆔 App ID:', env.NEXT_PUBLIC_APP_ID);
      
      try {
        // Check if JWT is embedded in URI after redirect
        const hasJWT = vincentAppClient.uriContainsVincentJWT();
        console.log('🔍 URI contains Vincent JWT:', hasJWT);
        
        if (hasJWT) {
          console.log('✅ JWT found in URI, processing...');
          // Handle app logic for the user has just logged in
          try {
            console.log('🔓 Attempting to decode JWT with audience:', env.NEXT_PUBLIC_EXPECTED_AUDIENCE);
            const result = await vincentAppClient.decodeVincentJWTFromUri(env.NEXT_PUBLIC_EXPECTED_AUDIENCE);
            console.log('🎫 JWT decoded successfully',result);

            if (!result) {
              throw new Error('Failed to decode JWT');
            }

            const {decodedJWT:decoded, jwtStr:jwt} = result;

            console.log('📋 Decoded JWT payload:', decoded);
            console.log('🔑 JWT token length:', jwt.length);
            
            // Store `jwt` for later usage; the user is now logged in.
            if (typeof window !== 'undefined') {
              localStorage.setItem('VINCENT_AUTH_JWT', jwt)
              console.log('💾 JWT stored in localStorage');
            }
            
            vincentAppClient.removeVincentJWTFromURI()
            console.log('🧹 JWT removed from URI');
            
            // Check if we have pending user data (new registration)
            const pendingUserData = localStorage.getItem('pending_user_data');
            console.log('📝 Pending user data found:', !!pendingUserData);
            
            if (pendingUserData) {
              try {
                const userData = JSON.parse(pendingUserData);
                console.log('👤 Creating user with data:', userData);
                // Create user in database after Vincent authentication
                await register(userData);
                console.log('✅ User created successfully');
                // Clear pending data
                localStorage.removeItem('pending_user_data');
                console.log('🗑️ Pending user data cleared');
              } catch (error) {
                console.error('❌ Failed to create user after Vincent auth:', error);
                router.replace('/login');
                return;
              }
            } else {
              // Existing user - login with backend to get JWT
              try {
                console.log('🔐 Logging in existing user with backend...');
                console.log('🔍 Decoded JWT structure:', decoded);
                const walletAddress = (decoded as any).address || (decoded as any).wallet_address || (decoded as any).sub; // Try different possible fields
                console.log('👛 Wallet address from JWT:', walletAddress);
                
                const loginResponse = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ wallet_address: walletAddress }),
                });

                if (loginResponse.ok) {
                  const loginData = await loginResponse.json();
                  console.log('🔐 Backend login successful:', loginData);
                  
                  // Store backend JWT
                  if (loginData.access_token && typeof window !== 'undefined') {
                    localStorage.setItem('GUARDIAN_BACKEND_JWT', loginData.access_token);
                    console.log('✅ Backend JWT stored in localStorage');
                  }
                } else {
                  console.error('❌ Backend login failed:', await loginResponse.text());
                  router.replace('/login');
                  return;
                }
              } catch (error) {
                console.error('❌ Failed to login with backend:', error);
                router.replace('/login');
                return;
              }
            }
            
            console.log('🏠 Redirecting to dashboard');
            // Redirect to dashboard
            router.replace('/dashboard')
          } catch (jwtError: any) {
            console.error('❌ Failed to decode Vincent JWT:', jwtError)
            console.error('🔍 JWT Error details:', {
              message: jwtError.message,
              stack: jwtError.stack,
              name: jwtError.name
            });
            // If JWT decode fails, redirect to login
            router.replace('/login')
            return
          }
        } else {
          console.log('🔄 No JWT in URI, checking stored JWT...');
          // Handle app logic for the user is _already logged in_ (check for stored & unexpired JWT)
          const jwt = localStorage.getItem('VINCENT_AUTH_JWT');
          console.log('💾 Stored JWT found:', !!jwt);
          
          if (jwt) {
            const expired = isExpired(jwt as any);
            console.log('⏰ JWT expired:', expired);
            
            if (expired) {
              console.log('🔄 JWT expired, redirecting to Vincent login');
              // User must re-log in
              vincentAppClient.redirectToConnectPage({ redirectUri: window.location.href });
              return
            }
          }

          if (!jwt) {
            console.log('❌ No stored JWT, redirecting to Vincent login');
            // Handle app logic for the user is not yet logged in
            vincentAppClient.redirectToConnectPage({ redirectUri: window.location.href });
            return
          }

          console.log('✅ Valid JWT found, redirecting to dashboard');
          // JWT exists and is not expired, verify with backend and redirect to dashboard
          // Check if we have a backend JWT
          const backendJwt = localStorage.getItem('GUARDIAN_BACKEND_JWT');
          if (!backendJwt) {
            console.log('🔐 No backend JWT found, logging in with backend...');
            try {
              // Extract wallet address from Vincent JWT
              const decoded = JSON.parse(atob(jwt.split('.')[1]));
              const walletAddress = decoded.address || decoded.wallet_address || decoded.sub;
              console.log('👛 Wallet address from stored JWT:', walletAddress);
              
              const loginResponse = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ wallet_address: walletAddress }),
              });

              if (loginResponse.ok) {
                const loginData = await loginResponse.json();
                console.log('🔐 Backend login successful:', loginData);
                
                // Store backend JWT
                if (loginData.access_token && typeof window !== 'undefined') {
                  localStorage.setItem('GUARDIAN_BACKEND_JWT', loginData.access_token);
                  console.log('✅ Backend JWT stored in localStorage');
                }
              } else {
                console.error('❌ Backend login failed:', await loginResponse.text());
                router.replace('/login');
                return;
              }
            } catch (error) {
              console.error('❌ Failed to login with backend:', error);
              router.replace('/login');
              return;
            }
          }
          router.replace('/dashboard')
        }
      } catch (error: any) {
        console.error('💥 Vincent callback error:', error)
        console.error('🔍 Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        // If anything fails, send user to login to restart flow
        router.replace('/login')
      }
    }

    handleCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}



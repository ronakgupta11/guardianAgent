'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { env } from '@/lib/env';

interface BackendStatusProps {
  children: React.ReactNode;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ children }) => {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        setIsBackendOnline(response.ok);
      } catch (error) {
        console.error('Backend health check failed:', error);
        setIsBackendOnline(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkBackend();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Checking backend connection...</p>
        </div>
      </div>
    );
  }

  if (!isBackendOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-md w-full">
          <div className="bg-card/80 backdrop-blur-xl border border-red-200 dark:border-red-800 rounded-lg p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-300">
                Backend Server Offline
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                The backend server is not running. Please start it to use the application.
              </p>
            </div>
            <div className="space-y-2 text-left">
              <p className="text-xs text-muted-foreground">
                <strong>To start the backend:</strong>
              </p>
              <div className="bg-muted/50 rounded p-3 text-xs font-mono">
                <div>cd backend</div>
                <div>python run.py</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Backend URL: {env.NEXT_PUBLIC_BACKEND_URL}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

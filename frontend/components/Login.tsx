'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useBackend } from '@/hooks/useBackend';

export const Login: React.FC = () => {
  const { getJwt } = useBackend();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-w-screen bg-gray-100">
      <Card className="w-full md:max-w-md bg-white p-8 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Your App Name</CardTitle>
          <CardDescription className="text-gray-600">
            Connect with Vincent to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          <p className="text-gray-700">
            Welcome to your app. Connect with Vincent to manage your operations securely.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col items-center">
          <Button onClick={getJwt} className="bg-purple-600 text-white hover:bg-purple-700">
            Connect with Vincent
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
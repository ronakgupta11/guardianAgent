'use client';
 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { JwtProvider } from '@lit-protocol/vincent-app-sdk/react';
 
const queryClient = new QueryClient();
 
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JwtProvider appId={7554632662}>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
    </JwtProvider>

  );
}
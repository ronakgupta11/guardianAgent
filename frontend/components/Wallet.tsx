'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { LogOut, RefreshCcw, Copy, Check } from 'lucide-react';
import { useJwtContext } from '@lit-protocol/vincent-app-sdk/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChain } from '@/hooks/useChain';

const formatAddress = (address: string | undefined) => {
  if (!address) return 'Loading...';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const Wallet: React.FC = () => {
  const { getEthBalance, getUsdcBalance, getWbtcBalance, chain } = useChain();
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [wbtcBalance, setWbtcBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const { authInfo, logOut } = useJwtContext();

  const fetchBalances = useCallback(async () => {
    if (!authInfo?.pkp.ethAddress) return;

    try {
      setIsLoadingBalance(true);
      const [eth, usdc, wbtc] = await Promise.all([
        getEthBalance(authInfo.pkp.ethAddress as `0x${string}`),
        getUsdcBalance(authInfo.pkp.ethAddress as `0x${string}`),
        getWbtcBalance(authInfo.pkp.ethAddress as `0x${string}`),
      ]);
      
      setEthBalance(eth);
      setUsdcBalance(usdc);
      setWbtcBalance(wbtc);
      setIsLoadingBalance(false);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setIsLoadingBalance(false);
    }
  }, [authInfo, getEthBalance, getUsdcBalance, getWbtcBalance]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const copyAddress = useCallback(async () => {
    const address = authInfo?.pkp.ethAddress;
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy address', err);
    }
  }, [authInfo?.pkp.ethAddress]);

  return (
    <Card className="w-full bg-white p-6 shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Wallet</CardTitle>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        <div className="flex items-center justify-between">
          <span>Wallet Address:</span>
          <div className="flex items-center gap-2">
            <span>{formatAddress(authInfo?.pkp.ethAddress)}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={copyAddress}
              disabled={!authInfo?.pkp.ethAddress}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span>Network:</span>
          <span>{chain.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>ETH Balance:</span>
          <span>
            {isLoadingBalance ? 'Loading...' : `${parseFloat(ethBalance).toFixed(6)} ETH`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>USDC Balance:</span>
          <span>
            {isLoadingBalance ? 'Loading...' : `${parseFloat(usdcBalance).toFixed(2)} USDC`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>WBTC Balance:</span>
          <span>
            {isLoadingBalance ? 'Loading...' : `${parseFloat(wbtcBalance).toFixed(8)} WBTC`}
          </span>
        </div>

        <Button className="w-full" disabled={isLoadingBalance} onClick={fetchBalances}>
          {isLoadingBalance ? 'Refreshing...' : <><RefreshCcw /> Refresh Balance</>}
        </Button>

        <Button className="w-full" variant="destructive" onClick={logOut}>
          <LogOut /> Log Out
        </Button>
      </CardContent>
    </Card>
  );
};
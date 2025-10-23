'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBackend } from './useBackend';
import { useAccount } from 'wagmi';

export interface Position {
  id: number;
  chain_id: string;
  chain_name: string;
  supplied_assets: Array<{
    token: string;
    amount: number;
    usd_value?: number;
  }>;
  borrowed_assets: Array<{
    token: string;
    amount: number;
    usd_value?: number;
  }>;
  health_factor: number;
  risk_level: string;
  total_collateral_usd: number;
  total_borrowed_usd: number;
  created_at: string;
  updated_at?: string;
}

export interface PositionSummary {
  total_positions: number;
  total_collateral_usd: number;
  total_borrowed_usd: number;
  net_value_usd: number;
  average_health_factor: number;
  risk_level: string;
  positions: Position[];
}

export const usePositions = () => {
  const { address, isConnected } = useAccount();
  const { getPositions, discoverPositions } = useBackend();
  const [data, setData] = useState<PositionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!isConnected || !address) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const positions = await getPositions();
      setData(positions);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch positions'));
      console.error('Error fetching positions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, getPositions]);

  const discover = useCallback(async (chainIds: string[]) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const discovered = await discoverPositions(chainIds);
      // After discovery, fetch updated positions
      await fetchPositions();
      return discovered;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to discover positions'));
      console.error('Error discovering positions:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, discoverPositions, fetchPositions]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchPositions,
    discover,
  };
};


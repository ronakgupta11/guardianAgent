'use client';

import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useUserSupplies, useUserBorrows, useUserMarketState, evmAddress, useAaveMarkets,chainId } from '@aave/react';
import { formatUnits } from 'viem';

export interface AavePosition {
  id: string;
  chainId: number;
  chainName: string;
  protocol: string;
  collateralTokens: Array<{
    symbol: string;
    address: string;
    amount: number;
    usdValue: number;
  }>;
  borrowedTokens: Array<{
    symbol: string;
    address: string;
    amount: number;
    usdValue: number;
  }>;
  collateralUsd: number;
  borrowedUsd: number;
  healthFactor: number;
  ltv: number;
  positionAddress?: string;
}

export interface AavePortfolioSummary {
  totalPositions: number;
  totalCollateralUsd: number;
  totalBorrowedUsd: number;
  netValueUsd: number;
  averageHealthFactor: number;
  riskLevel: string;
  positions: AavePosition[];
}

export const useAaveData = () => {
  const { address, isConnected } = useAccount();
  
  const { data:markets, loading:marketsLoading, error:marketsError } = useAaveMarkets({
    chainIds: [chainId(1)],
  });
  
  // Only fetch user data if we have a valid address and markets
  const hasValidAddress = address && address.length > 0;
  const hasValidMarkets = markets && markets.length > 0;
  
  // Debug logging
  console.log('useAaveData Debug:', {
    address,
    isConnected,
    hasValidAddress,
    hasValidMarkets,
    marketsCount: markets?.length || 0,
    marketsError
  });
  
  // Fetch user supplies (collateral) - only if we have valid data
  const { data: supplies, loading: suppliesLoading } = useUserSupplies(
    hasValidAddress && hasValidMarkets ? {
      user: evmAddress(address),
      markets: markets.map(m => ({ chainId: m.chain.chainId, address: m.address })),
    } : {
      user: evmAddress('0x0000000000000000000000000000000000000000'),
      markets: [],
    }
  );
  
  // Fetch user borrows - only if we have valid data
  const { data: borrows, loading: borrowsLoading } = useUserBorrows(
    hasValidAddress && hasValidMarkets ? {
      user: evmAddress(address),
      markets: markets.map(m => ({ chainId: m.chain.chainId, address: m.address })),
    } : {
      user: evmAddress('0x0000000000000000000000000000000000000000'),
      markets: [],
    }
  );
  
  // Fetch market state data for prices - only if we have valid data
  const { data: marketData, loading: marketLoading } = useUserMarketState(
    hasValidAddress && hasValidMarkets ? {
      chainId: chainId(1),
      user: evmAddress(address),
      market: evmAddress(markets[0].address),
    } : {
      chainId: chainId(1),
      user: evmAddress('0x0000000000000000000000000000000000000000'),
      market: evmAddress('0x0000000000000000000000000000000000000000'),
    }
  );

  const isLoading = suppliesLoading || borrowsLoading || marketLoading || marketsLoading;

  const portfolioData = useMemo((): AavePortfolioSummary => {
    if (!supplies || !borrows || !marketData || !hasValidAddress) {
      return {
        totalPositions: 0,
        totalCollateralUsd: 0,
        totalBorrowedUsd: 0,
        netValueUsd: 0,
        averageHealthFactor: 0,
        riskLevel: 'safe',
        positions: [],
      };
    }

    const positions: AavePosition[] = [];
    let totalCollateralUsd = 0;
    let totalBorrowedUsd = 0;
    let weightedHealthFactor = 0;

    // Process supplies (collateral) - using correct Aave SDK structure
    const collateralTokens = supplies.map((supply) => {
      // Access the correct properties from the Aave SDK response
      const currency = supply.currency;
      const balance = supply.balance;
      const price = parseFloat(balance.usdPerToken?.valueOf() || '0');
      const amount = parseFloat(balance.amount?.value || '0');
      const usdValue = parseFloat(balance.usd?.valueOf() || '0');
      
      totalCollateralUsd += usdValue;
      
      return {
        symbol: currency.symbol,
        address: currency.address,
        amount,
        usdValue,
      };
    });

    // Process borrows - using correct Aave SDK structure
    const borrowedTokens = borrows.map((borrow) => {
      // Access the correct properties from the Aave SDK response
      const currency = borrow.currency;
      const debt = borrow.debt;
      const price = parseFloat(debt.usdPerToken?.valueOf() || '0');
      const amount = parseFloat(debt.amount?.value || '0');
      const usdValue = parseFloat(debt.usd?.valueOf() || '0');
      
      totalBorrowedUsd += usdValue;
      
      return {
        symbol: currency.symbol,
        address: currency.address,
        amount,
        usdValue,
      };
    });

    // Use health factor from market data if available, otherwise calculate
    let healthFactor = 0;
    if (marketData.healthFactor) {
      healthFactor = parseFloat(marketData.healthFactor.valueOf() || '0');
    } else if (totalBorrowedUsd > 0) {
      // Fallback calculation if health factor not available
      const liquidationThreshold = 0.8; // Default 80% LTV
      healthFactor = (totalCollateralUsd * liquidationThreshold) / totalBorrowedUsd;
    } else if (totalCollateralUsd > 0) {
      healthFactor = Infinity; // No debt = infinite health factor
    }

    // Create position if user has any activity
    if (collateralTokens.length > 0 || borrowedTokens.length > 0) {
      const position: AavePosition = {
        id: `aave-${address}`,
        chainId: 1, // Ethereum mainnet
        chainName: 'Ethereum',
        protocol: 'Aave',
        collateralTokens,
        borrowedTokens,
        collateralUsd: totalCollateralUsd,
        borrowedUsd: totalBorrowedUsd,
        healthFactor: healthFactor === Infinity ? 999 : healthFactor,
        ltv: totalCollateralUsd > 0 ? totalBorrowedUsd / totalCollateralUsd : 0,
        positionAddress: address,
      };
      
      positions.push(position);
      weightedHealthFactor = healthFactor;
    }

    // Determine risk level
    let riskLevel = 'safe';
    if (weightedHealthFactor < 1.25) {
      riskLevel = 'critical';
    } else if (weightedHealthFactor < 1.5) {
      riskLevel = 'danger';
    } else if (weightedHealthFactor < 2.0) {
      riskLevel = 'warning';
    }

    return {
      totalPositions: positions.length,
      totalCollateralUsd,
      totalBorrowedUsd,
      netValueUsd: totalCollateralUsd - totalBorrowedUsd,
      averageHealthFactor: weightedHealthFactor,
      riskLevel,
      positions,
    };
  }, [supplies, borrows, marketData, address, hasValidAddress]);

  // Combine all errors
  const allErrors = [marketsError].filter(Boolean);
  
  return {
    data: portfolioData,
    isLoading,
    error: allErrors.length > 0 ? allErrors[0] : null,
    mutate: () => {}, // Placeholder for refresh functionality
  };
};

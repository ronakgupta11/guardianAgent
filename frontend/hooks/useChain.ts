'use client';

import { useState } from 'react';
import { createPublicClient, http, formatEther, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { LIT_EVM_CHAINS } from '@lit-protocol/constants';

// ERC20 ABI for balance checking
const ERC20_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const WBTC_CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  [LIT_EVM_CHAINS.base.chainId]: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
};

const USDC_CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  [LIT_EVM_CHAINS.base.chainId]: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
};

export const useChain = () => {
  const [chain, setChain] = useState(LIT_EVM_CHAINS.base);

  const publicClient = createPublicClient({
    chain: base,
    transport: http(chain.rpcUrls[0]),
  });

  const getTokenBalance = async (tokenAddress: `0x${string}`, userAddress: `0x${string}`, decimals: number) => {
    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [userAddress],
    });
    return formatUnits(balance, decimals);
  };

  const getEthBalance = async (userAddress: `0x${string}`) => {
    const balance = await publicClient.getBalance({ address: userAddress });
    return formatEther(balance);
  };

  const getUsdcBalance = async (userAddress: `0x${string}`) => {
    return getTokenBalance(USDC_CONTRACT_ADDRESSES[chain.chainId], userAddress, 6);
  };

  const getWbtcBalance = async (userAddress: `0x${string}`) => {
    return getTokenBalance(WBTC_CONTRACT_ADDRESSES[chain.chainId], userAddress, 8);
  };

  return {
    chain,
    setChain,
    publicClient,
    getEthBalance,
    getUsdcBalance,
    getWbtcBalance,
  };
};
import { NexusSDK } from '@avail-project/nexus-core';
 
export const sdk = new NexusSDK({ network: 'testnet'});

 
// Thin wrapper that calls sdk.isInitialized() from the SDK
export function isInitialized() {
    return sdk.isInitialized();
  }
   
  export async function initializeWithProvider(provider: any) {
    console.log('Initializing Nexus with provider');
    if (!provider) throw new Error('No EIP-1193 provider (e.g., MetaMask) found');
    
    //If the SDK is already initialized, return
    if (sdk.isInitialized()) {
        console.log('Nexus already initialized');
        return;
    }
   
    //If the SDK is not initialized, initialize it with the provider passed as a parameter
    await sdk.initialize(provider);
  }
   
  export async function deinit() {
    
    //If the SDK is not initialized, return
    if (!sdk.isInitialized()) return;
   
    //If the SDK is initialized, de-initialize it
    await sdk.deinit();
  }
   
  export async function getUnifiedBalances() {
   
    //Get the unified balances from the SDK
    return await sdk.getUnifiedBalances();
  }
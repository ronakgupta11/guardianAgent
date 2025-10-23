"""
Real-Time Price Fetcher
Fetches current token prices from external APIs for accurate health factor calculation
"""

import httpx
import asyncio
from typing import Dict, Optional, List
import json

class PriceFetcher:
    """Fetches real-time token prices from external sources"""
    
    def __init__(self):
        self.base_urls = {
            "coingecko": "https://api.coingecko.com/api/v3",
            "coinmarketcap": "https://pro-api.coinmarketcap.com/v1",
            "binance": "https://api.binance.com/api/v3"
        }
        self.cache = {}
        self.cache_duration = 60  # Cache prices for 60 seconds
        
    async def get_price(self, token_symbol: str) -> Optional[float]:
        """
        Get current price for a token
        
        Args:
            token_symbol: Token symbol (e.g., "ETH", "USDC", "WBTC")
            
        Returns:
            Current price in USD or None if not found
        """
        # Check cache first
        if token_symbol in self.cache:
            cached_price, timestamp = self.cache[token_symbol]
            if asyncio.get_event_loop().time() - timestamp < self.cache_duration:
                return cached_price
        
        # Try multiple sources
        price = None
        
        # Try CoinGecko first (free, no API key needed)
        try:
            price = await self._fetch_from_coingecko(token_symbol)
        except Exception as e:
            print(f"CoinGecko fetch failed for {token_symbol}: {e}")
        
        # Try Binance as fallback
        if not price:
            try:
                price = await self._fetch_from_binance(token_symbol)
            except Exception as e:
                print(f"Binance fetch failed for {token_symbol}: {e}")
        
        # Cache the result
        if price:
            self.cache[token_symbol] = (price, asyncio.get_event_loop().time())
        
        return price
    
    async def get_prices_batch(self, token_symbols: List[str]) -> Dict[str, float]:
        """Get prices for multiple tokens at once"""
        prices = {}
        for symbol in token_symbols:
            price = await self.get_price(symbol)
            if price:
                prices[symbol] = price
        return prices
    
    async def _fetch_from_coingecko(self, token_symbol: str) -> Optional[float]:
        """Fetch price from CoinGecko API"""
        async with httpx.AsyncClient() as client:
            # Map token symbols to CoinGecko IDs
            token_map = {
                "ETH": "ethereum",
                "USDC": "usd-coin",
                "USDT": "tether",
                "DAI": "dai",
                "WBTC": "wrapped-bitcoin",
                "LINK": "chainlink",
                "UNI": "uniswap",
                "AAVE": "aave",
                "WETH": "ethereum",
                "CBETH": "coinbase-wrapped-staked-eth",
                "STETH": "staked-ether",
                "RETH": "rocket-pool-eth",
                "WSTETH": "wrapped-steth"
            }
            
            token_id = token_map.get(token_symbol.upper())
            if not token_id:
                # Try CoinGecko search API for unknown tokens
                try:
                    search_url = f"{self.base_urls['coingecko']}/search"
                    search_params = {"query": token_symbol.lower()}
                    search_response = await client.get(search_url, params=search_params, timeout=10.0)
                    search_response.raise_for_status()
                    search_data = search_response.json()
                    
                    if search_data.get("coins") and len(search_data["coins"]) > 0:
                        # Use the first result
                        token_id = search_data["coins"][0]["id"]
                        print(f"  🔍 Found CoinGecko ID for {token_symbol}: {token_id}")
                except Exception as e:
                    print(f"  ⚠️ CoinGecko search failed for {token_symbol}: {e}")
                    return None
            
            url = f"{self.base_urls['coingecko']}/simple/price"
            params = {
                "ids": token_id,
                "vs_currencies": "usd"
            }
            
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            if token_id in data and "usd" in data[token_id]:
                return data[token_id]["usd"]
            
        return None
    
    async def _fetch_from_binance(self, token_symbol: str) -> Optional[float]:
        """Fetch price from Binance API"""
        async with httpx.AsyncClient() as client:
            # Map to Binance trading pairs
            ticker_map = {
                "ETH": "ETHUSDT",
                "USDC": "USDCUSDT",
                "USDT": "USDTUSD",
                "WBTC": "WBTCUSDT",
                "LINK": "LINKUSDT",
                "UNI": "UNIUSDT",
                "AAVE": "AAVEUSDT"
            }
            
            ticker = ticker_map.get(token_symbol.upper())
            if not ticker:
                return None
            
            url = f"{self.base_urls['binance']}/ticker/price"
            params = {"symbol": ticker}
            
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            if "price" in data:
                return float(data["price"])
            
        return None
    
    def get_cached_price(self, token_symbol: str) -> Optional[float]:
        """Get cached price without making API call"""
        if token_symbol in self.cache:
            return self.cache[token_symbol][0]
        return None

# Global instance
price_fetcher = PriceFetcher()

# Convenience functions
async def get_price(token_symbol: str) -> Optional[float]:
    """Get price for a token"""
    return await price_fetcher.get_price(token_symbol)

async def get_prices_batch(token_symbols: List[str]) -> Dict[str, float]:
    """Get prices for multiple tokens"""
    return await price_fetcher.get_prices_batch(token_symbols)

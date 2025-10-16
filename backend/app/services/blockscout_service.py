import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings
import asyncio

class BlockscoutService:
    """Service for interacting with Blockscout API to discover DeFi positions"""
    
    def __init__(self):
        self.base_url = settings.BLOCKSCOUT_API_URL
        self.timeout = 30.0
    
    async def _make_request(self, url: str, params: Dict[str, Any] = None) -> Optional[Dict]:
        """Make HTTP request to Blockscout API"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            print(f"Error making request to {url}: {str(e)}")
            return None
    
    def get_aave_positions(self, wallet_address: str, chain_id: int) -> List[Dict[str, Any]]:
        """Get Aave positions for a wallet on a specific chain"""
        # This is a synchronous wrapper for the async method
        return asyncio.run(self._get_aave_positions_async(wallet_address, chain_id))
    
    async def _get_aave_positions_async(self, wallet_address: str, chain_id: int) -> List[Dict[str, Any]]:
        """Async method to get Aave positions"""
        positions = []
        
        # Get chain-specific Blockscout URL
        chain_config = next(
            (chain for chain in settings.SUPPORTED_CHAINS if chain["id"] == chain_id),
            None
        )
        
        if not chain_config:
            return positions
        
        blockscout_url = chain_config.get("blockscout_url", self.base_url)
        
        # Mock implementation for now - replace with actual Blockscout API calls
        # In a real implementation, you would:
        # 1. Query for Aave lending pool interactions
        # 2. Parse transaction logs to extract position data
        # 3. Calculate health factors and collateral/borrow amounts
        
        # For MVP, return mock data based on chain
        if chain_id == 137:  # Polygon
            positions = [
                {
                    "chain_id": chain_id,
                    "chain_name": chain_config["name"],
                    "protocol": "Aave",
                    "collateral_tokens": [
                        {
                            "symbol": "WETH",
                            "address": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
                            "amount": 2.5,
                            "usd_value": 5000.0
                        }
                    ],
                    "borrowed_tokens": [
                        {
                            "symbol": "USDC",
                            "address": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
                            "amount": 2000.0,
                            "usd_value": 2000.0
                        }
                    ],
                    "collateral_usd": 5000.0,
                    "borrowed_usd": 2000.0,
                    "health_factor": 1.8,
                    "ltv": 0.4,
                    "position_address": f"0x{wallet_address[:40]}"
                }
            ]
        elif chain_id == 42161:  # Arbitrum
            positions = [
                {
                    "chain_id": chain_id,
                    "chain_name": chain_config["name"],
                    "protocol": "Aave",
                    "collateral_tokens": [
                        {
                            "symbol": "WBTC",
                            "address": "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
                            "amount": 0.1,
                            "usd_value": 3000.0
                        }
                    ],
                    "borrowed_tokens": [
                        {
                            "symbol": "USDT",
                            "address": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
                            "amount": 1500.0,
                            "usd_value": 1500.0
                        }
                    ],
                    "collateral_usd": 3000.0,
                    "borrowed_usd": 1500.0,
                    "health_factor": 1.4,
                    "ltv": 0.5,
                    "position_address": f"0x{wallet_address[:40]}"
                }
            ]
        
        return positions
    
    async def get_token_prices(self, token_addresses: List[str], chain_id: int) -> Dict[str, float]:
        """Get current token prices from Blockscout or price oracle"""
        # Mock implementation - in production, integrate with price oracles
        # like CoinGecko, 1inch, or chain-specific price feeds
        
        mock_prices = {
            "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619": 2000.0,  # WETH on Polygon
            "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174": 1.0,    # USDC on Polygon
            "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f": 30000.0, # WBTC on Arbitrum
            "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9": 1.0,    # USDT on Arbitrum
        }
        
        return {addr: mock_prices.get(addr, 0.0) for addr in token_addresses}
    
    def calculate_health_factor(
        self, 
        collateral_usd: float, 
        borrowed_usd: float, 
        liquidation_threshold: float = 0.8
    ) -> float:
        """Calculate health factor for a position"""
        if borrowed_usd == 0:
            return float('inf')
        
        return (collateral_usd * liquidation_threshold) / borrowed_usd

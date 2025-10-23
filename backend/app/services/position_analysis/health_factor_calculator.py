"""
Health Factor Calculator
Calculates health factor using the correct Aave formula
"""

from typing import List, Dict
from .price_fetcher import price_fetcher
from .defi_knowledge import DeFiKnowledgeGraph

class HealthFactorCalculator:
    """Calculates health factor using Aave formula"""
    
    def __init__(self):
        self.knowledge_graph = DeFiKnowledgeGraph()
    
    def calculate_health_factor(self, supplied_assets: List[Dict], borrowed_assets: List[Dict], prices: Dict[str, float]) -> float:
        """
        Calculate health factor using Aave formula:
        
        HF = (Σ(Si × Pi × LTi)) / (Σ(Bj × Pj))
        
        Where:
        - Si = Amount of supplied asset i
        - Pi = Price of supplied asset i
        - LTi = Liquidation threshold of supplied asset i
        - Bj = Amount of borrowed asset j
        - Pj = Price of borrowed asset j
        
        Args:
            supplied_assets: List of supplied assets [{"token": "WETH", "amount": 50}]
            borrowed_assets: List of borrowed assets [{"token": "USDC", "amount": 110}]
            prices: Dict of token prices {"WETH": 3000.0, "USDC": 1.0}
        
        Returns:
            Health factor (float)
        """
        
        if not borrowed_assets or len(borrowed_assets) == 0:
            return float('inf')  # No borrowing, infinite health factor
        
        # Calculate numerator: Σ(Si × Pi × LTi)
        numerator = 0.0
        for asset in supplied_assets:
            token = asset["token"]
            amount = float(asset["amount"])
            price = prices.get(token, 0.0)
            
            # Get liquidation threshold from knowledge graph
            lt = self.knowledge_graph.get_liquidation_threshold(token)
            
            # Handle MeTTa atoms
            if hasattr(lt, 'value'):
                lt = float(lt.value)
            elif isinstance(lt, str):
                lt = float(lt.strip('"'))
            else:
                lt = float(lt)
            
            collateral_value = amount * price * lt
            numerator += collateral_value
            
            print(f"  💰 {token}: {amount} × ${price:.2f} × {lt} = ${collateral_value:.2f}")
        
        # Calculate denominator: Σ(Bj × Pj)
        denominator = 0.0
        for asset in borrowed_assets:
            token = asset["token"]
            amount = float(asset["amount"])
            price = prices.get(token, 0.0)
            
            debt_value = amount * price
            denominator += debt_value
            
            print(f"  💳 {token}: {amount} × ${price:.2f} = ${debt_value:.2f}")
        
        if denominator == 0:
            return float('inf')
        
        health_factor = numerator / denominator
        
        print(f"  📊 HF = {numerator:.2f} / {denominator:.2f} = {health_factor:.2f}")
        
        return health_factor
    
    async def get_prices_for_assets(self, positions: List[Dict]) -> Dict[str, float]:
        """Get prices for all unique tokens in positions"""
        all_tokens = set()
        
        for position in positions:
            for asset in position.get("supplied_assets", []):
                all_tokens.add(asset["token"])
            for asset in position.get("borrowed_assets", []):
                all_tokens.add(asset["token"])
        
        # Fetch prices
        prices = await price_fetcher.get_prices_batch(list(all_tokens))
        
        # Use fallback prices for tokens not found
        fallback_prices = {
            "ETH": 3000.0,
            "WETH": 3000.0,
            "USDC": 1.0,
            "USDT": 1.0,
            "DAI": 1.0,
            "WBTC": 45000.0,
            "LINK": 15.0,
            "UNI": 7.0,
            "AAVE": 100.0,
            "CBETH": 3000.0,  # Coinbase staked ETH
            "STETH": 3000.0,  # Lido staked ETH
            "RETH": 3000.0,   # Rocket Pool ETH
            "WSTETH": 3000.0  # Wrapped stETH
        }
        
        for token in all_tokens:
            if token not in prices:
                if token in fallback_prices:
                    prices[token] = fallback_prices[token]
                    print(f"  ⚠️ Using fallback price for {token}: ${fallback_prices[token]:.2f}")
                else:
                    prices[token] = 0.0
                    print(f"  ⚠️ No price found for {token}, using $0.00")
        
        return prices

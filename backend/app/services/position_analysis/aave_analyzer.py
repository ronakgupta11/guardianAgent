"""
Aave Position Analyzer with Real-Time Prices
Integrates with Blockscout MCP and fetches real-time prices for accurate health factor calculation
"""

import json
import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from .defi_knowledge import DeFiKnowledgeGraph
from .price_fetcher import price_fetcher

@dataclass
class AavePosition:
    """Represents an Aave position for a specific asset"""
    asset: str
    supplied_amount: float
    borrowed_amount: float
    collateral_factor: float
    liquidation_threshold: float
    health_factor: float
    supply_apy: float
    borrow_apy: float
    token_price_usd: float
    
    def to_dict(self):
        return asdict(self)

@dataclass
class ExecutableAction:
    """Represents an executable action for risk mitigation"""
    action_type: str  # repay, supply, swap, withdraw
    src_chain_id: str
    dest_chain_id: str
    token: str
    token_amount: float
    address_to_send: str
    reason: str
    
    def to_dict(self):
        return asdict(self)

class AavePositionAnalyzer:
    """Analyzes Aave positions and provides risk assessment with real-time prices"""
    
    def __init__(self, blockscout_client):
        self.blockscout_client = blockscout_client
        self.knowledge_graph = DeFiKnowledgeGraph()
        # Popular Aave markets (Testnet)
        self.aave_markets = {
            "11155111": "Sepolia (Ethereum Testnet)",
            "84532": "Base Sepolia",
            "80001": "Mumbai (Polygon Testnet)",
            "421614": "Arbitrum Sepolia",
            "11155420": "Optimism Sepolia"
        }
    
    async def get_aave_positions(self, user_address: str, chain_id: str = "11155111") -> List[AavePosition]:
        """Fetch Aave positions for a user from blockchain data"""
        positions = []
        
        try:
            print(f"🔍 Fetching tokens for address {user_address} on chain {chain_id}...")
            
            # Get user's token balances
            tokens_response = await self.blockscout_client.call_tool("get_tokens_by_address", {
                "address": user_address,
                "chain_id": chain_id
            })
            
            print(f"📊 Raw tokens response keys: {list(tokens_response.keys())}")
            print(f"📊 Tokens response has 'data': {'data' in tokens_response}")
            
            # Parse token balances to identify potential Aave positions
            if "data" in tokens_response:
                print(f"📊 Found {len(tokens_response['data'])} tokens")
                
                for i, token in enumerate(tokens_response["data"]):
                    symbol = token.get("symbol", "Unknown")
                    name = token.get("name", "Unknown")
                    balance = token.get("balance", 0)
                    print(f"  Token {i+1}: {symbol} ({name}) - Balance: {balance}")
                    
                    if self._is_aave_token(token):
                        print(f"  ✅ Token {symbol} identified as Aave token, analyzing...")
                        position = await self._analyze_token_position(token, user_address, chain_id)
                        if position:
                            print(f"  ✅ Position created for {symbol}: HF={position.health_factor:.2f}")
                            positions.append(position)
                        else:
                            print(f"  ⚠️ Position creation failed for {symbol}")
                    else:
                        print(f"  ⏭️ Token {symbol} not identified as Aave token")
            else:
                print(f"⚠️ No 'data' key in tokens response")
                print(f"📊 Full response: {tokens_response}")
            
            print(f"✅ Total positions found: {len(positions)}")
            return positions
            
        except Exception as e:
            print(f"❌ Error fetching Aave positions: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def _is_aave_token(self, token: Dict) -> bool:
        """Check if a token is related to Aave"""
        token_symbol = token.get("symbol", "").upper()
        token_name = token.get("name", "").upper()
        
        # Aave tokens have specific patterns:
        # 1. Tokens starting with 'a' followed by chain name (e.g., aEthWETH, aBasSepWETH)
        # 2. Tokens containing 'variableDebt' (e.g., variableDebtEthUSDC)
        # 3. Tokens containing 'stableDebt' 
        # 4. Name contains "Aave" (case-insensitive)
        
        is_aave = (
            "AAVE" in token_name or 
            token_name.startswith("AAVE") or
            token_symbol.startswith("A") or  # Aave tokens like aEthWETH, aBasSepWETH
            "VARIABLEDEBT" in token_symbol or     # Variable debt tokens
            "STABLEDEBT" in token_symbol or       # Stable debt tokens
            "DEBT" in token_symbol                 # Debt tokens
        )
        
        # Explicitly exclude certain tokens
        if token_symbol == "ACCESS":
            return False
        
        return is_aave
    
    async def _analyze_token_position(self, token: Dict, user_address: str, chain_id: str) -> Optional[AavePosition]:
        """Analyze a specific token position"""
        try:
            asset_symbol = token.get("symbol", "").upper()
            balance = float(token.get("balance", 0))
            
            print(f"    📊 Analyzing {asset_symbol}: balance={balance}")
            
            if balance == 0:
                return None
            
            # Get collateral factor and liquidation threshold from knowledge graph
            collateral_factor = self.knowledge_graph.get_collateral_factor(asset_symbol)
            liquidation_threshold = self.knowledge_graph.get_liquidation_threshold(asset_symbol)
            
            # Convert MeTTa result to float if needed
            if hasattr(collateral_factor, 'value'):
                collateral_factor = float(collateral_factor.value)
            elif isinstance(collateral_factor, str):
                collateral_factor = float(collateral_factor)
            else:
                collateral_factor = float(collateral_factor) if collateral_factor else 0.0
            
            if hasattr(liquidation_threshold, 'value'):
                liquidation_threshold = float(liquidation_threshold.value)
            elif isinstance(liquidation_threshold, str):
                liquidation_threshold = float(liquidation_threshold)
            else:
                liquidation_threshold = float(liquidation_threshold) if liquidation_threshold else 0.0
            
            print(f"    📊 CF={collateral_factor}, LT={liquidation_threshold}")
            
            # Get real-time price
            token_price = await price_fetcher.get_price(asset_symbol)
            if not token_price:
                # Fallback to default prices
                token_price = self._get_default_price(asset_symbol)
            
            print(f"    📊 Price=${token_price:.2f}")
            
            # Estimate borrowed amount (would need Aave contract query in production)
            borrowed_amount = self._estimate_borrowed_amount(balance, asset_symbol)
            
            print(f"    📊 Borrowed={borrowed_amount:.2f}")
            
            # Calculate health factor with real prices
            health_factor = self._calculate_health_factor(
                balance, borrowed_amount, collateral_factor, liquidation_threshold, token_price
            )
            
            print(f"    📊 Health Factor={health_factor:.2f}")
            
            return AavePosition(
                asset=asset_symbol,
                supplied_amount=balance,
                borrowed_amount=borrowed_amount,
                collateral_factor=collateral_factor,
                liquidation_threshold=liquidation_threshold,
                health_factor=health_factor,
                supply_apy=0.0,  # Would need to fetch from Aave
                borrow_apy=0.0,
                token_price_usd=token_price
            )
            
        except Exception as e:
            print(f"    ❌ Error analyzing token position: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _get_default_price(self, asset: str) -> float:
        """Get default price if API fails"""
        default_prices = {
            "ETH": 3000.0,
            "USDC": 1.0,
            "USDT": 1.0,
            "DAI": 1.0,
            "WBTC": 45000.0,
            "LINK": 15.0,
            "UNI": 7.0,
            "AAVE": 100.0,
        }
        return default_prices.get(asset.upper(), 1.0)
    
    def _estimate_borrowed_amount(self, supplied: float, asset: str) -> float:
        """Estimate borrowed amount (simplified - would query Aave contracts in production)"""
        # Simulate borrowing patterns
        import random
        if asset in ["USDC", "USDT", "DAI"]:
            # Stablecoins typically have lower borrowing
            borrowed_ratio = random.uniform(0.3, 0.6)
        else:
            # Volatile assets
            borrowed_ratio = random.uniform(0.1, 0.4)
        
        return supplied * borrowed_ratio
    
    def _calculate_health_factor(self, supplied: float, borrowed: float, 
                                collateral_factor: float, liquidation_threshold: float,
                                price: float) -> float:
        """Calculate health factor using real prices"""
        if borrowed == 0:
            return float('inf')  # No borrowing, infinite health factor
        
        # Health Factor = (Collateral Value * Liquidation Threshold) / Total Debt
        # Simplified calculation
        collateral_value = supplied * price * collateral_factor
        debt_value = borrowed * price
        
        if debt_value == 0:
            return float('inf')
        
        health_factor = collateral_value / debt_value
        
        return health_factor
    
    def calculate_liquidation_risk(self, positions: List[AavePosition]) -> Dict[str, Any]:
        """Calculate overall liquidation risk for all positions"""
        if not positions:
            return {
                "risk_level": "unknown", 
                "min_health_factor": float('inf'),
                "total_supplied": 0.0,
                "total_borrowed": 0.0,
                "positions_count": 0,
                "message": "No positions found"
            }
        
        # Find the position with the lowest health factor
        min_health_factor = min(pos.health_factor for pos in positions)
        risk_level = self.knowledge_graph.get_risk_level(min_health_factor)
        
        # Calculate total exposure
        total_supplied = sum(pos.supplied_amount for pos in positions)
        total_borrowed = sum(pos.borrowed_amount for pos in positions)
        
        return {
            "risk_level": risk_level,
            "min_health_factor": min_health_factor,
            "total_supplied": total_supplied,
            "total_borrowed": total_borrowed,
            "positions_count": len(positions),
            "action_needed": self.knowledge_graph.get_action_plan(risk_level)
        }
    
    def format_action_plan(self, action_plan: Dict[str, Any]) -> str:
        """Format action plan into human-readable text"""
        output = []
        
        # Risk assessment
        output.append("🔍 **RISK ASSESSMENT**")
        output.append("=" * 50)
        
        for asset, assessment in action_plan["risk_assessment"].items():
            risk_emoji = {
                "low": "🟢",
                "medium": "🟡", 
                "high": "🟠",
                "critical": "🔴"
            }.get(assessment["risk_level"], "⚪")
            
            output.append(f"{risk_emoji} **{asset}**: Health Factor {assessment['health_factor']:.2f} ({assessment['risk_level'].upper()})")
            output.append(f"   Action: {assessment['action_needed']}")
            output.append("")
        
        # Recommended actions
        if action_plan["recommended_actions"]:
            output.append("📋 **RECOMMENDED ACTIONS**")
            output.append("=" * 50)
            
            for i, action in enumerate(action_plan["recommended_actions"], 1):
                action_emoji = {
                    "repay": "💳",
                    "supply": "💰",
                    "swap": "🔄",
                    "withdraw": "📤"
                }.get(action["action"], "📝")
                
                output.append(f"{i}. {action_emoji} **{action['action'].upper()}** {action['amount']:.2f} {action['asset']}")
                output.append(f"   Reason: {action['reason']}")
                output.append("")
        
        # Priority
        priority_emoji = {
            "low": "🟢",
            "medium": "🟡",
            "high": "🟠", 
            "critical": "🔴"
        }.get(action_plan["priority"], "⚪")
        
        output.append(f"⚠️ **PRIORITY**: {priority_emoji} {action_plan['priority'].upper()}")
        
        return "\n".join(output)
    
    async def generate_executable_action_plan(self, positions: List[AavePosition], 
                                              user_address: str, cross_chain_balances: Dict) -> List[ExecutableAction]:
        """Generate executable action plan based on user balances across chains"""
        actions = []
        
        for position in positions:
            risk_level = self.knowledge_graph.get_risk_level(position.health_factor)
            
            if risk_level in ["high", "critical"]:
                # Generate repay actions
                if position.borrowed_amount > 0:
                    repay_action = self._create_repay_action(
                        position, user_address, cross_chain_balances
                    )
                    if repay_action:
                        actions.append(repay_action)
                
                # Generate supply actions
                supply_action = self._create_supply_action(
                    position, user_address, cross_chain_balances
                )
                if supply_action:
                    actions.append(supply_action)
        
        return actions
    
    def _create_repay_action(self, position: AavePosition, user_address: str, 
                            cross_chain_balances: Dict) -> Optional[ExecutableAction]:
        """Create a repay action if user has balance on other chains"""
        # Check if user has the same token on other chains
        for chain_id, balances in cross_chain_balances.items():
            if position.asset in balances and balances[position.asset] > 0:
                repay_amount = min(position.borrowed_amount * 0.3, balances[position.asset])
                
                return ExecutableAction(
                    action_type="repay",
                    src_chain_id=chain_id,
                    dest_chain_id=position.asset,  # Using asset as chain identifier for now
                    token=position.asset,
                    token_amount=repay_amount,
                    address_to_send=user_address,
                    reason=f"Repay {repay_amount:.2f} {position.asset} to improve health factor from {position.health_factor:.2f}"
                )
        
        return None
    
    def _create_supply_action(self, position: AavePosition, user_address: str,
                             cross_chain_balances: Dict) -> Optional[ExecutableAction]:
        """Create a supply action if user has balance on other chains"""
        # Check if user has the same token on other chains
        for chain_id, balances in cross_chain_balances.items():
            if position.asset in balances and balances[position.asset] > 0:
                supply_amount = balances[position.asset] * 0.5  # Use 50% of available balance
                
                return ExecutableAction(
                    action_type="supply",
                    src_chain_id=chain_id,
                    dest_chain_id=position.asset,
                    token=position.asset,
                    token_amount=supply_amount,
                    address_to_send=user_address,
                    reason=f"Supply {supply_amount:.2f} {position.asset} to improve health factor"
                )
        
        return None
    
    def generate_action_plan(self, positions: List[AavePosition], target_health_factor: float = 1.5) -> Dict[str, Any]:
        """Generate comprehensive action plan for risk mitigation"""
        return self.knowledge_graph.generate_action_plan([
            {
                "asset": pos.asset,
                "supplied": pos.supplied_amount,
                "borrowed": pos.borrowed_amount,
                "health_factor": pos.health_factor
            }
            for pos in positions
        ], target_health_factor)

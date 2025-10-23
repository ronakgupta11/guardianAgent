"""
Multi-Chain Position Monitor
Monitors Aave positions across multiple chains and generates alerts
"""

import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import asdict
from .aave_analyzer import AavePositionAnalyzer, AavePosition, ExecutableAction
from .blockscout_client import BlockscoutMCPClient
from .aave_position_parser import AavePositionParser
from .health_factor_calculator import HealthFactorCalculator
from .action_plan_generator import ActionPlanGenerator

class MultiChainPositionMonitor:
    """Monitors Aave positions across multiple chains"""
    
    def __init__(self, blockscout_client: BlockscoutMCPClient):
        self.blockscout_client = blockscout_client
        self.aave_analyzer = AavePositionAnalyzer(blockscout_client)
        self.position_parser = AavePositionParser()
        self.hf_calculator = HealthFactorCalculator()
        self.action_generator = ActionPlanGenerator()
        
        # Supported chains (Testnet)
        self.supported_chains = {
            "11155111": "Sepolia (Ethereum Testnet)",
            "84532": "Base Sepolia",
            "80001": "Mumbai (Polygon Testnet)",
            "421614": "Arbitrum Sepolia",
            "11155420": "Optimism Sepolia"
        }
    
    async def analyze_multi_chain_positions_llm(self, user_address: str, 
                                                chain_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Analyze Aave positions using LLM-based parsing
        
        Args:
            user_address: User's EVM address
            chain_ids: List of chain IDs to check (defaults to all supported)
            
        Returns:
            Comprehensive analysis including positions, health factors, and executable actions
        """
        if chain_ids is None:
            chain_ids = list(self.supported_chains.keys())
        
        print(f"🔍 Fetching token balances for {user_address} across {len(chain_ids)} chains...")
        
        # Step 1: Fetch token balances for all chains
        chain_tokens = []
        for chain_id in chain_ids:
            chain_name = self.supported_chains[chain_id]
            print(f"\n📊 Fetching tokens for {chain_name} (Chain ID: {chain_id})...")
            
            try:
                tokens_response = await self.blockscout_client.get_tokens_by_address(user_address, chain_id)
                
                if "data" in tokens_response:
                    token_balances = []
                    for token in tokens_response["data"]:
                        raw_balance = token.get("balance", "0")
                        decimals = token.get("decimals", 18)  # Default to 18 decimals
                        
                        # Convert decimals to int if it's a string
                        if isinstance(decimals, str):
                            decimals = int(decimals)
                        
                        # Convert balance to human-readable format
                        balance_float = float(raw_balance) / (10 ** decimals)
                        
                        token_balances.append({
                            "token_name": token.get("name", ""),
                            "token_symbol": token.get("symbol", ""),
                            "token_address": token.get("contract_address", ""),
                            "balance": balance_float,
                            "decimals": decimals
                        })
                        
                    chain_tokens.append({
                        "chain_name": chain_name,
                        "chain_id": chain_id,
                        "tokens_balances": token_balances
                    })
                    
                    print(f"  ✅ Found {len(token_balances)} tokens")
                else:
                    print(f"  ⚠️ No tokens found")
                    
            except Exception as e:
                print(f"  ❌ Error fetching tokens: {e}")
                continue
        
        # Step 2: Use LLM to parse Aave positions
        print(f"\n🤖 Using LLM to parse Aave positions...")
        aave_positions = await self.position_parser.parse_aave_positions(chain_tokens)
        print(f"  ✅ Parsed {len(aave_positions)} Aave positions")
        
        # Step 3: Fetch prices for all tokens
        print(f"\n💰 Fetching prices for all tokens...")
        prices = await self.hf_calculator.get_prices_for_assets(aave_positions)
        print(f"  ✅ Fetched {len(prices)} prices")
        
        # Step 4: Calculate health factors for each position
        print(f"\n📊 Calculating health factors...")
        for position in aave_positions:
            chain_name = position["chain_name"]
            print(f"\n  Chain: {chain_name}")
            
            hf = self.hf_calculator.calculate_health_factor(
                position["supplied_assets"],
                position["borrowed_assets"],
                prices
            )
            
            position["health_factor"] = hf
            position["risk_level"] = self.aave_analyzer.knowledge_graph.get_risk_level(hf)
        
        # Step 5: Calculate overall risk
        health_factors = [pos["health_factor"] for pos in aave_positions]
        min_hf = min(health_factors) if health_factors else float('inf')
        overall_risk_level = self.aave_analyzer.knowledge_graph.get_risk_level(min_hf)
        
        # Step 6: Generate action plan if needed
        executable_actions = []
        if overall_risk_level in ["high", "critical"]:
            print(f"\n🎯 Generating action plan for {overall_risk_level} risk...")
            action_plans = await self.action_generator.generate_action_plan(
                aave_positions,
                chain_tokens  # User holdings
            )
            print(f"  ✅ Generated action plans for {len(action_plans)} positions")
            
            # Merge actions into positions
            for action_plan in action_plans:
                chain_id = action_plan["chain_id"]
                for position in aave_positions:
                    if position["chain_id"] == chain_id:
                        position["actions"] = action_plan.get("actions", [])
                        break
        
        return {
            "user_address": user_address,
            "total_positions": len(aave_positions),
            "positions": aave_positions,
            "risk_assessment": {
                "risk_level": overall_risk_level,
                "min_health_factor": min_hf,
                "total_chains": len(aave_positions)
            },
            "prices": prices
        }
    
    async def monitor_position(self, user_address: str, chain_id: str, 
                              asset: str) -> Dict[str, Any]:
        """
        Monitor a specific position
        
        Args:
            user_address: User's EVM address
            chain_id: Chain ID where the position exists
            asset: Asset symbol
            
        Returns:
            Detailed position analysis
        """
        print(f"🔍 Monitoring {asset} position on Chain {chain_id}...")
        
        positions = await self.aave_analyzer.get_aave_positions(user_address, chain_id)
        
        # Find the specific position
        target_position = None
        for pos in positions:
            if pos.asset.upper() == asset.upper():
                target_position = pos
                break
        
        if not target_position:
            return {
                "error": f"No {asset} position found for {user_address} on chain {chain_id}"
            }
        
        # Get risk level
        risk_level = self.aave_analyzer.knowledge_graph.get_risk_level(target_position.health_factor)
        
        # Generate action plan
        action_plan = self.aave_analyzer.knowledge_graph.generate_action_plan(
            [{
                "asset": target_position.asset,
                "supplied": target_position.supplied_amount,
                "borrowed": target_position.borrowed_amount,
                "health_factor": target_position.health_factor
            }]
        )
        
        return {
            "position": target_position.to_dict(),
            "risk_level": risk_level,
            "action_plan": action_plan
        }
    
    def format_analysis_response(self, analysis: Dict[str, Any]) -> str:
        """Format analysis response for display"""
        output = []
        
        output.append("📊 **MULTI-CHAIN AAVE POSITION ANALYSIS**")
        output.append("=" * 60)
        output.append(f"Address: {analysis['user_address']}")
        output.append(f"Total Positions: {analysis['total_positions']}")
        output.append("")
        
        # Risk Assessment
        risk = analysis['risk_assessment']
        risk_emoji = {
            "low": "🟢",
            "medium": "🟡",
            "high": "🟠",
            "critical": "🔴"
        }.get(risk['risk_level'], "⚪")
        
        output.append(f"⚠️ **RISK LEVEL**: {risk_emoji} {risk['risk_level'].upper()}")
        output.append(f"Minimum Health Factor: {risk['min_health_factor']:.2f}")
        output.append(f"Total Supplied: {risk['total_supplied']:.2f}")
        output.append(f"Total Borrowed: {risk['total_borrowed']:.2f}")
        output.append("")
        
        # Positions
        if analysis['positions']:
            output.append("📋 **POSITIONS**")
            output.append("-" * 60)
            for pos in analysis['positions']:
                output.append(f"Asset: {pos['asset']}")
                output.append(f"  Supplied: {pos['supplied_amount']:.2f}")
                output.append(f"  Borrowed: {pos['borrowed_amount']:.2f}")
                output.append(f"  Health Factor: {pos['health_factor']:.2f}")
                output.append(f"  Price: ${pos['token_price_usd']:.2f}")
                output.append("")
        
        # Executable Actions
        if analysis['executable_actions']:
            output.append("🎯 **EXECUTABLE ACTIONS**")
            output.append("-" * 60)
            for i, action in enumerate(analysis['executable_actions'], 1):
                output.append(f"{i}. {action['action_type'].upper()}")
                output.append(f"   Token: {action['token']}")
                output.append(f"   Amount: {action['token_amount']:.2f}")
                output.append(f"   Source Chain: {action['src_chain_id']}")
                output.append(f"   Destination Chain: {action['dest_chain_id']}")
                output.append(f"   Reason: {action['reason']}")
                output.append("")
        
        return "\n".join(output)

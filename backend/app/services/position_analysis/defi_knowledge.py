"""
DeFi Knowledge Graph for Aave Risk Management
Based on MeTTa (Meta Type Talk) from SingularityNET
"""

from hyperon import MeTTa, E, S, ValueAtom
from typing import Dict, List, Any

class DeFiKnowledgeGraph:
    """DeFi knowledge graph using MeTTa for risk management and action planning"""
    
    def __init__(self):
        self.metta = MeTTa()
        self.initialize_defi_knowledge()
    
    def initialize_defi_knowledge(self):
        """Initialize the DeFi knowledge graph with Aave-specific data"""
        
        # Asset → Collateral Factor mappings
        self.metta.space().add_atom(E(S("collateral_factor"), S("ETH"), ValueAtom("0.825")))
        self.metta.space().add_atom(E(S("collateral_factor"), S("USDC"), ValueAtom("0.85")))
        self.metta.space().add_atom(E(S("collateral_factor"), S("USDT"), ValueAtom("0.85")))
        self.metta.space().add_atom(E(S("collateral_factor"), S("DAI"), ValueAtom("0.75")))
        self.metta.space().add_atom(E(S("collateral_factor"), S("WBTC"), ValueAtom("0.7")))
        self.metta.space().add_atom(E(S("collateral_factor"), S("LINK"), ValueAtom("0.65")))
        self.metta.space().add_atom(E(S("collateral_factor"), S("UNI"), ValueAtom("0.6")))
        
        # Asset → Liquidation Threshold mappings
        self.metta.space().add_atom(E(S("liquidation_threshold"), S("ETH"), ValueAtom("0.8")))
        self.metta.space().add_atom(E(S("liquidation_threshold"), S("USDC"), ValueAtom("0.82")))
        self.metta.space().add_atom(E(S("liquidation_threshold"), S("USDT"), ValueAtom("0.82")))
        self.metta.space().add_atom(E(S("liquidation_threshold"), S("DAI"), ValueAtom("0.72")))
        self.metta.space().add_atom(E(S("liquidation_threshold"), S("WBTC"), ValueAtom("0.65")))
        self.metta.space().add_atom(E(S("liquidation_threshold"), S("LINK"), ValueAtom("0.6")))
        self.metta.space().add_atom(E(S("liquidation_threshold"), S("UNI"), ValueAtom("0.55")))
        
        # Risk Levels → Action Plans
        self.metta.space().add_atom(E(S("risk_level"), S("low"), ValueAtom("Monitor position, consider adding collateral")))
        self.metta.space().add_atom(E(S("risk_level"), S("medium"), ValueAtom("Add collateral or repay debt to improve health factor")))
        self.metta.space().add_atom(E(S("risk_level"), S("high"), ValueAtom("URGENT: Repay debt immediately or add significant collateral")))
        self.metta.space().add_atom(E(S("risk_level"), S("critical"), ValueAtom("CRITICAL: Position at risk of liquidation, take immediate action")))
        
        # Chain → Network Info
        self.metta.space().add_atom(E(S("chain"), S("ethereum"), ValueAtom("Chain ID: 1, Aave V3")))
        self.metta.space().add_atom(E(S("chain"), S("polygon"), ValueAtom("Chain ID: 137, Aave V3")))
        self.metta.space().add_atom(E(S("chain"), S("arbitrum"), ValueAtom("Chain ID: 42161, Aave V3")))
        self.metta.space().add_atom(E(S("chain"), S("optimism"), ValueAtom("Chain ID: 10, Aave V3")))
        self.metta.space().add_atom(E(S("chain"), S("base"), ValueAtom("Chain ID: 8453, Aave V3")))
        
        # Action Types → Descriptions
        self.metta.space().add_atom(E(S("action_type"), S("repay"), ValueAtom("Repay borrowed assets to improve health factor")))
        self.metta.space().add_atom(E(S("action_type"), S("supply"), ValueAtom("Supply additional collateral to improve health factor")))
        self.metta.space().add_atom(E(S("action_type"), S("swap"), ValueAtom("Swap assets to optimize collateral or repay debt")))
        self.metta.space().add_atom(E(S("action_type"), S("withdraw"), ValueAtom("Withdraw excess collateral if health factor is safe")))
        
        # Health Factor Ranges → Risk Assessment
        self.metta.space().add_atom(E(S("health_factor_range"), S(">2.0"), S("low")))
        self.metta.space().add_atom(E(S("health_factor_range"), S("1.5-2.0"), S("medium")))
        self.metta.space().add_atom(E(S("health_factor_range"), S("1.1-1.5"), S("high")))
        self.metta.space().add_atom(E(S("health_factor_range"), S("<1.1"), S("critical")))
    
    def get_collateral_factor(self, asset: str) -> float:
        """Get collateral factor for an asset"""
        # Normalize asset symbol (remove 'a' prefix, extract base token)
        base_token = self._extract_base_token(asset)
        
        query = f'!(match &self (collateral_factor {base_token} $factor) $factor)'
        results = self.metta.run(query)
        
        if results and len(results) > 0 and len(results[0]) > 0:
            value = results[0][0]
            # Handle MeTTa atoms
            if hasattr(value, 'value'):
                return float(value.value)
            elif hasattr(value, 'get'):
                return float(value.get())
            else:
                # Remove quotes if present
                str_value = str(value).strip('"')
                return float(str_value)
        return 0.825  # Default collateral factor
    
    def _extract_base_token(self, token_symbol: str) -> str:
        """Extract base token from Aave token symbol"""
        # Examples: aEthWETH -> WETH, variableDebtEthUSDC -> USDC
        symbol = token_symbol.upper()
        
        # Remove Aave prefixes
        if symbol.startswith("A"):
            # Remove 'a' prefix
            symbol = symbol[1:]
            # Remove chain identifiers
            if symbol.startswith("ETH"):
                symbol = symbol[3:]
            elif symbol.startswith("BASSEP"):
                symbol = symbol[6:]
            elif symbol.startswith("POL"):
                symbol = symbol[3:]
            elif symbol.startswith("ARB"):
                symbol = symbol[3:]
            elif symbol.startswith("OP"):
                symbol = symbol[2:]
        
        # Handle debt tokens
        if "DEBT" in symbol:
            # Extract token after debt
            parts = symbol.split("DEBT")
            if len(parts) > 1:
                symbol = parts[-1]
        
        return symbol
    
    def get_liquidation_threshold(self, asset: str) -> float:
        """Get liquidation threshold for an asset"""
        # Normalize asset symbol (remove 'a' prefix, extract base token)
        base_token = self._extract_base_token(asset)
        
        query = f'!(match &self (liquidation_threshold {base_token} $threshold) $threshold)'
        results = self.metta.run(query)
        
        if results and len(results) > 0 and len(results[0]) > 0:
            value = results[0][0]
            # Handle MeTTa atoms
            if hasattr(value, 'value'):
                return float(value.value)
            elif hasattr(value, 'get'):
                return float(value.get())
            else:
                # Remove quotes if present
                str_value = str(value).strip('"')
                return float(str_value)
        return 0.80  # Default liquidation threshold
    
    def get_risk_level(self, health_factor: float) -> str:
        """Determine risk level based on health factor"""
        if health_factor > 2.0:
            return "low"
        elif health_factor >= 1.5:
            return "medium"
        elif health_factor >= 1.1:
            return "high"
        else:
            return "critical"
    
    def get_action_plan(self, risk_level: str) -> str:
        """Get action plan for risk level"""
        query = f'!(match &self (risk_level {risk_level} $plan) $plan)'
        results = self.metta.run(query)
        if results and len(results) > 0:
            return results[0][0]
        return "Monitor position"
    
    def generate_action_plan(self, positions: List[Dict], target_health_factor: float = 1.5) -> Dict[str, Any]:
        """Generate comprehensive action plan for risk mitigation"""
        action_plan = {
            "risk_assessment": {},
            "recommended_actions": [],
            "priority": "medium"
        }
        
        for position in positions:
            asset = position['asset']
            health_factor = position['health_factor']
            risk_level = self.get_risk_level(health_factor)
            
            action_plan["risk_assessment"][asset] = {
                "health_factor": health_factor,
                "risk_level": risk_level,
                "action_needed": self.get_action_plan(risk_level)
            }
            
            # Generate specific actions
            if risk_level in ["high", "critical"]:
                if position['borrowed'] > 0:
                    repay_amount = position['borrowed'] * 0.3  # Repay 30% of debt
                    action_plan["recommended_actions"].append({
                        "action": "repay",
                        "asset": asset,
                        "amount": repay_amount,
                        "reason": f"Reduce debt to improve health factor from {health_factor:.2f}"
                    })
                
                if position['supplied'] > 0:
                    supply_amount = position['supplied'] * 0.2  # Add 20% more collateral
                    action_plan["recommended_actions"].append({
                        "action": "supply",
                        "asset": asset,
                        "amount": supply_amount,
                        "reason": f"Increase collateral to improve health factor"
                    })
        
        # Set priority based on highest risk
        max_risk_levels = [self.get_risk_level(pos['health_factor']) for pos in positions]
        if "critical" in max_risk_levels:
            action_plan["priority"] = "critical"
        elif "high" in max_risk_levels:
            action_plan["priority"] = "high"
        elif "medium" in max_risk_levels:
            action_plan["priority"] = "medium"
        else:
            action_plan["priority"] = "low"
        
        return action_plan

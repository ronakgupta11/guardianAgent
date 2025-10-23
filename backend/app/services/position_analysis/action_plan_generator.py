"""
Action Plan Generator
Uses LLM + MeTTa knowledge base to generate actionable plans for improving health factor
"""

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from typing import Dict, List, Any
import json
from .defi_knowledge import DeFiKnowledgeGraph

load_dotenv()

class ActionPlanGenerator:
    """Generates actionable plans to improve health factor"""
    
    def __init__(self):
        self.model = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        self.knowledge_graph = DeFiKnowledgeGraph()
    
    async def generate_action_plan(self, positions: List[Dict], user_holdings: List[Dict], token_prices: Dict[str, float] = None) -> List[Dict]:
        """
        Generate action plan to improve health factor
        
        Args:
            positions: List of current Aave positions with health factors
            user_holdings: List of user's token holdings across chains
            
        Returns:
            List of positions with actions in format:
            [{
                "chain_id": "11155111",
                "chain_name": "sepolia",
                "position_details": {
                    "supplied_assets": [{"token": "WETH", "amount": 0.05}],
                    "borrowed_assets": [{"token": "USDC", "amount": 111}],
                    "health_factor": 1.40,
                    "risk_level": "HIGH"
                },
                "actions": [
                    {
                        "action_type": "repay",
                        "token": "USDC",
                        "amount": 50.0,
                        "reason": "Repay to improve health factor"
                    }
                ]
            }]
        """
        
        system_prompt = """You are an expert DeFi risk management advisor specializing in Aave protocol.

Your task is to analyze user positions and holdings to generate actionable recommendations for improving health factors.

CRITICAL TOKEN VALIDATION RULES:
- **NEVER suggest actions for tokens the user does NOT hold**
- **ONLY use tokens listed in user_holdings.chains[chain_id].available_tokens**
- **Before suggesting any action, verify the user has the required token**
- **If user doesn't have required tokens, suggest alternative actions or skip that action**

Risk Levels:
- LOW: Health Factor > 2.0 - Position is safe, consider optimization
- MEDIUM: Health Factor 1.5-2.0 - Monitor closely, target 2.0+
- HIGH: Health Factor 1.3-1.5 - Take action soon, target 1.5-1.8
- CRITICAL: Health Factor < 1.3 - Immediate action required, target minimum 1.3

VALID ACTION TYPES (only suggest if user has required tokens):
1. **repay**: Pay down borrowed debt
   - Required: user must hold the borrowed token
   - Example: If position has USDC debt, user must have USDC tokens
   
2. **supply**: Add collateral
   - Required: user must hold the token to supply
   - Example: If suggesting to supply WETH, user must have WETH tokens
   
3. **swap**: Swap tokens to get required tokens
   - Required: user must have src_token to swap
   - Example: Swap USDC → WETH (user must have USDC)
   
4. **withdraw**: Withdraw excess collateral
   - Required: position must have excess collateral
   - Example: Withdraw excess WETH if HF is too high
   
5. **bridge**: Bridge tokens across chains
   - Required: user must have token on source chain
   - Example: Bridge USDC from Base to Sepolia (user must have USDC on Base)
   
6. **transfer**: Transfer tokens between chains
   - Required: user must have token on source chain
   - Example: Transfer USDC from Base to Sepolia

CHAIN SELECTION PRIORITY:
- **ALWAYS prioritize tokens from the SAME CHAIN as the position**
- **ONLY use cross-chain transfers if same-chain tokens are unavailable**
- **Check user_holdings.chains[position_chain_id] FIRST**

HEALTH FACTOR CALCULATION GUIDANCE:
- **Health Factor Formula**: HF = Total Collateral Value (USD) / Total Borrowed Value (USD)
- **Current HF Calculation**: 
  * Total Collateral = Σ(supplied_amount × token_price)
  * Total Borrowed = Σ(borrowed_amount × token_price)
  * Current HF = Total Collateral / Total Borrowed
- **Target HF Strategy**:
  - If HF < 1.3: Target minimum HF of 1.3 (critical improvement needed)
  - If HF 1.3-1.5: Target HF of 1.5-1.8 (moderate improvement)
  - If HF 1.5-2.0: Target HF of 2.0+ (optimization)
  - If HF > 2.0: Consider withdrawing excess collateral or optimizing position
- **Action Impact Calculation**:
  * To repay debt: New HF = Total Collateral / (Total Borrowed - repay_amount × token_price)
  * To add collateral: New HF = (Total Collateral + supply_amount × token_price) / Total Borrowed
  * Calculate exact amounts needed to reach target HF
- **CRITICAL**: Always calculate exact amounts using real token prices and HF formulas

ACTION GENERATION PROCESS:
1. Identify position chain_id
2. Check user_holdings.chains[chain_id].available_tokens
3. Only suggest actions for tokens user actually holds
4. Calculate realistic amounts based on user's holdings
5. Prioritize same-chain solutions
6. Provide clear reasoning for each action

VALIDATION CHECKLIST (for each action):
- ✅ User has the required token?
- ✅ Amount is within user's holdings?
- ✅ Action is logically ordered?
- ✅ Action will improve health factor?
- ✅ Reason is clear and specific?"""

        # Format input data with enhanced chain-specific information
        formatted_positions = self._format_positions_for_ai(positions)
        formatted_holdings = self._format_holdings_for_ai(user_holdings)
        
        # Add detailed logging to debug token data
        print("🔍 DEBUG: Raw positions data:")
        print(json.dumps(positions, indent=2))
        
        print("\n🔍 DEBUG: Raw user holdings data:")
        print(json.dumps(user_holdings, indent=2))
        
        print("\n🔍 DEBUG: Formatted positions for AI:")
        print(json.dumps(formatted_positions, indent=2))
        
        print("\n🔍 DEBUG: Formatted holdings for AI:")
        print(json.dumps(formatted_holdings, indent=2))
        
        positions_json = json.dumps(formatted_positions, indent=2)
        holdings_json = json.dumps(formatted_holdings, indent=2)
        prices_json = json.dumps(token_prices or {}, indent=2)
        
        user_prompt = f"""Analyze the following Aave positions and user token holdings:

**Current Aave Positions:**
{positions_json}

**User Token Holdings Across Chains:**
{holdings_json}

**Current Token Prices (USD):**
{prices_json}

Generate executable actions organized by position to improve health factors.

🚨 CRITICAL VALIDATION RULES 🚨
1. **ONLY suggest actions for tokens the user ACTUALLY HOLDS**
2. **Check user_holdings.chains[chain_id].available_tokens BEFORE suggesting any action**
3. **If user doesn't have required tokens, suggest alternative actions or skip**
4. **NEVER suggest repay/supply actions for tokens user doesn't hold**

HEALTH FACTOR CALCULATION FORMULAS:
- **Current HF**: HF = Total Collateral Value (USD) / Total Borrowed Value (USD)
- **Total Collateral**: Σ(supplied_amount × token_price_usd)
- **Total Borrowed**: Σ(borrowed_amount × token_price_usd)
- **Action Impact**:
  * Repay debt: New HF = Total Collateral / (Total Borrowed - repay_amount × token_price_usd)
  * Add collateral: New HF = (Total Collateral + supply_amount × token_price_usd) / Total Borrowed

EXAMPLE CALCULATION WITH ALTERNATIVES:
- Position: 0.3 WETH supplied ($600), 607 USDC borrowed ($607)
- Current HF = $600 / $607 = 0.99
- Optimal: Repay $145.38 USDC to reach HF = 1.3
- **If user only has 10 USDC available**:
  * Option 1: Repay 10 USDC → New HF = $600 / ($607 - $10) = 1.01 (partial improvement)
  * Option 2: Supply 0.05 WETH ($100) → New HF = ($600 + $100) / $607 = 1.15 (better improvement)
  * Option 3: Bridge USDC from another chain if available
  * Option 4: Swap other tokens to USDC first

TARGET HF STRATEGY:
- If HF < 1.3: Target minimum HF of 1.3 (critical improvement needed)
- If HF 1.3-1.5: Target HF of 1.5-1.8 (moderate improvement) 
- If HF 1.5-2.0: Target HF of 2.0+ (optimization)
- If HF > 2.0: Consider withdrawing excess collateral or optimizing position

ACTION GENERATION WORKFLOW:
1. For each position with HIGH/CRITICAL risk:
   - Calculate current HF using token prices
   - Determine target HF based on current HF
   - Calculate exact amounts needed using HF formulas
   - Check user_holdings.chains[chain_id].available_tokens
   - **If insufficient tokens for optimal action, suggest alternative strategies**:
     * Use available tokens (even if partial improvement)
     * Suggest cross-chain transfers if beneficial
     * Suggest swapping to get required tokens
     * Suggest adding collateral instead of repaying
   - Only suggest actions for available tokens with sufficient amounts

2. For each action, include:
   - Exact HF calculation showing current → target
   - Specific amount based on HF formula
   - Token validation confirming user has sufficient balance
   - Alternative strategies if optimal action not possible

Return a JSON array organized by position with this exact structure:
[
    {{
        "chain_id": "84532",
        "chain_name": "base sepolia",
        "position_details": {{
            "supplied_assets": [{{"token": "WETH", "amount": 0.3}}],
            "borrowed_assets": [{{"token": "USDC", "amount": 607}}],
            "health_factor": 0.99,
            "risk_level": "CRITICAL"
        }},
        "actions": [
            {{
                "order": 1,
                "action_type": "repay",
                "token": "USDC",
                "amount": 10.0,
                "reason": "Repay 10 USDC (user has 10 USDC available) for partial HF improvement from 0.99 to 1.01. Optimal would be 145.38 USDC but insufficient balance."
            }},
            {{
                "order": 2,
                "action_type": "supply",
                "token": "WETH",
                "amount": 0.05,
                "reason": "Supply 0.05 WETH ($100) to improve HF from 1.01 to 1.15. Better improvement than partial repay."
            }}
        ]
    }}
]

VALIDATION CHECKLIST FOR EACH ACTION:
- ✅ Token exists in user_holdings.chains[chain_id].available_tokens?
- ✅ Amount ≤ user's token balance?
- ✅ Amount calculated using HF formula?
- ✅ Action improves health factor to target?
- ✅ Reason includes HF calculation?

IMPORTANT:
- Generate actions ONLY for positions with HIGH or CRITICAL risk
- ONLY use tokens from user_holdings.chains
- VERIFY token availability before suggesting actions
- Calculate exact amounts using HF formulas and token prices
- Include detailed HF calculations in reasoning"""

        try:
            response = await self.model.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ])
            
            # Parse JSON response
            response_text = response.content.strip()
            
            # Extract JSON from markdown code blocks if present
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            actions = json.loads(response_text)
            
            print("\n🔍 DEBUG: AI Response (before validation):")
            print(json.dumps(actions, indent=2))
            
            # Sort actions by order for each position
            for position in actions:
                if 'actions' in position and isinstance(position['actions'], list):
                    position['actions'] = sorted(
                        position['actions'],
                        key=lambda x: x.get('order', 999)
                    )
            
            # Sort actions by order for each position and validate
            validated_actions = []
            for position in actions:
                if 'actions' in position and isinstance(position['actions'], list):
                    # Sort by order
                    sorted_actions = sorted(
                        position['actions'],
                        key=lambda x: x.get('order', 999)
                    )
                    
                    # Validate each action
                    validated_position_actions = []
                    position_chain_id = position.get('chain_id')
                    
                    for action in sorted_actions:
                        if self._validate_action(action, position_chain_id, user_holdings):
                            validated_position_actions.append(action)
                        else:
                            print(f"⚠️ Skipping invalid action: {action.get('action_type')} {action.get('token')} - user doesn't hold this token")
                    
                    position['actions'] = validated_position_actions
                    validated_actions.append(position)
            
            print("\n🔍 DEBUG: Final validated actions:")
            print(json.dumps(validated_actions, indent=2))
            
            return validated_actions
            
        except Exception as e:
            print(f"Error generating action plan: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def _format_positions_for_ai(self, positions: List[Dict]) -> List[Dict]:
        """Format positions data to make chain information more explicit for AI"""
        formatted = []
        for pos in positions:
            formatted_pos = {
                "chain_id": pos.get("chain_id"),
                "chain_name": pos.get("chain_name"),
                "position_summary": f"Position on {pos.get('chain_name')} (Chain ID: {pos.get('chain_id')})",
                "health_factor": pos.get("health_factor"),
                "risk_level": pos.get("risk_level"),
                "supplied_assets": pos.get("supplied_assets", []),
                "borrowed_assets": pos.get("borrowed_assets", []),
                "needs_action": pos.get("risk_level") in ["HIGH", "CRITICAL"]
            }
            formatted.append(formatted_pos)
        return formatted
    
    def _format_holdings_for_ai(self, user_holdings: List[Dict]) -> Dict:
        """Format holdings data to make chain-specific tokens more explicit for AI"""
        formatted = {
            "summary": "User token holdings organized by chain - ONLY USE THESE TOKENS",
            "chains": {},
            "total_available_tokens": 0,
            "available_token_list": []
        }
        
        for chain_data in user_holdings:
            chain_id = chain_data.get("chain_id")
            chain_name = chain_data.get("chain_name")
            tokens = chain_data.get("tokens_balances", [])
            
            # Filter only tokens with positive balance
            available_tokens = [
                {
                    "token_symbol": token.get("token_symbol", ""),
                    "token_name": token.get("token_name", ""),
                    "amount": token.get("balance", 0),
                    "decimals": token.get("decimals", 18),
                    "usd_value": token.get("usd_value", 0)
                }
                for token in tokens
                if token.get("balance", 0) > 0
            ]
            
            formatted["chains"][chain_id] = {
                "chain_name": chain_name,
                "chain_id": chain_id,
                "available_tokens": available_tokens,
                "total_tokens": len(available_tokens),
                "token_symbols": [t["token_symbol"] for t in available_tokens]
            }
            
            # Add to global list for easy reference
            for token in available_tokens:
                formatted["available_token_list"].append({
                    "chain_id": chain_id,
                    "chain_name": chain_name,
                    "token_symbol": token["token_symbol"],
                    "amount": token["amount"]
                })
        
        formatted["total_available_tokens"] = len(formatted["available_token_list"])
        
        return formatted
    
    def _validate_action(self, action: Dict, position_chain_id: str, user_holdings: List[Dict]) -> bool:
        """Validate that an action is executable with user's current holdings"""
        action_type = action.get('action_type', '').lower()
        token = action.get('token', '')
        amount = action.get('amount', 0)
        
        print(f"\n🔍 VALIDATION: Checking action {action_type} for token {token} (amount: {amount})")
        print(f"🔍 VALIDATION: Position chain_id: {position_chain_id}")
        
        # Find user's holdings for the position chain
        position_holdings = None
        for chain_data in user_holdings:
            if chain_data.get('chain_id') == position_chain_id:
                position_holdings = chain_data
                break
        
        if not position_holdings:
            print(f"❌ No holdings found for chain {position_chain_id}")
            print(f"🔍 Available chains: {[c.get('chain_id') for c in user_holdings]}")
            return False
        
        print(f"🔍 VALIDATION: Found holdings for chain {position_chain_id}")
        
        # Check if user has the required token
        available_tokens = position_holdings.get('tokens_balances', [])
        print(f"🔍 VALIDATION: Available tokens on chain {position_chain_id}:")
        for token_data in available_tokens:
            print(f"  - {token_data.get('token_symbol', 'UNKNOWN')}: {token_data.get('balance', 0)}")
        
        user_token_balance = 0
        for token_data in available_tokens:
            if token_data.get('token_symbol', '').upper() == token.upper():
                user_token_balance = token_data.get('balance', 0)
                print(f"🔍 VALIDATION: Found {token} with balance: {user_token_balance}")
                break
        
        if user_token_balance == 0:
            print(f"🔍 VALIDATION: Token {token} not found in available tokens")
        
        # Validate based on action type
        if action_type in ['repay', 'supply']:
            if user_token_balance <= 0:
                print(f"❌ User doesn't have {token} tokens (balance: {user_token_balance})")
                return False
            
            if amount > user_token_balance:
                print(f"❌ Requested amount {amount} exceeds user's {token} balance {user_token_balance}")
                return False
            
            print(f"✅ VALIDATION: Action {action_type} for {token} is valid (balance: {user_token_balance}, amount: {amount})")
        
        elif action_type in ['bridge', 'transfer']:
            src_chain_id = action.get('src_chain_id')
            if src_chain_id:
                # Check source chain holdings
                src_holdings = None
                for chain_data in user_holdings:
                    if chain_data.get('chain_id') == src_chain_id:
                        src_holdings = chain_data
                        break
                
                if not src_holdings:
                    print(f"❌ No holdings found for source chain {src_chain_id}")
                    return False
                
                src_token_balance = 0
                for token_data in src_holdings.get('tokens_balances', []):
                    if token_data.get('token_symbol', '').upper() == token.upper():
                        src_token_balance = token_data.get('balance', 0)
                        break
                
                if src_token_balance <= 0 or amount > src_token_balance:
                    print(f"❌ User doesn't have sufficient {token} on source chain {src_chain_id}")
                    return False
        
        elif action_type == 'swap':
            src_token = action.get('src_token', token)
            # Check if user has source token
            src_token_balance = 0
            for token_data in available_tokens:
                if token_data.get('token_symbol', '').upper() == src_token.upper():
                    src_token_balance = token_data.get('balance', 0)
                    break
            
            if src_token_balance <= 0:
                print(f"❌ User doesn't have {src_token} tokens for swap")
                return False
        
        return True

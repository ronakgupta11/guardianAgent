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
    
    async def generate_action_plan(self, positions: List[Dict], user_holdings: List[Dict]) -> List[Dict]:
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

Risk Levels:
- LOW: Health Factor > 2.0 - Position is safe
- MEDIUM: Health Factor 1.5-2.0 - Monitor closely
- HIGH: Health Factor 1.1-1.5 - Take action soon
- CRITICAL: Health Factor < 1.1 - Immediate action required

Action Types and Required Metadata:
1. **repay**: Pay down borrowed debt
   - Required: token, amount
   
2. **supply**: Add collateral
   - Required: token, amount
   
3. **swap**: Swap tokens to optimize position
   - Required: src_token, dst_token, src_amount
   
4. **withdraw**: Withdraw excess collateral
   - Required: token, amount
   
5. **transfer**: Transfer tokens between chains
   - Required: src_chain_id, dst_chain_id, token, amount
   
6. **bridge**: Bridge tokens across chains
   - Required: src_chain_id, dst_chain_id, token, amount

Action Execution Order:
- **order**: Integer (1, 2, 3, ...) indicating execution sequence
- Actions MUST be ordered logically:
  1. First: Bridge/Transfer tokens to destination chain
  2. Second: Swap tokens if needed
  3. Third: Supply collateral (if needed)
  4. Fourth: Repay debt
  5. Last: Withdraw excess (if any)

Generate actions that:
- ONLY use tokens the user actually holds
- Consider cross-chain opportunities
- Prioritize actions that will have the most impact
- Provide clear reasons for each action
- Assign execution order based on logical flow"""

        # Format input data
        positions_json = json.dumps(positions, indent=2)
        holdings_json = json.dumps(user_holdings, indent=2)
        
        user_prompt = f"""Analyze the following Aave positions and user token holdings:

**Current Aave Positions:**
{positions_json}

**User Token Holdings Across Chains:**
{holdings_json}

Generate executable actions organized by position to improve health factors.

CRITICAL RULES:
- Only use tokens the user actually holds (check user_holdings)
- Generate actions for positions with HIGH or CRITICAL risk levels
- Consider cross-chain opportunities based on holdings
- Actions must be feasible with current holdings
- Be specific with amounts based on actual holdings

Return a JSON array organized by position with this exact structure:
[
    {{
        "chain_id": "11155111",
        "chain_name": "sepolia",
        "position_details": {{
            "supplied_assets": [{{"token": "WETH", "amount": 0.05}}],
            "borrowed_assets": [{{"token": "USDC", "amount": 111}}],
            "health_factor": 1.40,
            "risk_level": "HIGH"
        }},
        "actions": [
            {{
                "order": 1,
                "action_type": "transfer",
                "src_chain_id": "84532",
                "dst_chain_id": "11155111",
                "token": "USDC",
                "amount": 50.0,
                "reason": "Transfer USDC from Base Sepolia to pay down debt"
            }},
            {{
                "order": 2,
                "action_type": "repay",
                "token": "USDC",
                "amount": 50.0,
                "reason": "Repay 50 USDC to improve HF from 1.40 to 1.55"
            }}
        ]
    }}
]

Important:
- Generate actions for ALL positions with HIGH or CRITICAL risk
- Only use tokens from user_holdings
- Include cross-chain actions if beneficial
- Be specific with amounts based on actual holdings"""

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
            
            # Sort actions by order for each position
            for position in actions:
                if 'actions' in position and isinstance(position['actions'], list):
                    position['actions'] = sorted(
                        position['actions'],
                        key=lambda x: x.get('order', 999)
                    )
            
            return actions
            
        except Exception as e:
            print(f"Error generating action plan: {e}")
            import traceback
            traceback.print_exc()
            return []

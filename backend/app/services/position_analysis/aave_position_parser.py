"""
Aave Position Parser with LLM
Uses LLM to intelligently parse Aave positions from token balances
"""

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from typing import Dict, List, Any
import json

load_dotenv()

class AavePositionParser:
    """Uses LLM to parse Aave positions from token balances"""
    
    def __init__(self):
        self.model = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    async def parse_aave_positions(self, chain_tokens: List[Dict]) -> List[Dict]:
        """
        Parse Aave positions from token balances using LLM
        
        Args:
            chain_tokens: List of chain token data in format:
                [{
                    "chainName": "sepolia",
                    "chain_id": "11155111",
                    "tokens_balances": [
                        {"token_name": "aEthWETH", "token_address": "0x...", "balance": "1000000000000000000"}
                    ]
                }]
        
        Returns:
            List of Aave positions in format:
            [{
                "chain_id": "11155111",
                "chain_name": "sepolia",
                "supplied_assets": [{"token": "WETH", "amount": 100}],
                "borrowed_assets": [{"token": "USDC", "amount": 50}]
            }]
        """
        
        system_prompt = """You are an expert DeFi analyst specializing in Aave protocol positions.

Your task is to analyze token balances across multiple chains and identify Aave positions.

Aave tokens follow specific patterns:
- **Supplied Tokens (Collateral)**: Tokens starting with 'a' + chain identifier (e.g., aEthWETH, aBasSepWETH)
- **Borrowed Tokens (Debt)**: Tokens containing 'variableDebt' or 'stableDebt' (e.g., variableDebtEthUSDC, variableDebtBasSepUSDC)

Key Rules:
1. Look for ALL borrowed tokens, not just one. A user can have multiple borrowed assets.
2. Look for ALL supplied tokens. A user can have multiple collateral assets.
3. Extract the base token name from Aave token names intelligently:
   - For supplied tokens: Remove 'a' prefix and chain identifier (e.g., aEthWETH → WETH, aBasSepWETH → WETH)
   - For borrowed tokens: Extract the token after 'Debt' and chain identifier (e.g., variableDebtEthUSDC → USDC, variableDebtBasSepUSDC → USDC)
4. Common chain identifiers: Eth, BasSep, Pol, Arb, Op
5. Include ALL assets that match Aave patterns, even if they have different naming conventions

Return only valid Aave positions. Ignore regular tokens that are not part of Aave protocol."""

        # Format the input
        input_text = json.dumps(chain_tokens, indent=2)
        
        user_prompt = f"""Analyze the following token balances across chains and extract Aave positions:

{input_text}

IMPORTANT: The balances are already converted to human-readable format (accounting for decimals).

CRITICAL INSTRUCTIONS:
1. Extract ALL supplied assets (collateral tokens) for each chain
2. Extract ALL borrowed assets (debt tokens) for each chain
3. Do NOT miss any tokens - a user can have multiple borrowed and supplied assets
4. Use the exact balance values provided (they are already in human-readable format)

Return a JSON array of Aave positions with this exact structure:
[
    {{
        "chain_id": "11155111",
        "chain_name": "sepolia",
        "supplied_assets": [
            {{"token": "WETH", "amount": 50}}
        ],
        "borrowed_assets": [
            {{"token": "USDC", "amount": 110}},
            {{"token": "DAI", "amount": 50}}
        ]
    }}
]

Only include chains where Aave positions exist. Extract base token names (WETH, USDC, etc.) from Aave token names."""

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
            
            positions = json.loads(response_text)
            return positions
            
        except Exception as e:
            print(f"Error parsing Aave positions: {e}")
            return []

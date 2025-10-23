from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.position import Position
from app.schemas.position import ActionPlan
from app.services.position_analysis.multi_chain_monitor import MultiChainPositionMonitor
from app.services.position_analysis.blockscout_client import BlockscoutMCPClient
from langchain_mcp_adapters.client import MultiServerMCPClient

router = APIRouter()

class GenerateActionsRequest(BaseModel):
    chain_ids: List[str]

class GenerateActionsResponse(BaseModel):
    user_address: str
    positions_with_actions: List[Dict[str, Any]]

# Global monitor instance  
position_monitor = None

def get_position_monitor():
    """Get or initialize position monitor"""
    global position_monitor
    if position_monitor is None:
        # Initialize MCP client for Blockscout
        mcp_client = MultiServerMCPClient({
            "blockscout": {
                "transport": "streamable_http",
                "url": "https://mcp.blockscout.com/mcp",
            }
        })
        
        blockscout_client = BlockscoutMCPClient(mcp_client)
        position_monitor = MultiChainPositionMonitor(blockscout_client)
    return position_monitor

@router.post("/actions", response_model=GenerateActionsResponse)
async def generate_actions(
    request: GenerateActionsRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Generate executable actions for user positions
    Only returns actions for positions on the provided chain_ids,
    but considers tokens from all chains when calculating actions
    """
    try:
        monitor = get_position_monitor()
        
        # Get positions from database, filtered by provided chain_ids
        positions = db.query(Position).filter(
            Position.user_id == current_user.id,
            Position.chain_id.in_(request.chain_ids)
        ).all()
        
        if not positions:
            raise HTTPException(status_code=404, detail="No positions found for the specified chains")
        
        # Convert positions to dict format
        positions_dict = []
        for pos in positions:
            pos_dict = {
                'chain_id': pos.chain_id,
                'chain_name': pos.chain_name,
                'supplied_assets': pos.supplied_assets or [],
                'borrowed_assets': pos.borrowed_assets or [],
                'health_factor': pos.health_factor,
                'risk_level': pos.risk_level
            }
            positions_dict.append(pos_dict)
        
        # Get user holdings across ALL chains (even if not in request.chain_ids)
        # This allows the action generator to consider cross-chain transfers
        all_chain_ids = list(monitor.supported_chains.keys())
        chain_tokens = []
        
        for chain_id in all_chain_ids:
            chain_name = monitor.supported_chains[chain_id]
            try:
                tokens_response = await monitor.blockscout_client.get_tokens_by_address(
                    current_user.wallet_address, chain_id
                )
                
                if "data" in tokens_response:
                    token_balances = []
                    for token in tokens_response["data"]:
                        raw_balance = token.get("balance", "0")
                        decimals = token.get("decimals", 18)
                        
                        if isinstance(decimals, str):
                            decimals = int(decimals)
                        
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
            except Exception as e:
                print(f"Error fetching tokens for chain {chain_id}: {e}")
                continue
        
        # Generate action plans (this will consider tokens from all chains)
        action_plans = await monitor.action_generator.generate_action_plan(
            positions_dict,
            chain_tokens
        )
        
        # Merge actions into positions
        for action_plan in action_plans:
            chain_id = action_plan["chain_id"]
            for position in positions_dict:
                if position["chain_id"] == chain_id:
                    position["actions"] = action_plan.get("actions", [])
                    break
        
        return GenerateActionsResponse(
            user_address=current_user.wallet_address,
            positions_with_actions=positions_dict
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

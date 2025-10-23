"""
FastAPI REST API for Aave Position Analysis
Provides endpoints for analyzing Aave positions across multiple chains
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import asyncio

from langchain_mcp_adapters.client import MultiServerMCPClient
from blockscout_client import BlockscoutMCPClient
from multi_chain_monitor import MultiChainPositionMonitor

load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Aave Position Analysis API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global client instances
blockscout_client = None
monitor = None

# Initialize client on startup
@app.on_event("startup")
async def startup_event():
    global blockscout_client, monitor
    
    print("🚀 Initializing API...")
    
    try:
        # Initialize MCP client for Blockscout
        mcp_client = MultiServerMCPClient({
            "blockscout": {
                "transport": "streamable_http",
                "url": "https://mcp.blockscout.com/mcp",
            }
        })
        
        blockscout_client = BlockscoutMCPClient(mcp_client)
        monitor = MultiChainPositionMonitor(blockscout_client)
        
        print("✅ API initialized successfully")
        
    except Exception as e:
        print(f"❌ Error initializing API: {e}")
        raise e

# Request/Response Models
class PositionAnalysisRequest(BaseModel):
    wallet_address: str
    chain_ids: Optional[List[str]] = None

class GetPositionsResponse(BaseModel):
    user_address: str
    total_positions: int
    positions: List[Dict[str, Any]]
    prices: Dict[str, float]

class GenerateActionsRequest(BaseModel):
    wallet_address: str
    chain_ids: List[str]  # Required for action generation

class GenerateActionsResponse(BaseModel):
    user_address: str
    positions_with_actions: List[Dict[str, Any]]

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Aave Position Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "/positions": "POST - Get Aave positions",
            "/actions": "POST - Generate executable actions",
            "/chains": "GET - Get supported chains",
            "/health": "GET - Health check"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "blockscout_client": "initialized" if blockscout_client else "not initialized",
        "monitor": "initialized" if monitor else "not initialized"
    }

@app.post("/positions", response_model=GetPositionsResponse)
async def get_positions(request: PositionAnalysisRequest):
    """
    Get Aave positions for a given wallet address
    
    Args:
        request: PositionAnalysisRequest containing wallet_address and optional chain_ids
        
    Returns:
        GetPositionsResponse with positions, health factors, and prices
    """
    
    if not monitor:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    try:
        print(f"📊 Getting positions for {request.wallet_address}")
        
        # Analyze positions (without action generation)
        analysis = await monitor.analyze_multi_chain_positions_llm(
            request.wallet_address,
            request.chain_ids
        )
        
        # Remove actions from response
        for position in analysis['positions']:
            if 'actions' in position:
                del position['actions']
        
        return GetPositionsResponse(
            user_address=analysis['user_address'],
            total_positions=analysis['total_positions'],
            positions=analysis['positions'],
            prices=analysis['prices']
        )
        
    except Exception as e:
        print(f"❌ Error getting positions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/actions", response_model=GenerateActionsResponse)
async def generate_actions(request: GenerateActionsRequest):
    """
    Generate executable actions for Aave positions
    
    Args:
        request: GenerateActionsRequest containing wallet_address and chain_ids
        
    Returns:
        GenerateActionsResponse with positions and executable actions
    """
    
    if not monitor:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    try:
        print(f"🎯 Generating actions for {request.wallet_address}")
        
        # Get positions first
        positions_response = await get_positions(
            PositionAnalysisRequest(
                wallet_address=request.wallet_address,
                chain_ids=request.chain_ids
            )
        )
        
        # Convert to dict for action generation
        positions_dict = positions_response.dict()
        
        # Get user holdings across all chains
        all_chain_ids = list(monitor.supported_chains.keys())
        chain_tokens = []
        
        for chain_id in all_chain_ids:
            chain_name = monitor.supported_chains[chain_id]
            try:
                tokens_response = await monitor.blockscout_client.get_tokens_by_address(
                    request.wallet_address, chain_id
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
        
        # Generate action plans
        action_plans = await monitor.action_generator.generate_action_plan(
            positions_dict['positions'],
            chain_tokens
        )
        
        # Merge actions into positions
        for action_plan in action_plans:
            chain_id = action_plan["chain_id"]
            for position in positions_dict['positions']:
                if position["chain_id"] == chain_id:
                    position["actions"] = action_plan.get("actions", [])
                    break
        
        return GenerateActionsResponse(
            user_address=request.wallet_address,
            positions_with_actions=positions_dict['positions']
        )
        
    except Exception as e:
        print(f"❌ Error generating actions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chains")
async def get_supported_chains():
    """Get list of supported chains"""
    if not monitor:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    return {
        "supported_chains": monitor.supported_chains
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

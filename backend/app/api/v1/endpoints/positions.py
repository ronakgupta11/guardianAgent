from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.position import Position
from app.schemas.position import PositionResponse, PositionSummary, PositionCreate
from app.services.position_analysis.multi_chain_monitor import MultiChainPositionMonitor
from app.services.position_analysis.blockscout_client import BlockscoutMCPClient
from langchain_mcp_adapters.client import MultiServerMCPClient
import asyncio

router = APIRouter()

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

@router.post("/discover", response_model=List[PositionResponse])
async def discover_positions(
    chain_ids: Optional[List[str]] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Discover new positions for user across supported chains
    This fetches positions from external API and stores them in DB
    """
    try:
        monitor = get_position_monitor()
        
        # Analyze positions using external API
        analysis = await monitor.analyze_multi_chain_positions_llm(
            current_user.wallet_address,
            chain_ids
        )
        
        print(f"🔍 Analysis result keys: {analysis.keys()}")
        print(f"🔍 Positions count: {len(analysis.get('positions', []))}")
        
        discovered_positions = []
        
        for pos_data in analysis['positions']:
            print(f"🔍 Position data keys: {pos_data.keys()}")
            
            # Calculate total collateral and borrowed USD from assets
            total_collateral_usd = 0.0
            total_borrowed_usd = 0.0
            
            # Calculate collateral USD
            for asset in pos_data.get('supplied_assets', []):
                if 'usd_value' in asset:
                    total_collateral_usd += asset['usd_value']
                elif 'amount' in asset and 'token' in asset:
                    # Try to get price from analysis prices
                    token_symbol = asset['token']
                    if token_symbol in analysis.get('prices', {}):
                        total_collateral_usd += asset['amount'] * analysis['prices'][token_symbol]
            
            # Calculate borrowed USD
            for asset in pos_data.get('borrowed_assets', []):
                if 'usd_value' in asset:
                    total_borrowed_usd += asset['usd_value']
                elif 'amount' in asset and 'token' in asset:
                    # Try to get price from analysis prices
                    token_symbol = asset['token']
                    if token_symbol in analysis.get('prices', {}):
                        total_borrowed_usd += asset['amount'] * analysis['prices'][token_symbol]
            
            # Check if position already exists
            existing = db.query(Position).filter(
                Position.user_id == current_user.id,
                Position.chain_id == pos_data['chain_id']
            ).first()
            
            if not existing:
                # Create new position
                new_position = Position(
                    user_id=current_user.id,
                    chain_id=pos_data['chain_id'],
                    chain_name=pos_data['chain_name'],
                    supplied_assets=pos_data.get('supplied_assets', []),
                    borrowed_assets=pos_data.get('borrowed_assets', []),
                    health_factor=pos_data['health_factor'],
                    risk_level=pos_data['risk_level'],
                    total_collateral_usd=total_collateral_usd,
                    total_borrowed_usd=total_borrowed_usd
                )
                db.add(new_position)
                discovered_positions.append(new_position)
            else:
                # Update existing position
                existing.supplied_assets = pos_data.get('supplied_assets', [])
                existing.borrowed_assets = pos_data.get('borrowed_assets', [])
                existing.health_factor = pos_data['health_factor']
                existing.risk_level = pos_data['risk_level']
                existing.total_collateral_usd = total_collateral_usd
                existing.total_borrowed_usd = total_borrowed_usd
                discovered_positions.append(existing)
        
        db.commit()
        
        # Refresh all positions
        for pos in discovered_positions:
            db.refresh(pos)
        
        return discovered_positions
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=PositionSummary)
def get_user_positions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all positions for current user from database
    """
    positions = db.query(Position).filter(Position.user_id == current_user.id).all()
    
    if not positions:
        return PositionSummary(
            total_positions=0,
            total_collateral_usd=0.0,
            total_borrowed_usd=0.0,
            net_value_usd=0.0,
            average_health_factor=0.0,
            risk_level="safe",
            positions=[]
        )
    
    # Convert to dict for response
    positions_dict = []
    total_collateral = 0.0
    total_borrowed = 0.0
    
    for pos in positions:
        pos_dict = {
            'id': pos.id,
            'chain_id': pos.chain_id,
            'chain_name': pos.chain_name,
            'supplied_assets': pos.supplied_assets or [],
            'borrowed_assets': pos.borrowed_assets or [],
            'health_factor': pos.health_factor,
            'risk_level': pos.risk_level,
            'total_collateral_usd': pos.total_collateral_usd or 0.0,
            'total_borrowed_usd': pos.total_borrowed_usd or 0.0
        }
        positions_dict.append(pos_dict)
        
        total_collateral += pos.total_collateral_usd or 0.0
        total_borrowed += pos.total_borrowed_usd or 0.0
    
    net_value = total_collateral - total_borrowed
    
    # Calculate weighted average health factor
    if total_collateral > 0:
        weighted_hf = sum(p.health_factor * (p.total_collateral_usd or 0.0) for p in positions) / total_collateral
    else:
        weighted_hf = 0.0
    
    # Determine overall risk level
    risk_level = "safe"
    if weighted_hf < 1.25:
        risk_level = "critical"
    elif weighted_hf < 1.5:
        risk_level = "danger"
    elif weighted_hf < 2.0:
        risk_level = "warning"
    
    return PositionSummary(
        total_positions=len(positions),
        total_collateral_usd=total_collateral,
        total_borrowed_usd=total_borrowed,
        net_value_usd=net_value,
        average_health_factor=weighted_hf,
        risk_level=risk_level,
        positions=positions_dict
    )

@router.get("/{position_id}", response_model=PositionResponse)
def get_position(
    position_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific position by ID"""
    position = db.query(Position).filter(
        Position.id == position_id,
        Position.user_id == current_user.id
    ).first()
    
    if not position:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Position not found"
        )
    
    return position

@router.delete("/{position_id}")
def delete_position(
    position_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete position"""
    position = db.query(Position).filter(
        Position.id == position_id,
        Position.user_id == current_user.id
    ).first()
    
    if not position:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Position not found"
        )
    
    db.delete(position)
    db.commit()
    return {"message": "Position deleted successfully"}

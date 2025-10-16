from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.position import Position
from app.schemas.position import PositionResponse, PositionSummary, PositionCreate, PositionUpdate
from app.services.blockscout_service import BlockscoutService
from app.core.config import settings

router = APIRouter()

@router.get("/", response_model=PositionSummary)
def get_user_positions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all positions for current user"""
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
    
    total_collateral = sum(p.collateral_usd for p in positions)
    total_borrowed = sum(p.borrowed_usd for p in positions)
    net_value = total_collateral - total_borrowed
    
    # Calculate weighted average health factor
    if total_collateral > 0:
        weighted_hf = sum(p.health_factor * p.collateral_usd for p in positions) / total_collateral
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
        positions=positions
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

@router.post("/discover", response_model=List[PositionResponse])
def discover_positions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Discover new positions for user across supported chains"""
    blockscout_service = BlockscoutService()
    discovered_positions = []
    
    for chain in settings.SUPPORTED_CHAINS:
        try:
            # Discover positions on this chain
            positions_data = blockscout_service.get_aave_positions(
                current_user.wallet_address, 
                chain["id"]
            )
            
            for pos_data in positions_data:
                # Check if position already exists
                existing = db.query(Position).filter(
                    Position.user_id == current_user.id,
                    Position.chain_id == chain["id"],
                    Position.position_address == pos_data.get("position_address")
                ).first()
                
                if not existing:
                    # Create new position
                    new_position = Position(
                        user_id=current_user.id,
                        chain_id=chain["id"],
                        chain_name=chain["name"],
                        **pos_data
                    )
                    db.add(new_position)
                    discovered_positions.append(new_position)
                else:
                    # Update existing position
                    for key, value in pos_data.items():
                        setattr(existing, key, value)
                    discovered_positions.append(existing)
        
        except Exception as e:
            # Log error but continue with other chains
            print(f"Error discovering positions on {chain['name']}: {str(e)}")
            continue
    
    db.commit()
    
    # Refresh all positions to get updated data
    for pos in discovered_positions:
        db.refresh(pos)
    
    return discovered_positions

@router.put("/{position_id}", response_model=PositionResponse)
def update_position(
    position_id: int,
    position_update: PositionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update position data"""
    position = db.query(Position).filter(
        Position.id == position_id,
        Position.user_id == current_user.id
    ).first()
    
    if not position:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Position not found"
        )
    
    update_data = position_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(position, field, value)
    
    db.commit()
    db.refresh(position)
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

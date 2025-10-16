from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class TokenInfo(BaseModel):
    symbol: str
    address: str
    amount: float
    usd_value: float

class PositionBase(BaseModel):
    chain_id: int
    chain_name: str
    protocol: str = "Aave"
    collateral_tokens: Optional[List[TokenInfo]] = None
    borrowed_tokens: Optional[List[TokenInfo]] = None
    collateral_usd: float = 0.0
    borrowed_usd: float = 0.0
    health_factor: float
    ltv: float = 0.0
    position_address: Optional[str] = None

class PositionCreate(PositionBase):
    user_id: int

class PositionUpdate(BaseModel):
    collateral_tokens: Optional[List[TokenInfo]] = None
    borrowed_tokens: Optional[List[TokenInfo]] = None
    collateral_usd: Optional[float] = None
    borrowed_usd: Optional[float] = None
    health_factor: Optional[float] = None
    ltv: Optional[float] = None

class PositionResponse(PositionBase):
    id: int
    user_id: int
    last_updated: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class PositionSummary(BaseModel):
    total_positions: int
    total_collateral_usd: float
    total_borrowed_usd: float
    net_value_usd: float
    average_health_factor: float
    risk_level: str
    positions: List[PositionResponse]

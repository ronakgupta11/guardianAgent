from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class SuppliedAsset(BaseModel):
    token: str
    amount: float
    usd_value: Optional[float] = None

class BorrowedAsset(BaseModel):
    token: str
    amount: float
    usd_value: Optional[float] = None

class PositionCreate(BaseModel):
    user_id: int
    chain_id: str
    chain_name: str
    supplied_assets: List[Dict[str, Any]]
    borrowed_assets: List[Dict[str, Any]]
    health_factor: float
    risk_level: str
    total_collateral_usd: Optional[float] = None
    total_borrowed_usd: Optional[float] = None

class PositionUpdate(BaseModel):
    supplied_assets: Optional[List[Dict[str, Any]]] = None
    borrowed_assets: Optional[List[Dict[str, Any]]] = None
    health_factor: Optional[float] = None
    risk_level: Optional[str] = None
    total_collateral_usd: Optional[float] = None
    total_borrowed_usd: Optional[float] = None

class PositionResponse(BaseModel):
    id: int
    user_id: int
    chain_id: str
    chain_name: str
    supplied_assets: List[Dict[str, Any]]
    borrowed_assets: List[Dict[str, Any]]
    health_factor: float
    risk_level: str
    total_collateral_usd: Optional[float]
    total_borrowed_usd: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PositionSummary(BaseModel):
    total_positions: int
    total_collateral_usd: float
    total_borrowed_usd: float
    net_value_usd: float
    average_health_factor: float
    risk_level: str
    positions: List[Dict[str, Any]]

class ActionPlan(BaseModel):
    order: int
    action_type: str
    token: str
    amount: float
    reason: str
    src_chain_id: Optional[str] = None
    dst_chain_id: Optional[str] = None

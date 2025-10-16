from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

class AlertBase(BaseModel):
    chain_id: int
    chain_name: str
    protocol: str = "Aave"
    alert_type: str
    severity: str
    message: str
    health_factor: Optional[float] = None
    
    @field_validator('severity')
    @classmethod
    def validate_severity(cls, v):
        if v not in ['low', 'medium', 'high', 'critical']:
            raise ValueError('Severity must be one of: low, medium, high, critical')
        return v
    
    @field_validator('alert_type')
    @classmethod
    def validate_alert_type(cls, v):
        if v not in ['health_factor', 'liquidation_risk', 'price_volatility', 'system']:
            raise ValueError('Invalid alert type')
        return v

class AlertCreate(AlertBase):
    user_id: int

class AlertUpdate(BaseModel):
    is_resolved: Optional[bool] = None

class AlertResponse(AlertBase):
    id: int
    user_id: int
    is_resolved: bool
    resolved_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

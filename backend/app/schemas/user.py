from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    wallet_address: str
    
    @field_validator('wallet_address')
    @classmethod
    def validate_wallet_address(cls, v):
        if not v.startswith('0x') or len(v) != 42:
            raise ValueError('Invalid wallet address format')
        return v.lower()

class UserCreate(UserBase):
    vincent_id: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    vincent_id: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    vincent_id: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

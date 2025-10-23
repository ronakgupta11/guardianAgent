from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class Position(Base):
    __tablename__ = "positions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Chain information
    chain_id = Column(String(10), nullable=False)
    chain_name = Column(String(50), nullable=False)
    
    # Position data
    supplied_assets = Column(JSON, nullable=True)  # List of supplied assets
    borrowed_assets = Column(JSON, nullable=True)  # List of borrowed assets
    
    # Health metrics
    health_factor = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    
    # USD values
    total_collateral_usd = Column(Float, nullable=True)
    total_borrowed_usd = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Position(id={self.id}, chain={self.chain_id}, hf={self.health_factor})>"

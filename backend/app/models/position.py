from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Position(Base):
    __tablename__ = "positions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chain_id = Column(Integer, nullable=False)  # Chain ID (137 for Polygon, 42161 for Arbitrum)
    chain_name = Column(String(50), nullable=False)  # "Polygon", "Arbitrum"
    protocol = Column(String(50), nullable=False, default="Aave")  # Protocol name
    protocol_address = Column(String(42), nullable=True)  # Protocol contract address
    
    # Position data
    collateral_tokens = Column(JSON, nullable=True)  # List of collateral tokens with amounts
    borrowed_tokens = Column(JSON, nullable=True)    # List of borrowed tokens with amounts
    collateral_usd = Column(Float, default=0.0)      # Total collateral value in USD
    borrowed_usd = Column(Float, default=0.0)        # Total borrowed value in USD
    health_factor = Column(Float, nullable=False)    # Health factor
    ltv = Column(Float, default=0.0)                 # Loan-to-value ratio
    
    # Metadata
    position_address = Column(String(42), nullable=True)  # Position contract address
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="positions")
    
    def __repr__(self):
        return f"<Position(id={self.id}, user_id={self.user_id}, chain={self.chain_name}, hf={self.health_factor})>"
    
    @property
    def risk_level(self) -> str:
        """Calculate risk level based on health factor"""
        if self.health_factor >= 2.0:
            return "safe"
        elif self.health_factor >= 1.5:
            return "warning"
        elif self.health_factor >= 1.25:
            return "danger"
        else:
            return "critical"

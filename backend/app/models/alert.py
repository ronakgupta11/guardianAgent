from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chain_id = Column(Integer, nullable=False)
    chain_name = Column(String(50), nullable=False)
    protocol = Column(String(50), nullable=False, default="Aave")
    
    # Alert details
    alert_type = Column(String(50), nullable=False)  # "health_factor", "liquidation_risk", etc.
    severity = Column(String(20), nullable=False)    # "low", "medium", "high", "critical"
    message = Column(Text, nullable=False)
    health_factor = Column(Float, nullable=True)     # Health factor when alert was created
    
    # Status
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="alerts")
    
    def __repr__(self):
        return f"<Alert(id={self.id}, user_id={self.user_id}, type={self.alert_type}, severity={self.severity})>"
    
    def resolve(self):
        """Mark alert as resolved"""
        self.is_resolved = True
        self.resolved_at = func.now()

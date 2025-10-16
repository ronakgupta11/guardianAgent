from sqlalchemy.orm import Session
from typing import List
from app.models.position import Position
from app.models.alert import Alert
from app.models.user import User
from app.core.config import settings
from datetime import datetime

class AlertService:
    """Service for managing risk alerts based on position health factors"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_positions_for_alerts(self) -> List[Alert]:
        """Check all positions and create alerts for risky ones"""
        new_alerts = []
        
        # Get all active positions
        positions = self.db.query(Position).all()
        
        for position in positions:
            alerts = self._check_position_alerts(position)
            new_alerts.extend(alerts)
        
        return new_alerts
    
    def _check_position_alerts(self, position: Position) -> List[Alert]:
        """Check a single position for alert conditions"""
        alerts = []
        
        # Check if position already has active alerts
        existing_alerts = self.db.query(Alert).filter(
            Alert.user_id == position.user_id,
            Alert.chain_id == position.chain_id,
            Alert.is_resolved == False
        ).all()
        
        # Health factor based alerts
        if position.health_factor < settings.HEALTH_FACTOR_LIQUIDATION:
            # Critical: Risk of immediate liquidation
            if not self._has_alert_type(existing_alerts, "liquidation_risk"):
                alert = self._create_health_factor_alert(
                    position, "critical", "liquidation_risk",
                    f"🚨 CRITICAL: Your {position.protocol} position on {position.chain_name} is at immediate risk of liquidation (HF: {position.health_factor:.2f}). Take action immediately!"
                )
                alerts.append(alert)
        
        elif position.health_factor < settings.HEALTH_FACTOR_DANGER:
            # High: Very close to liquidation
            if not self._has_alert_type(existing_alerts, "health_factor"):
                alert = self._create_health_factor_alert(
                    position, "high", "health_factor",
                    f"⚠️ DANGER: Your {position.protocol} position on {position.chain_name} is at high risk (HF: {position.health_factor:.2f}). Consider adding collateral or repaying debt."
                )
                alerts.append(alert)
        
        elif position.health_factor < settings.HEALTH_FACTOR_WARNING:
            # Medium: Approaching danger zone
            if not self._has_alert_type(existing_alerts, "health_factor"):
                alert = self._create_health_factor_alert(
                    position, "medium", "health_factor",
                    f"⚠️ WARNING: Your {position.protocol} position on {position.chain_name} health factor is low (HF: {position.health_factor:.2f}). Monitor closely."
                )
                alerts.append(alert)
        
        # Add alerts to database
        for alert in alerts:
            self.db.add(alert)
        
        self.db.commit()
        return alerts
    
    def _create_health_factor_alert(
        self, 
        position: Position, 
        severity: str, 
        alert_type: str, 
        message: str
    ) -> Alert:
        """Create a health factor alert"""
        return Alert(
            user_id=position.user_id,
            chain_id=position.chain_id,
            chain_name=position.chain_name,
            protocol=position.protocol,
            alert_type=alert_type,
            severity=severity,
            message=message,
            health_factor=position.health_factor
        )
    
    def _has_alert_type(self, existing_alerts: List[Alert], alert_type: str) -> bool:
        """Check if position already has an alert of the specified type"""
        return any(alert.alert_type == alert_type for alert in existing_alerts)
    
    def resolve_stale_alerts(self, position: Position):
        """Resolve alerts that are no longer relevant for a position"""
        # Get active alerts for this position
        active_alerts = self.db.query(Alert).filter(
            Alert.user_id == position.user_id,
            Alert.chain_id == position.chain_id,
            Alert.is_resolved == False
        ).all()
        
        for alert in active_alerts:
            # If health factor improved significantly, resolve the alert
            if alert.alert_type == "health_factor" and position.health_factor >= settings.HEALTH_FACTOR_WARNING:
                alert.is_resolved = True
                alert.resolved_at = datetime.utcnow()
            elif alert.alert_type == "liquidation_risk" and position.health_factor >= settings.HEALTH_FACTOR_DANGER:
                alert.is_resolved = True
                alert.resolved_at = datetime.utcnow()
        
        self.db.commit()
    
    def get_user_risk_summary(self, user_id: int) -> dict:
        """Get risk summary for a user"""
        positions = self.db.query(Position).filter(Position.user_id == user_id).all()
        active_alerts = self.db.query(Alert).filter(
            Alert.user_id == user_id,
            Alert.is_resolved == False
        ).all()
        
        critical_positions = [p for p in positions if p.health_factor < settings.HEALTH_FACTOR_DANGER]
        warning_positions = [p for p in positions if settings.HEALTH_FACTOR_DANGER <= p.health_factor < settings.HEALTH_FACTOR_WARNING]
        
        return {
            "total_positions": len(positions),
            "critical_positions": len(critical_positions),
            "warning_positions": len(warning_positions),
            "active_alerts": len(active_alerts),
            "overall_risk": "critical" if critical_positions else "warning" if warning_positions else "safe"
        }

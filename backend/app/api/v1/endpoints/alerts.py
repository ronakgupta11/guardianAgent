from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.alert import Alert
from app.schemas.alert import AlertResponse, AlertCreate, AlertUpdate

router = APIRouter()

@router.get("/", response_model=List[AlertResponse])
def get_user_alerts(
    resolved: Optional[bool] = Query(None, description="Filter by resolved status"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all alerts for current user"""
    query = db.query(Alert).filter(Alert.user_id == current_user.id)
    
    if resolved is not None:
        query = query.filter(Alert.is_resolved == resolved)
    
    if severity:
        query = query.filter(Alert.severity == severity)
    
    alerts = query.order_by(Alert.created_at.desc()).all()
    return alerts

@router.get("/active", response_model=List[AlertResponse])
def get_active_alerts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get active (unresolved) alerts for current user"""
    alerts = db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.is_resolved == False
    ).order_by(Alert.created_at.desc()).all()
    return alerts

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific alert by ID"""
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    return alert

@router.post("/", response_model=AlertResponse)
def create_alert(
    alert_data: AlertCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new alert"""
    # Ensure the alert is for the current user
    alert_data.user_id = current_user.id
    
    alert = Alert(**alert_data.dict())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

@router.put("/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: int,
    alert_update: AlertUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update alert (mainly to resolve it)"""
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    update_data = alert_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(alert, field, value)
    
    # If resolving the alert, set resolved_at timestamp
    if alert_update.is_resolved and not alert.is_resolved:
        from sqlalchemy.sql import func
        alert.resolved_at = func.now()
    
    db.commit()
    db.refresh(alert)
    return alert

@router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete alert"""
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    db.delete(alert)
    db.commit()
    return {"message": "Alert deleted successfully"}

@router.post("/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark alert as resolved"""
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    alert.is_resolved = True
    from sqlalchemy.sql import func
    alert.resolved_at = func.now()
    
    db.commit()
    return {"message": "Alert resolved successfully"}

import asyncio
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.position import Position
from app.services.blockscout_service import BlockscoutService
from app.services.alert_service import AlertService
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PositionMonitor:
    """Background task for monitoring user positions and generating alerts"""
    
    def __init__(self):
        self.blockscout_service = BlockscoutService()
        self.is_running = False
    
    async def start_monitoring(self):
        """Start the monitoring loop"""
        self.is_running = True
        logger.info("Starting position monitoring service")
        
        while self.is_running:
            try:
                await self._monitor_cycle()
                # Wait for the configured interval
                await asyncio.sleep(settings.POSITION_UPDATE_INTERVAL_MINUTES * 60)
            except Exception as e:
                logger.error(f"Error in monitoring cycle: {str(e)}")
                # Wait a bit before retrying
                await asyncio.sleep(60)
    
    async def stop_monitoring(self):
        """Stop the monitoring loop"""
        self.is_running = False
        logger.info("Stopping position monitoring service")
    
    async def _monitor_cycle(self):
        """Single monitoring cycle"""
        logger.info("Starting monitoring cycle")
        
        db = SessionLocal()
        try:
            # Get all active users
            users = db.query(User).filter(User.is_active == True).all()
            logger.info(f"Monitoring {len(users)} active users")
            
            for user in users:
                try:
                    await self._update_user_positions(user, db)
                except Exception as e:
                    logger.error(f"Error updating positions for user {user.id}: {str(e)}")
                    continue
            
            # Check for alerts after updating all positions
            alert_service = AlertService(db)
            new_alerts = alert_service.check_positions_for_alerts()
            
            if new_alerts:
                logger.info(f"Created {len(new_alerts)} new alerts")
            
        finally:
            db.close()
        
        logger.info("Monitoring cycle completed")
    
    async def _update_user_positions(self, user: User, db: Session):
        """Update positions for a specific user"""
        logger.info(f"Updating positions for user {user.id} ({user.wallet_address})")
        
        # Get existing positions
        existing_positions = db.query(Position).filter(Position.user_id == user.id).all()
        existing_by_chain = {pos.chain_id: pos for pos in existing_positions}
        
        # Discover positions on all supported chains
        for chain in settings.SUPPORTED_CHAINS:
            try:
                # Get positions from Blockscout
                positions_data = self.blockscout_service.get_aave_positions(
                    user.wallet_address, 
                    chain["id"]
                )
                
                for pos_data in positions_data:
                    existing_pos = existing_by_chain.get(chain["id"])
                    
                    if existing_pos:
                        # Update existing position
                        for key, value in pos_data.items():
                            if key != "user_id":  # Don't update user_id
                                setattr(existing_pos, key, value)
                        existing_pos.last_updated = datetime.utcnow()
                        logger.info(f"Updated position {existing_pos.id} on {chain['name']}")
                    else:
                        # Create new position
                        new_position = Position(
                            user_id=user.id,
                            **pos_data
                        )
                        db.add(new_position)
                        logger.info(f"Created new position on {chain['name']} for user {user.id}")
                
            except Exception as e:
                logger.error(f"Error updating positions on {chain['name']} for user {user.id}: {str(e)}")
                continue
        
        # Commit changes
        db.commit()
        
        # Resolve stale alerts
        alert_service = AlertService(db)
        for position in existing_positions:
            alert_service.resolve_stale_alerts(position)

# Global monitor instance
monitor = PositionMonitor()

async def start_background_monitoring():
    """Start the background monitoring task"""
    await monitor.start_monitoring()

async def stop_background_monitoring():
    """Stop the background monitoring task"""
    await monitor.stop_monitoring()

# For testing purposes
async def run_single_cycle():
    """Run a single monitoring cycle (useful for testing)"""
    await monitor._monitor_cycle()

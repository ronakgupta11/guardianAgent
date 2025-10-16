from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/guardian_agent")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_HOSTS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-frontend-domain.com"
    ]
    
    # Environment
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # External APIs
    BLOCKSCOUT_API_URL: str = os.getenv("BLOCKSCOUT_API_URL", "https://api.blockscout.com/api/v2")
    
    # Supported Chains
    SUPPORTED_CHAINS: List[dict] = [
        {
            "id": 137,
            "name": "Polygon",
            "rpc_url": "https://polygon-rpc.com",
            "blockscout_url": "https://polygon.blockscout.com/api/v2"
        },
        {
            "id": 42161,
            "name": "Arbitrum",
            "rpc_url": "https://arb1.arbitrum.io/rpc",
            "blockscout_url": "https://arbitrum.blockscout.com/api/v2"
        }
    ]
    
    # Health Factor Thresholds
    HEALTH_FACTOR_WARNING: float = 1.5
    HEALTH_FACTOR_DANGER: float = 1.25
    HEALTH_FACTOR_LIQUIDATION: float = 1.0
    
    # Monitoring
    POSITION_UPDATE_INTERVAL_MINUTES: int = 2
    ALERT_CHECK_INTERVAL_MINUTES: int = 1
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

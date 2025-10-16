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
    
    # CORS - Use string and parse it manually
    ALLOWED_HOSTS_STR: str = os.getenv("ALLOWED_HOSTS", "http://localhost:3000,http://127.0.0.1:3000")
    
    @property
    def ALLOWED_HOSTS(self) -> List[str]:
        return [host.strip() for host in self.ALLOWED_HOSTS_STR.split(',')]
    
    # Environment
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # External APIs
    BLOCKSCOUT_API_URL: str = os.getenv("BLOCKSCOUT_API_URL", "https://api.blockscout.com/api/v2")
    
    # Supported Chains - Define as static list to avoid parsing issues
    @property
    def SUPPORTED_CHAINS(self) -> List[dict]:
        return [
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
        extra = "ignore"  # Ignore extra fields from environment

settings = Settings()

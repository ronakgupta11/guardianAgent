from fastapi import APIRouter
from app.api.v1.endpoints import users, positions, alerts, auth

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(positions.router, prefix="/positions", tags=["positions"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])

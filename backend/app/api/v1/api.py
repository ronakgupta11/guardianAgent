from fastapi import APIRouter
from app.api.v1.endpoints import auth, positions, actions

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(positions.router, prefix="/positions", tags=["positions"])
api_router.include_router(actions.router, prefix="/actions", tags=["actions"])

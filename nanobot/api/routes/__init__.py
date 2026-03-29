"""nanobot.api.routes - API route handlers.

Route registration and endpoint definitions go here.
"""

from fastapi import APIRouter

from nanobot.api.routes.agent import router as agent_router
from nanobot.api.routes.channels import router as channels_router
from nanobot.api.routes.config import router as config_router
from nanobot.api.routes.gateway import router as gateway_router

# Create main API router
api_router = APIRouter()
api_router.include_router(config_router)
api_router.include_router(agent_router)
api_router.include_router(channels_router)
api_router.include_router(gateway_router)

__all__ = ["api_router"]

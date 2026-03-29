"""Channels API routes for nanobot.

Provides endpoints for managing chat channels (status, login, QR codes).
"""

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from nanobot.api.services.gateway import get_gateway_service
from nanobot.channels.registry import discover_all

router = APIRouter(prefix="/api/channels", tags=["channels"])


class ChannelStatus(BaseModel):
    """Channel status information."""

    name: str
    display_name: str
    enabled: bool
    running: bool


class LoginResponse(BaseModel):
    """Response from login endpoint."""

    status: str  # "waiting_for_qr" or "already_logged_in"


class QRCodeResponse(BaseModel):
    """Response containing QR code data."""

    qrcode_id: str
    image_base64: str | None = None
    login_url: str | None = None


def _get_channel_or_404(name: str):
    """Get channel by name or raise 404."""
    gateway = get_gateway_service()
    if gateway.channel_manager is None:
        raise HTTPException(status_code=503, detail="Gateway not initialized")

    channel = gateway.channel_manager.get_channel(name)
    if channel is None:
        raise HTTPException(status_code=404, detail=f"Channel '{name}' not found or not enabled")
    return channel


@router.get("", response_model=list[ChannelStatus])
async def list_channels() -> list[ChannelStatus]:
    """Get list of all channels and their status.

    Returns all enabled channels with their display names and running status.
    """
    gateway = get_gateway_service()
    status = gateway.get_status()
    channels_data = status.get("channels", {})

    # Get display names from channel classes
    all_channel_classes = discover_all()

    result = []
    for name, channel_info in channels_data.items():
        channel_cls = all_channel_classes.get(name)
        display_name = channel_cls.display_name if channel_cls else name.title()

        result.append(
            ChannelStatus(
                name=name,
                display_name=display_name,
                enabled=channel_info.get("enabled", False),
                running=channel_info.get("running", False),
            )
        )

    return result


@router.get("/{name}/status", response_model=ChannelStatus)
async def get_channel_status(name: str) -> ChannelStatus:
    """Get the status of a specific channel."""
    channel = _get_channel_or_404(name)

    # Get display name from channel class
    all_channel_classes = discover_all()
    channel_cls = all_channel_classes.get(name)
    display_name = channel_cls.display_name if channel_cls else name.title()

    return ChannelStatus(
        name=name,
        display_name=display_name,
        enabled=True,
        running=channel.is_running,
    )


@router.post("/{name}/login", response_model=LoginResponse)
async def login_channel(name: str) -> LoginResponse:
    """Trigger login flow for a channel that supports QR code login.

    Returns:
        - "already_logged_in" if the channel is already authenticated
        - "waiting_for_qr" if QR code login flow was started

    Supports WeChat (weixin) QR code login.
    """
    channel = _get_channel_or_404(name)

    # Check if channel supports login
    if not hasattr(channel, "login"):
        raise HTTPException(status_code=501, detail=f"Channel '{name}' does not support login")

    try:
        # Try to login (force=False to not re-authenticate if already logged in)
        success = await channel.login(force=False)

        if success:
            return LoginResponse(status="already_logged_in")
        else:
            return LoginResponse(status="waiting_for_qr")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.get("/{name}/qr", response_model=QRCodeResponse)
async def get_qr_code(name: str) -> QRCodeResponse:
    """Get QR code for channels that support QR code login.

    Returns the QR code data as base64 or a login URL to display.

    Supports:
        - WeChat (weixin): Returns QR code image as base64
    """
    channel = _get_channel_or_404(name)

    # WeChat-specific QR code fetch
    if name == "weixin" and hasattr(channel, "_fetch_qr_code"):
        try:
            qrcode_id, scan_url = await channel._fetch_qr_code()

            # scan_url could be base64 image data or a URL
            # If it looks like base64 (contains data: or is long), use as image_base64
            # Otherwise treat as login_url
            if scan_url.startswith("data:") or len(scan_url) > 200:
                return QRCodeResponse(qrcode_id=qrcode_id, image_base64=scan_url)
            else:
                return QRCodeResponse(qrcode_id=qrcode_id, login_url=scan_url)

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get QR code: {str(e)}")

    raise HTTPException(
        status_code=501, detail=f"Channel '{name}' does not support QR code retrieval"
    )

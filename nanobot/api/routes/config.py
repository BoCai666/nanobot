"""Config API routes for nanobot.

Provides endpoints for reading and updating nanobot configuration.
"""

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict

from nanobot.config.loader import load_config, save_config
from nanobot.config.schema import Config
from nanobot.providers.registry import PROVIDERS

router = APIRouter(prefix="/api/config", tags=["config"])


class ProviderInfo(BaseModel):
    """Provider information for API responses."""

    name: str
    display_name: str
    configured: bool
    api_base: str = ""  # 用户配置的 api_base
    default_api_base: str = ""  # 注册表中的默认 api_base
    is_gateway: bool = False
    is_local: bool = False
    is_direct: bool = False
    is_oauth: bool = False


class ChannelInfo(BaseModel):
    """Channel information for API responses."""

    name: str
    enabled: bool


class ConfigUpdateRequest(BaseModel):
    """Request body for partial config update."""

    model_config = ConfigDict(extra="allow")


def _mask_api_key(api_key: str) -> str:
    """Mask API key, showing only first 4 and last 4 characters."""
    if not api_key or len(api_key) <= 8:
        return "****"
    return f"{api_key[:4]}****{api_key[-4:]}"


def _mask_config(config: Config) -> dict[str, Any]:
    """Convert config to dict with masked API keys."""
    data = config.model_dump(mode="json", by_alias=True)

    # Mask API keys in providers
    providers = data.get("providers", {})
    for provider_name, provider_data in providers.items():
        if isinstance(provider_data, dict) and "apiKey" in provider_data:
            api_key = provider_data.get("apiKey", "")
            if api_key:
                provider_data["apiKey"] = _mask_api_key(api_key)

    return data


@router.get("", response_model=dict[str, Any])
async def get_config() -> dict[str, Any]:
    """Get the current nanobot configuration.

    Returns the full configuration with sensitive fields (apiKey) masked.
    """
    config = load_config()
    return _mask_config(config)


@router.put("", response_model=dict[str, Any])
async def update_config(update: ConfigUpdateRequest) -> dict[str, Any]:
    """Partially update the nanobot configuration.

    Merges the provided update with the existing configuration and saves.
    Only the fields provided in the update request will be changed.
    """
    config = load_config()

    # Convert update to dict and merge
    update_data = update.model_dump(exclude_unset=True, by_alias=True)

    # Merge the update into existing config
    existing_data = config.model_dump(mode="json", by_alias=True)
    merged_data = _deep_merge(existing_data, update_data)

    # Validate and create new config
    updated_config = Config.model_validate(merged_data)

    # Save the updated config
    save_config(updated_config)

    return _mask_config(updated_config)


def _deep_merge(base: dict[str, Any], update: dict[str, Any]) -> dict[str, Any]:
    """Deep merge update dict into base dict."""
    result = base.copy()
    for key, value in update.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = value
    return result


@router.get("/providers", response_model=list[ProviderInfo])
async def get_providers() -> list[ProviderInfo]:
    """Get the list of available providers and their configuration status.

    Returns a list of all registered providers with their display names
    and whether they are currently configured (have an API key or are local/direct).
    """
    config = load_config()
    providers_list = []

    for spec in PROVIDERS:
        provider_data = getattr(config.providers, spec.name, None)
        is_configured = False

        if provider_data:
            # Provider is configured if it has an API key or is a direct/local provider
            if spec.is_direct or spec.is_local:
                is_configured = True
            elif provider_data.api_key:
                is_configured = True

        providers_list.append(
            ProviderInfo(
                name=spec.name,
                display_name=spec.display_name or spec.name.title(),
                configured=is_configured,
                api_base=provider_data.api_base if provider_data else "",
                default_api_base=spec.default_api_base,
                is_gateway=spec.is_gateway,
                is_local=spec.is_local,
                is_direct=spec.is_direct,
                is_oauth=spec.is_oauth,
            )
        )

    return providers_list


@router.get("/channels", response_model=list[ChannelInfo])
async def get_channels() -> list[ChannelInfo]:
    """Get the list of configured channels and their status.

    Returns a list of all channels that have configuration data,
    with their names and enabled status.
    """
    config = load_config()
    channels_data = config.model_dump(mode="json", by_alias=True).get("channels", {})
    channels_list = []

    # Get all channel names from the config (extra fields are channel configs)
    for channel_name, channel_config in channels_data.items():
        # Skip global channel settings (send_progress, send_tool_hints, send_max_retries)
        if channel_name in ("sendProgress", "sendToolHints", "sendMaxRetries"):
            continue

        if isinstance(channel_config, dict):
            enabled = channel_config.get("enabled", False)
        else:
            enabled = False

        channels_list.append(
            ChannelInfo(
                name=channel_name,
                enabled=enabled,
            )
        )

    return channels_list

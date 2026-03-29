"""Tests for Gateway API endpoints."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from nanobot.api.server import Server
from nanobot.api.services.gateway import GatewayService


@pytest.fixture
def test_client() -> TestClient:
    """创建测试客户端 fixture."""
    server = Server()
    app = server.create_app()
    return TestClient(app)


def test_get_gateway_status_not_initialized(test_client: TestClient) -> None:
    """测试 GET /api/gateway/status 在未初始化时返回正确状态."""
    response = test_client.get("/api/gateway/status")
    assert response.status_code == 200

    data = response.json()
    assert "running" in data
    assert "channels" in data
    assert data["running"] is False
    assert data["channels"] == {}


@patch("nanobot.api.routes.gateway.get_gateway_service")
def test_get_gateway_status_running(
    mock_get_service: patch,
    test_client: TestClient,
) -> None:
    """测试 GET /api/gateway/status 在运行时返回通道状态."""
    mock_service = GatewayService()
    # 模拟已初始化的服务
    mock_service._channel_manager = None
    mock_get_service.return_value = mock_service

    response = test_client.get("/api/gateway/status")
    assert response.status_code == 200

    data = response.json()
    assert "running" in data
    assert "channels" in data


@patch("nanobot.api.routes.gateway.get_gateway_service")
@patch("nanobot.api.routes.gateway.load_config")
def test_start_gateway_not_initialized(
    mock_load_config: patch,
    mock_get_service: patch,
    test_client: TestClient,
) -> None:
    """测试 POST /api/gateway/start 初始化并启动网关."""
    mock_service = GatewayService()
    mock_get_service.return_value = mock_service

    mock_config = MagicMock()
    mock_load_config.return_value = mock_config

    response = test_client.post("/api/gateway/start")
    assert response.status_code == 200

    data = response.json()
    assert "running" in data
    assert "channels" in data


@patch("nanobot.api.routes.gateway.get_gateway_service")
def test_stop_gateway_not_initialized(
    mock_get_service: patch,
    test_client: TestClient,
) -> None:
    """测试 POST /api/gateway/stop 在未初始化时返回 503."""
    mock_service = GatewayService()
    mock_service._channel_manager = None
    mock_get_service.return_value = mock_service

    response = test_client.post("/api/gateway/stop")
    # 未初始化时应该返回 503
    assert response.status_code == 503
    assert "not initialized" in response.json()["detail"]


@patch("nanobot.api.routes.gateway.get_gateway_service")
def test_stop_gateway_initialized(
    mock_get_service: patch,
    test_client: TestClient,
) -> None:
    """测试 POST /api/gateway/stop 在已初始化时停止网关."""
    mock_service = GatewayService()
    # 模拟已初始化但未运行的状态
    mock_channel_manager = MagicMock()
    mock_channel_manager.get_status.return_value = {}
    mock_channel_manager.channels = {}  # 空 channels 表示无运行
    mock_service._channel_manager = mock_channel_manager
    mock_service._start_task = None

    mock_get_service.return_value = mock_service

    response = test_client.post("/api/gateway/stop")
    assert response.status_code == 200

    data = response.json()
    assert "running" in data
    assert "channels" in data
    # 未运行时 running 应为 False
    assert data["running"] is False

"""Tests for Config API endpoints."""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from nanobot.api.server import Server
from nanobot.config.schema import Config


@pytest.fixture
def test_client() -> TestClient:
    """创建测试客户端 fixture."""
    server = Server()
    app = server.create_app()
    return TestClient(app)


@pytest.fixture
def mock_config() -> Config:
    """创建测试用 Config 对象."""
    return Config()


@patch("nanobot.api.routes.config.load_config")
def test_get_config(mock_load_config: patch, test_client: TestClient, mock_config: Config) -> None:
    """测试 GET /api/config 返回配置信息."""
    mock_load_config.return_value = mock_config

    response = test_client.get("/api/config")
    assert response.status_code == 200

    data = response.json()
    # 验证返回的是字典格式的配置
    assert isinstance(data, dict)
    # 验证包含基本配置字段
    assert "agents" in data or "providers" in data or "channels" in data


@patch("nanobot.api.routes.config.load_config")
@patch("nanobot.api.routes.config.save_config")
def test_update_config(
    mock_save_config: patch,
    mock_load_config: patch,
    test_client: TestClient,
    mock_config: Config,
) -> None:
    """测试 PUT /api/config 更新配置."""
    mock_load_config.return_value = mock_config

    update_data = {"agents": {"defaults": {"model": "test/model"}}}

    response = test_client.put("/api/config", json=update_data)
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, dict)


@patch("nanobot.api.routes.config.load_config")
def test_get_providers(
    mock_load_config: patch, test_client: TestClient, mock_config: Config
) -> None:
    """测试 GET /api/config/providers 返回提供商列表."""
    mock_load_config.return_value = mock_config

    response = test_client.get("/api/config/providers")
    assert response.status_code == 200

    data = response.json()
    # 验证返回的是列表
    assert isinstance(data, list)
    # 验证每个提供商包含必要字段
    if len(data) > 0:
        provider = data[0]
        assert "name" in provider
        assert "display_name" in provider
        assert "configured" in provider


@patch("nanobot.api.routes.config.load_config")
def test_get_channels(
    mock_load_config: patch, test_client: TestClient, mock_config: Config
) -> None:
    """测试 GET /api/config/channels 返回频道列表."""
    mock_load_config.return_value = mock_config

    response = test_client.get("/api/config/channels")
    assert response.status_code == 200

    data = response.json()
    # 验证返回的是列表
    assert isinstance(data, list)
    # 如果有频道数据，验证格式
    if len(data) > 0:
        channel = data[0]
        assert "name" in channel
        assert "enabled" in channel

"""Tests for nanobot API server and health check endpoint."""

import pytest
from fastapi.testclient import TestClient

from nanobot.api.server import Server


@pytest.fixture
def test_client() -> TestClient:
    """创建测试客户端 fixture."""
    server = Server()
    app = server.create_app()
    return TestClient(app)


def test_health_check(test_client: TestClient) -> None:
    """测试健康检查端点返回正确状态."""
    response = test_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "ok"}


def test_health_check_no_auth_required(test_client: TestClient) -> None:
    """测试健康检查端点不需要认证."""
    # 健康检查端点不应该需要任何认证
    response = test_client.get("/api/health")
    assert response.status_code == 200

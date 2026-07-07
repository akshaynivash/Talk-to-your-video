from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ready_returns_200_when_all_dependencies_are_reachable() -> None:
    fake_driver = MagicMock()
    fake_redis_client = MagicMock()
    fake_ollama_client = MagicMock()

    with (
        patch("app.api.routes.health.get_driver", return_value=fake_driver),
        patch("app.api.routes.health.redis.from_url", return_value=fake_redis_client),
        patch("app.api.routes.health.ollama.Client", return_value=fake_ollama_client),
    ):
        response = client.get("/ready")

    assert response.status_code == 200
    assert response.json() == {"neo4j": "ok", "redis": "ok", "ollama": "ok"}


def test_ready_returns_503_when_a_dependency_is_unreachable() -> None:
    fake_driver = MagicMock()
    fake_driver.verify_connectivity.side_effect = Exception("connection refused")

    with (
        patch("app.api.routes.health.get_driver", return_value=fake_driver),
        patch("app.api.routes.health.redis.from_url", return_value=MagicMock()),
        patch("app.api.routes.health.ollama.Client", return_value=MagicMock()),
    ):
        response = client.get("/ready")

    assert response.status_code == 503
    assert response.json()["neo4j"] == "connection refused"

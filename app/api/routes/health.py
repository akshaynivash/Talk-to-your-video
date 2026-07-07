import ollama
import redis
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from talk_to_your_video.config import get_settings
from talk_to_your_video.graph.client import get_driver

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
def ready() -> JSONResponse:
    settings = get_settings()
    checks: dict[str, str] = {}

    try:
        get_driver().verify_connectivity()
        checks["neo4j"] = "ok"
    except Exception as exc:
        checks["neo4j"] = str(exc)

    try:
        redis.from_url(settings.redis_url).ping()
        checks["redis"] = "ok"
    except Exception as exc:
        checks["redis"] = str(exc)

    try:
        ollama.Client(host=settings.ollama_base_url).list()
        checks["ollama"] = "ok"
    except Exception as exc:
        checks["ollama"] = str(exc)

    healthy = all(v == "ok" for v in checks.values())
    return JSONResponse(status_code=200 if healthy else 503, content=checks)

from celery import Celery

from talk_to_your_video.config import get_settings

settings = get_settings()

celery_app = Celery(
    "talk_to_your_video",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["worker.pipeline"],
)

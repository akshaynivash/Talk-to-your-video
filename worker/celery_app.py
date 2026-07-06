from celery import Celery

from common.config import settings

celery_app = Celery(
    "talk_to_your_video",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["worker.pipeline"],
)

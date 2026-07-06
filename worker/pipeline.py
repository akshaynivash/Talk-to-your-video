from talk_to_your_video.ingestion.pipeline import run_pipeline
from worker.celery_app import celery_app


@celery_app.task(name="worker.pipeline.process_video")
def process_video(video_id: str, file_path: str) -> None:
    run_pipeline(video_id, file_path)

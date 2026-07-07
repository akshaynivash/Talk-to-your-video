from talk_to_your_video.graph.video_status import set_video_status
from talk_to_your_video.ingestion.pipeline import run_pipeline
from talk_to_your_video.models import VideoStatus
from worker.celery_app import celery_app


@celery_app.task(name="worker.pipeline.process_video")
def process_video(video_id: str, file_path: str) -> None:
    try:
        run_pipeline(
            video_id, file_path, on_stage=lambda status: set_video_status(video_id, status)
        )
    except Exception:
        set_video_status(video_id, VideoStatus.FAILED)
        raise

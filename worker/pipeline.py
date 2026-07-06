from worker.celery_app import celery_app


@celery_app.task(name="worker.pipeline.process_video")
def process_video(video_id: str, file_path: str) -> None:
    raise NotImplementedError

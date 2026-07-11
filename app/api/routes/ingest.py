import uuid
from pathlib import Path

from fastapi import APIRouter, Form, HTTPException, UploadFile

from talk_to_your_video.config import get_settings
from talk_to_your_video.graph.video_status import create_video, get_video_status, list_videos
from talk_to_your_video.models import VideoStatus, VideoSummary
from worker.pipeline import process_video

router = APIRouter()


@router.get("/videos")
async def get_videos() -> list[VideoSummary]:
    return list_videos()


@router.post("/videos")
async def upload_video(file: UploadFile, title: str | None = Form(default=None)) -> dict[str, str]:
    settings = get_settings()
    videos_dir = Path(settings.videos_dir)
    videos_dir.mkdir(parents=True, exist_ok=True)

    video_id = str(uuid.uuid4())
    suffix = Path(file.filename or "").suffix
    dest = videos_dir / f"{video_id}{suffix}"
    dest.write_bytes(await file.read())

    create_video(video_id, title, file_path=str(dest))
    task = process_video.delay(video_id, str(dest))

    return {"video_id": video_id, "job_id": task.id, "status": VideoStatus.QUEUED.value}


@router.get("/videos/{video_id}/status")
async def video_status(video_id: str) -> dict[str, str]:
    status = get_video_status(video_id)
    if status is None:
        raise HTTPException(status_code=404, detail="video not found")
    return {"video_id": video_id, "status": status.value}

from fastapi import APIRouter, UploadFile

router = APIRouter()


@router.post("/videos")
async def upload_video(file: UploadFile) -> dict[str, str]:
    raise NotImplementedError


@router.get("/videos/{video_id}/status")
async def video_status(video_id: str) -> dict[str, str]:
    raise NotImplementedError

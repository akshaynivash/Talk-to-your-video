from fastapi import APIRouter

from talk_to_your_video.graph.segments import list_video_segments
from talk_to_your_video.models import SegmentDetail

router = APIRouter()


@router.get("/videos/{video_id}/segments")
async def get_video_segments(video_id: str) -> list[SegmentDetail]:
    return list_video_segments(video_id)

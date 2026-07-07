import asyncio
import json
from collections.abc import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from talk_to_your_video.graph.video_status import get_video_status
from talk_to_your_video.models import VideoStatus

router = APIRouter()

_TERMINAL_STATUSES = {VideoStatus.COMPLETE, VideoStatus.FAILED}
_POLL_INTERVAL_SECONDS = 1.0


async def _event_stream(video_id: str) -> AsyncIterator[str]:
    last_status: VideoStatus | None = None
    while True:
        status = await asyncio.to_thread(get_video_status, video_id)
        if status is not None and status != last_status:
            yield f"data: {json.dumps({'status': status.value})}\n\n"
            last_status = status
        if status in _TERMINAL_STATUSES:
            break
        await asyncio.sleep(_POLL_INTERVAL_SECONDS)


@router.get("/videos/{video_id}/events")
async def video_events(video_id: str) -> StreamingResponse:
    return StreamingResponse(_event_stream(video_id), media_type="text/event-stream")

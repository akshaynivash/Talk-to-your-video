from datetime import UTC, datetime

from talk_to_your_video.graph.client import get_driver
from talk_to_your_video.models import VideoStatus, VideoSummary

_CREATE_VIDEO_QUERY = """
MERGE (v:Video {id: $video_id})
ON CREATE SET v.status = $status, v.title = $title, v.created_at = $created_at
"""

_SET_STATUS_QUERY = """
MERGE (v:Video {id: $video_id})
SET v.status = $status
"""

_GET_STATUS_QUERY = """
MATCH (v:Video {id: $video_id})
RETURN v.status AS status
"""

_LIST_VIDEOS_QUERY = """
MATCH (v:Video)
RETURN v.id AS id, v.title AS title, v.status AS status, v.created_at AS created_at
ORDER BY v.created_at DESC
"""


def create_video(video_id: str, title: str | None = None) -> None:
    driver = get_driver()
    with driver.session() as session:
        session.execute_write(
            lambda tx: tx.run(
                _CREATE_VIDEO_QUERY,
                video_id=video_id,
                status=VideoStatus.QUEUED.value,
                title=title,
                created_at=datetime.now(UTC).isoformat(),
            )
        )


def set_video_status(video_id: str, status: VideoStatus) -> None:
    driver = get_driver()
    with driver.session() as session:
        session.execute_write(
            lambda tx: tx.run(_SET_STATUS_QUERY, video_id=video_id, status=status.value)
        )


def get_video_status(video_id: str) -> VideoStatus | None:
    driver = get_driver()
    with driver.session() as session:
        record = session.execute_read(
            lambda tx: tx.run(_GET_STATUS_QUERY, video_id=video_id).single()
        )
    if record is None:
        return None
    return VideoStatus(record["status"])


def list_videos() -> list[VideoSummary]:
    driver = get_driver()
    with driver.session() as session:
        records = session.execute_read(lambda tx: [r.data() for r in tx.run(_LIST_VIDEOS_QUERY)])
    return [VideoSummary(**r) for r in records]

from talk_to_your_video.graph.client import get_driver
from talk_to_your_video.models import VideoStatus

_CREATE_VIDEO_QUERY = """
MERGE (v:Video {id: $video_id})
ON CREATE SET v.status = $status, v.title = $title
"""

_SET_STATUS_QUERY = """
MERGE (v:Video {id: $video_id})
SET v.status = $status
"""

_GET_STATUS_QUERY = """
MATCH (v:Video {id: $video_id})
RETURN v.status AS status
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

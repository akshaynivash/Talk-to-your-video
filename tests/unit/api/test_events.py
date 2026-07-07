from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app
from talk_to_your_video.models import VideoStatus

client = TestClient(app)


def test_video_events_streams_status_changes_until_terminal():
    statuses = iter([VideoStatus.QUEUED, VideoStatus.TRANSCRIBING, VideoStatus.COMPLETE])

    def fake_get_status(video_id):
        return next(statuses)

    with (
        patch("app.api.routes.events.get_video_status", side_effect=fake_get_status),
        patch("app.api.routes.events.asyncio.sleep", new_callable=AsyncMock),
    ):
        with client.stream("GET", "/videos/video-1/events") as response:
            lines = [line for line in response.iter_lines() if line]

    assert response.status_code == 200
    assert "queued" in lines[0]
    assert "transcribing" in lines[1]
    assert "complete" in lines[2]

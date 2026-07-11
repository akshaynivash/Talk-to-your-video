import io
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app
from talk_to_your_video.models import VideoStatus, VideoSummary

client = TestClient(app)


def test_get_videos_returns_list_from_graph():
    summaries = [
        VideoSummary(id="video-1", title="My Video", status=VideoStatus.COMPLETE, created_at="x")
    ]
    with patch("app.api.routes.ingest.list_videos", return_value=summaries):
        response = client.get("/videos")

    assert response.status_code == 200
    assert response.json() == [
        {"id": "video-1", "title": "My Video", "status": "complete", "created_at": "x"}
    ]


def test_upload_video_creates_video_and_enqueues_task(tmp_path):
    fake_task = MagicMock(id="task-123")

    with (
        patch("app.api.routes.ingest.get_settings") as m_settings,
        patch("app.api.routes.ingest.create_video") as m_create,
        patch("app.api.routes.ingest.process_video") as m_process,
    ):
        m_settings.return_value.videos_dir = str(tmp_path)
        m_process.delay.return_value = fake_task

        response = client.post(
            "/videos",
            files={"file": ("clip.mp4", io.BytesIO(b"fake video bytes"), "video/mp4")},
            data={"title": "My Video"},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["job_id"] == "task-123"
    assert body["status"] == "queued"

    video_id = body["video_id"]
    dest_path = m_process.delay.call_args.args[1]
    assert dest_path.endswith(f"{video_id}.mp4")
    assert (tmp_path / f"{video_id}.mp4").read_bytes() == b"fake video bytes"

    m_create.assert_called_once_with(video_id, "My Video", file_path=dest_path)


def test_video_status_returns_404_for_unknown_video():
    with patch("app.api.routes.ingest.get_video_status", return_value=None):
        response = client.get("/videos/unknown-id/status")

    assert response.status_code == 404


def test_video_status_returns_status_for_known_video():
    with patch("app.api.routes.ingest.get_video_status", return_value=VideoStatus.COMPLETE):
        response = client.get("/videos/video-1/status")

    assert response.status_code == 200
    assert response.json() == {"video_id": "video-1", "status": "complete"}

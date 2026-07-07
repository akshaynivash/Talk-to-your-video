from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from talk_to_your_video.models import SegmentDetail

client = TestClient(app)


def test_get_video_segments_returns_list():
    fake_segments = [
        SegmentDetail(
            start=0.0,
            end=8.0,
            text="hello",
            visual_description="a car",
            entities=["Marie Curie"],
            topics=["radioactivity"],
        )
    ]

    with patch("app.api.routes.segments.list_video_segments", return_value=fake_segments):
        response = client.get("/videos/video-1/segments")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["text"] == "hello"
    assert body[0]["entities"] == ["Marie Curie"]

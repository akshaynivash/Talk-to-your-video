from unittest.mock import MagicMock, patch

from talk_to_your_video.graph.segments import list_video_segments


def test_list_video_segments_returns_segment_details():
    fake_driver = MagicMock()
    fake_session = MagicMock()
    fake_driver.session.return_value.__enter__.return_value = fake_session
    fake_session.execute_read.return_value = [
        {
            "start": 0.0,
            "end": 8.0,
            "text": "hello",
            "visual_description": "a car",
            "entities": ["Marie Curie"],
            "topics": ["radioactivity"],
        }
    ]

    with patch("talk_to_your_video.graph.segments.get_driver", return_value=fake_driver):
        result = list_video_segments("video-1")

    assert len(result) == 1
    assert result[0].text == "hello"
    assert result[0].visual_description == "a car"
    assert result[0].entities == ["Marie Curie"]
    assert result[0].topics == ["radioactivity"]

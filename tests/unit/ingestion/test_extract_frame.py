from unittest.mock import patch

from talk_to_your_video.ingestion.extract_frame import extract_frame


@patch("talk_to_your_video.ingestion.extract_frame.subprocess.run")
def test_extract_frame_builds_ffmpeg_command(mock_run):
    frame_path = extract_frame("videos/clip.mp4", 12.5)

    assert frame_path.endswith(".jpg")
    mock_run.assert_called_once()
    args, kwargs = mock_run.call_args
    command = args[0]
    assert command[0] == "ffmpeg"
    assert "12.5" in command
    assert "videos/clip.mp4" in command
    assert kwargs["check"] is True

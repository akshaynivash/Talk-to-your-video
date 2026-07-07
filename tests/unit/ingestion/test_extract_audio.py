from pathlib import Path
from unittest.mock import patch

from talk_to_your_video.ingestion.extract_audio import extract_audio


@patch("talk_to_your_video.ingestion.extract_audio.subprocess.run")
def test_extract_audio_builds_ffmpeg_command(mock_run):
    audio_path = extract_audio("videos/clip.mp4")

    assert audio_path == str(Path("videos/clip.mp4").with_suffix(".wav"))
    mock_run.assert_called_once()
    args, kwargs = mock_run.call_args
    command = args[0]
    assert command[0] == "ffmpeg"
    assert "videos/clip.mp4" in command
    assert kwargs["check"] is True

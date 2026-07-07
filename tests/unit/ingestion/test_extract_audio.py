from pathlib import Path
from unittest.mock import MagicMock, patch

from talk_to_your_video.ingestion.extract_audio import (
    extract_audio,
    get_video_duration,
)


@patch("talk_to_your_video.ingestion.extract_audio.subprocess.run")
def test_extract_audio_builds_ffmpeg_command(mock_run):
    mock_run.return_value = MagicMock(stdout="0")

    audio_path = extract_audio("videos/clip.mp4")

    assert audio_path == str(Path("videos/clip.mp4").with_suffix(".wav"))
    assert mock_run.call_count == 2
    ffmpeg_call = mock_run.call_args_list[1]
    command = ffmpeg_call.args[0]
    assert command[0] == "ffmpeg"
    assert "videos/clip.mp4" in command
    assert ffmpeg_call.kwargs["check"] is True


@patch("talk_to_your_video.ingestion.extract_audio.subprocess.run")
def test_extract_audio_returns_none_when_no_audio_stream(mock_run):
    mock_run.return_value = MagicMock(stdout="")

    audio_path = extract_audio("videos/silent.mp4")

    assert audio_path is None
    mock_run.assert_called_once()


@patch("talk_to_your_video.ingestion.extract_audio.subprocess.run")
def test_get_video_duration_parses_ffprobe_output(mock_run):
    mock_run.return_value = MagicMock(stdout="12.34\n")

    duration = get_video_duration("videos/clip.mp4")

    assert duration == 12.34

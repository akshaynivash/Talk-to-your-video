import subprocess
from pathlib import Path


def get_video_duration(video_path: str) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "csv=p=0",
            video_path,
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def _has_audio_stream(video_path: str) -> bool:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "a",
            "-show_entries",
            "stream=index",
            "-of",
            "csv=p=0",
            video_path,
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return bool(result.stdout.strip())


def extract_audio(video_path: str) -> str | None:
    if not _has_audio_stream(video_path):
        return None

    audio_path = str(Path(video_path).with_suffix(".wav"))
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            video_path,
            "-ar",
            "16000",
            "-ac",
            "1",
            "-vn",
            audio_path,
        ],
        check=True,
        capture_output=True,
    )
    return audio_path

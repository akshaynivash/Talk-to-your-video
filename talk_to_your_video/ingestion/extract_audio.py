import subprocess
from pathlib import Path


def extract_audio(video_path: str) -> str:
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

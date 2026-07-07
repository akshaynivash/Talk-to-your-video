import subprocess
import tempfile


def extract_frame(video_path: str, timestamp: float) -> str:
    frame_path = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False).name
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-ss",
            str(timestamp),
            "-i",
            video_path,
            "-frames:v",
            "1",
            "-update",
            "1",
            frame_path,
        ],
        check=True,
        capture_output=True,
    )
    return frame_path

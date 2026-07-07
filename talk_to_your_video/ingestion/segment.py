import math

from talk_to_your_video.config import get_settings
from talk_to_your_video.models import Segment


def segment(transcript_segments: list[Segment], duration: float) -> list[Segment]:
    if duration <= 0:
        return []

    window = get_settings().segment_window_seconds
    num_windows = max(1, math.ceil(duration / window))

    windows = []
    for i in range(num_windows):
        start = i * window
        end = min((i + 1) * window, duration)
        overlapping_text = " ".join(
            t.text for t in transcript_segments if t.start < end and t.end > start
        ).strip()
        windows.append(Segment(start=start, end=end, text=overlapping_text))
    return windows

from talk_to_your_video.ingestion.segment import segment
from talk_to_your_video.models import Segment


def test_segment_builds_fixed_windows_spanning_duration():
    transcript = [Segment(start=1.0, end=3.0, text="hello there")]

    windows = segment(transcript, duration=20.0)

    assert [(w.start, w.end) for w in windows] == [(0.0, 8.0), (8.0, 16.0), (16.0, 20.0)]
    assert windows[0].text == "hello there"
    assert windows[1].text == ""
    assert windows[2].text == ""


def test_segment_concatenates_overlapping_transcript_text():
    transcript = [
        Segment(start=1.0, end=3.0, text="first"),
        Segment(start=5.0, end=7.0, text="second"),
    ]

    windows = segment(transcript, duration=8.0)

    assert len(windows) == 1
    assert windows[0].text == "first second"


def test_segment_returns_empty_list_for_zero_duration():
    assert segment([], duration=0.0) == []

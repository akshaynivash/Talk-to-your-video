from talk_to_your_video.ingestion.segment import segment
from talk_to_your_video.models import Segment


def test_segment_passthrough():
    segments = [Segment(start=0.0, end=1.0, text="hi")]
    assert segment(segments) == segments

from unittest.mock import MagicMock, patch

from talk_to_your_video.ingestion.extract_entities import SegmentExtraction
from talk_to_your_video.ingestion.graph_write import write_video_graph
from talk_to_your_video.models import Segment


def test_write_video_graph_writes_each_segment():
    fake_driver = MagicMock()
    fake_session = MagicMock()
    fake_driver.session.return_value.__enter__.return_value = fake_session

    segments = [Segment(start=0.0, end=1.0, text="hello")]
    extractions = [SegmentExtraction(entities=["A"], topics=["B"])]
    embeddings = [[0.1, 0.2]]

    with patch("talk_to_your_video.ingestion.graph_write.get_driver", return_value=fake_driver):
        write_video_graph("video-1", segments, extractions, embeddings)

    assert fake_session.execute_write.call_count == 1
    args = fake_session.execute_write.call_args.args
    assert args[1] == "video-1"
    assert args[2] == segments[0]
    assert args[3] == extractions[0]
    assert args[4] == embeddings[0]

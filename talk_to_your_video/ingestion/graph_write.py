from talk_to_your_video.models import Segment
from talk_to_your_video.ingestion.extract_entities import SegmentExtraction


def write_video_graph(
    video_id: str,
    segments: list[Segment],
    extractions: list[SegmentExtraction],
    embeddings: list[list[float]],
) -> None:
    raise NotImplementedError

from common.models import Segment
from worker.tasks.extract_entities import SegmentExtraction


def write_video_graph(
    video_id: str,
    segments: list[Segment],
    extractions: list[SegmentExtraction],
    embeddings: list[list[float]],
) -> None:
    raise NotImplementedError

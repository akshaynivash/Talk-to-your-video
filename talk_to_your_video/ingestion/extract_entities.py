from pydantic import BaseModel

from talk_to_your_video.models import Segment


class SegmentExtraction(BaseModel):
    entities: list[str]
    topics: list[str]


def extract_entities(segment: Segment) -> SegmentExtraction:
    raise NotImplementedError

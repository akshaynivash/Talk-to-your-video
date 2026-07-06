from pydantic import BaseModel

from common.models import Segment


class SegmentExtraction(BaseModel):
    entities: list[str]
    topics: list[str]


def extract_entities(segment: Segment) -> SegmentExtraction:
    raise NotImplementedError

from enum import StrEnum

from pydantic import BaseModel


class VideoStatus(StrEnum):
    QUEUED = "queued"
    TRANSCRIBING = "transcribing"
    EXTRACTING = "extracting"
    EMBEDDING = "embedding"
    WRITING_GRAPH = "writing_graph"
    COMPLETE = "complete"
    FAILED = "failed"


class Segment(BaseModel):
    start: float
    end: float
    text: str
    visual_description: str | None = None


class SegmentDetail(BaseModel):
    start: float
    end: float
    text: str
    visual_description: str | None = None
    entities: list[str]
    topics: list[str]


class Citation(BaseModel):
    start: float
    end: float
    text: str


class QueryResponse(BaseModel):
    answer: str
    citations: list[Citation]

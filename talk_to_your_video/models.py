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


class Citation(BaseModel):
    start: float
    end: float
    text: str


class QueryResponse(BaseModel):
    answer: str
    citations: list[Citation]

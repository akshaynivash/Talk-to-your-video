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


class VideoSummary(BaseModel):
    id: str
    title: str | None = None
    status: VideoStatus
    created_at: str | None = None


class GraphNode(BaseModel):
    id: str
    label: str
    type: str


class GraphEdge(BaseModel):
    source: str
    target: str
    type: str


class GraphData(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class Citation(BaseModel):
    start: float
    end: float
    text: str


class QueryResponse(BaseModel):
    answer: str
    citations: list[Citation]

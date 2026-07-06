from typing import TypedDict

from common.models import Citation


class AgentState(TypedDict):
    video_id: str
    question: str
    route: str
    cypher_query: str | None
    cypher_results: list[dict]
    vector_results: list[dict]
    answer: str
    citations: list[Citation]

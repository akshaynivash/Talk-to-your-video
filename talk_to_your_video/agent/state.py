from typing import Literal, TypedDict

from talk_to_your_video.models import Citation

Route = Literal["graph_lookup", "semantic", "hybrid"]


class AgentState(TypedDict):
    video_id: str
    question: str
    route: Route
    cypher_query: str | None
    cypher_results: list[dict]
    vector_results: list[dict]
    visual_inspection: str | None
    answer: str
    citations: list[Citation]

import asyncio

from fastapi import APIRouter
from pydantic import BaseModel

from talk_to_your_video.agent.graph import build_graph
from talk_to_your_video.agent.state import AgentState
from talk_to_your_video.models import QueryResponse

router = APIRouter()

_compiled_graph = None


def _get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph


class QueryRequest(BaseModel):
    video_id: str
    question: str


@router.post("/query")
async def query_video(request: QueryRequest) -> QueryResponse:
    graph = _get_graph()
    initial_state = AgentState(
        video_id=request.video_id,
        question=request.question,
        route="hybrid",
        cypher_query=None,
        cypher_results=[],
        vector_results=[],
        visual_inspection=None,
        answer="",
        citations=[],
    )
    result = await asyncio.to_thread(graph.invoke, initial_state)
    return QueryResponse(answer=result["answer"], citations=result["citations"])

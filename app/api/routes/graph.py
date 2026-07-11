from fastapi import APIRouter

from talk_to_your_video.graph.graph_view import get_video_graph
from talk_to_your_video.models import GraphData

router = APIRouter()


@router.get("/videos/{video_id}/graph")
async def get_video_graph_route(video_id: str) -> GraphData:
    return get_video_graph(video_id)

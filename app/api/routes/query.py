from fastapi import APIRouter
from pydantic import BaseModel

from talk_to_your_video.models import QueryResponse

router = APIRouter()


class QueryRequest(BaseModel):
    video_id: str
    question: str


@router.post("/query")
async def query_video(request: QueryRequest) -> QueryResponse:
    raise NotImplementedError

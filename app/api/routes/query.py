from fastapi import APIRouter
from pydantic import BaseModel

from common.models import QueryResponse

router = APIRouter()


class QueryRequest(BaseModel):
    video_id: str
    question: str


@router.post("/query")
async def query_video(request: QueryRequest) -> QueryResponse:
    raise NotImplementedError

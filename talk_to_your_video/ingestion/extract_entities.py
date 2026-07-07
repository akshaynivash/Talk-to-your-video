import instructor
from openai import OpenAI
from pydantic import BaseModel

from talk_to_your_video.config import get_settings
from talk_to_your_video.models import Segment

_client: instructor.Instructor | None = None


def _get_client() -> instructor.Instructor:
    global _client
    if _client is None:
        settings = get_settings()
        openai_client = OpenAI(base_url=f"{settings.ollama_base_url}/v1", api_key="ollama")
        _client = instructor.from_openai(openai_client, mode=instructor.Mode.JSON)
    return _client


class SegmentExtraction(BaseModel):
    entities: list[str]
    topics: list[str]


def extract_entities(segment: Segment) -> SegmentExtraction:
    settings = get_settings()
    client = _get_client()
    return client.chat.completions.create(
        model=settings.ollama_model,
        response_model=SegmentExtraction,
        max_retries=3,
        messages=[
            {
                "role": "system",
                "content": (
                    "Extract named entities and topics mentioned in this video transcript "
                    "segment. Only include entities/topics explicitly present in the text."
                ),
            },
            {"role": "user", "content": segment.text},
        ],
    )

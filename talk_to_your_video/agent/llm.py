import instructor
from openai import OpenAI

from talk_to_your_video.config import get_settings

_client: instructor.Instructor | None = None


def get_instructor_client() -> instructor.Instructor:
    global _client
    if _client is None:
        settings = get_settings()
        openai_client = OpenAI(base_url=f"{settings.ollama_base_url}/v1", api_key="ollama")
        _client = instructor.from_openai(openai_client, mode=instructor.Mode.JSON)
    return _client

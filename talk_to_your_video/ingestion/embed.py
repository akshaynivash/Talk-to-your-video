import ollama

from talk_to_your_video.config import get_settings

_client: ollama.Client | None = None


def _get_client() -> ollama.Client:
    global _client
    if _client is None:
        _client = ollama.Client(host=get_settings().ollama_base_url)
    return _client


def embed(text: str) -> list[float]:
    settings = get_settings()
    response = _get_client().embeddings(model=settings.ollama_embedding_model, prompt=text)
    return list(response["embedding"])

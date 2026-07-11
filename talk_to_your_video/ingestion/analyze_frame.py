import ollama

from talk_to_your_video.config import get_settings

_client: ollama.Client | None = None

DEFAULT_PROMPT = "Describe what is happening in this image factually and concisely."


def _get_client() -> ollama.Client:
    global _client
    if _client is None:
        _client = ollama.Client(host=get_settings().ollama_base_url)
    return _client


def analyze_frame(frame_path: str, prompt: str = DEFAULT_PROMPT) -> str:
    settings = get_settings()
    response = _get_client().chat(
        model=settings.ollama_vision_model,
        messages=[{"role": "user", "content": prompt, "images": [frame_path]}],
    )
    return response["message"]["content"].strip()

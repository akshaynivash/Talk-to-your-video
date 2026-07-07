from pydantic import BaseModel

from talk_to_your_video.agent.llm import get_instructor_client
from talk_to_your_video.agent.prompts import ROUTER_SYSTEM_PROMPT
from talk_to_your_video.agent.state import AgentState, Route
from talk_to_your_video.config import get_settings


class RouteDecision(BaseModel):
    route: Route


def route(state: AgentState) -> dict:
    settings = get_settings()
    client = get_instructor_client()
    decision = client.chat.completions.create(
        model=settings.ollama_model,
        response_model=RouteDecision,
        max_retries=3,
        messages=[
            {"role": "system", "content": ROUTER_SYSTEM_PROMPT},
            {"role": "user", "content": state["question"]},
        ],
    )
    return {"route": decision.route}

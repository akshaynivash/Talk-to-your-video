import pytest

from talk_to_your_video.agent.state import AgentState


@pytest.fixture
def base_state() -> AgentState:
    return AgentState(
        video_id="v1",
        question="What topics are covered?",
        route="hybrid",
        cypher_query=None,
        cypher_results=[],
        vector_results=[],
        answer="",
        citations=[],
    )

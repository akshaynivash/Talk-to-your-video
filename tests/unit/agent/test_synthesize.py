from unittest.mock import MagicMock, patch

from talk_to_your_video.agent.nodes.synthesize import synthesize
from talk_to_your_video.agent.prompts import NO_CONTEXT_ANSWER
from talk_to_your_video.models import Citation, QueryResponse


def test_synthesize_returns_canned_answer_when_no_context(base_state):
    result = synthesize(base_state)

    assert result["answer"] == NO_CONTEXT_ANSWER
    assert result["citations"] == []


def test_synthesize_filters_hallucinated_citations(base_state):
    base_state["vector_results"] = [
        {"start": 0.0, "end": 8.0, "text": "hello", "visual_description": "a car", "score": 0.9}
    ]
    fake_response = QueryResponse(
        answer="It's about a car.",
        citations=[
            Citation(start=0.0, end=8.0, text="hello"),
            Citation(start=99.0, end=100.0, text="made up"),
        ],
    )
    fake_client = MagicMock()
    fake_client.chat.completions.create.return_value = fake_response

    with patch(
        "talk_to_your_video.agent.nodes.synthesize.get_instructor_client",
        return_value=fake_client,
    ):
        result = synthesize(base_state)

    assert result["answer"] == "It's about a car."
    assert len(result["citations"]) == 1
    assert result["citations"][0].start == 0.0

from unittest.mock import MagicMock, patch

from talk_to_your_video.agent.nodes.router import RouteDecision, route


def test_route_sets_route_from_instructor_response(base_state):
    fake_client = MagicMock()
    fake_client.chat.completions.create.return_value = RouteDecision(route="graph_lookup")

    with patch(
        "talk_to_your_video.agent.nodes.router.get_instructor_client", return_value=fake_client
    ):
        result = route(base_state)

    assert result["route"] == "graph_lookup"
    _, kwargs = fake_client.chat.completions.create.call_args
    assert kwargs["response_model"] is RouteDecision
    assert kwargs["max_retries"] == 3

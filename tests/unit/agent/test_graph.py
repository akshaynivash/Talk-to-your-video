from unittest.mock import patch

from talk_to_your_video.agent.graph import build_graph
from talk_to_your_video.agent.state import AgentState


def _initial_state(route: str) -> AgentState:
    return AgentState(
        video_id="v1",
        question="tell me everything",
        route=route,
        cypher_query=None,
        cypher_results=[],
        vector_results=[],
        answer="",
        citations=[],
    )


def test_hybrid_route_runs_both_cypher_and_vector_search():
    def fake_route(state):
        return {"route": "hybrid"}

    def fake_cypher(state):
        return {"cypher_results": [{"from": "cypher"}]}

    def fake_vector(state):
        return {"vector_results": [{"from": "vector"}]}

    def fake_synthesize(state):
        return {"answer": "done", "citations": []}

    with (
        patch("talk_to_your_video.agent.graph.route", fake_route),
        patch("talk_to_your_video.agent.graph.run_cypher", fake_cypher),
        patch("talk_to_your_video.agent.graph.run_vector_search", fake_vector),
        patch("talk_to_your_video.agent.graph.synthesize", fake_synthesize),
    ):
        graph = build_graph()
        result = graph.invoke(_initial_state("hybrid"))

    assert result["cypher_results"] == [{"from": "cypher"}]
    assert result["vector_results"] == [{"from": "vector"}]
    assert result["answer"] == "done"


def test_graph_lookup_route_skips_vector_search():
    def fake_route(state):
        return {"route": "graph_lookup"}

    def fake_cypher(state):
        return {"cypher_results": [{"from": "cypher"}]}

    def fake_vector(state):
        raise AssertionError("vector search should not run for graph_lookup route")

    def fake_synthesize(state):
        return {"answer": "done", "citations": []}

    with (
        patch("talk_to_your_video.agent.graph.route", fake_route),
        patch("talk_to_your_video.agent.graph.run_cypher", fake_cypher),
        patch("talk_to_your_video.agent.graph.run_vector_search", fake_vector),
        patch("talk_to_your_video.agent.graph.synthesize", fake_synthesize),
    ):
        graph = build_graph()
        result = graph.invoke(_initial_state("graph_lookup"))

    assert result["cypher_results"] == [{"from": "cypher"}]
    assert result["vector_results"] == []

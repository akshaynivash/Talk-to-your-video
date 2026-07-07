from unittest.mock import MagicMock, patch

from neo4j.exceptions import Neo4jError

from talk_to_your_video.agent.nodes.cypher_tool import CypherQuery, run_cypher


def test_run_cypher_returns_results_on_success(base_state):
    fake_client = MagicMock()
    fake_client.chat.completions.create.return_value = CypherQuery(
        cypher="MATCH (v:Video {id: $video_id}) RETURN v"
    )

    fake_driver = MagicMock()
    fake_session = MagicMock()
    fake_driver.session.return_value.__enter__.return_value = fake_session
    fake_session.execute_read.side_effect = lambda fn: [{"name": "Marie Curie"}]

    with (
        patch(
            "talk_to_your_video.agent.nodes.cypher_tool.get_instructor_client",
            return_value=fake_client,
        ),
        patch("talk_to_your_video.agent.nodes.cypher_tool.get_driver", return_value=fake_driver),
    ):
        result = run_cypher(base_state)

    assert result["cypher_results"] == [{"name": "Marie Curie"}]
    assert "MATCH" in result["cypher_query"]


def test_run_cypher_rejects_forbidden_keywords_and_exhausts_retries(base_state):
    fake_client = MagicMock()
    fake_client.chat.completions.create.return_value = CypherQuery(cypher="CREATE (n) RETURN n")

    with patch(
        "talk_to_your_video.agent.nodes.cypher_tool.get_instructor_client",
        return_value=fake_client,
    ):
        result = run_cypher(base_state)

    assert result["cypher_results"] == []
    assert fake_client.chat.completions.create.call_count == 3


def test_run_cypher_returns_empty_results_after_neo4j_errors(base_state):
    fake_client = MagicMock()
    fake_client.chat.completions.create.return_value = CypherQuery(cypher="MATCH (n) RETURN n")

    fake_driver = MagicMock()
    fake_session = MagicMock()
    fake_driver.session.return_value.__enter__.return_value = fake_session
    fake_session.execute_read.side_effect = Neo4jError("boom")

    with (
        patch(
            "talk_to_your_video.agent.nodes.cypher_tool.get_instructor_client",
            return_value=fake_client,
        ),
        patch("talk_to_your_video.agent.nodes.cypher_tool.get_driver", return_value=fake_driver),
    ):
        result = run_cypher(base_state)

    assert result["cypher_results"] == []
    assert fake_client.chat.completions.create.call_count == 3

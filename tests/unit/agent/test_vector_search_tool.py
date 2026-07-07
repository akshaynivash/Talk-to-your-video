from unittest.mock import MagicMock, patch

from talk_to_your_video.agent.nodes.vector_search_tool import run_vector_search


def test_run_vector_search_queries_index_and_returns_results(base_state):
    fake_driver = MagicMock()
    fake_session = MagicMock()
    fake_driver.session.return_value.__enter__.return_value = fake_session
    fake_session.execute_read.side_effect = lambda fn: [
        {"start": 0.0, "end": 8.0, "text": "hello", "visual_description": "a car", "score": 0.9}
    ]

    with (
        patch(
            "talk_to_your_video.agent.nodes.vector_search_tool.embed", return_value=[0.1, 0.2]
        ) as m_embed,
        patch(
            "talk_to_your_video.agent.nodes.vector_search_tool.get_driver",
            return_value=fake_driver,
        ),
    ):
        result = run_vector_search(base_state)

    m_embed.assert_called_once_with(base_state["question"])
    assert result["vector_results"][0]["text"] == "hello"
    assert result["vector_results"][0]["visual_description"] == "a car"

from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app
from talk_to_your_video.models import Citation

client = TestClient(app)


def test_query_video_invokes_graph_and_returns_response():
    fake_graph = MagicMock()
    fake_graph.invoke.return_value = {
        "answer": "It's about radium.",
        "citations": [Citation(start=0.0, end=8.0, text="hello")],
    }

    with patch("app.api.routes.query._get_graph", return_value=fake_graph):
        response = client.post(
            "/query", json={"video_id": "video-1", "question": "What is this about?"}
        )

    assert response.status_code == 200
    body = response.json()
    assert body["answer"] == "It's about radium."
    assert body["citations"][0]["start"] == 0.0

    initial_state = fake_graph.invoke.call_args.args[0]
    assert initial_state["video_id"] == "video-1"
    assert initial_state["question"] == "What is this about?"

from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from talk_to_your_video.models import GraphData, GraphEdge, GraphNode

client = TestClient(app)


def test_get_video_graph_returns_nodes_and_edges():
    fake_graph = GraphData(
        nodes=[
            GraphNode(id="v0", label="My Video", type="Video"),
            GraphNode(id="s0", label="0:00-0:08", type="Segment"),
        ],
        edges=[GraphEdge(source="v0", target="s0", type="HAS_SEGMENT")],
    )

    with patch("app.api.routes.graph.get_video_graph", return_value=fake_graph):
        response = client.get("/videos/video-1/graph")

    assert response.status_code == 200
    body = response.json()
    assert len(body["nodes"]) == 2
    assert body["edges"] == [{"source": "v0", "target": "s0", "type": "HAS_SEGMENT"}]

from unittest.mock import MagicMock, patch

from talk_to_your_video.graph.graph_view import get_video_graph


def test_get_video_graph_builds_deduplicated_nodes_and_edges():
    fake_driver = MagicMock()
    fake_session = MagicMock()
    fake_driver.session.return_value.__enter__.return_value = fake_session
    fake_session.execute_read.return_value = [
        {
            "video_eid": "v0",
            "video_id": "video-1",
            "video_title": "My Video",
            "segment_eid": "s0",
            "start": 0.0,
            "end": 8.0,
            "mention_eid": "e0",
            "mention_name": "Marie Curie",
            "mention_labels": ["Entity"],
        },
        {
            "video_eid": "v0",
            "video_id": "video-1",
            "video_title": "My Video",
            "segment_eid": "s0",
            "start": 0.0,
            "end": 8.0,
            "mention_eid": "t0",
            "mention_name": "radioactivity",
            "mention_labels": ["Topic"],
        },
    ]

    with patch("talk_to_your_video.graph.graph_view.get_driver", return_value=fake_driver):
        result = get_video_graph("video-1")

    node_types = {node.id: node.type for node in result.nodes}
    assert node_types == {"v0": "Video", "s0": "Segment", "e0": "Entity", "t0": "Topic"}
    assert len(result.nodes) == 4

    edge_pairs = {(edge.source, edge.target, edge.type) for edge in result.edges}
    assert edge_pairs == {
        ("v0", "s0", "HAS_SEGMENT"),
        ("s0", "e0", "MENTIONS"),
        ("s0", "t0", "MENTIONS"),
    }


def test_get_video_graph_handles_video_with_no_segments():
    fake_driver = MagicMock()
    fake_session = MagicMock()
    fake_driver.session.return_value.__enter__.return_value = fake_session
    fake_session.execute_read.return_value = [
        {
            "video_eid": "v0",
            "video_id": "video-1",
            "video_title": None,
            "segment_eid": None,
            "start": None,
            "end": None,
            "mention_eid": None,
            "mention_name": None,
            "mention_labels": None,
        }
    ]

    with patch("talk_to_your_video.graph.graph_view.get_driver", return_value=fake_driver):
        result = get_video_graph("video-1")

    assert len(result.nodes) == 1
    assert result.nodes[0].type == "Video"
    assert result.edges == []

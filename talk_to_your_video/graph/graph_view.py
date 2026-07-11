from talk_to_your_video.graph.client import get_driver
from talk_to_your_video.models import GraphData, GraphEdge, GraphNode

_GRAPH_QUERY = """
MATCH (v:Video {id: $video_id})
OPTIONAL MATCH (v)-[:HAS_SEGMENT]->(s:Segment)
OPTIONAL MATCH (s)-[:MENTIONS]->(m)
RETURN elementId(v) AS video_eid, v.id AS video_id, v.title AS video_title,
       elementId(s) AS segment_eid, s.start AS start, s.end AS `end`,
       elementId(m) AS mention_eid, m.name AS mention_name, labels(m) AS mention_labels
ORDER BY s.start
"""


def _format_timestamp(seconds: float) -> str:
    minutes, secs = divmod(int(seconds), 60)
    return f"{minutes}:{secs:02d}"


def get_video_graph(video_id: str) -> GraphData:
    driver = get_driver()
    with driver.session() as session:
        records = session.execute_read(
            lambda tx: [r.data() for r in tx.run(_GRAPH_QUERY, video_id=video_id)]
        )

    nodes: dict[str, GraphNode] = {}
    edges: set[tuple[str, str, str]] = set()

    for row in records:
        video_eid = row["video_eid"]
        if video_eid is None:
            continue
        nodes[video_eid] = GraphNode(
            id=video_eid, label=row["video_title"] or row["video_id"], type="Video"
        )

        segment_eid = row["segment_eid"]
        if segment_eid is None:
            continue
        nodes[segment_eid] = GraphNode(
            id=segment_eid,
            label=f"{_format_timestamp(row['start'])}–{_format_timestamp(row['end'])}",
            type="Segment",
        )
        edges.add((video_eid, segment_eid, "HAS_SEGMENT"))

        mention_eid = row["mention_eid"]
        if mention_eid is None:
            continue
        mention_type = "Entity" if "Entity" in row["mention_labels"] else "Topic"
        nodes[mention_eid] = GraphNode(id=mention_eid, label=row["mention_name"], type=mention_type)
        edges.add((segment_eid, mention_eid, "MENTIONS"))

    return GraphData(
        nodes=list(nodes.values()),
        edges=[GraphEdge(source=s, target=t, type=ty) for s, t, ty in edges],
    )

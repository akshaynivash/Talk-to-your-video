from talk_to_your_video.graph.client import get_driver
from talk_to_your_video.models import SegmentDetail

_LIST_SEGMENTS_QUERY = """
MATCH (v:Video {id: $video_id})-[:HAS_SEGMENT]->(s:Segment)
OPTIONAL MATCH (s)-[:MENTIONS]->(e:Entity)
OPTIONAL MATCH (s)-[:MENTIONS]->(t:Topic)
RETURN s.start AS start, s.end AS end, s.text AS text,
       s.visual_description AS visual_description,
       collect(DISTINCT e.name) AS entities, collect(DISTINCT t.name) AS topics
ORDER BY s.start
"""


def list_video_segments(video_id: str) -> list[SegmentDetail]:
    driver = get_driver()
    with driver.session() as session:
        records = session.execute_read(
            lambda tx: [r.data() for r in tx.run(_LIST_SEGMENTS_QUERY, video_id=video_id)]
        )
    return [SegmentDetail(**r) for r in records]

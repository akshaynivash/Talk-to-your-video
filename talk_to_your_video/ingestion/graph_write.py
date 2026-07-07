from neo4j import ManagedTransaction

from talk_to_your_video.graph.client import get_driver
from talk_to_your_video.ingestion.extract_entities import SegmentExtraction
from talk_to_your_video.models import Segment

_WRITE_SEGMENT_QUERY = """
MERGE (v:Video {id: $video_id})
CREATE (s:Segment {
  start: $start, end: $end, text: $text,
  visual_description: $visual_description, embedding: $embedding
})
MERGE (v)-[:HAS_SEGMENT]->(s)
FOREACH (entity_name IN $entities |
  MERGE (e:Entity {name: entity_name})
  MERGE (s)-[:MENTIONS]->(e)
)
FOREACH (topic_name IN $topics |
  MERGE (t:Topic {name: topic_name})
  MERGE (s)-[:MENTIONS]->(t)
)
"""


def _write_segment(
    tx: ManagedTransaction,
    video_id: str,
    segment: Segment,
    extraction: SegmentExtraction,
    embedding: list[float],
) -> None:
    tx.run(
        _WRITE_SEGMENT_QUERY,
        video_id=video_id,
        start=segment.start,
        end=segment.end,
        text=segment.text,
        visual_description=segment.visual_description,
        embedding=embedding,
        entities=extraction.entities,
        topics=extraction.topics,
    )


def write_video_graph(
    video_id: str,
    segments: list[Segment],
    extractions: list[SegmentExtraction],
    embeddings: list[list[float]],
) -> None:
    driver = get_driver()
    with driver.session() as session:
        for seg, extraction, embedding in zip(segments, extractions, embeddings, strict=True):
            session.execute_write(_write_segment, video_id, seg, extraction, embedding)

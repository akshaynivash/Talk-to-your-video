from talk_to_your_video.agent.state import AgentState
from talk_to_your_video.graph.client import get_driver
from talk_to_your_video.ingestion.embed import embed

_OVER_FETCH_K = 20
_TOP_N = 5

_VECTOR_SEARCH_QUERY = """
CALL db.index.vector.queryNodes('segment_embedding', $k, $embedding) YIELD node, score
MATCH (v:Video {id: $video_id})-[:HAS_SEGMENT]->(node)
RETURN node.start AS start, node.end AS end, node.text AS text, score
ORDER BY score DESC
LIMIT $top_n
"""


def run_vector_search(state: AgentState) -> AgentState:
    embedding = embed(state["question"])
    driver = get_driver()
    with driver.session() as session:
        records = session.execute_read(
            lambda tx: [
                r.data()
                for r in tx.run(
                    _VECTOR_SEARCH_QUERY,
                    k=_OVER_FETCH_K,
                    embedding=embedding,
                    video_id=state["video_id"],
                    top_n=_TOP_N,
                )
            ]
        )
    return {**state, "vector_results": records}

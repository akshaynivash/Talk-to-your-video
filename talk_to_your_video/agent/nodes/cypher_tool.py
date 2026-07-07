import logging
import re

from neo4j.exceptions import Neo4jError
from pydantic import BaseModel

from talk_to_your_video.agent.llm import get_instructor_client
from talk_to_your_video.agent.prompts import CYPHER_SYSTEM_PROMPT
from talk_to_your_video.agent.state import AgentState
from talk_to_your_video.config import get_settings
from talk_to_your_video.graph.client import get_driver

logger = logging.getLogger(__name__)

_FORBIDDEN_KEYWORDS = re.compile(r"\b(CREATE|MERGE|DELETE|SET|REMOVE|DROP|CALL)\b", re.IGNORECASE)
_MAX_ATTEMPTS = 3


class CypherQuery(BaseModel):
    cypher: str


def _generate_cypher(question: str, previous_error: str | None) -> str:
    settings = get_settings()
    client = get_instructor_client()
    messages = [
        {"role": "system", "content": CYPHER_SYSTEM_PROMPT},
        {"role": "user", "content": question},
    ]
    if previous_error:
        messages.append(
            {
                "role": "user",
                "content": f"Your previous query failed: {previous_error}. Fix it and try again.",
            }
        )
    result = client.chat.completions.create(
        model=settings.ollama_model,
        response_model=CypherQuery,
        max_retries=1,
        messages=messages,
    )
    return result.cypher


def run_cypher(state: AgentState) -> dict:
    video_id = state["video_id"]
    question = state["question"]
    previous_error: str | None = None
    cypher = ""

    for _attempt in range(_MAX_ATTEMPTS):
        cypher = _generate_cypher(question, previous_error)

        if _FORBIDDEN_KEYWORDS.search(cypher):
            previous_error = "query contains a forbidden write keyword"
            logger.warning("Rejected generated Cypher (forbidden keyword): %s", cypher)
            continue

        try:
            driver = get_driver()
            with driver.session() as session:
                records = session.execute_read(
                    lambda tx: [r.data() for r in tx.run(cypher, video_id=video_id)]
                )
            return {"cypher_query": cypher, "cypher_results": records}
        except Neo4jError as exc:
            previous_error = str(exc)
            logger.warning("Generated Cypher failed to execute: %s (%s)", cypher, exc)

    logger.warning(
        "Exhausted %d attempts generating valid Cypher for question: %s", _MAX_ATTEMPTS, question
    )
    return {"cypher_query": cypher, "cypher_results": []}

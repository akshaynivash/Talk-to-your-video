from talk_to_your_video.agent.llm import get_instructor_client
from talk_to_your_video.agent.prompts import NO_CONTEXT_ANSWER, SYNTHESIZE_SYSTEM_PROMPT
from talk_to_your_video.agent.state import AgentState
from talk_to_your_video.config import get_settings
from talk_to_your_video.models import QueryResponse


def _format_context(state: AgentState) -> str:
    parts = []
    if state["cypher_results"]:
        parts.append(f"Graph query results: {state['cypher_results']}")
    if state["vector_results"]:
        segments = "\n".join(
            f"[{r['start']:.2f}-{r['end']:.2f}] spoken: {r['text'] or '(none)'} | "
            f"visual: {r.get('visual_description') or '(none)'}"
            for r in state["vector_results"]
        )
        parts.append(f"Relevant segments (spoken and visual content):\n{segments}")
    if state.get("visual_inspection"):
        parts.append(
            f"On-demand visual inspection of the most relevant frame, answering this "
            f"specific question: {state['visual_inspection']}"
        )
    return "\n\n".join(parts)


def synthesize(state: AgentState) -> dict:
    if not state["cypher_results"] and not state["vector_results"]:
        return {"answer": NO_CONTEXT_ANSWER, "citations": []}

    settings = get_settings()
    client = get_instructor_client()
    response = client.chat.completions.create(
        model=settings.ollama_model,
        response_model=QueryResponse,
        max_retries=3,
        messages=[
            {"role": "system", "content": SYNTHESIZE_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Question: {state['question']}\n\n{_format_context(state)}",
            },
        ],
    )

    valid_segments = {(r["start"], r["end"]) for r in state["vector_results"]}
    citations = [c for c in response.citations if (c.start, c.end) in valid_segments]

    return {"answer": response.answer, "citations": citations}

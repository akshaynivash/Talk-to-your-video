from talk_to_your_video.agent.state import AgentState
from talk_to_your_video.graph.video_status import get_video_file_path
from talk_to_your_video.ingestion.analyze_frame import analyze_frame
from talk_to_your_video.ingestion.extract_frame import extract_frame

_INSPECT_PROMPT_TEMPLATE = (
    "Answer this question about the image as factually and concisely as possible: {question}"
)


def run_visual_inspect(state: AgentState) -> dict:
    vector_results = state["vector_results"]
    if not vector_results:
        return {"visual_inspection": None}

    file_path = get_video_file_path(state["video_id"])
    if file_path is None:
        return {"visual_inspection": None}

    top_segment = vector_results[0]
    midpoint = (top_segment["start"] + top_segment["end"]) / 2
    frame_path = extract_frame(file_path, midpoint)
    prompt = _INSPECT_PROMPT_TEMPLATE.format(question=state["question"])
    return {"visual_inspection": analyze_frame(frame_path, prompt=prompt)}

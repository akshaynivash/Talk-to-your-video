from unittest.mock import patch

from talk_to_your_video.agent.nodes.visual_inspect_tool import run_visual_inspect


def test_run_visual_inspect_analyzes_top_segment_frame(base_state):
    base_state["question"] = "What color is the shirt?"
    base_state["vector_results"] = [
        {"start": 8.0, "end": 16.0, "text": "", "visual_description": "a man walking"}
    ]

    with (
        patch(
            "talk_to_your_video.agent.nodes.visual_inspect_tool.get_video_file_path",
            return_value="/data/videos/v1.mp4",
        ),
        patch(
            "talk_to_your_video.agent.nodes.visual_inspect_tool.extract_frame",
            return_value="/tmp/frame.jpg",
        ) as m_extract,
        patch(
            "talk_to_your_video.agent.nodes.visual_inspect_tool.analyze_frame",
            return_value="blue",
        ) as m_analyze,
    ):
        result = run_visual_inspect(base_state)

    assert result == {"visual_inspection": "blue"}
    m_extract.assert_called_once_with("/data/videos/v1.mp4", 12.0)
    _, kwargs = m_analyze.call_args
    assert "What color is the shirt?" in kwargs["prompt"]


def test_run_visual_inspect_returns_none_when_no_vector_results(base_state):
    base_state["vector_results"] = []

    result = run_visual_inspect(base_state)

    assert result == {"visual_inspection": None}


def test_run_visual_inspect_returns_none_when_video_file_missing(base_state):
    base_state["vector_results"] = [
        {"start": 0.0, "end": 8.0, "text": "", "visual_description": ""}
    ]

    with patch(
        "talk_to_your_video.agent.nodes.visual_inspect_tool.get_video_file_path",
        return_value=None,
    ):
        result = run_visual_inspect(base_state)

    assert result == {"visual_inspection": None}

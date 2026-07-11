from unittest.mock import MagicMock, patch

from talk_to_your_video.ingestion import analyze_frame as analyze_frame_module


def test_analyze_frame_returns_description_from_ollama():
    analyze_frame_module._client = None
    fake_client = MagicMock()
    fake_client.chat.return_value = {"message": {"content": "  a red car  "}}

    with patch.object(analyze_frame_module, "_get_client", return_value=fake_client):
        result = analyze_frame_module.analyze_frame("frame.jpg")

    assert result == "a red car"
    _, kwargs = fake_client.chat.call_args
    assert kwargs["messages"][0]["images"] == ["frame.jpg"]


def test_analyze_frame_uses_custom_prompt_when_given():
    analyze_frame_module._client = None
    fake_client = MagicMock()
    fake_client.chat.return_value = {"message": {"content": "blue"}}

    with patch.object(analyze_frame_module, "_get_client", return_value=fake_client):
        result = analyze_frame_module.analyze_frame("frame.jpg", prompt="What color is the shirt?")

    assert result == "blue"
    _, kwargs = fake_client.chat.call_args
    assert kwargs["messages"][0]["content"] == "What color is the shirt?"

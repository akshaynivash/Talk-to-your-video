from unittest.mock import MagicMock, patch

from talk_to_your_video.ingestion import transcribe as transcribe_module


def test_transcribe_maps_whisper_segments_to_models():
    transcribe_module._model = None
    fake_segment = MagicMock(start=0.0, end=2.5, text="  hello world  ")
    fake_model = MagicMock()
    fake_model.transcribe.return_value = ([fake_segment], MagicMock())

    with patch.object(transcribe_module, "WhisperModel", return_value=fake_model) as mock_cls:
        result = transcribe_module.transcribe("audio.wav")

    mock_cls.assert_called_once_with("small", device="cpu", compute_type="int8")
    assert len(result) == 1
    assert result[0].start == 0.0
    assert result[0].end == 2.5
    assert result[0].text == "hello world"


def test_transcribe_returns_empty_list_when_no_audio():
    assert transcribe_module.transcribe(None) == []

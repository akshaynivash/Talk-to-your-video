from faster_whisper import WhisperModel

from talk_to_your_video.models import Segment

_model: WhisperModel | None = None


def _get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel("small", device="cpu", compute_type="int8")
    return _model


def transcribe(audio_path: str) -> list[Segment]:
    model = _get_model()
    segments, _info = model.transcribe(audio_path)
    return [Segment(start=s.start, end=s.end, text=s.text.strip()) for s in segments]

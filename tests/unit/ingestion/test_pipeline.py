from unittest.mock import patch

from talk_to_your_video.ingestion.pipeline import run_pipeline
from talk_to_your_video.models import Segment


def test_run_pipeline_calls_steps_in_order():
    segments = [Segment(start=0.0, end=1.0, text="hello")]

    with (
        patch(
            "talk_to_your_video.ingestion.pipeline.extract_audio", return_value="audio.wav"
        ) as m_audio,
        patch(
            "talk_to_your_video.ingestion.pipeline.transcribe", return_value=segments
        ) as m_transcribe,
        patch("talk_to_your_video.ingestion.pipeline.segment", return_value=segments) as m_segment,
        patch(
            "talk_to_your_video.ingestion.pipeline.extract_entities", return_value="extraction"
        ) as m_extract,
        patch("talk_to_your_video.ingestion.pipeline.embed", return_value=[0.1]) as m_embed,
        patch("talk_to_your_video.ingestion.pipeline.write_video_graph") as m_write,
    ):
        run_pipeline("video-1", "video.mp4")

    m_audio.assert_called_once_with("video.mp4")
    m_transcribe.assert_called_once_with("audio.wav")
    m_segment.assert_called_once_with(segments)
    m_extract.assert_called_once_with(segments[0])
    m_embed.assert_called_once_with(segments[0].text)
    m_write.assert_called_once_with("video-1", segments, ["extraction"], [[0.1]])

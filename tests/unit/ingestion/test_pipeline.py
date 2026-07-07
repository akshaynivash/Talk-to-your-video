from unittest.mock import patch

from talk_to_your_video.ingestion.extract_entities import SegmentExtraction
from talk_to_your_video.ingestion.pipeline import run_pipeline
from talk_to_your_video.models import Segment


def test_run_pipeline_merges_transcript_and_visual_extraction():
    segments = [Segment(start=0.0, end=8.0, text="hello")]
    transcript_extraction = SegmentExtraction(entities=["A"], topics=["B"])
    visual_extraction = SegmentExtraction(entities=["C"], topics=["D"])

    with (
        patch(
            "talk_to_your_video.ingestion.pipeline.get_video_duration", return_value=8.0
        ) as m_duration,
        patch(
            "talk_to_your_video.ingestion.pipeline.extract_audio", return_value="audio.wav"
        ) as m_audio,
        patch(
            "talk_to_your_video.ingestion.pipeline.transcribe", return_value=segments
        ) as m_transcribe,
        patch("talk_to_your_video.ingestion.pipeline.segment", return_value=segments) as m_segment,
        patch(
            "talk_to_your_video.ingestion.pipeline.extract_frame", return_value="frame.jpg"
        ) as m_frame,
        patch(
            "talk_to_your_video.ingestion.pipeline.analyze_frame", return_value="a red car"
        ) as m_analyze,
        patch(
            "talk_to_your_video.ingestion.pipeline.extract_entities",
            side_effect=[transcript_extraction, visual_extraction],
        ) as m_extract,
        patch("talk_to_your_video.ingestion.pipeline.embed", return_value=[0.1]) as m_embed,
        patch("talk_to_your_video.ingestion.pipeline.write_video_graph") as m_write,
    ):
        run_pipeline("video-1", "video.mp4")

    m_duration.assert_called_once_with("video.mp4")
    m_audio.assert_called_once_with("video.mp4")
    m_transcribe.assert_called_once_with("audio.wav")
    m_segment.assert_called_once_with(segments, 8.0)
    m_frame.assert_called_once_with("video.mp4", 4.0)
    m_analyze.assert_called_once_with("frame.jpg")
    assert m_extract.call_count == 2
    m_embed.assert_called_once_with("hello a red car")

    m_write.assert_called_once()
    args = m_write.call_args.args
    assert args[0] == "video-1"
    written_segments = args[1]
    assert written_segments[0].visual_description == "a red car"
    merged_extraction = args[2][0]
    assert merged_extraction.entities == ["A", "C"]
    assert merged_extraction.topics == ["B", "D"]
    assert args[3] == [[0.1]]


def test_run_pipeline_skips_transcript_extraction_for_silent_segment():
    segments = [Segment(start=0.0, end=8.0, text="")]
    visual_extraction = SegmentExtraction(entities=["C"], topics=["D"])

    with (
        patch("talk_to_your_video.ingestion.pipeline.get_video_duration", return_value=8.0),
        patch("talk_to_your_video.ingestion.pipeline.extract_audio", return_value=None),
        patch("talk_to_your_video.ingestion.pipeline.transcribe", return_value=[]),
        patch("talk_to_your_video.ingestion.pipeline.segment", return_value=segments),
        patch("talk_to_your_video.ingestion.pipeline.extract_frame", return_value="frame.jpg"),
        patch("talk_to_your_video.ingestion.pipeline.analyze_frame", return_value="a red car"),
        patch(
            "talk_to_your_video.ingestion.pipeline.extract_entities",
            return_value=visual_extraction,
        ) as m_extract,
        patch("talk_to_your_video.ingestion.pipeline.embed", return_value=[0.1]),
        patch("talk_to_your_video.ingestion.pipeline.write_video_graph") as m_write,
    ):
        run_pipeline("video-1", "video.mp4")

    m_extract.assert_called_once()
    merged_extraction = m_write.call_args.args[2][0]
    assert merged_extraction.entities == ["C"]
    assert merged_extraction.topics == ["D"]

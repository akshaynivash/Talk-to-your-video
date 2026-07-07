from talk_to_your_video.ingestion.analyze_frame import analyze_frame
from talk_to_your_video.ingestion.embed import embed
from talk_to_your_video.ingestion.extract_audio import extract_audio, get_video_duration
from talk_to_your_video.ingestion.extract_entities import (
    SegmentExtraction,
    extract_entities,
    merge_extractions,
)
from talk_to_your_video.ingestion.extract_frame import extract_frame
from talk_to_your_video.ingestion.graph_write import write_video_graph
from talk_to_your_video.ingestion.segment import segment
from talk_to_your_video.ingestion.transcribe import transcribe
from talk_to_your_video.models import Segment

_EMPTY_EXTRACTION = SegmentExtraction(entities=[], topics=[])


def run_pipeline(video_id: str, file_path: str) -> None:
    duration = get_video_duration(file_path)
    audio_path = extract_audio(file_path)
    transcript_segments = transcribe(audio_path)
    segments = segment(transcript_segments, duration)

    transcript_extractions = [
        extract_entities(s) if s.text else _EMPTY_EXTRACTION for s in segments
    ]

    frame_paths = [extract_frame(file_path, (s.start + s.end) / 2) for s in segments]
    visual_descriptions = [analyze_frame(fp) for fp in frame_paths]
    segments = [
        s.model_copy(update={"visual_description": d})
        for s, d in zip(segments, visual_descriptions, strict=True)
    ]
    visual_extractions = [
        extract_entities(Segment(start=s.start, end=s.end, text=d))
        for s, d in zip(segments, visual_descriptions, strict=True)
    ]

    extractions = [
        merge_extractions(t, v)
        for t, v in zip(transcript_extractions, visual_extractions, strict=True)
    ]
    embeddings = [embed(f"{s.text} {s.visual_description}".strip()) for s in segments]

    write_video_graph(video_id, segments, extractions, embeddings)

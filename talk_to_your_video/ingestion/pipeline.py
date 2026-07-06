from talk_to_your_video.ingestion.embed import embed
from talk_to_your_video.ingestion.extract_audio import extract_audio
from talk_to_your_video.ingestion.extract_entities import extract_entities
from talk_to_your_video.ingestion.graph_write import write_video_graph
from talk_to_your_video.ingestion.segment import segment
from talk_to_your_video.ingestion.transcribe import transcribe


def run_pipeline(video_id: str, file_path: str) -> None:
    audio_path = extract_audio(file_path)
    transcript_segments = transcribe(audio_path)
    segments = segment(transcript_segments)
    extractions = [extract_entities(s) for s in segments]
    embeddings = [embed(s.text) for s in segments]
    write_video_graph(video_id, segments, extractions, embeddings)

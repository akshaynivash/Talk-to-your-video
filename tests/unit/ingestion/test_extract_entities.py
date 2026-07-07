from unittest.mock import MagicMock, patch

from talk_to_your_video.ingestion import extract_entities as extract_entities_module
from talk_to_your_video.ingestion.extract_entities import (
    SegmentExtraction,
    merge_extractions,
)
from talk_to_your_video.models import Segment


def test_extract_entities_calls_instructor_with_response_model():
    extract_entities_module._client = None
    expected = SegmentExtraction(entities=["Marie Curie"], topics=["Radioactivity"])
    fake_client = MagicMock()
    fake_client.chat.completions.create.return_value = expected

    with patch.object(extract_entities_module, "_get_client", return_value=fake_client):
        result = extract_entities_module.extract_entities(
            Segment(start=0.0, end=1.0, text="Marie Curie discovered radium.")
        )

    assert result == expected
    _, kwargs = fake_client.chat.completions.create.call_args
    assert kwargs["response_model"] is SegmentExtraction
    assert kwargs["max_retries"] == 3


def test_merge_extractions_dedupes_and_preserves_order():
    a = SegmentExtraction(entities=["Marie Curie", "Paris"], topics=["radioactivity"])
    b = SegmentExtraction(entities=["Paris", "Poland"], topics=["radioactivity", "chemistry"])

    merged = merge_extractions(a, b)

    assert merged.entities == ["Marie Curie", "Paris", "Poland"]
    assert merged.topics == ["radioactivity", "chemistry"]

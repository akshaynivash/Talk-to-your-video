from unittest.mock import MagicMock, patch

from talk_to_your_video.ingestion import embed as embed_module


def test_embed_returns_vector_from_ollama_client():
    embed_module._client = None
    fake_client = MagicMock()
    fake_client.embeddings.return_value = {"embedding": [0.1, 0.2, 0.3]}

    with patch.object(embed_module, "_get_client", return_value=fake_client):
        result = embed_module.embed("hello")

    assert result == [0.1, 0.2, 0.3]

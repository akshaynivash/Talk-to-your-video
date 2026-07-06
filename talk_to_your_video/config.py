from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    redis_url: str = "redis://localhost:6379/0"

    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "password"

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1:8b"
    ollama_embedding_model: str = "nomic-embed-text"

    videos_dir: str = "/data/videos"

    langchain_tracing_v2: bool = False
    langchain_project: str = "talk-to-your-video"
    langchain_api_key: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()

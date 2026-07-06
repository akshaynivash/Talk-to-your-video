# Talk to Your Video

Ask natural-language questions about a video and get back answers grounded with exact timestamps. Upload a video, it's transcribed and turned into a knowledge graph, and a LangGraph agent answers your questions by querying that graph.

## Architecture

```
                 ┌─────────────┐
   upload        │   FastAPI   │  query
  ───────────────►             ◄───────────────
                 └──────┬──────┘
                        │ enqueue
                        ▼
                 ┌─────────────┐        ┌──────────────┐
                 │   Celery    │───────►│    Ollama    │
                 │   worker    │        │ (llama3.1:8b │
                 │             │◄───────│ + embeddings)│
                 └──────┬──────┘        └──────────────┘
                        │ 1. ffmpeg extract audio
                        │ 2. faster-whisper transcribe
                        │ 3. Ollama entity/topic extraction
                        │ 4. embed segments
                        ▼
                 ┌─────────────┐
                 │    Neo4j    │  (:Video)-[:HAS_SEGMENT]->(:Segment)
                 │             │  (:Segment)-[:MENTIONS]->(:Entity|:Topic)
                 └──────▲──────┘  + native vector index on Segment.embedding
                        │
                        │ Cypher + vector search
                 ┌──────┴──────┐
                 │  LangGraph  │  router -> cypher_tool / vector_search_tool -> synthesize
                 │    agent    │  (traced via LangSmith)
                 └─────────────┘
```

Redis is the Celery broker/result backend (not pictured above).

## Tech stack

- **API:** FastAPI
- **Async ingestion:** Celery + Redis
- **Transcription:** faster-whisper
- **Knowledge graph:** Neo4j (graph relations + native vector index for semantic search)
- **Agent orchestration:** LangGraph
- **LLM/embeddings:** Ollama, self-hosted (default `llama3.1:8b` + `nomic-embed-text`) — no external API costs
- **Tracing:** LangSmith
- **Deployment:** Kubernetes (Kind) via Helm, NGINX ingress
- **Observability:** Prometheus + Grafana
- **CI/CD:** GitHub Actions

## Project structure

```
app/       FastAPI service — HTTP API (upload, status, query)
worker/    Celery worker — ingestion pipeline (audio -> transcript -> extraction -> embeddings -> graph write)
agent/     LangGraph agent — the query-time StateGraph (router, Cypher tool, vector search tool, synthesis)
graph/     Neo4j driver client + Cypher migrations (constraints, vector index)
common/    Shared config, Pydantic models, logging used by app/worker/agent
charts/    Helm chart for Kubernetes deployment
scripts/   Dev/deploy helper scripts
tests/     Unit and integration tests
docs/      Implementation plan (PLAN.md) and phase progress checklist (PROGRESS.md)
```

## Local development

```bash
uv sync
cp .env.example .env
docker compose up -d
```

Then:

```bash
curl -F file=@tests/fixtures/sample.mp4 localhost:8000/videos
curl localhost:8000/videos/<video_id>/status
curl -X POST localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"video_id": "<video_id>", "question": "What does the speaker say about X?"}'
```

Neo4j Browser is available at `localhost:7474` to inspect the graph directly.

> Local dev loop (docker-compose wiring) lands in a later build phase — see `docs/PROGRESS.md` for current status.

## Kubernetes deployment

```bash
kind create cluster
helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace
helm install ttyv charts/talk-to-your-video
```

> Helm chart contents land in a later build phase — see `docs/PROGRESS.md` for current status.

## Status

This project is under active build-out. See [`docs/PLAN.md`](docs/PLAN.md) for the full phased implementation plan and [`docs/PROGRESS.md`](docs/PROGRESS.md) for what's done so far.

## Demo

_Screenshots / recording placeholder — added once the end-to-end flow is working._

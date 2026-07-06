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

The core pipeline logic is an installable library (`talk_to_your_video/`), independent of any web framework or task queue. `app/` and `worker/` are thin services that import from it — either can be swapped or reused elsewhere without dragging the other along.

```
talk_to_your_video/   Installable library — the reusable core (pip install -e . pulls in just this)
  config.py             Settings + lazy get_settings() (no import-time side effects)
  models.py             Shared Pydantic models (Segment, Citation, QueryResponse, VideoStatus)
  ingestion/            Pure ingestion steps + run_pipeline() orchestration (audio -> transcript ->
                         extraction -> embeddings -> graph write) — no Celery decorators here
  agent/                LangGraph agent (router, Cypher tool, vector search tool, synthesis)
  graph/                Neo4j driver client + Cypher migrations (constraints, vector index)

app/       FastAPI service — HTTP API (upload, status, query), calls into talk_to_your_video
worker/    Celery worker — wraps talk_to_your_video.ingestion.run_pipeline() as a task
charts/    Helm chart for Kubernetes deployment
scripts/   Dev/deploy helper scripts
tests/     Unit and integration tests
docs/      Implementation plan (PLAN.md) and phase progress checklist (PROGRESS.md)
```

Installing just the core (no FastAPI/Celery): `pip install .` gives you `agent`, `graph`, and `ingestion`. Add `.[api]` and/or `.[worker]` extras for the FastAPI/Celery pieces.

## Local development

```bash
uv sync --all-extras
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

## License

All rights reserved. This repository is public for portfolio/demonstration purposes only — see [`LICENSE`](LICENSE). No permission is granted to copy, modify, or reuse this code.

# Talk to Your Video — Implementation Plan

## Context

This is a portfolio project: a natural-language video Q&A system. A user uploads a video, the system transcribes it, builds a knowledge graph of what's in it, and answers plain-English questions with timestamp-grounded citations (e.g. "at 12:34, the speaker explains X"). The repo (`d:\Akshaya-Github\Talk-to-your-video`) is currently an empty git init with `origin` already pointed at `https://github.com/akshaynivash/Talk-to-your-video.git` — zero commits, zero files. This plan scaffolds and builds the whole thing from scratch.

Locked-in architecture (confirmed with user before planning, not up for re-litigation): **LangGraph** (not Claude Agent SDK, which only targets Anthropic's hosted API) orchestrating a **local Ollama** model (default `llama3.1:8b`) for both transcript-entity-extraction and the Q&A agent; **faster-whisper** for transcription; **Neo4j** as the knowledge graph with its **native vector index** for semantic search (no separate vector DB); **Celery + Redis** to decouple heavy ingestion from the query path; **FastAPI** as the API layer; **Kind + Helm + NGINX ingress** for Kubernetes deployment; **Prometheus/Grafana + LangSmith** for observability; **GitHub Actions** for CI/CD. Bar: portfolio-grade — coherent and demoable, not production-scale.

**Environment already checked (read-only):** Python 3.11.5, Docker Desktop 26.1.1, Helm 3.15.2, kubectl 1.29.2, Ollama 0.5.11 all installed. `uv` and `kind` are NOT installed yet. No GPU available (CPU-only inference). 16 GB total RAM — tight once Neo4j + Redis + Ollama(8B) + Docker Desktop + Kind are all in play; never run the docker-compose stack and a Kind cluster at the same time.

## Phase 0 — Prerequisites (~30 min)
- Install `uv` (`winget install astral-sh.uv`) and `kind` (`winget install kubernetes-sigs.kind`).
- Sign up for a free LangSmith account + API key (needed by Phase 4).
- **Verify:** `uv --version` and `kind --version` resolve.

## Phase 1 — Repo scaffold + README (1–2 hrs)

Monorepo layout:
```
talk-to-your-video/
  app/                 # FastAPI service (main.py, api/routes/{ingest,query,health}.py, Dockerfile)
  worker/              # Celery worker (celery_app.py, tasks/{extract_audio,transcribe,segment,
                       #   extract_entities,embed,graph_write}.py, pipeline.py, Dockerfile)
  agent/               # LangGraph agent (graph.py, state.py, nodes/{router,cypher_tool,
                       #   vector_search_tool,synthesize}.py, prompts/, tools.py)
  graph/               # Neo4j schema/migrations + driver client
                       #   (migrations/001_init_constraints.cypher, 002_vector_index.cypher, client.py)
  common/              # shared Pydantic models, config, logging, celery_app factory used by app+worker
  charts/talk-to-your-video/   # single umbrella Helm chart
  .github/workflows/{ci.yml,docker-publish.yml}
  scripts/{dev-smoke-test.sh, deploy-local.sh, fetch_test_video.sh}
  tests/{unit,integration}
  docker-compose.yml
  pyproject.toml + uv.lock     # ONE root project/venv shared by app/worker/agent/graph/common
  Makefile
  .env.example
  docs/PLAN.md, docs/PROGRESS.md   # this plan + a phase checklist, for cross-session resumability
  README.md
```

**Tooling:** `uv` (single binary, fast, not yet installed anyway) over Poetry; one root `pyproject.toml`/`uv.lock` shared by both Dockerfiles (`app` runs `uvicorn`, `worker` runs `celery worker`, same lockfile). Python 3.11. Base image `python:3.11-slim`.

**README.md must cover:** project pitch (1-2 sentences), architecture diagram (ASCII or Mermaid: upload → Celery/Whisper/Ollama-extraction → Neo4j → LangGraph query agent → answer), tech stack list, local dev quickstart (docker-compose up + curl smoke test from Phase 2), Kubernetes/Helm quickstart, project structure explanation, and a screenshots/demo placeholder section to fill in later. This is the first thing a reviewer/interviewer opens, so it should stand alone.

**Verify:** tree exists, `uv sync` succeeds, both Dockerfiles build as stub entrypoints, `git commit` as phase-1 checkpoint (README + scaffold).

## Phase 2 — Local dev loop via docker-compose (~1 day) — before any Kubernetes work

Services: `neo4j` (5.20-community, volume for `/data`), `redis` (7-alpine), `ollama` (official image, volume for model cache — with a documented `OLLAMA_BASE_URL` fallback to point at the host's already-installed Ollama instead, given the 16GB RAM constraint), `app`, `worker`.

Test video: not committed to git; `scripts/fetch_test_video.sh` pulls a small CC0 sample, or user drops `tests/fixtures/sample.mp4` (gitignored).

**Verify ("it works" bar for this milestone):**
1. `docker compose up -d`
2. `curl -F file=@sample.mp4 localhost:8000/videos` → `video_id`/`job_id`
3. Poll `curl localhost:8000/videos/{id}/status` until `complete`
4. `curl -X POST localhost:8000/query -d '{"video_id":"...","question":"..."}'` → answer + citations with real timestamps
5. Neo4j Browser (`localhost:7474`) shows `Video`/`Segment`/`Entity` nodes and `HAS_SEGMENT`/`MENTIONS` edges.

## Phase 3 — Ingestion pipeline (2–3 days, largest early lift)

Celery chain in `worker/pipeline.py`:
1. `extract_audio` — ffmpeg → 16kHz mono wav.
2. `transcribe` — faster-whisper (`small`/`base.en` given CPU-only) → `[{start,end,text}]`.
3. `segment` — v1 uses Whisper's native segments 1:1 as graph Segments.
4. `extract_entities` — Ollama call per segment, `format:"json"` + Pydantic validation. **Reliability handling:** on validation failure, retry with the error fed back into the prompt, up to N times; after N failures log and continue with empty extraction rather than failing the whole video. Consider the `instructor` library (works against Ollama's OpenAI-compatible endpoint) instead of hand-rolled retries.
5. `embed` — dedicated `nomic-embed-text` model via Ollama (not llama3.1:8b) for segment vectors.
6. `graph_write` — MERGE `Video`, CREATE `Segment` (with embedding property) + `HAS_SEGMENT`, MERGE dedup'd `Entity`/`Topic` + `MENTIONS`. Vector index created once via idempotent `graph/migrations/002_vector_index.cypher`, not per-task.

**Verify:** run pipeline against sample video, inspect Neo4j node/edge counts, spot-check timestamps vs transcript, `SHOW INDEXES` confirms vector index.

## Phase 4 — Query agent / LangGraph (2–3 days, largest lift)

`agent/graph.py` as a **deterministic StateGraph with conditional edges** (not a free-form ReAct loop — llama3.1:8b's local tool-calling is too flaky for a reliable demo). Nodes: `router` (graph-lookup vs semantic vs hybrid, default hybrid on ambiguity) → `cypher_tool` (LLM-generated Cypher, read-only execution, same retry-on-error pattern as Phase 3) and/or `vector_search_tool` (embed question, query Neo4j vector index) → `synthesize` (combine results, answer with timestamp citations, parse structured citations list).

**LangSmith:** `LANGCHAIN_TRACING_V2=true`, `LANGCHAIN_API_KEY`, `LANGCHAIN_PROJECT=talk-to-your-video`.

**Verify:** `python -m agent.graph "question"` against Phase-3-populated Neo4j returns answer+citations; LangSmith shows a trace with router/cypher/vector/synthesize spans.

## Phase 5 — FastAPI layer (~1 day)
- `POST /videos` (multipart) → shared volume, `Video` stub node with a `status` field as source of truth (updated at each Celery step), enqueues chain, returns `{video_id, job_id, status}`.
- `GET /videos/{id}/status` — reads `Video.status`.
- `POST /query` — calls the LangGraph agent **synchronously** (seconds, no need to queue).
- `GET /health`, `GET /ready` (Neo4j/Redis/Ollama reachability) for later k8s probes.

**Verify:** `/docs` loads; curl flow from Phase 2 plus validation cases (bad upload, unknown id); `pytest` with `TestClient` + Celery eager mode.

## Phase 6 — Containerization (few hours)
Multi-stage Dockerfiles (`python:3.11-slim`, `uv sync --frozen --no-dev` in a builder stage, venv copied to final stage): `app/Dockerfile` runs `uvicorn`, `worker/Dockerfile` adds `ffmpeg`/`libsndfile1` (needed by faster-whisper) and runs `celery worker`. No custom images for Neo4j/Redis/Ollama.

**Verify:** both images build; `docker run` the app image against the already-running compose Neo4j/Redis, hit `/health`.

## Phase 7 — Kubernetes/Helm (2–3 days)

One umbrella chart `charts/talk-to-your-video` with hand-written templates per component (fastapi, celery-worker, neo4j, redis, ollama, ingress) — deliberately simple, and more Helm templating to show/discuss than pulling prebuilt subcharts.

- **PVCs:** `neo4j-data` (~2-5Gi), `ollama-models` (~10Gi), `videos-data` (RWO fine on a single-node Kind cluster — the recommendation here).
- **Ollama model pulling in-cluster:** a Helm post-install/upgrade Job hitting the Ollama pod's `/api/pull` for each required model into the PVC-backed cache (rejected: baking models into a custom image).
- **Ingress:** `ingress-nginx` installed as a separate cluster-addon (documented setup step outside the app chart), routing to the FastAPI Service.
- **Resource sizing for Kind on 16GB:** neo4j ~1-2Gi (heap capped), redis ~256Mi, ollama 4Gi request/6-8Gi limit (tightest budget item — document a host-Ollama fallback if this doesn't fit), fastapi ~256-512Mi, worker ~1-2Gi. StatefulSets for Neo4j/Ollama (stable PVC identity), Deployment for Redis.

**Verify:** `kind create cluster`, install `ingress-nginx`, `helm install ttyv charts/talk-to-your-video`, all pods Running/Ready, curl flow against ingress host, delete worker pod and confirm Neo4j data/Ollama models persist via PVC.

## Phase 8 — Observability (1–2 days)
- **kube-prometheus-stack** community Helm chart (Prometheus Operator + Grafana, real `ServiceMonitor` CRDs).
- FastAPI metrics via `prometheus-fastapi-instrumentator`; Celery metrics via `celery-exporter` (queue depth, task success/failure).
- Custom histograms: `video_processing_duration_seconds`, `llm_call_duration_seconds`. Note: Prometheus = aggregate latency/dashboards/alerting; LangSmith = full per-call trace content (prompts/completions/tokens) — different concerns, both kept.
- Grafana dashboard JSON provisioned via ConfigMap (`grafana_dashboard` label), checked into `charts/.../dashboards/`.

**Verify:** Prometheus targets UP for fastapi/worker/celery-exporter; Grafana dashboards populate after an ingest+query run; LangSmith project shows matching traces.

## Phase 9 — CI/CD (~1 day)
- `ci.yml`: checkout → Python 3.11 + `uv` (astral-sh/setup-uv) → `uv sync` → `ruff check`/`format --check` → `pytest` (mocked Ollama/Celery-eager; optional integration job with real Redis/Neo4j via GH Actions `services:`, but **no real Ollama model pull in CI** — too slow for hosted runners).
- `docker-publish.yml`: build+push `app`/`worker` to GHCR on merge to main (git-SHA + `latest` tags).
- **Deploy recommendation:** CI does build+test+publish only. Deploying to the local Kind cluster is a documented manual step (`scripts/deploy-local.sh` wrapping `kind create cluster` + `helm upgrade --install --wait`) — Kind isn't reachable by GitHub-hosted runners, and spinning up a managed cluster just for a CI deploy target adds cost/complexity without materially improving the story over "build/test/publish automated, local deploy is one scripted command." Note managed-cluster deploy as optional future work only.

**Verify:** PR triggers `ci.yml` and passes; merge to main triggers `docker-publish.yml`, images appear in GHCR.

## Cross-cutting: resumability across sessions
Keep this plan as `docs/PLAN.md` plus `docs/PROGRESS.md` (phase checklist) in the repo so a new session can pick up exactly where the last one stopped. Commit at the end of each phase (e.g. `feat: scaffold repo layout (phase 1)`).

## Effort summary (rough, part-time pace)
| Phase | Size | Notes |
|---|---|---|
| 0 Prereqs | trivial | <30 min |
| 1 Scaffold+README | small | 1–2 hrs |
| 2 Compose dev loop | medium | ~1 day, mostly Ollama/networking friction |
| 3 Ingestion pipeline | large | 2–3 days, JSON-reliability handling is the hard part |
| 4 Query agent | large | 2–3 days, Cypher-gen reliability + prompt tuning |
| 5 FastAPI layer | medium | ~1 day |
| 6 Dockerfiles | small | few hours |
| 7 K8s/Helm | large | 2–3 days |
| 8 Observability | medium | 1–2 days |
| 9 CI/CD | small-medium | ~1 day |

Total: roughly 2–2.5 weeks focused part-time work. Heaviest lifts: ingestion pipeline, query agent, K8s/Helm.

## Hardware/prerequisite flags
- 16GB RAM is tight with Neo4j+Redis+Ollama(8B)+Docker Desktop+Kind all running — never run compose and Kind simultaneously.
- No GPU — CPU-only inference; keep demo videos short (1-3 min); `llama3.2:3b`/`qwen2.5:3b` documented as a values.yaml-swappable fallback if llama3.1:8b latency is too slow for live demos (default stays llama3.1:8b).
- `uv` and `kind` need installing; LangSmith needs a free account/API key before Phase 4.
- No cloud secrets needed for CI/CD (GHCR push uses built-in `GITHUB_TOKEN`).

### Critical files
- `pyproject.toml`/`uv.lock` — shared dependency contract for app/worker/agent
- `worker/pipeline.py` — Celery task chain (audio → transcript → extraction → embed → Neo4j write)
- `agent/graph.py` — LangGraph StateGraph (router → cypher/vector → synthesize)
- `graph/migrations/002_vector_index.cypher` — Neo4j vector index, core to semantic search
- `charts/talk-to-your-video/values.yaml` — single source of truth for K8s sizing/model config
- `README.md` — project pitch, architecture diagram, quickstart (local + k8s)

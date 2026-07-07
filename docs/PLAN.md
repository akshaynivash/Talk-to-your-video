# Talk to Your Video — Implementation Plan

## Context

This is a portfolio project: a natural-language video Q&A system. A user uploads a video, the system understands it — both what's **said** (transcript) and what's **shown** (visual frame analysis) — builds a unified knowledge graph of what's in it, and answers plain-English questions with timestamp-grounded citations (e.g. "at 12:34, the speaker explains X"). The visual understanding is the real differentiator: it's what makes this more than a transcript-Q&A tool, and it's why the system still works on videos with little or no narration.

**This document is a living plan, not a historical record — it's kept in sync with what actually shipped.** See `docs/PROGRESS.md` for the detailed phase-by-phase implementation notes, bugs caught, and environment gotchas; this file is the higher-level shape of the project.

Locked-in architecture: **LangGraph** (not Claude Agent SDK, which only targets Anthropic's hosted API) orchestrating a **local Ollama** stack — `llama3.1:8b` for text extraction/reasoning, `moondream` for vision, `nomic-embed-text` for embeddings — no external API costs; **faster-whisper** for transcription; **Neo4j** as the knowledge graph with its **native vector index** for semantic search (no separate vector DB); **Celery + Redis** to decouple heavy ingestion from the query path; **FastAPI** as the API layer; **React + Vite + Tailwind** for the frontend; **Kind + Helm + NGINX ingress** for Kubernetes deployment; **Prometheus/Grafana + LangSmith** for observability; **GitHub Actions** for CI/CD. Bar: portfolio-grade — coherent and demoable, not production-scale. Repo is public for portfolio visibility but all-rights-reserved (see `LICENSE`), not intended for reuse.

**Environment (dev machine):** Windows, Python 3.11.5, `uv` + `kind` installed via winget, Ollama upgraded to 0.31.1 (0.5.11 crashed on vision models — see PROGRESS.md), `ffmpeg` installed via winget, Node 18.20.2. No GPU (CPU-only inference) — keep demo videos short (1-3 min). Docker Desktop's WSL backend has been broken for most of this project's development (Neo4j/Redis unreachable) — ingestion and agent logic were built and verified against real Ollama/ffmpeg directly on the host, with live Neo4j verification deferred; this is called out per-phase below where it applies.

## Phase 0 — Prerequisites (~30 min)
- Install `uv` (`winget install astral-sh.uv`) and `kind` (`winget install kubernetes-sigs.kind`).
- Sign up for a free LangSmith account + API key (needed by Phase 4).
- **Verify:** `uv --version` and `kind --version` resolve.

## Phase 1 — Repo scaffold + README (done; restructured since)

Original flat scaffold (`app/`, `worker/`, `agent/`, `graph/`, `common/` all top-level) was later restructured into a **library + thin-adapters** split, so the reusable core is importable independent of FastAPI/Celery. Current layout:
```
talk-to-your-video/
  talk_to_your_video/     # installable library (pip install -e . gives you just this)
    config.py               # Settings + lazy get_settings() (lru-cached, no import-time side effects)
    models.py                # Segment, SegmentDetail, Citation, QueryResponse, VideoStatus
    ingestion/                # extract_audio, transcribe, segment, extract_frame, analyze_frame,
                              #   extract_entities, embed, graph_write, pipeline.py (run_pipeline)
    agent/                    # graph.py, state.py, llm.py, prompts.py, tools.py, nodes/{router,
                              #   cypher_tool,vector_search_tool,synthesize}.py
    graph/                    # client.py (driver), video_status.py, segments.py,
                              #   migrations/{001_init_constraints,002_vector_index}.cypher
  app/                     # FastAPI service — thin adapter, imports talk_to_your_video
    main.py, api/routes/{health,ingest,query,segments,events}.py, Dockerfile
  worker/                  # Celery worker — thin adapter
    celery_app.py, pipeline.py (wraps run_pipeline as a task), Dockerfile
  frontend/                # React + Vite + Tailwind SPA
  charts/talk-to-your-video/   # single umbrella Helm chart
  .github/workflows/{ci.yml,docker-publish.yml}
  scripts/, tests/{unit,integration}, docker-compose.yml
  pyproject.toml + uv.lock     # ONE root project; talk_to_your_video packaged via hatchling,
                              #   fastapi/celery deps live in optional api/worker extras
  Makefile, .env.example, LICENSE (all-rights-reserved)
  docs/PLAN.md, docs/PROGRESS.md, README.md
```

**Tooling:** `uv` over Poetry. Python 3.11, base image `python:3.11-slim`. `pyproject.toml` has packaging turned on (`[build-system]` + hatchling) — `uv sync --all-extras` installs `talk_to_your_video` as an editable package plus the FastAPI/Celery extras needed for local dev.

**Verify:** done — see `docs/PROGRESS.md` for the restructuring notes and the reasoning (library reusability was the driver).

## Phase 2 — Local dev loop via docker-compose (~1 day) — before any Kubernetes work

Services: `neo4j` (5.20-community, volume for `/data`), `redis` (7-alpine), `ollama` (official image, volume for model cache — with a documented `OLLAMA_BASE_URL` fallback to point at the host's already-installed Ollama instead, given the 16GB RAM constraint), `app`, `worker`.

Test video: not committed to git; `scripts/fetch_test_video.sh` pulls a small CC0 sample, or user drops `tests/fixtures/sample.mp4` (gitignored).

**Verify ("it works" bar for this milestone):**
1. `docker compose up -d`
2. `curl -F file=@sample.mp4 localhost:8000/videos` → `video_id`/`job_id`
3. Poll `curl localhost:8000/videos/{id}/status` until `complete`
4. `curl -X POST localhost:8000/query -d '{"video_id":"...","question":"..."}'` → answer + citations with real timestamps
5. Neo4j Browser (`localhost:7474`) shows `Video`/`Segment`/`Entity` nodes and `HAS_SEGMENT`/`MENTIONS` edges.

## Phase 3 — Ingestion pipeline (done; real logic, verified manually against real ffmpeg/faster-whisper/Ollama)

`talk_to_your_video/ingestion/pipeline.py::run_pipeline`, orchestrating (with an optional `on_stage(VideoStatus)` callback for progress reporting, added in Phase 5):
1. `get_video_duration` — **ffprobe on the video file directly** (not derived from the audio stream — a real bug was caught here, see PROGRESS.md).
2. `extract_audio` — ffmpeg → 16kHz mono wav; returns `None` (not a crash) if the video has no audio stream at all.
3. `transcribe` — faster-whisper `small` model, CPU. Returns `[]` if there's no audio.
4. `segment` — **fixed ~8s time windows** (`Settings.segment_window_seconds`) spanning the *whole video duration*, not just Whisper's speech chunks — this is what makes silent stretches still get a segment.
5. `extract_entities` — instructor + Ollama's OpenAI-compatible endpoint for validated structured JSON (`max_retries=3` handles malformed output automatically), called once on transcript text (if non-empty) **and** once on the frame's visual description, then merged (`merge_extractions`) into one combined entity/topic set per segment.
6. `extract_frame` + `analyze_frame` — ffmpeg grabs a representative frame per window; Ollama's `moondream` vision model describes it. This is what lets the graph understand videos with no speech.
7. `embed` — `nomic-embed-text` via Ollama, on the **combined transcript+visual text** (not transcript alone), so semantic search still works for visual-only segments.
8. `graph_write` — MERGE `Video`, CREATE `Segment` (start/end/text/visual_description/embedding) + `HAS_SEGMENT`, `FOREACH` (not a second `UNWIND` — avoids a cartesian-product bug) to MERGE dedup'd `Entity`/`Topic` + `MENTIONS`. Visual and transcript entities share the same node space, so "said" and "shown" are queryable together.

**Verify:** done for everything except a live Neo4j write (still blocked on Docker) — manually verified end-to-end against real ffmpeg/faster-whisper/moondream/llama3.1:8b, including the fully-silent-video case. 19 mocked unit tests in `tests/unit/ingestion/`.

## Phase 4 — Query agent / LangGraph (done)

`talk_to_your_video/agent/graph.py` as a **deterministic StateGraph with conditional edges** (not a free-form ReAct loop — llama3.1:8b's local tool-calling is too flaky for a reliable demo). Nodes: `router` (graph_lookup vs semantic vs hybrid, default hybrid on ambiguity) → for hybrid, **fans out to both** `cypher_tool` and `vector_search_tool` concurrently → `synthesize` (combine results, answer with timestamp citations from both spoken and visual context, post-validated against retrieved segments to avoid hallucination).

- `cypher_tool`: freeform LLM-generated Cypher (not fixed templates), guarded by a keyword blocklist + Neo4j's read-only transaction mode, retries up to 3x with the failure fed back into the prompt, degrades to empty results rather than failing the request.
- `vector_search_tool`: embeds the question, over-fetches (`k=20`) from the vector index then filters to the target video (Neo4j Community edition has no native pre-filtered vector search).

**Real bug caught by the test suite**: every node originally returned the *entire* state (`{**state, ...}`) instead of a partial update. Fine sequentially, but the hybrid fan-out runs two nodes concurrently, and LangGraph's default channels reject concurrent writes to the same key from two branches — every real hybrid query would have crashed. Fixed by having all four nodes return only the keys they actually change.

**LangSmith:** `LANGCHAIN_TRACING_V2=true`, `LANGCHAIN_API_KEY`, `LANGCHAIN_PROJECT=talk-to-your-video` (wired via env vars, no code changes needed).

**Verify:** 9 unit tests (`tests/unit/agent/`) covering all four nodes plus the compiled graph's routing (hybrid fan-out, graph_lookup skipping vector search). `router`/`synthesize` also manually verified live against real `llama3.1:8b`. `cypher_tool`/`vector_search_tool` still mock-only, pending live Neo4j.

## Phase 5 — FastAPI layer (done)
- `POST /videos` (multipart, optional `title`) → saves upload, creates a `Video` node (`graph/video_status.py::create_video`, status trackable from upload time — not just at the end of ingestion like the original design), enqueues `worker.pipeline.process_video`, returns `{video_id, job_id, status}`.
- `GET /videos/{id}/status` — reads `Video.status` via `get_video_status`, 404 if unknown.
- `GET /videos/{id}/segments` (**added beyond original plan** — needed by the frontend's timeline view, nothing returned per-segment entity/topic data before this) — `graph/segments.py::list_video_segments`.
- `GET /videos/{id}/events` (**added beyond original plan** — SSE progress) — polls `Video.status` (~1s via `asyncio.to_thread`), simple by design, not built to scale to many concurrent subscribers.
- `POST /query` — lazily caches one compiled LangGraph instance at the route-module level, runs it via `asyncio.to_thread` (not blocking the event loop, without needing a Celery round-trip since it only takes seconds).
- `GET /health`, `GET /ready` (real Neo4j `verify_connectivity`/Redis `ping`/Ollama `.list()` checks, 503 with a per-dependency breakdown on failure) for k8s probes later.
- `run_pipeline` gained an optional `on_stage(VideoStatus)` callback so ingestion progress reaches Neo4j; kept optional so the ingestion library has no hard dependency on Neo4j-status-writing — `worker/pipeline.py` supplies the real callback and sets `FAILED` on any exception.

**Verify:** `/docs` loads showing all 7 routes; 16 unit tests (`tests/unit/api/`, `tests/unit/graph/`) with `TestClient` + mocked Neo4j/Redis/Ollama/Celery. Full live curl flow still blocked on Docker/Neo4j.

## Phase 5.5 — Frontend (added beyond original plan — not in the initial 0-9 phase list)

React + Vite + Tailwind SPA (`frontend/`), black/silver always-dark theme. Components: upload (with optional title), SSE-driven progress stepper, segment timeline (entities/topics per segment, clickable timestamps), chatbot panel (calls `/query`, renders citations). Dev proxy: Vite proxies `/api/*` → `http://localhost:8000/*` (backend routes stay unprefixed, matching existing README curl examples). Production serving (nginx-container vs FastAPI `StaticFiles`) deferred to Phase 6/7.

**Verify:** component tests (Vitest + RTL, mocked fetch/EventSource). Full real upload→chat flow blocked on Docker/Neo4j, same as everything else.

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

## Phase 9 — CI/CD (done, out of order — landed right after Phase 1, before Phases 3-5)
- `ci.yml`: checkout → Python 3.11 + `uv` (astral-sh/setup-uv) → `uv sync --all-extras` → `ruff check`/`format --check` → `pytest` (fully mocked, no real Ollama/Neo4j/Redis in CI at all — every test in the suite mocks its external dependencies).
- `docker-publish.yml`: build+push `app`/`worker` to GHCR on merge to main (git-SHA + `latest` tags).
- **Deploy:** CI does build+test+publish only; local Kind deploy stays a manual step (documented, not yet scripted — `scripts/deploy-local.sh` from the original plan hasn't been written since Phase 7 hasn't started).

**Verify:** done — every PR since triggers `ci.yml`; merge to main triggers `docker-publish.yml`.

## Cross-cutting: resumability across sessions
Keep this plan as `docs/PLAN.md` plus `docs/PROGRESS.md` (phase checklist) in the repo so a new session can pick up exactly where the last one stopped. Commit at the end of each phase (e.g. `feat: scaffold repo layout (phase 1)`).

## Status summary
| Phase | Status | Notes |
|---|---|---|
| 0 Prereqs | done | |
| 1 Scaffold+README | done | restructured into library+adapters since |
| 2 Compose dev loop | written, unverified | blocked on Docker Desktop's WSL backend |
| 3 Ingestion pipeline | done | now includes visual analysis, verified manually for real |
| 4 Query agent | done | caught+fixed a real LangGraph hybrid fan-out bug |
| 5 FastAPI layer | done | + segments/events endpoints beyond original scope |
| 5.5 Frontend | in progress | added beyond original plan |
| 6 Dockerfiles | written, needs revisiting | frontend container not yet accounted for |
| 7 K8s/Helm | not started | |
| 8 Observability | not started | |
| 9 CI/CD | done | landed early, right after Phase 1 |

See `docs/PROGRESS.md` for the detailed checklist and per-phase implementation notes.

## Hardware/prerequisite flags
- 16GB RAM is tight with Neo4j+Redis+Ollama(8B+moondream)+Docker Desktop+Kind all running — never run compose and Kind simultaneously.
- No GPU — CPU-only inference; keep demo videos short (1-3 min).
- Ollama must be **≥0.31.1** — 0.5.11 crashes on `moondream` (see PROGRESS.md).
- LangSmith needs a free account/API key for agent tracing.
- No cloud secrets needed for CI/CD (GHCR push uses built-in `GITHUB_TOKEN`).

### Critical files
- `pyproject.toml`/`uv.lock` — shared dependency contract; `talk_to_your_video` packaged via hatchling
- `talk_to_your_video/ingestion/pipeline.py` — the full ingestion orchestration (transcript + visual)
- `talk_to_your_video/agent/graph.py` — LangGraph StateGraph (router → cypher/vector fan-out → synthesize)
- `talk_to_your_video/graph/migrations/002_vector_index.cypher` — Neo4j vector index, core to semantic search
- `frontend/vite.config.ts` — dev proxy, the seam between frontend and backend
- `charts/talk-to-your-video/values.yaml` — not yet created; single source of truth for K8s sizing/model config once Phase 7 starts
- `README.md` — project pitch, architecture diagram, quickstart (local + k8s)

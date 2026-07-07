# Progress Checklist

Tracks phase completion so a new session can resume without re-deriving context. See `docs/PLAN.md` for full phase details.

- [x] Phase 0 — Prerequisites (`uv`, `kind` installed)
- [x] Phase 1 — Repo scaffold + README
- [~] Phase 2 — docker-compose local dev loop (compose file written, not yet verified end-to-end — Docker Desktop had a WSL bootstrap crash during this session)
- [~] Phase 3 — Ingestion pipeline (real logic implemented + verified manually against real ffmpeg/faster-whisper/Ollama, now including visual frame analysis — see below; `graph_write` implemented but not yet verified against a live Neo4j — still blocked on Docker)
- [x] Phase 4 — Query agent / LangGraph (real router/cypher_tool/vector_search_tool/synthesize nodes; caught and fixed a real LangGraph hybrid-fan-out state bug during testing — see notes)
- [x] Phase 5 — FastAPI layer (real upload/status/segments/events(SSE)/query/ready endpoints, replacing stubs; not yet verified live end-to-end — still blocked on Docker/Neo4j)
- [x] Phase 5.5 — Frontend (React + Vite + Tailwind SPA — upload, SSE progress, segment timeline, chat — not in the original phase list, added when the user asked for a UI)
- [ ] Phase 6 — Containerization (Dockerfiles hardened/finalized; frontend container not yet accounted for)
- [ ] Phase 7 — Kubernetes / Helm
- [x] Phase 9 — CI/CD (GitHub Actions) — done out of order: `ci.yml` (lint+test on PRs to main) and `docker-publish.yml` (GHCR build+push on merge to main), merged via PR #1
- [ ] Phase 8 — Observability (Prometheus/Grafana/LangSmith)

## Notes for next session
- **Architecture change:** core logic (`agent/`, `graph/`, `common/`, ingestion tasks) was restructured out of flat top-level dirs into an installable `talk_to_your_video/` package, so it can be imported as a library independent of the FastAPI/Celery apps. `app/` and `worker/` are now thin adapters that import from it — see the README's Project Structure section for the current layout. Repo scaffold still uses stub implementations (`raise NotImplementedError`) for all real business logic — these get filled in during Phases 3-5, not before.
- `pyproject.toml` now has packaging turned on (`[build-system]` + hatchling, `packages = ["talk_to_your_video"]`) — `uv sync` installs it as an editable package. FastAPI/Celery deps live in optional `api`/`worker` extras; local dev needs `uv sync --all-extras` (already reflected in Makefile/CI/Dockerfiles).
- `talk_to_your_video.config.Settings` is accessed via a lazy `get_settings()` (lru-cached), not a module-level singleton — avoids import-time side effects for library consumers. `graph/client.py`'s lazy `get_driver()` singleton was the pattern this followed.
- No GPU available on the dev machine; Ollama/Whisper inference is CPU-only. Keep test videos short (1-3 min).
- `pytest` needs `[tool.pytest.ini_options] pythonpath = ["."]` in `pyproject.toml` — `tests/unit` and `tests/integration` intentionally have no `__init__.py`, so without this pytest can't resolve top-level modules like `app`.
- GitHub repo's default branch is now `main` (fixed — was `feature/ci-cd` due to push order before `main` had commits).
- Repo has an explicit all-rights-reserved `LICENSE` — public for portfolio visibility, not for reuse.
- Ongoing convention: land changes via a feature branch + PR into `main`, not direct pushes — `ci.yml` runs lint+test on every PR.
- **Phase 3 implementation notes:**
  - `extract_audio` shells out to `ffmpeg` (must be on PATH — not bundled, installed separately on this dev machine via winget `Gyan.FFmpeg`; the worker Docker image already installs it via apt).
  - `transcribe` uses faster-whisper's `small` model on CPU (`int8` compute type) — verified for real against a synthesized speech clip.
  - `extract_entities` uses `instructor` patched onto Ollama's OpenAI-compatible endpoint (`{OLLAMA_BASE_URL}/v1`) for validated structured JSON output, with `max_retries=3` handling malformed model output automatically — verified for real against a locally pulled `llama3.1:8b`.
  - `embed` calls Ollama's native embeddings API with `nomic-embed-text` — verified for real, returns 768-dim vectors (matches the Neo4j vector index config in `002_vector_index.cypher`).
  - `graph_write` uses `FOREACH` (not a second `UNWIND`) to merge Entity/Topic nodes per segment — avoids an easy-to-miss cartesian-product bug where a second `UNWIND` after the first would re-run once per entity.
  - All ingestion unit tests (`tests/unit/ingestion/`) mock ffmpeg/Whisper/Ollama/Neo4j — CI never needs real models or a live DB pull, keeping it fast.
  - Local dev machine now also has `ffmpeg` and Ollama models `llama3.1:8b` + `nomic-embed-text` pulled (in addition to pre-existing `mistral`/`phi`/`llama2`).
- **Visual ingestion (core differentiator, added after Phase 3 initially landed):** the project isn't just transcript Q&A — videos are also understood visually, so it still works on videos with little/no speech. Segmentation changed from Whisper's speech chunks to fixed ~8s time windows (`Settings.segment_window_seconds`) spanning the whole video; each window gets a representative frame (`ingestion/extract_frame.py`, ffmpeg) analyzed by Ollama's `moondream` vision model (`ingestion/analyze_frame.py`, `Settings.ollama_vision_model`). Entities/topics from transcript text and visual description both merge into the same `(:Entity)`/`(:Topic)` graph space (`merge_extractions` in `extract_entities.py`), and segment embeddings combine both texts so semantic search works even for silent segments. `Segment` gained `visual_description: str | None`.
  - **Real bug caught by live-testing**: originally planned to get video duration from faster-whisper's `TranscriptionInfo.duration` — but that's the *audio* stream's duration, not the video's. A video with no audio track (or a shorter audio track than the video) would silently under-cover or crash. Fixed by getting duration from `ffprobe` directly on the video file (`extract_audio.get_video_duration`), fully decoupled from whether there's audio at all; `extract_audio()` now returns `None` (not a crash) when there's no audio stream.
  - **Environment gotcha**: `moondream` crashes Ollama 0.5.11 with `GGML_ASSERT(i01 >= 0 && i01 < ne01) failed` in the CPU CLIP encoder (llama.cpp compatibility bug) — required `winget upgrade Ollama.Ollama` to 0.31.1. If vision analysis crashes Ollama, check the version first.
  - `docker-compose.yml`'s `ollama-init` now also pulls `moondream`.
- **Phase 4 (LangGraph agent) implementation notes:**
  - `agent/llm.py` gives `router`/`cypher_tool`/`synthesize` a shared lazy instructor-wrapped Ollama client (same pattern as `graph/client.py::get_driver()`).
  - `cypher_tool` generates freeform Cypher (not fixed templates) guarded by a keyword blocklist + Neo4j's read-only transaction mode, retrying up to 3 times with the failure fed back into the prompt; degrades to empty results rather than failing the whole query.
  - `vector_search_tool` over-fetches (`k=20`) from the vector index then filters/joins to the target video, since Neo4j Community edition has no native pre-filtered vector search.
  - `synthesize` post-validates citations against retrieved segments to avoid hallucinated timestamps.
  - **Real bug caught by the test suite**: every node originally returned `{**state, ...}` — the *entire* state — instead of a partial update. That's fine sequentially, but the hybrid route fans out to `cypher_tool` and `vector_search_tool` concurrently, and LangGraph's default channels reject concurrent writes to the same key from two branches (`InvalidUpdateError`), even when the value is identical. Every real hybrid query would have crashed. Fixed by having all four nodes return only the keys they change.
- **Phase 5 (FastAPI) implementation notes:**
  - `graph/video_status.py` (`create_video`/`set_video_status`/`get_video_status`) makes a `Video` node trackable from upload time, not just at the end of ingestion. `create_video` uses `ON CREATE SET` so re-uploads don't stomp an in-progress status.
  - `ingestion/pipeline.py::run_pipeline` takes an optional `on_stage` callback fired at each stage transition — kept optional so the library has no hard Neo4j dependency; `worker/pipeline.py` supplies the real callback and sets `FAILED` on any exception.
  - `GET /videos/{id}/events` is a simple polling SSE endpoint (~1s against Neo4j via `asyncio.to_thread`), not push-based pub/sub — fine at portfolio/demo scale, explicitly not built to scale to many concurrent subscribers.
  - `POST /query` lazily caches one compiled LangGraph instance at the route-module level (not inside `build_graph()`, so tests can still call that fresh) and runs `graph.invoke` via `asyncio.to_thread` so it doesn't block the event loop.
  - `GET /ready` does real reachability checks (Neo4j `verify_connectivity`, Redis `ping`, Ollama `.list()`), returning 503 with a per-dependency breakdown on failure.
  - Two test files were both named `test_segments.py` (one for `graph/segments.py`, one for the API route) — pytest can't collect same-basename modules without `__init__.py` in this project's test layout; the API one is `test_segments_route.py`.
- **Phase 5.5 (Frontend) implementation notes:**
  - **Node 18.20.2 on this machine can't run the latest tooling** — `create-vite@latest`, `vitest@4`, and `jsdom@29` all fail with `SyntaxError: The requested module 'node:util' does not provide an export named 'styleText'` (that export needs Node 20+). Pinned to `npm create vite@5`, `vitest@1`, `jsdom@24` instead — all confirmed working. If bumping any of these later, check the target Node version first.
  - Tailwind v3 (not v4) for the same Node-18 safety margin.
  - Black/silver theme: `tailwind.config.js` defines `base` (near-black surfaces, 950→600, avoiding pure `#000`), `silver` (text/border range), and one `accent` (blue `#60a5fa`) for interactive states — verified the custom palette actually compiled into the built CSS output (`bg-base-950` class name and `rgb(96,165,250)` both present), not just that the build didn't error.
  - Vite dev proxy (`vite.config.ts`) forwards `/api/*` → `http://localhost:8000/*`, stripping the prefix — keeps the backend's existing unprefixed routes unchanged.
  - 18 component/API-client tests (Vitest + RTL), mocking `fetch`/`EventSource` — no backend needed, same "mock the external dependency" convention as the Python suite.
  - Not yet done: production serving story (nginx-container vs FastAPI `StaticFiles`) — deferred to Phase 6/7. Full real upload→chat flow still blocked on Docker/Neo4j, same as everything else.

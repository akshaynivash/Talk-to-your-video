# Progress Checklist

Tracks phase completion so a new session can resume without re-deriving context. See `docs/PLAN.md` for full phase details.

- [x] Phase 0 — Prerequisites (`uv`, `kind` installed)
- [x] Phase 1 — Repo scaffold + README
- [ ] Phase 2 — docker-compose local dev loop
- [ ] Phase 3 — Ingestion pipeline (Celery + Whisper + extraction + Neo4j write)
- [ ] Phase 4 — Query agent / LangGraph
- [ ] Phase 5 — FastAPI layer (full implementation, replacing stubs)
- [ ] Phase 6 — Containerization (Dockerfiles hardened/finalized)
- [ ] Phase 7 — Kubernetes / Helm
- [ ] Phase 8 — Observability (Prometheus/Grafana/LangSmith)
- [ ] Phase 9 — CI/CD (GitHub Actions)

## Notes for next session
- Repo scaffold uses stub implementations (`raise NotImplementedError`) for all business logic in `app/`, `worker/`, `agent/`, `graph/` — these get filled in during their respective phases, not before.
- `pyproject.toml` uses `[tool.uv] package = false` — this is an application, not an installable package; run things with `uv run` from the repo root so `app`/`worker`/`agent`/`graph`/`common` resolve as plain top-level modules.
- No GPU available on the dev machine; Ollama/Whisper inference is CPU-only. Keep test videos short (1-3 min).

# Progress Checklist

Tracks phase completion so a new session can resume without re-deriving context. See `docs/PLAN.md` for full phase details.

- [x] Phase 0 — Prerequisites (`uv`, `kind` installed)
- [x] Phase 1 — Repo scaffold + README
- [~] Phase 2 — docker-compose local dev loop (compose file written, not yet verified end-to-end — Docker Desktop had a WSL bootstrap crash during this session)
- [ ] Phase 3 — Ingestion pipeline (Celery + Whisper + extraction + Neo4j write)
- [ ] Phase 4 — Query agent / LangGraph
- [ ] Phase 5 — FastAPI layer (full implementation, replacing stubs)
- [ ] Phase 6 — Containerization (Dockerfiles hardened/finalized)
- [ ] Phase 7 — Kubernetes / Helm
- [x] Phase 9 — CI/CD (GitHub Actions) — done out of order: `ci.yml` (lint+test on PRs to main) and `docker-publish.yml` (GHCR build+push on merge to main), merged via PR #1
- [ ] Phase 8 — Observability (Prometheus/Grafana/LangSmith)

## Notes for next session
- Repo scaffold uses stub implementations (`raise NotImplementedError`) for all business logic in `app/`, `worker/`, `agent/`, `graph/` — these get filled in during their respective phases, not before.
- `pyproject.toml` uses `[tool.uv] package = false` — this is an application, not an installable package; run things with `uv run` from the repo root so `app`/`worker`/`agent`/`graph`/`common` resolve as plain top-level modules.
- No GPU available on the dev machine; Ollama/Whisper inference is CPU-only. Keep test videos short (1-3 min).
- `pytest` needs `[tool.pytest.ini_options] pythonpath = ["."]` in `pyproject.toml` — `tests/unit` and `tests/integration` intentionally have no `__init__.py`, so without this pytest can't resolve top-level modules like `app`.
- GitHub repo's default branch was `feature/ci-cd` (an artifact of push order before `main` had commits) — needs switching to `main` in GitHub Settings → Branches.
- Ongoing convention: land changes via a feature branch + PR into `main`, not direct pushes — `ci.yml` runs lint+test on every PR.

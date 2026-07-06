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
- **Architecture change:** core logic (`agent/`, `graph/`, `common/`, ingestion tasks) was restructured out of flat top-level dirs into an installable `talk_to_your_video/` package, so it can be imported as a library independent of the FastAPI/Celery apps. `app/` and `worker/` are now thin adapters that import from it — see the README's Project Structure section for the current layout. Repo scaffold still uses stub implementations (`raise NotImplementedError`) for all real business logic — these get filled in during Phases 3-5, not before.
- `pyproject.toml` now has packaging turned on (`[build-system]` + hatchling, `packages = ["talk_to_your_video"]`) — `uv sync` installs it as an editable package. FastAPI/Celery deps live in optional `api`/`worker` extras; local dev needs `uv sync --all-extras` (already reflected in Makefile/CI/Dockerfiles).
- `talk_to_your_video.config.Settings` is accessed via a lazy `get_settings()` (lru-cached), not a module-level singleton — avoids import-time side effects for library consumers. `graph/client.py`'s lazy `get_driver()` singleton was the pattern this followed.
- No GPU available on the dev machine; Ollama/Whisper inference is CPU-only. Keep test videos short (1-3 min).
- `pytest` needs `[tool.pytest.ini_options] pythonpath = ["."]` in `pyproject.toml` — `tests/unit` and `tests/integration` intentionally have no `__init__.py`, so without this pytest can't resolve top-level modules like `app`.
- GitHub repo's default branch is now `main` (fixed — was `feature/ci-cd` due to push order before `main` had commits).
- Repo has an explicit all-rights-reserved `LICENSE` — public for portfolio visibility, not for reuse.
- Ongoing convention: land changes via a feature branch + PR into `main`, not direct pushes — `ci.yml` runs lint+test on every PR.

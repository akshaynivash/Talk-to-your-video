FROM python:3.11-slim AS builder

WORKDIR /srv
RUN pip install --no-cache-dir uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /srv
COPY --from=builder /srv/.venv /srv/.venv
ENV PATH="/srv/.venv/bin:$PATH"

COPY worker ./worker
COPY common ./common
COPY agent ./agent
COPY graph ./graph

CMD ["celery", "-A", "worker.celery_app", "worker", "--loglevel=info"]

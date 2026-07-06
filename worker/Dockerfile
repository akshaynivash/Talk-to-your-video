FROM python:3.11-slim AS builder

WORKDIR /srv
RUN pip install --no-cache-dir uv
COPY pyproject.toml uv.lock ./
COPY talk_to_your_video ./talk_to_your_video
RUN uv sync --frozen --no-dev --extra worker

FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /srv
COPY --from=builder /srv/.venv /srv/.venv
COPY --from=builder /srv/talk_to_your_video /srv/talk_to_your_video
ENV PATH="/srv/.venv/bin:$PATH"

COPY worker ./worker

CMD ["celery", "-A", "worker.celery_app", "worker", "--loglevel=info"]

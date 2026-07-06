FROM python:3.11-slim AS builder

WORKDIR /srv
RUN pip install --no-cache-dir uv
COPY pyproject.toml uv.lock ./
COPY talk_to_your_video ./talk_to_your_video
RUN uv sync --frozen --no-dev --extra api --extra worker

FROM python:3.11-slim

WORKDIR /srv
COPY --from=builder /srv/.venv /srv/.venv
COPY --from=builder /srv/talk_to_your_video /srv/talk_to_your_video
ENV PATH="/srv/.venv/bin:$PATH"

COPY app ./app
COPY worker ./worker

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

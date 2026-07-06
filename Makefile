.PHONY: sync lint test up down

sync:
	uv sync --all-extras

lint:
	uv run ruff check .
	uv run ruff format --check .

test:
	uv run pytest

up:
	docker compose up -d

down:
	docker compose down

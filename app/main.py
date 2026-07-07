from fastapi import FastAPI

from app.api.routes import events, health, ingest, query, segments

app = FastAPI(title="Talk to Your Video")

app.include_router(health.router)
app.include_router(ingest.router)
app.include_router(query.router)
app.include_router(segments.router)
app.include_router(events.router)

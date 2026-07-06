from fastapi import FastAPI

from app.api.routes import health, ingest, query

app = FastAPI(title="Talk to Your Video")

app.include_router(health.router)
app.include_router(ingest.router)
app.include_router(query.router)

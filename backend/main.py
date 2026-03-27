from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.db import create_db_and_tables
import app.models.music  # Required to register the table
from app.api.upload import router as upload_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="Music Transcriber MVP", lifespan=lifespan)

app.include_router(upload_router, prefix="/api/v1/music", tags=["Music"])

@app.get("/health")
def health_check():
    return {"status": "ok"}

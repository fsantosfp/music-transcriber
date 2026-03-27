from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.db import create_db_and_tables
import app.models.music  # Required to register the table

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="Music Transcriber MVP", lifespan=lifespan)

@app.get("/health")
def health_check():
    return {"status": "ok"}

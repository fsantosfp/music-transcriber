from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.db import create_db_and_tables
import app.models.music  # Required to register the table
from app.api.upload import router as upload_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="Music Transcriber MVP", lifespan=lifespan)

os.makedirs("/app/uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api/v1/music", tags=["Music"])

@app.get("/health")
def health_check():
    return {"status": "ok"}

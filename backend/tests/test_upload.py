import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

TEST_DB_PATH = "./test_music.sqlite3"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

from fastapi.testclient import TestClient
from main import app
from app.core.db import engine, create_db_and_tables
from app.api.upload import UPLOAD_DIR
from sqlmodel import SQLModel
import pytest

client = TestClient(app)

@pytest.fixture(autouse=True)
def cleanup():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    create_db_and_tables()
    yield
    for f in os.listdir(UPLOAD_DIR):
        if f.endswith(".mp3") or f.endswith(".txt") or f.endswith(".wav"):
            os.remove(os.path.join(UPLOAD_DIR, f))
    SQLModel.metadata.drop_all(engine)

def test_ct_01_upload_valid_file():
    file_content = b"fake mp3 content" * 1024
    files = {"file": ("test_song.mp3", file_content, "audio/mpeg")}
    response = client.post("/api/v1/music/upload", files=files)
    
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "PENDING"
    assert data["filename"] == "test_song.mp3"
    assert "id" in data
    
    relative_path = data["audio_path"]
    filename = os.path.basename(relative_path)
    physical_path = os.path.join(UPLOAD_DIR, filename)
    assert os.path.exists(physical_path)

def test_ct_02_invalid_file_type():
    file_content = b"fake text content"
    files = {"file": ("test_doc.txt", file_content, "text/plain")}
    response = client.post("/api/v1/music/upload", files=files)
    
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]

def test_ct_03_payload_too_large(monkeypatch):
    import app.api.upload
    monkeypatch.setattr(app.api.upload, "MAX_UPLOAD_SIZE_MB", 1)
    
    file_content = b"a" * int(1.5 * 1024 * 1024)
    files = {"file": ("large_song.mp3", file_content, "audio/mpeg")}
    response = client.post("/api/v1/music/upload", files=files)
    
    assert response.status_code == 413
    assert "Payload Too Large" in response.json()["detail"]

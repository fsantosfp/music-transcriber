import os
import sys
import uuid
import pytest
from unittest.mock import patch, MagicMock
from sqlmodel import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

TEST_DB_PATH = "./test_music_transcribe.sqlite3"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

from app.core.db import engine, create_db_and_tables
from app.models.music import Music, MusicStatus
from app.api.upload import UPLOAD_DIR
from app.tasks.transcription import process_transcription

@pytest.fixture(autouse=True)
def cleanup():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    create_db_and_tables()
    yield
    from sqlmodel import SQLModel
    SQLModel.metadata.drop_all(engine)

def test_ct_04_transcription_success():
    music_id = uuid.uuid4()
    with Session(engine) as session:
        music = Music(
            id=music_id,
            filename="test_audio.mp3",
            audio_path="uploads/test_audio.mp3",
            status=MusicStatus.PENDING
        )
        session.add(music)
        session.commit()
    
    with patch('app.tasks.transcription.WhisperService') as mock_service_class:
        mock_instance = MagicMock()
        mock_service_class.return_value = mock_instance
        # Simulate successful translation
        mock_instance.transcribe_audio.return_value = {
            "segments": [
                {"start": 0.0, "end": 2.5, "text": "Hello world"},
                {"start": 2.5, "end": 5.0, "text": "This is a test transcription"}
            ],
            "language": "en",
            "probability": 0.95
        }
        
        process_transcription(str(music_id))
        
        with Session(engine) as session:
            updated_music = session.get(Music, music_id)
            assert updated_music is not None
            assert updated_music.status == MusicStatus.COMPLETED
            assert updated_music.raw_transcription is not None
            assert "Hello world" in updated_music.raw_transcription

def test_ct_05_transcription_fallback_vocal_isolation():
    music_id = uuid.uuid4()
    with Session(engine) as session:
        music = Music(
            id=music_id,
            filename="noise.mp3",
            audio_path="uploads/noise.mp3",
            status=MusicStatus.PENDING
        )
        session.add(music)
        session.commit()
    
    with patch('app.tasks.transcription.WhisperService') as mock_service_class:
        mock_instance = MagicMock()
        mock_service_class.return_value = mock_instance
        # Simulate low confidence
        mock_instance.transcribe_audio.return_value = {
            "segments": [
                {"start": 0.0, "end": 2.5, "text": "hmmm..."}
            ],
            "language": "en",
            "probability": 0.20
        }
        
        process_transcription(str(music_id))
        
        with Session(engine) as session:
            updated_music = session.get(Music, music_id)
            assert updated_music.status == MusicStatus.ISOLATING_VOCALS
            assert updated_music.raw_transcription is None

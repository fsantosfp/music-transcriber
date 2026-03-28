from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid
from enum import Enum

class MusicStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING_WHISPER = "PROCESSING_WHISPER"
    ISOLATING_VOCALS = "ISOLATING_VOCALS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class TranscriptionSegment(SQLModel):
    start: float
    end: float
    text: str

class WhisperResult(SQLModel):
    segments: list[TranscriptionSegment]
    language: str
    probability: float

class Music(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    filename: str
    status: MusicStatus = Field(default=MusicStatus.PENDING)
    audio_path: str
    raw_transcription: Optional[str] = None
    formatted_transcription: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

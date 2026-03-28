import logging
from sqlmodel import Session
import os
import uuid
from app.core.db import engine
from app.models.music import Music, MusicStatus, WhisperResult
from app.services.whisper_service import WhisperService

logger = logging.getLogger(__name__)

def process_transcription(music_id: str):
    logger.info(f"Starting background task for music {music_id}")
    with Session(engine) as session:
        music_uuid = uuid.UUID(music_id) if isinstance(music_id, str) else music_id
        music = session.get(Music, music_uuid)
        if not music:
            logger.error(f"Music with ID {music_id} not found.")
            return

        music.status = MusicStatus.PROCESSING_WHISPER
        session.add(music)
        session.commit()

        try:
            whisper_service = WhisperService()
            # If path is relative to app root, it works natively inside docker /app path.
            # Convert to absolute path to be universally safe
            audio_path = os.path.join(os.getcwd(), music.audio_path)
            
            result_dict = whisper_service.transcribe_audio(audio_path)
            whisper_result = WhisperResult(**result_dict)
            
            if not whisper_result.segments or whisper_result.probability < 0.35:
                music.status = MusicStatus.ISOLATING_VOCALS
                logger.info(f"Low confidence ({whisper_result.probability}). Diverting {music_id} to ISOLATING_VOCALS.")
            else:
                music.raw_transcription = whisper_result.model_dump_json() # Validate and Serialize
                music.status = MusicStatus.COMPLETED
                logger.info(f"Transcription successful for {music_id} with probability {whisper_result.probability}.")

            session.add(music)
            session.commit()
            
        except Exception as e:
            logger.error(f"Transcription failed for {music_id}: {e}")
            music.status = MusicStatus.FAILED
            session.add(music)
            session.commit()

import os
import threading
from faster_whisper import WhisperModel
import logging

logger = logging.getLogger(__name__)

class WhisperService:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(WhisperService, cls).__new__(cls)
                logger.info("Initializing faster-whisper model (small) on CPU...")
                # To save memory locally and maximize compatibility on MVP, we use CPU and int8
                cls._instance.model = WhisperModel("small", device="cpu", compute_type="int8")
                logger.info("Model loaded successfully.")
            return cls._instance

    def transcribe_audio(self, audio_path: str) -> dict:
        """
        Transcribes the given audio and returns a dictionary matching the WhisperResult schema.
        """
        logger.info(f"Starting transcription for {audio_path}")
        segments_generator, info = self.model.transcribe(audio_path, beam_size=5)
        
        parsed_segments = []
        # iterating through generator executes the transcription
        for segment in segments_generator:
            parsed_segments.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text
            })
            
        logger.info(f"Completed transcription for {audio_path}. Found {len(parsed_segments)} segments.")
        
        return {
            "segments": parsed_segments,
            "language": info.language,
            "probability": info.language_probability
        }

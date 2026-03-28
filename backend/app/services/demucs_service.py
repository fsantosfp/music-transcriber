import os
import logging
import subprocess

logger = logging.getLogger(__name__)

class DemucsService:
    def separate_vocals(self, audio_path: str) -> str:
        """
        Takes an absolute path of an audio file, runs Demucs subprocess to separate stems,
        and returns the absolute path directly to the `vocals.wav` file.
        """
        logger.info(f"Starting Demucs separation for {audio_path}")
        output_dir = "/app/uploads/processed"
        os.makedirs(output_dir, exist_ok=True)
        
        # Demucs CLI definition
        cmd = [
            "python", "-m", "demucs.separate",
            "-n", "htdemucs",
            "-d", "cpu",
            "-o", output_dir,
            audio_path
        ]
        
        try:
            logger.info("Executing Demucs... This might take a few moments.")
            subprocess.run(cmd, check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            logger.error(f"Demucs subprocess failed: {e.stderr}")
            raise e
            
        filename = os.path.basename(audio_path)
        name_without_ext = os.path.splitext(filename)[0]
        vocals_path = os.path.join(output_dir, "htdemucs", name_without_ext, "vocals.wav")
        
        if not os.path.exists(vocals_path):
            raise FileNotFoundError(f"Vocals file not found at expected generated path {vocals_path}")
            
        logger.info(f"Vocals isolated successfully at {vocals_path}")
        return vocals_path

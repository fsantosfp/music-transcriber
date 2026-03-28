import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./music.sqlite3")
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

import os
import uuid
import re
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from sqlmodel import Session
from app.core.db import engine
from app.models.music import Music, MusicStatus
from app.core.config import MAX_UPLOAD_SIZE_MB
import aiofiles
from app.tasks.transcription import process_transcription

router = APIRouter()

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg"}
UPLOAD_DIR = "/app/uploads"
if not os.path.exists(UPLOAD_DIR):
    UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
    os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_session():
    with Session(engine) as session:
        yield session

@router.post("/upload", status_code=201, response_model=Music)
async def upload_music_file(background_tasks: BackgroundTasks, file: UploadFile = File(...), session: Session = Depends(get_session)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file format. Allowed: {ALLOWED_EXTENSIONS}")

    safe_filename = re.sub(r'[^a-zA-Z0-9_\-.]', '_', file.filename.lower())
    transaction_id = uuid.uuid4()
    new_filename = f"{transaction_id}-{safe_filename}"
    file_path_disk = os.path.join(UPLOAD_DIR, new_filename)
    relative_path = f"uploads/{new_filename}"

    max_size_bytes = MAX_UPLOAD_SIZE_MB * 1024 * 1024
    current_size = 0
    
    try:
        async with aiofiles.open(file_path_disk, 'wb') as out_file:
            while content := await file.read(1024 * 1024):
                current_size += len(content)
                if current_size > max_size_bytes:
                    os.remove(file_path_disk)
                    raise HTTPException(status_code=413, detail="Payload Too Large")
                await out_file.write(content)
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(file_path_disk):
            os.remove(file_path_disk)
        raise HTTPException(status_code=500, detail="Failed to save file to disk")

    music_record = Music(
        id=transaction_id,
        filename=safe_filename,
        audio_path=relative_path,
        status=MusicStatus.PENDING
    )
    
    try:
        session.add(music_record)
        session.commit()
        session.refresh(music_record)
        
        # Dispara processo de transcrição em 2o plano
        background_tasks.add_task(process_transcription, str(music_record.id))
        
    except Exception as e:
        if os.path.exists(file_path_disk):
            os.remove(file_path_disk)
        session.rollback()
        raise HTTPException(status_code=500, detail="Failed to persist record in database")

    return music_record

@router.get("/{music_id}", response_model=Music)
def get_music_status(music_id: uuid.UUID, session: Session = Depends(get_session)):
    """
    Retrieve the current status and transcriptions of a specific music upload.
    """
    music = session.get(Music, music_id)
    if not music:
        raise HTTPException(status_code=404, detail="Music not found")
    return music

@router.get("/", response_model=list[Music])
def list_all_music(session: Session = Depends(get_session)):
    """
    List all uploaded music tracks, ordered by newest first.
    """
    from sqlmodel import select
    statement = select(Music).order_by(Music.created_at.desc())
    return session.exec(statement).all()

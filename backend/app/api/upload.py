import os
import io
import uuid
import re
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlmodel import Session
from app.core.db import engine
from app.models.music import Music, MusicStatus, MusicUpdate

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

@router.patch("/{music_id}", response_model=Music)
def update_music(music_id: uuid.UUID, music_update: MusicUpdate, session: Session = Depends(get_session)):
    """
    Apply targeted overwrites to properties of an already instantiated upload.
    Mainly utilized for front-end generic saves on JSON Segment Arrays.
    """
    db_music = session.get(Music, music_id)
    if not db_music:
        raise HTTPException(status_code=404, detail="Music not found")
        
    update_data = music_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_music, key, value)
        
    # Se o raw_transcription foi atualizado pelo editor, refazemos a formatacao LLM com os dados novos.
    if "raw_transcription" in update_data and update_data["raw_transcription"] is not None:
        from app.services.llm_service import LLMService
        llm_service = LLMService()
        try:
            formatted_text = llm_service.format_transcription(update_data["raw_transcription"])
            db_music.formatted_transcription = formatted_text
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to rebuild formatted transcription from AI: {str(e)}")
        
    session.add(db_music)
    session.commit()
    session.refresh(db_music)
    return db_music

@router.get("/{music_id}/export")
def export_music_lyrics(music_id: uuid.UUID, format: str = "txt", session: Session = Depends(get_session)):
    """
    Generate physical files representing the final transcription.
    """
    music = session.get(Music, music_id)
    if not music:
        raise HTTPException(status_code=404, detail="Music not found")
        
    text = music.formatted_transcription or music.raw_transcription or "Letra não disponível"
    
    if format == "txt":
        buffer = io.BytesIO()
        buffer.write(text.encode("utf-8"))
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="text/plain", headers={"Content-Disposition": f"attachment; filename={music.filename}.txt"})
        
    elif format == "docx":
        try:
            from docx import Document
        except ImportError:
            raise HTTPException(status_code=500, detail="python-docx is not installed")
            
        doc = Document()
        doc.add_heading(f"Letra: {music.filename}", 0)
        doc.add_paragraph(text)
        
        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": f"attachment; filename={music.filename}.docx"})
        
    elif format == "pdf":
        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
            from reportlab.lib.utils import simpleSplit
        except ImportError:
            raise HTTPException(status_code=500, detail="reportlab is not installed")
            
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(72, 750, f"Letra: {music.filename}")
        
        c.setFont("Helvetica", 12)
        y = 720
        for line in text.split('\n'):
            line = line.strip('\r')
            if not line.strip():
                y -= 15
                if y < 72:
                    c.showPage()
                    c.setFont("Helvetica", 12)
                    y = 750
                continue
                
            wrapped_lines = simpleSplit(line, "Helvetica", 12, 450)
            for wrapped in wrapped_lines:
                if y < 72:
                    c.showPage()
                    c.setFont("Helvetica", 12)
                    y = 750
                c.drawString(72, y, wrapped)
                y -= 15
        
        c.save()
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={music.filename}.pdf"})
        
    raise HTTPException(status_code=400, detail="Invalid format requested. Valid formats: txt, docx, pdf.")

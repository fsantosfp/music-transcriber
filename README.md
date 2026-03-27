# Music Transcriber MVP

## Instructions
1. Certifique-se de que o Docker e Docker-Compose estão instalados.
2. Suba a orquestração via comando: `docker-compose up --build -d`
3. Acesse a **Interface do Aplicativo (Frontend)** em: `http://localhost:5173`
4. A API (Backend) responderá na porta 8000: `http://localhost:8000` (Ex: `/health`)

## API Endpoints

### 1. Upload de Áudio
Rota para ingestão de arquivos de áudio suportados (`.mp3`, `.wav`, `.m4a`, `.ogg`) limitado a `50MB` (configurável via variável de ambiente `MAX_UPLOAD_SIZE_MB`).

**POST** `/api/v1/music/upload`

- **Tipo do Body**: `multipart/form-data`
- **Campo Obrigatório**: `file`

#### Exemplo prático de requisição (cURL)
```bash
curl -X POST -F "file=@caminho/do/seu/audio.mp3;type=audio/mpeg" http://localhost:8000/api/v1/music/upload
```

#### Retorno Esperado (Status 201 Created)
O áudio recebido terá o nome original sanitizado e mesclado a um UUID único evitando falsos positivos ao gravar no banco de dados e persistir o arquivo em disco na pasta `/uploads`.
```json
{
  "id": "3cb2b0b6-f8bc-4dce-adcd-6e412dfa00e9",
  "filename": "meu_audio_sanitizado.mp3",
  "status": "PENDING",
  "audio_path": "uploads/3cb2b0b6-...-meu_audio.mp3",
  "raw_transcription": null,
  "formatted_transcription": null,
  "created_at": "2026-03-27T21:06:29.691330"
}
```

#### Processamento em Segundo Plano (Background Task)
Imediatamente após o upload (resposta `201 Created`), a API inicia a transcrição do áudio utilizando a IA `faster-whisper` assincronamente.
Durante o processamento, o `status` do registro evolui para `PROCESSING_WHISPER`.
- Quando finalizado com sucesso (confiança > 35%), o JSON com o texto e os *timestamps* é salvo em `raw_transcription` e o status passa para `COMPLETED`. 
- Caso a probabilidade detectada seja baixa (abaixo de 35%, indicando possível ruído ou apenas instrumental), o status será modificado para o fallback `ISOLATING_VOCALS`.

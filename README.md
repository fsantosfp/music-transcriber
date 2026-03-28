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

#### Processamento de IA (Background Tasks)
Imediatamente após o upload (resposta `201 Created`), a API lança um pipeline em duas fases assíncronas sequenciais:
1. **Transcrição Base (`PROCESSING_WHISPER`)**: Extração temporal via IA local em Python *faster-whisper*. O resultado bruto é mapeado no atributo temporal `raw_transcription`. (Fallback alternativo é acionado somente sob confidence de áudio inferior a 35%).
2. **Formatação Semântica (`PROCESSING_FORMATTING`)**: A transcrição integral avança instantaneamente para o Gemini 2.5 Flash, alimentada por um extenso System Prompt encarregado de injetar estéticas musicais rigorosas (refrões, capitalizações, junção dos versos, reticências de fade out, etc). Este produto é consolidado em alto nível dentro de `formatted_transcription`.

Somente após esta última devolutiva, o status atinge definitivamente o ponto de `COMPLETED`.

### 2. Status e Polling
Como as APIs de orquestração de Inteligência Artificial rodam em fila nos processos assíncronos (`BackgroundTasks`), a tela do Front-end deve consultar periodicamente o andamento da requisição disparada pelo ID devolvido.

**GET** `/api/v1/music/{music_id}`

#### Retorno Esperado
Caso a transcrição, isolamento ou formatação estejam rolando, os atributos `raw_transcription` e `formatted_transcription` virão vazios. Assim que o processamento terminar, as letras textuais estarão embutidas e o `status` atingirá `COMPLETED`. Retorna **404** se UUID não existir.
```json
{
  "id": "3cb2b0b6-f8bc-4dce-adcd-6e412dfa00e9",
  "filename": "meu_audio_sanitizado.mp3",
  "status": "COMPLETED",
  "audio_path": "uploads/3cb2b0b6-...-meu_audio.mp3",
  "vocal_isolation_attempted": false,
  "raw_transcription": "{\"segments\":[{\"start\": 0.0, ...]",
  "formatted_transcription": "Is this the real life? Is this just fantasy?\nCaught in a landslide...",
  "created_at": "2026-03-27T21:06:29.691330"
}
```

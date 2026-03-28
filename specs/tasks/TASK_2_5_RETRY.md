Spec: Tarefa 2.5 - Lógica de Retry (Backend)
Objetivo: Permitir reprocessar um áudio sem novo upload.

Endpoint: POST /api/v1/music/{id}/retry.

Lógica: 1. Resetar os campos raw_transcription e formatted_transcription para null.
2. Resetar o retry_count (da tarefa 2.3) para 0.
3. Mudar o status para PENDING.
4. O Worker de IA (Tarefa 2.1) deve detectar a mudança e reiniciar o fluxo automaticamente.

Do/Don't: - [ ] DO: Reutilizar o arquivo físico já presente em /uploads.

[ ] DON'T: Criar um novo registro no banco.
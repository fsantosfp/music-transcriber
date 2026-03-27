# Project Progress Dashboard

## Milestone 1: O Alicerce (Infra & Ingestão)
- [x] Tarefa 1.1: Setup Docker, Git e Estrutura de Pastas.
- [ ] Tarefa 1.2: Endpoint de Upload e Persistência no SQLite.
- [ ] Tarefa 1.3: Frontend Base (Vite + Dropzone) e Conexão com API.
> **GATE DE QUALIDADE:** Validar se o áudio aparece na pasta /uploads e no banco.

## Milestone 2: O Cérebro (Pipeline de IA)
- [ ] Tarefa 2.1: Integração Faster-Whisper (Transcrição Bruta).
- [ ] Tarefa 2.2: Formatação via LLM (System Prompt).
- [ ] Tarefa 2.3: Fallback com Demucs (Isolamento de Vocal).
- [ ] Tarefa 2.4: Endpoint de Status (Polling).
> **GATE DE QUALIDADE:** Processar áudio de teste e verificar JSON (segments + letra).

## Milestone 3: A Experiência (UI & Edição)
- [ ] Tarefa 3.1: Dashboard de Acompanhamento (Polling no Front).
- [ ] Tarefa 3.2: Player Wavesurfer.js e Visualização.
- [ ] Tarefa 3.3: Editor de Trechos com "Play Local" (Sincronia).
> **GATE DE QUALIDADE:** Clicar no texto e ouvir o trecho exato no áudio.

## Milestone 4: Entrega Final
- [ ] Tarefa 4.1: Exportação (TXT, PDF, DOCX).
> **GATE DE QUALIDADE:** Gerar PDF e validar formatação da letra.
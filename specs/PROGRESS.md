# Project Progress Dashboard

## Milestone 1: O Alicerce (Infra & Ingestão)
- [x] Tarefa 1.1: Setup Docker, Git e Estrutura de Pastas.
- [x] Tarefa 1.2: Endpoint de Upload e Persistência no SQLite.
- [x] Tarefa 1.3: Frontend Base (Vite + Dropzone) e Conexão com API.
> **GATE DE QUALIDADE:** Validar se o áudio aparece na pasta /uploads e no banco.

## Milestone 2: O Cérebro (Pipeline de IA)
- [x] Tarefa 2.1: Integração com Faster-Whisper para transcrição bruta.
- [x] Tarefa 2.2: Formatação via LLM (System Prompt).
- [x] Tarefa 2.3: Fallback com Demucs (Isolamento de Vocal).
- [x] Tarefa 2.4: Endpoint de Status (Polling).
- [x] Tarefa 2.5: Lógica de Retry (Backend)
> **GATE DE QUALIDADE:** Processar áudio de teste e verificar JSON (segments + letra).

## Milestone 3: A Experiência (UI & Edição)
- [x] Tarefa 3.1: Dashboard Principal (Listagem e Upload).
- [x] Tarefa 3.2: Sincronização e Player de Áudio.Wavesurfer.js e Visualização.
- [x] Tarefa 3.3: Editor de Trechos com "Play Local" (Sincronia).
- [ ] Tarefa 3.4: Fluxo de Deleção Segura (Padrão AWS)
- [ ] Tarefa 3.5: Paginação e Busca Global
- [ ] Tarefa 3.6: Modo Karaoke (Visualização)
> **GATE DE QUALIDADE:** Clicar no texto e ouvir o trecho exato no áudio.

## Milestone 4: Entrega Final
- [x] Tarefa 4.1: Exportação Final (Letras Formatas) - Download .txt, .docx, .pdf
> **GATE DE QUALIDADE:** Validar se os arquivos binários gerados estão limpos, legíveis e formatados pela IA.

## Milestone 5: Polimento (UX & Robustez)
- [ ] Tarefa 5.1: Ajuste nos Status (Frontend)
> **GATE DE QUALIDADE:** O sistema deve parecer "polido" e profissional, sem textos técnicos desnecessários.

## Milestone 6: Otimização (Performance & Limpeza)
- [ ] Tarefa 6.1: Remover Informações Extras do Upload
> **GATE DE QUALIDADE:** O sistema deve ser rápido e leve, sem "engasgos" ou requisições desnecessárias.

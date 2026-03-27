1. Estratégia de Testes
O projeto deve adotar uma abordagem de Test-Driven Development (TDD) sempre que possível. O objetivo é garantir que novas funcionalidades não quebrem o pipeline de IA e a persistência de dados.

🐍 Backend (Python / Pytest)
Testes Unitários: Focar em lógica pura (ex: formatação de strings, cálculos de timestamp, tratamento de exceções de arquivos).

Testes de Integração: Utilizar o TestClient do FastAPI para validar o ciclo de vida das rotas (Upload -> DB -> Status).

Política de Mocks: * Obrigatório: Mockar chamadas de API externas (OpenAI/Anthropic) e bibliotecas pesadas (Faster-Whisper, Demucs) durante os testes de integração para garantir velocidade.

Banco de Dados: Usar uma instância separada do SQLite (em memória :memory:) para os testes, garantindo que o banco de produção/dev não seja afetado.

⚛️ Frontend (Vitest / React Testing Library)
Componentes: Validar estados de UI (ex: o botão de upload deve estar desativado enquanto o arquivo é enviado).

Integração: Mockar chamadas de API (msw ou similar) para testar o comportamento do Dashboard e do Polling.

2. Casos de Teste Obrigatórios (Definition of Done)
Milestone 1: Ingestão
CT-01 (Upload Válido): Enviar .mp3 de 5MB -> Status 201, registro no DB, arquivo presente em /uploads.

CT-02 (Tipo Inválido): Enviar .exe ou .txt -> Status 400 Bad Request com mensagem de erro clara.

CT-03 (Limite de Tamanho): Enviar arquivo > 50MB -> Status 413 Payload Too Large.

Milestone 2: Pipeline de IA
CT-04 (Fallback Demucs): Mockar Whisper retornando lista vazia -> Validar se o status do registro no banco mudou automaticamente para ISOLATING_VOCALS.

CT-05 (Sincronia JSON): Validar se o JSON salvo no campo raw_transcription segue estritamente a estrutura [{start, end, text}].

Milestone 3: UI & UX
CT-06 (Polling): Validar se o frontend faz exatamente 1 requisição a cada 3 segundos enquanto o status for PROCESSING.

CT-07 (Seek do Player): Validar se ao clicar no timestamp 00:15 da letra, a função wavesurfer.seekTo é chamada com o valor correto.

3. Comandos de Execução (Referência para o Agente)
O agente deve ser capaz de rodar os testes com:

pytest backend/ (Backend)

npm test (Frontend)
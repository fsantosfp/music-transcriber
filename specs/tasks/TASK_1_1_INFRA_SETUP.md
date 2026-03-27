# Spec: Tarefa 1.1 - Infraestrutura Base e Setup de Projeto

## 1. Objetivo
Configurar o ambiente de desenvolvimento inicial, garantindo o versionamento, a conteinerização e a estrutura de pastas seguindo uma arquitetura limpa simplificada para o MVP de transcrição de música.

## 2. Stack Tecnológica
Linguagem: Python 3.10-slim (Base para compatibilidade com PyTorch/IA).

Framework Web: FastAPI.

ORM/Database: SQLModel (SQLite local).

Containerização: Docker & Docker-Compose.

Versionamento: Git.

## 3. Estrutura de Arquivos Requerida
/music-transcriber-mvp
├── .gitignore
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   ├── requirements.txt
│   ├── alembic.ini       # Para futuras migrações
│   └── app/
│       ├── core/         # Configurações de DB e Apps
│       ├── models/       # Definições de tabelas (SQLModel)
│       ├── api/          # Rotas/Endpoints
│       └── services/     # Stubs para Whisper e LLM
└── uploads/              # Volume para persistência de áudio

## 4. Requisitos de Configuração
4.1. Git
Inicializar repositório: git init.

Criar .gitignore ignorando: __pycache__, .env, .venv, *.sqlite3, uploads/ e arquivos de log.

4.2. Docker & Docker-Compose
Dockerfile: Deve usar python:3.10-slim. Obrigatório: Instalar ffmpeg via apt-get (essencial para manipulação de áudio).

Docker-Compose: - Serviço backend mapeando a porta 8000:8000.

Volume para o banco de dados sqlite.

Volume para a pasta /uploads para persistência de arquivos entre restarts.

4.3. Modelo de Dados Inicial (SQLModel)
Criar a tabela Music com os seguintes campos:

id: UUID (Primary Key).

filename: String.

status: Enum (PENDING, PROCESSING_WHISPER, ISOLATING_VOCALS, COMPLETED, FAILED).

audio_path: String (Caminho local do arquivo).

raw_transcription: Text (Opcional).

formatted_transcription: Text (Opcional).

created_at: DateTime (Default now).

## 5. Critérios de Aceite (Do / Don't)
✅ O que FAZER (Do)
[ ] O comando docker-compose up --build deve resultar em uma API rodando na porta 8000.

[ ] O endpoint GET /health deve retornar {"status": "ok"}.

[ ] O banco de dados SQLite deve ser criado automaticamente na primeira execução.

[ ] Incluir um arquivo README.md básico com instruções de como subir o ambiente.

❌ O que NÃO FAZER (Don't)
[ ] Não implementar a lógica de IA (Whisper/Demucs) nesta tarefa.

[ ] Não utilizar bancos de dados externos (Postgres/Redis).

[ ] Não commitar segredos ou arquivos de áudio de teste no Git.

## 6. Notas de Implementação
O agente deve garantir que as permissões de escrita na pasta uploads/ dentro do container estejam corretas para evitar erros de I/O ao salvar os arquivos de áudio que virão na tarefa 1.2.
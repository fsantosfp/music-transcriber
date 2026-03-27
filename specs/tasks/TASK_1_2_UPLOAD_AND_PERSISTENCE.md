# Spec: Tarefa 1.2 - Endpoint de Upload e Persistência de Registro
## 1. Objetivo
Implementar a funcionalidade de recebimento de arquivos de áudio via API, salvamento físico no servidor e criação do registro inicial no banco de dados com o status PENDING.

## 2. Fluxo de Execução
O cliente envia um arquivo de áudio via multipart/form-data.

O sistema valida o tipo de arquivo e tamanho.

O sistema gera um UUID único para a transação.

O arquivo é renomeado (usando o UUID para evitar conflitos) e salvo na pasta /uploads.

Um registro é criado na tabela Music com as informações do arquivo e status inicial.

A API retorna o objeto criado (incluindo o ID) para que o Front-end possa iniciar o monitoramento.

## 3. Detalhes Técnicos
3.1. Endpoint Principal
Rota: POST /api/v1/music/upload

Request: file: UploadFile

Response: 201 Created com o JSON do modelo Music.

3.2. Regras de Validação (Business Rules)
Formatos Aceitos: .mp3, .wav, .m4a, .ogg.

Tamanho Máximo: 50MB (configurável via .env).

Sanitização: O nome original do arquivo deve ser limpo de caracteres especiais, mas o caminho físico no disco deve usar o UUID para garantir unicidade.

3.3. Lógica de Persistência
Path do Áudio: Salvar no banco o caminho relativo (ex: uploads/uuid-original-name.mp3).

Status Inicial: Sempre PENDING.

## 4. Estrutura de Pastas (Atualização)
O agente deve garantir que a lógica de salvamento aponte para a pasta correta:

Plaintext
/backend
└── uploads/          # Destino final dos arquivos físicos
## 5. Critérios de Aceite (Do / Don't)
✅ O que FAZER (Do)
[ ] Implementar tratamento de erro para falhas de escrita em disco (ex: disco cheio ou permissão negada).

[ ] Retornar erro 400 Bad Request se o arquivo não for um áudio suportado.

[ ] Utilizar shutil ou aiofiles para a escrita do arquivo de forma eficiente.

[ ] Garantir que o registro no banco de dados seja commitado apenas após o sucesso do salvamento do arquivo no disco (atômico).

❌ O que NÃO FAZER (Don't)
[ ] Não iniciar o processo de transcrição (Whisper) nesta tarefa.

[ ] Não salvar o arquivo com o nome original puro (pode causar conflitos de nomes iguais ou ataques de Path Traversal).

[ ] Não carregar o arquivo inteiro em memória RAM (usar streams para arquivos grandes).

## 6. Tratamento de Exceções
Arquivo duplicado: Se o UUID for usado no nome, o risco é zero, mas o sistema deve estar pronto para sobrescrever ou renomear se houver colisão de hash (opcional).

Upload interrompido: Se o upload falhar no meio, o registro no banco não deve ser criado.
# Spec: Tarefa 3.1 - Dashboard de Acompanhamento (Polling UI)

## 1. Objetivo
Implementar a tela de listagem de músicas (Imagem 2) e a lógica de atualização automática de status (Polling) para que o usuário acompanhe o progresso em tempo real.

## 2. Requisitos de UI (Tailwind)
Tabela/Lista: Exibir Filename, Data de Upload, Status (Badge Colorido) e Ações.

Badges de Status:

PENDING: Cinza ("Na fila").

PROCESSING: Azul animado ("Processando...").

ISOLATING: Roxo ("Limpando áudio...").

COMPLETED: Verde ("Pronto").

FAILED: Vermelho ("Erro").

Ações: Botão "Ver Transcrição" (desabilitado se não for COMPLETED).

## 3. Lógica de Frontend
Ao carregar a página, buscar todas as músicas via GET /api/v1/music.

Para cada música com status diferente de COMPLETED ou FAILED, iniciar um setInterval (ex: a cada 3 segundos) chamando o endpoint de status da Tarefa 2.4.

Limpeza: Garantir que o intervalo seja limpo (clear) quando o componente for desmontado ou o status mudar para um estado final.
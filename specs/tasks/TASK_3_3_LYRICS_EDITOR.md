# Spec: Tarefa 3.3 - Editor Segmentado (A "Mágica" da Sincronia)

## 1. Objetivo
Implementar a tela de edição detalhada (Imagem 3), permitindo corrigir trechos específicos com auxílio do áudio segmentado.

## 2. Lógica do Editor (Data Driven)
Input: Lista de lyrics_sync (JSON com timestamp e stretch).

Interface: Cada "stretch" (trecho) deve ser um card ou linha contendo:

Um input de texto editável.

Um botão de Play Local.

## 3. Comportamento do "Play Local"
Ao clicar no play do trecho, o agente deve emitir um comando para o player global: wavesurfer.play(segment.start, segment.end).

Isso garante que o usuário ouça exatamente o que a IA transcreveu naquele bloco para validar a palavra.

## 4. Persistência (Salvamento)
Implementar botão "Salvar Alterações".

Ação: Enviar um PATCH /api/v1/music/{id} contendo o JSON atualizado dos trechos e o texto final consolidado.
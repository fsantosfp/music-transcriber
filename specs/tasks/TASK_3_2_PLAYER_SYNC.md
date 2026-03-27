# Spec: Tarefa 3.2 - Player Sincronizado e Visualização

## 1. Objetivo
Implementar a visualização da transcrição formatada e o player de áudio com waveform (onda sonora) para conferência.

## 2. Componentes Críticos
Waveform: Utilizar a biblioteca Wavesurfer.js.

Player Global: Controles de Play/Pause, Volume e barra de progresso.

Visualizador de Texto: Área que exibe o formatted_transcription (resultado da LLM).

## 3. Integração e Funcionalidades
O backend deve servir o arquivo de áudio via streaming estático (configurar FastAPI StaticFiles).

O Wavesurfer deve carregar o audio_path retornado pelo banco.

Download Rápido: Adicionar um botão temporário para baixar o .txt bruto da transcrição.
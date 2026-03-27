# Spec: Tarefa 2.3 - Isolamento de Vocal (Demucs Fallback)

## 1. Objetivo
Implementar o fluxo de exceção para músicas onde a instrumentação impede uma transcrição clara. Utilizar o Demucs para separar o vocal e reaplicar o Whisper.

## 2. Fluxo de "Recuperação"
Se acionado (status == ISOLATING_VOCALS):

Executar demucs via subprocess ou biblioteca python sobre o arquivo original.

Extrair apenas o arquivo de saída vocals.wav.

(Opcional/Bônus): Aplicar um filtro de normalização via ffmpeg.

Após este tramento a tarefa 2.1 de transcrição deve ser reacionada para que agora tente realizar a transcrição com base no audio do vocal isolado.

## 3. Critérios de Aceite
[ ] O arquivo de vocal isolado deve ser salvo em uma subpasta (ex: /uploads/processed/).

[ ] O sistema deve evitar loops infinitos (limitar a 1 tentativa de isolamento por música).
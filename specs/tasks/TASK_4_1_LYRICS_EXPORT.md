# Spec: Tarefa 4.1 - Exportação Multi-formato

## 1. Objetivo
Permitir que o usuário exporte a letra final em formatos comuns (Imagem 4).

## 2. Formatos Requeridos
TXT: Simples, apenas o texto da formatted_transcription.

DOCX: Utilizar a biblioteca python-docx no backend para gerar o arquivo.

PDF: Utilizar reportlab ou weasyprint no backend.

## 3. Fluxo de Download
Botão "Exportar" abre um menu com as opções.

O frontend chama GET /api/v1/music/{id}/export?format=pdf.

O backend gera o buffer do arquivo em memória e retorna como um download binário (FileResponse).
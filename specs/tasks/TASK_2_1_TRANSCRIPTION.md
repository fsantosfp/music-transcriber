# Spec: Tarefa 2.1 - Integração com Whisper (Transcrição Base)

## 1. Objetivo
Implementar o motor de transcrição utilizando o modelo OpenAI Whisper rodando localmente, transformando o arquivo de áudio em um JSON estruturado com timestamps e texto bruto.

## 2. Detalhes Técnicos
Biblioteca: faster-whisper (recomendada para melhor performance em CPU/GPU local).

Modelo: small ou medium (equilíbrio entre velocidade e precisão para um MVP).

Input: audio_path recuperado do registro no banco de dados.

Output esperado: Um objeto/lista de segmentos contendo start, end e text.

## 3. Fluxo de Trabalho do Agente
Buscar registros no banco com status PENDING.

Atualizar o status para PROCESSING_WHISPER.

Carregar o modelo Whisper (preferencialmente usando Singleton para não recarregar a cada requisição).

Executar a transcrição.

Critério de Fallback Inicial: Se o retorno for vazio ou consistir apenas em ruído (caracteres repetidos), marcar o status como ISOLATING_VOCALS (para a tarefa 2.3). Caso contrário, salvar em raw_transcription.

Utilize este modelo Pydantic para o retorno da função de transcrição:

Python
class TranscriptionSegment(SQLModel):
    start: float
    end: float
    text: str

class WhisperResult(SQLModel):
    segments: list[TranscriptionSegment]
    language: str
    probability: float

## 4. Instruções de Implementação
Singleton Pattern: O modelo do Whisper deve ser carregado uma única vez no início da aplicação (evitar reload a cada request).

Processamento: - Chamar model.transcribe(audio_path, beam_size=5).

Iterar sobre o gerador de segmentos e converter para a lista de TranscriptionSegment.

Tratamento de Baixa Confiança:

Se segments for vazio OU probability < 0.35, marcar status como ISOLATING_VOCALS.

Caso contrário, salvar a lista de segmentos no banco (campo raw_transcription) serializada como JSON.

## 5. Definition of Done (Do/Don't)
[ ] DO: Logar o tempo de início e fim do processamento.

[ ] DO: Utilizar fastapi.BackgroundTasks para não travar a requisição de upload.

[ ] DON'T: Não tentar traduzir o áudio; manter a língua original detectada.

## 6. Critérios de Aceite
[ ] O processamento deve ser assíncrono (utilizando BackgroundTasks do FastAPI ou uma thread separada).

[ ] O JSON gerado deve preservar os timestamps para permitir o "seek" no player do frontend futuramente.

[ ] Logs claros no console indicando o progresso da transcrição.


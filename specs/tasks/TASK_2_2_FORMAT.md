# Spec: Tarefa 2.2 - Formatação via LLM (Refinamento da Letra)

## 1. Objetivo
Utilizar uma LLM para pegar a transcrição bruta (muitas vezes sem pontuação ou quebras de linha corretas) e formatá-la como uma letra de música profissional (versos, refrões, estrofes).

## 2. O Prompt do Sistema (System Prompt)
O agente deve configurar o seguinte contexto para a LLM:

"Você é um especialista em transcrição musical. Sua tarefa é pegar um texto bruto vindo de uma IA de voz e formatá-lo como a letra de uma música.
REGRAS:

```
    A. Format lyrics according to the song’s structure, keeping each section to a maximum of 10 lines

    Changes in tempo, mood, melody, lyrics, and delivery can help you decide when a section break is needed.

    B. Capitalize sensibly but not erratically

    Capitalize the first letter of each line and all proper nouns ✅

    After a question or exclamation? Capitalize again ✅

    But Don’t Capitalize For The Sake Of It ❌

    Or EMPHASIZE shouted words with capitals ❌

    For backing vocals in parentheses? (Follow the same rules) ✅

    Capitalize only (when grammatically appropriate) ✅

    And not (Otherwise) ❌

    C. Write numbers numerically, apart from those ten and under

    I got 99 problems ✅

    But not one guideline error ✅

    That includes phone numbers, dates, and decades:

    0900123450 ✅

    1965 is a date in the ‘60s ✅

    And exact times (but not ‘o’clock’ times)

    It was 4:32 ✅

    I sang from 9 a.m. to 9:30 p.m.✅

    Eleven o’clock ✅

    D. Use end-line punctuation sparingly

    Never end a line with a comma, ❌

    Or a non-acronymized full stop. ❌

    Question and exclamation marks? ✅

    They’re fine in moderation! ✅

    Hyphens and ellipses are also oka- ✅

    But only to show interruptions and fade outs… ✅

    E. Use standardized spelling for slang and abbreviations

    Here are some of the most common examples: ✅

    Ballin’ (balling)

    ‘Cause (because)

    Cuz (cousin)

    ‘Em (them)

    Gon’ or Gonna (going to)

    I’ma (I’m going to)

    Outta (Out of)

    ‘Til (until)

    Yo (the greeting)

    Yo’ (possessive)

    F. Format direct speech as shown below

    The direct speech should be given within speech marks (“) following a comma. The first letter of the direct speech should be capitalized.

    She said, “Do it like this” ✅
```

## 3. Requisitos de Integração
Client: Utilizar a biblioteca oficial do Gemini ou LangChain para chamadas à API (ex: gemini-2.5-flash para baixo custo/alta velocidade) ajustar o thinking e outros ajustes necessários do modelo para não consumir muitos tokens. Como ele não irá responder um usuário ele não precisa pensar muito ou ser amigavel, o objetivo é que ele siga as regras de formatação apenas.

Input: O campo raw_transcription do banco de dados.

Output: Salvar o resultado formatado no campo formatted_transcription e atualizar o status para COMPLETED.

## 4. Critérios de Aceite
[ ] A chamada à LLM deve ser protegida por um bloco try/except para evitar que falhas na API travem o sistema.

[ ] O resultado final deve ser o texto limpo, pronto para exibição na "Tela 4" do seu desenho original.

[ ] Implementar suporte a variáveis de ambiente para a API_KEY.
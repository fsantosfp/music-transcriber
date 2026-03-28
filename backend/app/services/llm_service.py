import logging
from google import genai
from google.genai import types
from app.core.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Você é um especialista em transcrição musical. Sua tarefa é pegar um texto bruto vindo de uma IA de voz e formatá-lo como a letra de uma música.
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
    G. OUTPUT ONLY THE FINAL LYRICS
    Never output your reasoning, explanations, or thinking steps. Emit exclusively the musical lyrics bounded strictly by the text mapping.
```
"""

class LLMService:
    def __init__(self):
        if not GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY is not set. LLM formatting might fail if not mocked.")
        self.client = genai.Client(api_key=GEMINI_API_KEY)

    def format_transcription(self, raw_text: str) -> str:
        """
        Takes the raw JSON-like or concatenated string layout and runs it into Gemini 
        with strict systemic boundaries to parse into music lyrics format.
        """
        logger.info("Initializing formatting via Gemini 2.5 Flash")
        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=raw_text,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.1,
                    max_output_tokens=2048, # Hard cap the 'thinking' output waste
                    thinking_config=types.ThinkingConfig(thinking_budget=0)
                ),
            )
            logger.info("Formatting complete.")
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini LLM: {e}")
            raise

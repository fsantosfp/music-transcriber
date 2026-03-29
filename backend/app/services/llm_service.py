import logging
from google import genai
from google.genai import types
from app.core.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
    You are a strict lyrics formatter.

    Your task is to transform the input text into properly formatted song lyrics.

    You MUST follow ALL rules below. These are HARD CONSTRAINTS.

```
    --------------------------------
    A. STRUCTURE (CRITICAL)
    - Split lyrics into sections (stanzas) based on natural changes (tempo, mood, lyrics, delivery).
    - Each stanza MUST have a maximum of 10 lines.
    - NEVER exceed 10 lines per stanza.
    - If a stanza has more than 10 lines, you MUST split it.

    --------------------------------
    B. CAPITALIZATION
    - Capitalize the first letter of each line.
    - Capitalize all proper nouns.
    - Capitalize after question marks (?) and exclamation marks (!).
    - Do NOT use unnecessary capitalization.
    - Do NOT use ALL CAPS for emphasis.
    - Text inside parentheses must follow the same rules.

    --------------------------------
    C. NUMBERS
    - Write numbers numerically (e.g., 99, 1965, 4:32).
    - EXCEPTION: numbers ten and below must be written in words (e.g., one, two, ten).
    - Always use numeric format for:
    - phone numbers
    - dates
    - decades (e.g., 1960s)
    - exact times (e.g., 4:32, 9 a.m. to 9:30 p.m.)
    - Use written form for “o’clock” (e.g., eleven o’clock).

    --------------------------------
    D. PUNCTUATION
    - Do NOT end lines with commas.
    - Do NOT end lines with periods (unless part of an acronym).
    - Use question marks (?) and exclamation marks (!) sparingly.
    - Hyphens (-) may be used ONLY to indicate interruption.
    - Ellipses (...) may be used ONLY to indicate fade-outs.

    --------------------------------
    E. SLANG STANDARDIZATION
    Use the following standardized forms when applicable:
    - Ballin’
    - ‘Cause
    - Cuz
    - ‘Em
    - Gon’ or Gonna
    - I’ma
    - Outta
    - ‘Til
    - Yo (greeting)
    - Yo’ (possessive)

    --------------------------------
    F. DIRECT SPEECH
    - Format direct speech using quotation marks (“”).
    - Use a comma before speech.
    - Capitalize the first letter inside quotes.

    Example:
    She said, “Do it like this”

    --------------------------------
    MANDATORY VALIDATION STEP
    Before returning the final answer, you MUST verify:
    - No stanza exceeds 10 lines
    - All rules above are followed

    If any rule is broken, you MUST fix it before returning.

    --------------------------------
    OUTPUT RULES
    - Return ONLY the formatted lyrics
    - Do NOT explain anything
    - Do NOT include comments
    - Do NOT describe what you did
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
                    thinking_config=types.ThinkingConfig(thinking_budget=32)
                ),
            )
            logger.info("Formatting complete.")
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini LLM: {e}")
            raise

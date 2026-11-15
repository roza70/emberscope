
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import errors, types


ENV_FILE = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV_FILE)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

PRIMARY_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.1-flash-lite"
)

BACKUP_MODEL = os.getenv(
    "GEMINI_FALLBACK_MODEL",
    "gemini-3.5-flash-lite"
)

MAX_ATTEMPTS = 2
RETRYABLE_STATUS_CODES = {500, 502, 503, 504}


def generate_text(prompt: str) -> str:

    if not GEMINI_API_KEY:
        raise RuntimeError("Gemini API key is not configured.")

    client = genai.Client(
        api_key=GEMINI_API_KEY,
        http_options=types.HttpOptions(
            timeout=30000,
            retry_options=types.HttpRetryOptions(attempts=1)
        )
    )

    models = list(dict.fromkeys([
        PRIMARY_MODEL,
        BACKUP_MODEL
    ]))

    try:
        for model in models:

            for attempt in range(MAX_ATTEMPTS):

                try:
                    print(f"Trying Gemini model: {model}")

                    response = client.models.generate_content(
                        model=model,
                        contents=prompt
                    )

                    if not response.text:
                        raise RuntimeError(
                            "Gemini returned an empty response."
                        )

                    print(f"Gemini successful: {model}")

                    return response.text

                except errors.ServerError as exc:

                    if exc.code not in RETRYABLE_STATUS_CODES:
                        raise

                    print(
                        f"Gemini error {exc.code} on {model}. "
                        f"Attempt {attempt + 1}/{MAX_ATTEMPTS}"
                    )

                    if attempt < MAX_ATTEMPTS - 1:
                        time.sleep(2)
                    else:
                        print(
                            f"Switching to next model after {model}."
                        )

        raise RuntimeError(
            "All configured Gemini models are unavailable."
        )

    finally:
        client.close()

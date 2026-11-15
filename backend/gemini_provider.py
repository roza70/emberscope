import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import errors, types


# Load environment variables
ENV_FILE = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV_FILE)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

MAX_ATTEMPTS = 2
RETRYABLE_STATUS_CODES = {500, 502, 503, 504}


def generate_text(prompt: str) -> str:
    """Generate Gemini response with bounded retries and timeout."""

    if not GEMINI_API_KEY:
        raise RuntimeError("Gemini API key is not configured.")

    client = genai.Client(
        api_key=GEMINI_API_KEY,
        http_options=types.HttpOptions(
            timeout=12000,
            retry_options=types.HttpRetryOptions(
                attempts=1
            )
        )
    )

    try:
        for attempt in range(MAX_ATTEMPTS):
            try:
                response = client.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=prompt
                )

                if not response.text:
                    raise RuntimeError(
                        "Gemini returned an empty response."
                    )

                return response.text

            except errors.ServerError as exc:
                if (
                    exc.code not in RETRYABLE_STATUS_CODES
                    or attempt == MAX_ATTEMPTS - 1
                ):
                    raise RuntimeError(
                        f"Gemini unavailable (HTTP {exc.code})."
                    ) from exc

                print(
                    f"Gemini error {exc.code}. "
                    "One retry in 1 second..."
                )

                time.sleep(1)

    finally:
        client.close()

    raise RuntimeError("Gemini could not generate a response.")
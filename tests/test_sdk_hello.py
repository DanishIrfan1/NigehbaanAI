"""
Test: Verify Gemini SDK connectivity (Task 1.1 — hello-world check).

Run: pytest tests/test_sdk_hello.py -v
"""

import os
import sys
import pathlib

import pytest

# Ensure repo root is on the path
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv
load_dotenv(pathlib.Path(__file__).resolve().parents[1] / ".env")


@pytest.mark.skipif(
    os.getenv("RUN_GEMINI_LIVE", "0") != "1",
    reason="Set RUN_GEMINI_LIVE=1 to run live Gemini connectivity test",
)
@pytest.mark.skipif(
    not os.getenv("GOOGLE_API_KEY", "").strip() or os.getenv("GOOGLE_API_KEY", "").startswith("your"),
    reason="GOOGLE_API_KEY not configured — set it in .env to run this test",
)
def test_gemini_hello_world():
    """Basic test: call Gemini and get a response."""
    import google.generativeai as genai

    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content("Say 'NigehbaanAI is online' in exactly those words.")

    assert response.text is not None
    assert len(response.text) > 0
    print(f"✅ Gemini response: {response.text.strip()}")

"""Shared Gemini LLM helpers for agent modules."""

from __future__ import annotations

import json
import os
from typing import Any

import google.generativeai as genai

from agents.config import GOOGLE_API_KEY, MODEL_ID, log_trace, record_llm_call
from agents.mock_llm_payloads import mock_llm_json_for_agent

# Signals that used mock / fallback LLM output at least once (cleared by orchestrator).
_signal_used_mock_llm: set[str] = set()

genai.configure(api_key=GOOGLE_API_KEY or "dummy")
_model: Any = None


def _get_model() -> Any:
    """Lazy model init so GEMINI_MODEL_ID is read after dotenv."""
    global _model
    if _model is None:
        mid = os.getenv("GEMINI_MODEL_ID", "").strip() or MODEL_ID
        _model = genai.GenerativeModel(mid)
    return _model


def register_signal_used_mock_llm(signal_id: str) -> None:
    """Mark that this signal_id's pipeline used mock LLM output (any step)."""
    _signal_used_mock_llm.add(signal_id)


def consume_signal_used_mock_llm(signal_id: str) -> bool:
    """Return True if mock LLM was used for this signal, then clear the flag."""
    if signal_id in _signal_used_mock_llm:
        _signal_used_mock_llm.discard(signal_id)
        return True
    return False


def _llm_mode() -> str:
    return os.getenv("LLM_MODE", "auto").strip().lower()


def _should_fallback_to_mock(exc: BaseException) -> bool:
    """In auto mode, treat quota / auth failures as recoverable with mock JSON."""
    try:
        from google.api_core import exceptions as google_exc

        if isinstance(exc, google_exc.ResourceExhausted):
            return True
        if isinstance(exc, google_exc.PermissionDenied):
            return True
        if isinstance(exc, google_exc.Unauthenticated):
            return True
    except ImportError:
        pass
    msg = str(exc).lower()
    return any(
        part in msg
        for part in (
            "429",
            "quota",
            "resource exhausted",
            "exhausted",
            "api key not valid",
            "invalid api key",
            "permission denied",
        )
    )


def llm_call(prompt: str, agent_name: str, signal_id: str) -> str:
    """Make a Gemini API call; honor LLM_MODE and fall back to deterministic mocks on quota errors."""
    mode = _llm_mode()
    mock_json = mock_llm_json_for_agent(agent_name)

    if mode == "mock":
        log_trace(signal_id, agent_name, "llm_call_mock_mode", {"reason": "LLM_MODE=mock"})
        register_signal_used_mock_llm(signal_id)
        return mock_json

    if not (GOOGLE_API_KEY or "").strip():
        if mode == "real":
            raise ValueError("GOOGLE_API_KEY is empty but LLM_MODE=real")
        log_trace(signal_id, agent_name, "llm_call_fallback_mock", {"reason": "empty GOOGLE_API_KEY"})
        register_signal_used_mock_llm(signal_id)
        return mock_json

    log_trace(signal_id, agent_name, "llm_call_start", {"prompt_length": len(prompt)})
    try:
        response = _get_model().generate_content(prompt)
        text = response.text or ""
        log_trace(signal_id, agent_name, "llm_call_complete", {
            "response_length": len(text),
        })
        record_llm_call()
        return text
    except Exception as exc:
        log_trace(signal_id, agent_name, "llm_call_error", {"error": str(exc)})
        if mode == "real":
            raise
        if mode == "auto" and _should_fallback_to_mock(exc):
            log_trace(
                signal_id,
                agent_name,
                "llm_call_fallback_mock",
                {"error": str(exc)[:500]},
            )
            register_signal_used_mock_llm(signal_id)
            return mock_json
        raise


def parse_json_from_llm(text: str) -> dict:
    """Extract JSON from LLM response (handles markdown code blocks)."""
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return json.loads(cleaned.strip())

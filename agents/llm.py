"""LangChain Gemini helpers with structured output and LLM_MODE handling."""

from __future__ import annotations

import json
import os

from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel

from agents.config import GOOGLE_API_KEY, MODEL_ID, log_trace, record_llm_call
from agents.mock_llm_payloads import mock_payload_for_agent

_signal_used_mock_llm: set[str] = set()


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


def get_model_id() -> str:
    return os.getenv("GEMINI_MODEL_ID", "").strip() or MODEL_ID


def get_chat_model() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=get_model_id(),
        google_api_key=GOOGLE_API_KEY or "dummy",
        temperature=0.2,
    )


def invoke_structured[T: BaseModel](
    signal_id: str,
    agent_name: str,
    prompt: str,
    schema: type[T],
) -> T:
    """Run structured LLM call; honor LLM_MODE and mock fallbacks."""
    mode = _llm_mode()
    mock_data = mock_payload_for_agent(agent_name)

    if mode == "mock":
        log_trace(signal_id, agent_name, "llm_call_mock_mode", {"reason": "LLM_MODE=mock"})
        register_signal_used_mock_llm(signal_id)
        return schema.model_validate(mock_data)

    if not (GOOGLE_API_KEY or "").strip():
        if mode == "real":
            raise ValueError("GOOGLE_API_KEY is empty but LLM_MODE=real")
        log_trace(signal_id, agent_name, "llm_call_fallback_mock", {"reason": "empty GOOGLE_API_KEY"})
        register_signal_used_mock_llm(signal_id)
        return schema.model_validate(mock_data)

    log_trace(signal_id, agent_name, "llm_call_start", {"prompt_length": len(prompt)})
    try:
        model = get_chat_model().with_structured_output(schema)
        result = model.invoke([HumanMessage(content=prompt)])
        log_trace(signal_id, agent_name, "llm_call_complete", {
            "response_type": schema.__name__,
        })
        record_llm_call()
        return result
    except Exception as exc:
        log_trace(signal_id, agent_name, "llm_call_error", {"error": str(exc)})
        if mode == "real":
            raise
        if mode == "auto" and _should_fallback_to_mock(exc):
            log_trace(signal_id, agent_name, "llm_call_fallback_mock", {"error": str(exc)[:500]})
            register_signal_used_mock_llm(signal_id)
            return schema.model_validate(mock_data)
        raise


def invoke_text(signal_id: str, agent_name: str, prompt: str) -> str:
    """Small text LLM call (e.g. public + emergency notification polish)."""
    mode = _llm_mode()
    if mode == "mock" or not (GOOGLE_API_KEY or "").strip():
        if mode == "real" and not (GOOGLE_API_KEY or "").strip():
            raise ValueError("GOOGLE_API_KEY is empty but LLM_MODE=real")
        register_signal_used_mock_llm(signal_id)
        return json.dumps(mock_payload_for_agent(agent_name))

    log_trace(signal_id, agent_name, "llm_call_start", {"prompt_length": len(prompt)})
    try:
        response = get_chat_model().invoke([HumanMessage(content=prompt)])
        text = response.content if isinstance(response.content, str) else str(response.content)
        record_llm_call()
        log_trace(signal_id, agent_name, "llm_call_complete", {"response_length": len(text)})
        return text
    except Exception as exc:
        if mode == "auto" and _should_fallback_to_mock(exc):
            register_signal_used_mock_llm(signal_id)
            return json.dumps(mock_payload_for_agent(agent_name))
        raise

"""
Verification Agent — False alarm detection and signal correction.

Compares new field reports or contradictory signals against an existing
incident classification to verify its validity. Can trigger alert retractions.

Part of the NigehbaanAI Stage 4 robustness pipeline.
"""

from __future__ import annotations

import json
from typing import Any

import google.generativeai as genai

from agents.config import GOOGLE_API_KEY, MODEL_ID, log_trace

# ── Configure Gemini ─────────────────────────────────────────────────────────
genai.configure(api_key=GOOGLE_API_KEY)
_model = genai.GenerativeModel(MODEL_ID)


def _llm_call(prompt: str, agent_name: str, signal_id: str) -> str:
    """Make a Gemini API call with error handling and trace logging."""
    log_trace(signal_id, agent_name, "llm_call_start", {"prompt_length": len(prompt)})
    try:
        response = _model.generate_content(prompt)
        text = response.text
        log_trace(signal_id, agent_name, "llm_call_complete", {
            "response_length": len(text),
        })
        return text
    except Exception as e:
        log_trace(signal_id, agent_name, "llm_call_error", {"error": str(e)})
        raise


def _parse_json_from_llm(text: str) -> dict:
    """Extract JSON from LLM response (handles markdown code blocks)."""
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    return json.loads(cleaned)


def run_verification_agent(
    signal_id: str,
    original_detection: dict[str, Any],
    field_report: str,
) -> dict:
    """
    LLM-powered verification: detects false alarms or necessary corrections.

    Args:
        signal_id: Unique identifier for the incident.
        original_detection: The detection dict (fusion, classification, severity).
        field_report: The new incoming contradictory signal or report.

    Returns:
        Dict with verification status, correction details, and retraction message.
    """
    log_trace(signal_id, "verification_agent", "reasoning_start", {
        "task": "Verify incident validity against field report",
    })

    prompt = f"""You are the Verification Agent for NigehbaanAI.

Your task is to analyze a NEW field report and determine if the original crisis classification is still valid.

## Original Detection:
{json.dumps(original_detection, indent=2)}

## New Field Report:
"{field_report}"

## Your Tasks:
1. Determine if the field report CONFIRMS, CONTRADICTS, or Corrects the original detection.
2. If it CONTRADICTS (e.g., "no flooding here" or "it's just a water main"), classify as a FALSE_ALARM or INCIDENT_CORRECTION.
3. If it's a false alarm or correction, generate a RETRACTION/APOLOGY message for the public.
4. Recommend if alerts should be retracted.

## Output ONLY valid JSON:
```json
{{
  "verification_status": "confirmed|corrected|false_alarm",
  "is_retraction_needed": false,
  "original_type": "type",
  "new_type": "type or null",
  "original_severity": "severity",
  "new_severity": "severity or null",
  "reasoning": "explanation of why the status changed",
  "retraction_message": "Official apology/retraction text if needed",
  "stakeholder_updates": {{
    "public": "message",
    "utility_company": "message"
  }}
}}
```"""

    response = _llm_call(prompt, "verification_agent", signal_id)
    result = _parse_json_from_llm(response)

    log_trace(signal_id, "verification_agent", "verification_complete", {
        "status": result.get("verification_status"),
        "retraction_needed": result.get("is_retraction_needed"),
        "reasoning": result.get("reasoning", "")[:200],
    })

    return result

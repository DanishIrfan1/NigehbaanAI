"""
Stakeholder Notification Agent — LLM-powered tailored communication.

Generates tailored emergency messages for various stakeholder groups
(public, emergency services, hospitals, etc.) based on crisis details
and response actions taken.

Part of the NigehbaanAI Stage 3 response pipeline.
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


def run_stakeholder_notifier(
    signal_id: str,
    classification: dict[str, Any],
    severity: dict[str, Any],
    execution: dict[str, Any],
) -> dict:
    """
    LLM-powered stakeholder message generation.

    Args:
        signal_id: Unique identifier for this crisis.
        classification: Dict from Classifier Agent.
        severity: Dict from Severity Agent.
        execution: Dict from Action Executor Agent.

    Returns:
        Dict with tailored notifications for multiple stakeholder groups.
    """
    log_trace(signal_id, "stakeholder_notifier_agent", "reasoning_start", {
        "task": "Generate tailored messages for 6 stakeholder groups",
    })

    prompt = f"""You are the Stakeholder Notification Agent for NigehbaanAI.

Generate tailored emergency messages for each stakeholder group.

## Crisis Details:
- Type: {classification.get('crisis_type')}
- Location: {classification.get('location')}
- Confidence: {classification.get('confidence')}
- Severity: {severity.get('severity')}
- Affected Population: {severity.get('affected_population_estimate')}
- Expected Duration: {severity.get('expected_duration_hrs')} hours

## Actions Taken:
{json.dumps(execution.get('executed_actions', []), indent=2)}

## Generate messages for these 6 audiences:
1. PUBLIC — Clear, actionable, reassuring. Include safety instructions.
2. EMERGENCY_SERVICES — Technical, precise, operational details.
3. HOSPITAL — Medical preparation instructions, expected injuries.
4. UTILITY_COMPANY — Infrastructure-related actions needed.
5. TRANSPORT_AUTHORITY — Route changes, public transport adjustments.
6. MEDIA_COMMAND_CENTER — Official statement for press and coordination.

Mark all messages with [SIMULATED] tag.

## Output ONLY valid JSON:
```json
{{
  "notifications": {{
    "public": "message text",
    "emergency_services": "message text",
    "hospital": "message text",
    "utility_company": "message text",
    "transport_authority": "message text",
    "media_command_center": "message text"
  }},
  "notification_count": 6,
  "priority_audience": "which audience should receive first"
}}
```"""

    response = _llm_call(prompt, "stakeholder_notifier_agent", signal_id)
    result = _parse_json_from_llm(response)

    log_trace(signal_id, "stakeholder_notifier_agent", "notifications_generated", {
        "audiences_notified": list(result.get("notifications", {}).keys()),
        "priority_audience": result.get("priority_audience"),
    })

    return result

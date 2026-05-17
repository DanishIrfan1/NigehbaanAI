"""
Resource Planner Agent — Multi-crisis allocation & trade-off reasoning.

Allocates emergency response resources for detected crises based on type and severity.
Handles trade-off reasoning when multiple simultaneous crises are active.

Part of the NigehbaanAI Stage 3 response pipeline.
"""

from __future__ import annotations

import json
from typing import Any

import google.generativeai as genai

from agents.config import GOOGLE_API_KEY, MODEL_ID, DEFAULT_RESOURCES, log_trace

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


def run_resource_planner(
    signal_id: str,
    classification: dict[str, Any],
    severity: dict[str, Any],
    active_incidents: list[dict[str, Any]] | None = None,
) -> dict:
    """
    LLM-powered resource allocation with trade-off reasoning.

    Args:
        signal_id: Unique identifier for this crisis.
        classification: Dict from Classifier Agent.
        severity: Dict from Severity Agent.
        active_incidents: List of other currently active crises.

    Returns:
        Dict with priority, action_plan, and resource commitments.
    """
    log_trace(signal_id, "resource_planner_agent", "reasoning_start", {
        "task": "Allocate resources, handle multi-crisis trade-offs",
    })

    prompt = f"""You are the Resource Planner Agent for NigehbaanAI.

Allocate emergency response resources for the detected crisis.

## Crisis Details:
{json.dumps(classification, indent=2)}

## Severity Assessment:
{json.dumps(severity, indent=2)}

## Available Resources:
{json.dumps(DEFAULT_RESOURCES, indent=2)}

## Active Incidents (other crises competing for resources):
{json.dumps(active_incidents or [], indent=2)}

## Planning Rules:
- Never over-commit: keep 10% reserve of each resource type
- Always include a public_alert action
- If severity is critical, recommend escalating to national emergency services
- Consider blocked roads when assigning ambulance routes
- If multiple crises active, explain trade-off reasoning explicitly
- Include side effects for each action (e.g., public alert may cause evacuation congestion)
- Include fallback plans if primary resources are unavailable

## Output ONLY valid JSON:
```json
{{
  "priority": "P1|P2|P3",
  "action_plan": [
    {{
      "step": 1,
      "action": "action_name",
      "description": "what this action does",
      "resources_needed": {{}},
      "expected_duration_min": 0,
      "success_criteria": "how to measure success",
      "side_effects": ["possible unintended consequences"],
      "fallback": "what to do if this action fails"
    }}
  ],
  "total_resources_committed": {{}},
  "resources_remaining": {{}},
  "reserve_maintained_pct": 10,
  "rationale": "explanation of the overall plan",
  "multi_crisis_tradeoffs": "explanation if resources split across incidents",
  "ambulance_routing_note": "note about route optimization for blocked roads"
}}
```"""

    response = _llm_call(prompt, "resource_planner_agent", signal_id)
    result = _parse_json_from_llm(response)

    log_trace(signal_id, "resource_planner_agent", "plan_complete", {
        "priority": result.get("priority"),
        "action_count": len(result.get("action_plan", [])),
        "resources_committed": result.get("total_resources_committed"),
        "rationale": result.get("rationale", "")[:200],
    })

    return result

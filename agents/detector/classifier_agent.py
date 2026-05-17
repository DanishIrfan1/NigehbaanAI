"""
Crisis Classifier Agent — Determines crisis type, location, and confidence.

Reads the fused signal assessment from the Signal Fusion Agent and classifies
the crisis into one of the predefined types. Handles low-confidence scenarios
and alternative hypotheses.

Part of the NigehbaanAI Stage 2 detection pipeline.
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


def run_classifier(signal_id: str, fusion_result: dict, signals: dict[str, Any]) -> dict:
    """
    LLM-powered crisis classification.

    Args:
        signal_id: Unique identifier for this crisis signal.
        fusion_result: Output from run_signal_fusion().
        signals: Original raw signals dict (for accessing user_description).

    Returns:
        Dict with crisis_type, location, confidence, alternative_hypothesis,
        classification_reasoning, and field verification recommendation.
    """
    log_trace(signal_id, "crisis_classifier_agent", "reasoning_start", {
        "task": "Classify crisis type, location, and confidence",
    })

    prompt = f"""You are the Crisis Classifier Agent for NigehbaanAI.

Based on the fused signal assessment below, classify the crisis.

## Fused Signal Assessment:
{json.dumps(fusion_result, indent=2)}

## Original User Description:
{signals['user_description']}

## Classification Rules:
- Available crisis types: urban_flooding, heatwave, fire, accident, infrastructure_failure, power_outage, disease_cluster, protest, unknown
- If confidence < 0.5, set type to "unknown" and recommend field verification
- If contradictions exist, note the alternative hypothesis
- Consider ALL signals, not just the user description

## Output ONLY valid JSON:
```json
{{
  "crisis_type": "one_of_the_types_above",
  "location": "specific location string",
  "confidence": 0.0,
  "alternative_hypothesis": null,
  "alternative_confidence": 0.0,
  "classification_reasoning": "Brief explanation of why this type was chosen",
  "requires_field_verification": false,
  "geolocation_confidence": "high|medium|low"
}}
```"""

    response = _llm_call(prompt, "crisis_classifier_agent", signal_id)
    result = _parse_json_from_llm(response)

    log_trace(signal_id, "crisis_classifier_agent", "classification_complete", {
        "crisis_type": result.get("crisis_type"),
        "confidence": result.get("confidence"),
        "alternative": result.get("alternative_hypothesis"),
        "reasoning": result.get("classification_reasoning", "")[:200],
    })

    return result

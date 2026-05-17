"""
Severity Prediction Agent — Estimates impact radius, population, duration, and spread risk.

Reads the crisis classification and raw signal context to predict how severe
the crisis is and how it may evolve. Outputs actionable severity metrics
used by the Resource Planner.

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


def run_severity_predictor(signal_id: str, classification: dict, signals: dict[str, Any]) -> dict:
    """
    LLM-powered severity and evolution prediction.

    Args:
        signal_id: Unique identifier for this crisis signal.
        classification: Output from run_classifier().
        signals: Original raw signals dict (for weather/traffic context).

    Returns:
        Dict with severity level, affected_radius_km, affected_population_estimate,
        expected_duration_hrs, peak_impact_time, spread_risk, vulnerable_groups,
        escalation_triggers, and reasoning.
    """
    log_trace(signal_id, "severity_predictor_agent", "reasoning_start", {
        "task": "Estimate severity, affected area, population, duration",
    })

    prompt = f"""You are the Severity Prediction Agent for NigehbaanAI.

Based on the crisis classification and raw signals, predict the severity and evolution.

## Crisis Classification:
{json.dumps(classification, indent=2)}

## Weather Context:
{json.dumps(signals['weather'], indent=2)}

## Traffic Context:
{json.dumps(signals['traffic'], indent=2)}

## Prediction Tasks:
1. Severity level (low/medium/high/critical)
2. Affected radius in km
3. Affected population estimate
4. Expected duration in hours
5. Peak impact time (relative, e.g., "+2 hours")
6. Spread risk (how likely the crisis will expand)
7. Uncertainty range for all estimates

## Output ONLY valid JSON:
```json
{{
  "severity": "low|medium|high|critical",
  "affected_radius_km": 0.0,
  "affected_population_estimate": 0,
  "expected_duration_hrs": 0,
  "peak_impact_time": "+X hours",
  "spread_risk": "low|medium|high",
  "uncertainty_range": "low|medium|high",
  "vulnerable_groups": ["list of especially at-risk populations"],
  "escalation_triggers": ["conditions that would increase severity"],
  "severity_reasoning": "Brief explanation"
}}
```"""

    response = _llm_call(prompt, "severity_predictor_agent", signal_id)
    result = _parse_json_from_llm(response)

    log_trace(signal_id, "severity_predictor_agent", "prediction_complete", {
        "severity": result.get("severity"),
        "affected_radius_km": result.get("affected_radius_km"),
        "affected_population": result.get("affected_population_estimate"),
        "expected_duration_hrs": result.get("expected_duration_hrs"),
        "spread_risk": result.get("spread_risk"),
    })

    return result

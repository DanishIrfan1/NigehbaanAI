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

from agents.config import log_trace
from agents.llm_utils import llm_call, parse_json_from_llm


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

    response = llm_call(prompt, "severity_predictor_agent", signal_id)
    result = parse_json_from_llm(response)

    log_trace(signal_id, "severity_predictor_agent", "prediction_complete", {
        "severity": result.get("severity"),
        "affected_radius_km": result.get("affected_radius_km"),
        "affected_population": result.get("affected_population_estimate"),
        "expected_duration_hrs": result.get("expected_duration_hrs"),
        "spread_risk": result.get("spread_risk"),
    })

    return result

"""
Signal Fusion Agent — Multi-source credibility scoring & contradiction detection.

Receives raw signals from all ingestion tools, scores each source's credibility,
detects contradictions (e.g. flood vs water-main burst), and outputs a fused
signal assessment with weighted urgency.

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


def run_signal_fusion(signal_id: str, signals: dict[str, Any]) -> dict:
    """
    LLM-powered signal fusion: credibility scoring + contradiction detection.

    Args:
        signal_id: Unique identifier for this crisis signal.
        signals: Dict containing keys: user_description, weather, traffic,
                 social, emergency_call — each a dict from an ingestion tool.

    Returns:
        Dict with fused_summary, source_credibility_scores, contradiction info,
        overall_confidence, weighted_urgency, and signal agreement analysis.
    """
    log_trace(signal_id, "signal_fusion_agent", "reasoning_start", {
        "task": "Fuse multi-source signals, score credibility, detect contradictions",
    })

    prompt = f"""You are the Signal Fusion Agent for NigehbaanAI crisis intelligence system.

Your task: Analyze the following signals from multiple sources and produce a FUSED assessment.

## Input Signals

### User Report:
{signals['user_description']}

### Weather Data (credibility: {signals['weather'].get('credibility', 'N/A')}):
{json.dumps(signals['weather'], indent=2)}

### Traffic Data (credibility: {signals['traffic'].get('credibility', 'N/A')}):
{json.dumps(signals['traffic'], indent=2)}

### Social Media Posts (credibility: {signals['social'].get('credibility', 'N/A')}):
{json.dumps(signals['social'], indent=2)}

### Emergency Call (credibility: {signals['emergency_call'].get('credibility', 'N/A')}):
{json.dumps(signals['emergency_call'], indent=2)}

## Your Tasks:
1. Score each source's credibility (0-1) based on reliability, consistency with other sources, and detail level
2. Detect contradictions between sources (e.g., one says "flooding" another says "water main burst")
3. Compute weighted urgency based on mention velocity, language urgency, and source credibility
4. Identify the PRIMARY crisis signal vs. noise

## Output ONLY valid JSON:
```json
{{
  "fused_summary": "Brief narrative of what is happening based on all signals",
  "source_credibility_scores": {{
    "weather": 0.0,
    "traffic": 0.0,
    "social_media": 0.0,
    "emergency_call": 0.0
  }},
  "contradiction_detected": false,
  "contradicting_signals": [],
  "contradiction_description": "",
  "overall_confidence": 0.0,
  "weighted_urgency": "low|medium|high|critical",
  "primary_signal_source": "the most reliable source for this crisis",
  "contributing_signals": ["list of signals that agree"],
  "dissenting_signals": ["list of signals that disagree"]
}}
```"""

    response = _llm_call(prompt, "signal_fusion_agent", signal_id)
    result = _parse_json_from_llm(response)

    log_trace(signal_id, "signal_fusion_agent", "fusion_complete", {
        "overall_confidence": result.get("overall_confidence"),
        "contradiction_detected": result.get("contradiction_detected"),
        "weighted_urgency": result.get("weighted_urgency"),
        "fused_summary": result.get("fused_summary", "")[:200],
    })

    return result

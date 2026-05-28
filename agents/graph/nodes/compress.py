"""Rule-based signal compression for token-efficient LLM prompts."""

from __future__ import annotations

from typing import Any

from agents.config import log_trace
from agents.graph.state import CrisisState


def _top_keywords(raw_keywords: Any) -> list[str]:
    if isinstance(raw_keywords, list):
        return [str(item) for item in raw_keywords[:5]]
    return []


def _summarize_source(key: str, data: dict[str, Any] | None) -> dict[str, Any]:
    if not data:
        return {"status": "missing"}
    status = data.get("status", "ok")
    base: dict[str, Any] = {
        "status": status,
        "credibility": data.get("credibility"),
    }
    if key == "weather":
        base.update({
            "condition": data.get("condition"),
            "rainfall_mm": data.get("rainfall_mm"),
            "alert_level": data.get("alert_level"),
        })
    elif key == "traffic":
        base.update({
            "congestion": data.get("congestion_level"),
            "blocked_roads": data.get("blocked_roads", [])[:3],
        })
    elif key == "social":
        base.update({
            "post_count": data.get("post_count"),
            "sentiment": data.get("overall_sentiment"),
            "top_keywords": _top_keywords(data.get("keywords")),
        })
    elif key == "emergency_call":
        base.update({
            "has_call": data.get("has_call"),
            "call_type": data.get("call_type"),
            "urgency": data.get("urgency"),
        })
    return base


def compress_signals_node(state: CrisisState) -> dict:
    """Build compact digest from raw ingested signals."""
    signal_id = state["signal_id"]
    signals = state.get("signals_raw") or {}
    description = state.get("description", "")

    digest = {
        "user_description": description[:500],
        "location": state.get("location", ""),
        "weather": _summarize_source("weather", signals.get("weather")),
        "traffic": _summarize_source("traffic", signals.get("traffic")),
        "social": _summarize_source("social", signals.get("social")),
        "emergency_call": _summarize_source("emergency_call", signals.get("emergency_call")),
    }

    active = sum(
        1
        for k in ("weather", "traffic", "social", "emergency_call")
        if digest.get(k, {}).get("status") not in ("skipped", "failed", "missing")
    )
    digest["active_source_count"] = active

    log_trace(signal_id, "orchestrator", "signals_compressed", {
        "active_source_count": active,
        "digest_keys": list(digest.keys()),
    })

    return {"signal_digest": digest}

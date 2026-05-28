"""
Degraded mode and fallback handling for CIRO robustness requirements.

Detects missing/disabled sources, applies cached fallbacks, and flags duplicates.
"""

from __future__ import annotations

import datetime
from typing import Any

from agents.tools.weather_tool import fetch_weather
from agents.tools.traffic_tool import fetch_traffic


def _parse_timestamp(value: str | None) -> datetime.datetime | None:
    if not value:
        return None
    try:
        return datetime.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _is_expired(ts: datetime.datetime | None, now: datetime.datetime, window_minutes: int) -> bool:
    if ts is None:
        return True
    return (now - ts).total_seconds() > window_minutes * 60


def _is_candidate_status(record: dict[str, Any], now: datetime.datetime, window_minutes: int) -> bool:
    status = record.get("status", "")
    if status in ("error", "false_alarm"):
        return False
    if status != "completed":
        return True
    return not _is_expired(_parse_timestamp(record.get("completed_at")), now, window_minutes)


def _location_matches(location: str, record: dict[str, Any]) -> bool:
    loc_norm = location.lower().strip()
    payload_loc = (record.get("payload") or {}).get("location", "").lower()
    if not payload_loc:
        return False
    return loc_norm in payload_loc or payload_loc in loc_norm


def _type_matches(crisis_type: str | None, record: dict[str, Any]) -> bool:
    existing_type = (
        record.get("detection", {})
        .get("classification", {})
        .get("crisis_type")
    )
    if not (crisis_type and existing_type):
        return True
    return crisis_type == existing_type


def _duplicate_payload(sid: str, location: str, record: dict[str, Any]) -> dict[str, Any]:
    return {
        "duplicate_of": sid,
        "location": location,
        "existing_status": record.get("status", ""),
        "existing_type": (
            record.get("detection", {})
            .get("classification", {})
            .get("crisis_type")
        ),
    }


def _skipped_source(source: str, reason: str) -> dict:
    return {
        "source": source,
        "status": "skipped",
        "reason": reason,
        "credibility": 0.0,
        "degraded": True,
    }


def _failed_source(source: str, error: str) -> dict:
    return {
        "source": source,
        "status": "failed",
        "error": error,
        "credibility": 0.0,
        "degraded": True,
    }


def assess_ingestion(
    signals: dict[str, Any],
    flags: dict[str, bool],
    warnings: list[str],
) -> tuple[dict[str, Any], list[str], list[str]]:
    """
    Mark degraded sources and collect warnings / fallback_sources_used.

    Returns updated signals, warnings, fallback_sources_used.
    """
    fallback_used: list[str] = []
    updated = dict(signals)

    flag_map = {
        "weather": flags.get("enable_weather", True),
        "traffic": flags.get("enable_traffic", True),
        "social": flags.get("enable_social", True),
        "emergency_call": flags.get("enable_emergency_call", True),
    }

    for key, enabled in flag_map.items():
        sig = updated.get(key)
        if not enabled:
            updated[key] = _skipped_source(key, "disabled_by_client")
            warnings.append(f"{key}: disabled by request")
            continue
        if sig and sig.get("status") in ("failed", "skipped"):
            warnings.append(f"{key}: {sig.get('reason') or sig.get('error', 'unavailable')}")
        if sig and sig.get("used_fallback"):
            fallback_used.append(key)

    active_count = sum(
        1
        for k in ("weather", "traffic", "social", "emergency_call")
        if updated.get(k, {}).get("status") not in ("skipped", "failed")
        and updated.get(k) is not None
    )
    if active_count < 3:
        warnings.append(
            f"degraded_mode: only {active_count} active sources (minimum 3 recommended)"
        )

    return updated, warnings, fallback_used


def apply_fallbacks(signals: dict[str, Any], location: str) -> dict[str, Any]:
    """Replace failed sources with cached mock data where possible."""
    updated = dict(signals)

    if updated.get("weather", {}).get("status") == "failed":
        cached = fetch_weather(location)
        cached["used_fallback"] = True
        cached["fallback_reason"] = "primary_api_unavailable"
        cached["credibility"] = max(0.0, cached.get("credibility", 0.95) - 0.15)
        updated["weather"] = cached

    if updated.get("traffic", {}).get("status") == "failed":
        cached = fetch_traffic(location)
        cached["used_fallback"] = True
        cached["fallback_reason"] = "primary_api_unavailable"
        cached["credibility"] = max(0.0, cached.get("credibility", 0.90) - 0.15)
        updated["traffic"] = cached

    return updated


def detect_duplicate(
    location: str,
    crisis_type: str | None,
    incident_store: dict[str, Any],
    signal_id: str,
    window_minutes: int = 30,
) -> dict[str, Any] | None:
    """Return duplicate incident info if same location has a recent active incident."""
    now = datetime.datetime.now(datetime.timezone.utc)

    for sid, record in incident_store.items():
        if sid == signal_id:
            continue
        if not _is_candidate_status(record, now, window_minutes):
            continue
        if not _location_matches(location, record):
            continue
        if not _type_matches(crisis_type, record):
            continue
        if record.get("status") == "completed":
            completed_ts = _parse_timestamp(record.get("completed_at"))
            if _is_expired(completed_ts, now, window_minutes):
                continue
        return _duplicate_payload(sid, location, record)
    return None

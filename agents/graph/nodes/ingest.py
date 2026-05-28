"""Parallel signal ingestion node."""

from __future__ import annotations

import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from agents.config import log_task_plan, log_trace
from agents.graph.state import CrisisState
from agents.robustness.degraded import assess_ingestion, apply_fallbacks
from agents.tools.emergency_call_tool import fetch_emergency_call
from agents.tools.social_tool import fetch_social_posts
from agents.tools.traffic_tool import fetch_traffic
from agents.tools.weather_tool import fetch_weather

_executor = ThreadPoolExecutor(max_workers=4)
_asyncio_runner = ThreadPoolExecutor(max_workers=1)


def _skipped_payload(source: str) -> dict[str, Any]:
    return {
        "source": source,
        "status": "skipped",
        "reason": "disabled_by_client",
        "credibility": 0.0,
    }


def _fetch_weather(location: str) -> dict:
    return fetch_weather(location)


def _fetch_traffic(location: str) -> dict:
    return fetch_traffic(location)


def _fetch_social(location: str) -> dict:
    return fetch_social_posts(location)


def _fetch_emergency(location: str) -> dict:
    return fetch_emergency_call(location)


def _build_tasks(
    flags: dict[str, bool],
    maybe_fetch,
    signals: dict[str, Any],
) -> list:
    tasks = []
    if flags.get("enable_weather", True):
        tasks.append(maybe_fetch("weather", _fetch_weather, "weather"))
    else:
        signals["weather"] = _skipped_payload("weather_api")

    if flags.get("enable_traffic", True):
        tasks.append(maybe_fetch("traffic", _fetch_traffic, "traffic"))
    else:
        signals["traffic"] = _skipped_payload("traffic_api")

    if flags.get("enable_social", True):
        tasks.append(maybe_fetch("social", _fetch_social, "social"))
    else:
        signals["social"] = _skipped_payload("social_media")

    if flags.get("enable_emergency_call", True):
        tasks.append(maybe_fetch("emergency_call", _fetch_emergency, "emergency"))
    else:
        signals["emergency_call"] = _skipped_payload("emergency_call_1122")
    return tasks


def _apply_fallbacks_if_needed(
    signals: dict[str, Any],
    location: str,
    fallback_used: list[str],
) -> tuple[dict[str, Any], list[str]]:
    weather_or_traffic_failed = any(
        isinstance(signals.get(src), dict) and signals[src].get("status") == "failed"
        for src in ("weather", "traffic")
    )
    if not weather_or_traffic_failed:
        return signals, fallback_used

    updated = apply_fallbacks(signals, location)
    new_fallbacks = list(fallback_used)
    for src in ("weather", "traffic"):
        if updated.get(src, {}).get("used_fallback") and src not in new_fallbacks:
            new_fallbacks.append(src)
    return updated, new_fallbacks


async def _ingest_parallel(
    location: str,
    flags: dict[str, bool],
    simulate_fail: str | None,
) -> tuple[dict[str, Any], int, list[str], list[str]]:
    signals: dict[str, Any] = {}
    sources_collected = 0
    loop = asyncio.get_running_loop()

    async def _maybe_fetch(name: str, fn, fail_key: str):
        nonlocal sources_collected
        if simulate_fail == fail_key:
            return name, {
                "source": f"{name}_api" if name != "emergency_call" else "emergency_call_1122",
                "status": "failed",
                "error": "API timeout",
                "credibility": 0.0,
            }
        result = await loop.run_in_executor(_executor, fn, location)
        sources_collected += 1
        return name, result

    tasks = _build_tasks(flags, _maybe_fetch, signals)

    if tasks:
        results = await asyncio.gather(*tasks)
        for name, data in results:
            signals[name] = data

    warnings: list[str] = []
    signals, warnings, fallback_used = assess_ingestion(signals, flags, warnings)
    signals, fallback_used = _apply_fallbacks_if_needed(signals, location, fallback_used)

    return signals, sources_collected, warnings, fallback_used


def ingest_node(state: CrisisState) -> dict:
    """Fetch data from signal sources in parallel."""
    signal_id = state["signal_id"]
    payload = state.get("payload") or {}
    location = state.get("location", "G-10, Islamabad")
    description = state.get("description", "")

    flags = {
        "enable_weather": payload.get("enable_weather", True),
        "enable_traffic": payload.get("enable_traffic", True),
        "enable_social": payload.get("enable_social", True),
        "enable_emergency_call": payload.get("enable_emergency_call", True),
    }
    simulate_fail = payload.get("simulate_api_failure")

    log_trace(signal_id, "orchestrator", "stage1_ingestion_start", {"location": location, "flags": flags})
    log_task_plan(signal_id, "ingestion", [
        "fetch weather" if flags["enable_weather"] else "skip weather",
        "fetch traffic" if flags["enable_traffic"] else "skip traffic",
        "fetch social" if flags["enable_social"] else "skip social",
        "fetch emergency call" if flags["enable_emergency_call"] else "skip emergency",
    ])

    coro = _ingest_parallel(location, flags, simulate_fail)
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        signals, sources_collected, warnings, fallback_used = asyncio.run(coro)
    else:
        # process_signal can be invoked from an async context (tests). Run the
        # ingestion coroutine in a fresh loop on a helper thread.
        signals, sources_collected, warnings, fallback_used = _asyncio_runner.submit(
            asyncio.run, coro
        ).result()
    signals["user_description"] = description

    degraded = bool(warnings or fallback_used)
    log_trace(signal_id, "orchestrator", "stage1_ingestion_complete", {
        "sources_collected": sources_collected,
        "warnings": warnings,
        "fallback_sources_used": fallback_used,
    })

    return {
        "signals_raw": signals,
        "warnings": warnings,
        "fallback_sources_used": fallback_used,
        "degraded_mode": degraded,
        "status": "analyzing",
    }

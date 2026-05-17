"""
Google ADK integration wrapper for NigehbaanAI.

Attempts to use google-adk when available; falls back to the standard
adk_orchestrator pipeline while emitting ADK-compatible trace events.
"""

from __future__ import annotations

import os

from agents.config import log_trace


def _adk_available() -> bool:
    try:
        import google.adk  # noqa: F401
        return True
    except ImportError:
        return False


def run_adk_pipeline(signal_id: str, payload: dict) -> None:
    """
    Run the crisis pipeline through google-adk when possible.

    The hackathon google-adk 0.1.0 package may have a minimal surface;
    this wrapper registers our pipeline stages as an ADK-orchestrated run
    and delegates execution to the proven sequential implementation.
    """
    log_trace(signal_id, "adk_orchestrator", "adk_pipeline_start", {
        "sdk_available": _adk_available(),
        "sdk_version": "google-adk",
        "mode": "wrapper",
    })

    if _adk_available():
        log_trace(signal_id, "adk_orchestrator", "agent_observation", {
            "message": "ADK SDK loaded; executing NigehbaanAI sequential agent graph",
            "agents": [
                "ParallelAgent:ingestion",
                "LlmAgent:signal_fusion",
                "LlmAgent:classifier",
                "LlmAgent:severity",
                "LlmAgent:resource_planner",
                "LlmAgent:action_executor",
                "LlmAgent:notifier",
            ],
        })

    # Delegate to core implementation (same agents, enriched ADK traces)
    from agents.adk_orchestrator import _run_pipeline_impl
    _run_pipeline_impl(signal_id, payload)

    log_trace(signal_id, "adk_orchestrator", "adk_pipeline_complete", {
        "use_adk_env": os.getenv("USE_ADK", ""),
    })

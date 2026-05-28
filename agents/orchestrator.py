"""
NigehbaanAI – LangGraph orchestrator (production entry point).

Crisis pipeline: ingest → compress → detect → plan → execute → notify → impact
Verification: separate LangGraph subgraph on POST /verify
"""

from __future__ import annotations

import traceback

import agents.path_setup  # noqa: F401
from app.database.mock_store import upsert_incident

from agents.config import (
    log_trace,
    log_workplan,
    reset_pipeline_stats,
)
from agents.graph.build import compile_main_graph, compile_verification_graph
from agents.graph.state import CrisisState
from agents.llm import consume_signal_used_mock_llm

WORKPLAN = (
    "Ingest → Compress → Detect (1 LLM) → Plan → Execute → Notify → Impact"
)


def _initial_state(signal_id: str, payload: dict) -> CrisisState:
    return {
        "signal_id": signal_id,
        "payload": payload,
        "location": payload.get("location", "G-10, Islamabad"),
        "description": payload.get("description", ""),
        "warnings": [],
        "fallback_sources_used": [],
        "degraded_mode": False,
        "status": "processing",
        "llm_calls": 0,
    }


def process_signal(signal_id: str, payload: dict) -> None:
    """Run the main crisis pipeline via LangGraph."""
    reset_pipeline_stats()
    log_workplan(signal_id, WORKPLAN)
    log_trace(signal_id, "orchestrator", "pipeline_start", {
        "payload": payload,
        "engine": "langgraph",
    })

    upsert_incident(signal_id, {
        "status": "processing",
        "signal_id": signal_id,
        "payload": payload,
    })

    try:
        graph = compile_main_graph()
        graph.invoke(_initial_state(signal_id, payload))
    except Exception as exc:
        err_msg = str(exc)
        if "quota" in err_msg.lower() or "resource exhausted" in err_msg.lower() or "429" in err_msg:
            user_hint = (
                "Gemini API quota exceeded or rate-limited. Wait and retry, enable billing, "
                "or use a different GOOGLE_API_KEY. See https://ai.google.dev/gemini-api/docs/rate-limits"
            )
        else:
            user_hint = err_msg
        log_trace(signal_id, "orchestrator", "pipeline_error", {"error": err_msg})
        error_detail = {
            "status": "error",
            "signal_id": signal_id,
            "error": user_hint,
            "error_detail": err_msg,
            "traceback": traceback.format_exc(),
        }
        error_detail["simulated_llm_pipeline"] = consume_signal_used_mock_llm(signal_id)
        upsert_incident(signal_id, error_detail)


def verify_incident(signal_id: str, field_report: str) -> None:
    """Run verification subgraph for false alarms or corrections."""
    log_trace(signal_id, "orchestrator", "verification_pipeline_start", {
        "field_report": field_report,
        "engine": "langgraph",
    })

    try:
        graph = compile_verification_graph()
        graph.invoke({
            "signal_id": signal_id,
            "field_report": field_report,
        })
    except Exception as exc:
        log_trace(signal_id, "orchestrator", "verification_error", {
            "error": str(exc),
            "traceback": traceback.format_exc(),
        })

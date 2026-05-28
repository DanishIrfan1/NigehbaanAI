"""Action execution node (tools only, no LLM)."""

from __future__ import annotations

from agents.graph.services.actions import run_action_executor
from agents.graph.state import CrisisState


def execute_node(state: CrisisState) -> dict:
    signal_id = state["signal_id"]
    detection = state.get("detection") or {}
    classification = detection.get("classification", {})
    plan = state.get("plan") or {}

    execution = run_action_executor(signal_id, classification, plan)
    return {"execution": execution}

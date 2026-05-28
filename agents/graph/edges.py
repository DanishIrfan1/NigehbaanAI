"""Conditional routing for the LangGraph crisis pipeline."""

from __future__ import annotations

from agents.graph.state import CrisisState


def route_after_detect(state: CrisisState) -> str:
    if state.get("duplicate_info"):
        return "finalize_duplicate"
    if state.get("skip_response"):
        return "finalize_review"
    return "plan_resources"

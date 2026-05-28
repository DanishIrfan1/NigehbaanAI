"""Shared LangGraph state for the crisis pipeline."""

from __future__ import annotations

import operator
from typing import Annotated, Any, TypedDict


class CrisisState(TypedDict, total=False):
    signal_id: str
    payload: dict[str, Any]
    location: str
    description: str

    signals_raw: dict[str, Any]
    signal_digest: dict[str, Any]

    detection: dict[str, Any]
    duplicate_info: dict[str, Any] | None
    skip_response: bool

    plan: dict[str, Any]
    execution: dict[str, Any]
    notifications: dict[str, Any]
    response: dict[str, Any]
    impact: dict[str, Any]

    warnings: Annotated[list[str], operator.add]
    fallback_sources_used: list[str]
    degraded_mode: bool
    status: str
    errors: list[str]

    llm_calls: int
    human_review_required: bool

    # Verification subgraph
    field_report: str
    verification: dict[str, Any]
    retraction_result: dict[str, Any] | None

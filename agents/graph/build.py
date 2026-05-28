"""Compile LangGraph pipelines."""

from __future__ import annotations

from functools import lru_cache

from langgraph.graph import END, StateGraph

from agents.graph.edges import route_after_detect
from agents.graph.nodes.compress import compress_signals_node
from agents.graph.nodes.detect import detect_node
from agents.graph.nodes.execute import execute_node
from agents.graph.nodes.finalize import (
    finalize_complete_node,
    finalize_duplicate_node,
    finalize_review_node,
)
from agents.graph.nodes.impact import impact_node
from agents.graph.nodes.ingest import ingest_node
from agents.graph.nodes.notify import notify_node
from agents.graph.nodes.plan import plan_node
from agents.graph.state import CrisisState
from agents.graph.verification import build_verification_graph


def _build_main_graph():
    graph = StateGraph(CrisisState)

    graph.add_node("ingest", ingest_node)
    graph.add_node("compress", compress_signals_node)
    graph.add_node("detect", detect_node)
    graph.add_node("plan_resources", plan_node)
    graph.add_node("execute_actions", execute_node)
    graph.add_node("notify_stakeholders", notify_node)
    graph.add_node("assess_impact", impact_node)
    graph.add_node("finalize_complete", finalize_complete_node)
    graph.add_node("finalize_duplicate", finalize_duplicate_node)
    graph.add_node("finalize_review", finalize_review_node)

    graph.set_entry_point("ingest")
    graph.add_edge("ingest", "compress")
    graph.add_edge("compress", "detect")
    graph.add_conditional_edges(
        "detect",
        route_after_detect,
        {
            "plan_resources": "plan_resources",
            "finalize_duplicate": "finalize_duplicate",
            "finalize_review": "finalize_review",
        },
    )
    graph.add_edge("plan_resources", "execute_actions")
    graph.add_edge("execute_actions", "notify_stakeholders")
    graph.add_edge("notify_stakeholders", "assess_impact")
    graph.add_edge("assess_impact", "finalize_complete")
    graph.add_edge("finalize_complete", END)
    graph.add_edge("finalize_duplicate", END)
    graph.add_edge("finalize_review", END)

    return graph.compile()


@lru_cache(maxsize=1)
def compile_main_graph():
    return _build_main_graph()


@lru_cache(maxsize=1)
def compile_verification_graph():
    return build_verification_graph()

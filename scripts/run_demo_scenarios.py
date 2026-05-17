#!/usr/bin/env python3
"""
Run CIRO demo scenarios and print signal IDs for video / Bruno testing.

Usage:
  python scripts/run_demo_scenarios.py [--scenario 1|2|3|all]
"""

from __future__ import annotations

import argparse
import pathlib
import sys
import time
import uuid

_REPO = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_REPO))

from dotenv import load_dotenv
load_dotenv(_REPO / ".env")

sys.path.insert(0, str(_REPO / "backend"))
from app.database.mock_store import incident_store, reset_resource_ledger
from agents.adk_orchestrator import process_signal, verify_incident


def _wait(signal_id: str, timeout: int = 120) -> dict:
    for _ in range(timeout):
        rec = incident_store.get(signal_id)
        if rec and rec.get("status") in ("completed", "error", "corrected", "false_alarm"):
            return rec
        time.sleep(1)
    return incident_store.get(signal_id, {"status": "timeout"})


def scenario_1_flood() -> str:
    """G-10 flooding happy path."""
    sid = str(uuid.uuid4())
    process_signal(sid, {
        "location": "G-10, Islamabad",
        "description": "Streets flooded in G-10! Water entering homes. Need help NOW!",
        "enable_weather": True,
        "enable_traffic": True,
        "enable_social": True,
        "enable_emergency_call": True,
    })
    rec = _wait(sid)
    print(f"\n=== Scenario 1: G-10 Flood ===")
    print(f"signal_id: {sid}")
    print(f"status: {rec.get('status')}")
    print(f"crisis: {rec.get('detection', {}).get('classification', {}).get('crisis_type')}")
    return sid


def scenario_2_multi_crisis() -> tuple[str, str]:
    """G-10 flood + F-8 heatwave."""
    flood_id = str(uuid.uuid4())
    heat_id = str(uuid.uuid4())

    process_signal(flood_id, {
        "location": "G-10, Islamabad",
        "description": "Streets flooded in G-10!",
        "enable_weather": True,
        "enable_traffic": True,
        "enable_social": True,
        "enable_emergency_call": True,
    })
    time.sleep(2)
    process_signal(heat_id, {
        "location": "F-8, Islamabad",
        "description": "Elderly collapsing from heat in F-8.",
        "enable_weather": True,
        "enable_traffic": True,
        "enable_social": True,
        "enable_emergency_call": False,
    })

    flood_rec = _wait(flood_id)
    heat_rec = _wait(heat_id)
    print(f"\n=== Scenario 2: Multi-Crisis ===")
    print(f"flood_signal_id: {flood_id} -> {flood_rec.get('status')}")
    print(f"heat_signal_id: {heat_id} -> {heat_rec.get('status')}")
    tradeoffs = heat_rec.get("response", {}).get("plan", {}).get("multi_crisis_tradeoffs", "")
    if tradeoffs:
        print(f"tradeoffs: {tradeoffs[:120]}...")
    return flood_id, heat_id


def scenario_3_false_alarm(flood_id: str | None = None) -> str:
    """False alarm correction after flood detection."""
    sid = flood_id or scenario_1_flood()
    if flood_id is None:
        pass  # already waited in scenario_1_flood
    else:
        _wait(sid)

    verify_incident(sid, "Field report: broken water main only, not flooding. Water levels normal.")
    rec = _wait(sid)
    print(f"\n=== Scenario 3: False Alarm Correction ===")
    print(f"signal_id: {sid}")
    print(f"status: {rec.get('status')}")
    print(f"verification: {rec.get('verification', {}).get('verification_status')}")
    print(f"retracted: {rec.get('retraction_result', {}).get('status')}")
    return sid


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--scenario", choices=["1", "2", "3", "all"], default="all")
    args = parser.parse_args()

    reset_resource_ledger()
    incident_store.clear()

    if args.scenario in ("1", "all"):
        scenario_1_flood()
    if args.scenario in ("2", "all"):
        scenario_2_multi_crisis()
    if args.scenario in ("3", "all"):
        flood_id = None
        if args.scenario == "3":
            flood_id = scenario_1_flood()
        scenario_3_false_alarm(flood_id if args.scenario == "3" else None)

    print("\nTraces: agents/traces/trace_log.jsonl")


if __name__ == "__main__":
    main()

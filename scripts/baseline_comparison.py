#!/usr/bin/env python3
"""
Compare legacy stub orchestrator vs ADK orchestrator on the same payload.
"""

from __future__ import annotations

import json
import pathlib
import sys
import uuid

_REPO = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_REPO))

from dotenv import load_dotenv
load_dotenv(_REPO / ".env")

sys.path.insert(0, str(_REPO / "backend"))
from app.database.mock_store import incident_store, reset_resource_ledger
from agents.orchestrator import process_signal as stub_process
from agents.adk_orchestrator import process_signal as adk_process


PAYLOAD = {
    "location": "G-10, Islamabad",
    "description": "Streets flooded with water entering homes",
}


def _summary(record: dict) -> dict:
    if "detection" in record and "classification" in record.get("detection", {}):
        det = record["detection"]["classification"]
    else:
        det = record.get("detection", {})
    return {
        "status": record.get("status"),
        "crisis_type": det.get("crisis_type"),
        "severity": det.get("severity") or record.get("detection", {}).get("severity", {}).get("severity"),
        "confidence": det.get("confidence"),
        "has_impact": "impact" in record,
        "has_notifications": bool(record.get("response", {}).get("notifications")),
        "action_count": len(record.get("response", {}).get("execution", {}).get("executed_actions", [])),
    }


def main():
    reset_resource_ledger()
    incident_store.clear()

    stub_id = str(uuid.uuid4())
    adk_id = str(uuid.uuid4())

    print("Running legacy stub orchestrator...")
    stub_process(stub_id, PAYLOAD)

    print("Running ADK orchestrator (requires GOOGLE_API_KEY or will error)...")
    try:
        adk_process(adk_id, PAYLOAD)
    except Exception as e:
        print(f"ADK run failed (expected without API key): {e}")
        adk_record = {"status": "error", "error": str(e)}
    else:
        adk_record = incident_store.get(adk_id, {})

    stub_record = incident_store.get(stub_id, {})
    comparison = {
        "payload": PAYLOAD,
        "stub": _summary(stub_record),
        "adk": _summary(adk_record) if adk_record else {},
        "advantage_adk": [
            "Multi-source signal fusion with credibility scoring",
            "Structured severity prediction with evolution fields",
            "Per-action tool execution with alert_id tracking",
            "False alarm verification and alert retraction",
            "Degraded mode and fallback source handling",
        ],
    }

    out_path = _REPO / "scripts" / "baseline_comparison_output.json"
    out_path.write_text(json.dumps(comparison, indent=2), encoding="utf-8")
    print(json.dumps(comparison, indent=2))
    print(f"\nWritten to {out_path}")


if __name__ == "__main__":
    main()

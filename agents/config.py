"""
NigehbaanAI – Agent Configuration & Trace Logging

Centralised configuration for all ADK agents:
  - Model selection (Gemini 2.0 Flash)
  - Trace logging (JSONL)
  - Shared constants
"""

from __future__ import annotations

import datetime
import json
import os
import pathlib
from typing import Any

from dotenv import load_dotenv

# Load .env from repo root
_REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
load_dotenv(_REPO_ROOT / ".env")

# ── Model Configuration ─────────────────────────────────────────────────────

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
MODEL_ID = "gemini-2.0-flash"

# ── Trace Logging ────────────────────────────────────────────────────────────

TRACE_DIR = pathlib.Path(__file__).parent / "traces"
TRACE_DIR.mkdir(exist_ok=True)
TRACE_FILE = TRACE_DIR / "trace_log.jsonl"


def log_trace(
    signal_id: str,
    agent: str,
    event: str,
    data: dict[str, Any] | None = None,
) -> dict:
    """
    Append a structured trace entry (JSONL) for submission evidence.
    Also returns the entry dict so callers can use it.
    """
    entry = {
        "ts": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
        "signal_id": signal_id,
        "agent": agent,
        "event": event,
        **(data or {}),
    }
    with TRACE_FILE.open("a") as f:
        f.write(json.dumps(entry) + "\n")
    return entry


def get_traces(signal_id: str) -> list[dict]:
    """Read all trace entries for a given signal_id."""
    traces = []
    if not TRACE_FILE.exists():
        return traces
    with TRACE_FILE.open() as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                if entry.get("signal_id") == signal_id:
                    traces.append(entry)
            except json.JSONDecodeError:
                continue
    return traces


# ── Resource Defaults ────────────────────────────────────────────────────────

DEFAULT_RESOURCES = {
    "ambulances": 8,
    "police_units": 12,
    "rescue_teams": 5,
    "water_tankers": 4,
    "generators": 3,
    "drones": 2,
    "shelters": 6,
    "field_teams": 10,
}

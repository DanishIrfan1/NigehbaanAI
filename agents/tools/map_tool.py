"""
map_tool.py – Traffic rerouting simulation tool.

Called by the Executor agent to simulate road network rerouting
during a crisis. Returns a structured impact report.

[SIMULATED] – No real map API is called in the prototype.
"""

from __future__ import annotations
import datetime


# Mock rerouting table – replace with real Google Maps / OSM API
MOCK_REROUTE_TABLE: dict[str, dict] = {
    "G-10": {
        "blocked_route": "G-10 Markaz → Faizabad via 9th Avenue",
        "alternate_route": "G-10 → I-8 → Murree Road → Faizabad",
        "extra_distance_km": 4.2,
        "congestion_reduction_pct": 38,
        "estimated_clearance_min": 45,
    },
    "F-8": {
        "blocked_route": "F-8 Markaz → Jinnah Avenue",
        "alternate_route": "F-8 → F-7 → Margalla Road → Jinnah Avenue",
        "extra_distance_km": 2.1,
        "congestion_reduction_pct": 25,
        "estimated_clearance_min": 30,
    },
}

DEFAULT_REROUTE = {
    "blocked_route": "Primary route",
    "alternate_route": "Secondary route via city bypass",
    "extra_distance_km": 3.0,
    "congestion_reduction_pct": 20,
    "estimated_clearance_min": 40,
}


def simulate_rerouting(location: str) -> dict:
    """
    Simulate traffic rerouting for the given crisis location.

    Args:
        location: Crisis location string (e.g., "G-10, Islamabad")

    Returns:
        Structured rerouting impact dict.
    """
    # Fuzzy-match location against mock table
    key = next((k for k in MOCK_REROUTE_TABLE if k.lower() in location.lower()), None)
    data = MOCK_REROUTE_TABLE.get(key, DEFAULT_REROUTE) if key else DEFAULT_REROUTE

    return {
        "status": "[SIMULATED] success",
        "location": location,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
        **data,
    }

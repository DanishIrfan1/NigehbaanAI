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


# Ambulance-specific reroute data
MOCK_AMBULANCE_ROUTES: dict[str, dict] = {
    "G-10": {
        "blocked_roads": ["9th Avenue", "G-10 Markaz main road"],
        "alternate_route": "G-10 → I-8 service road → Murree Road → hospital",
        "route_coordinates": [
            {"lat": 33.6844, "lng": 73.0479},
            {"lat": 33.6900, "lng": 73.0550},
            {"lat": 33.6950, "lng": 73.0620},
        ],
        "eta_before_min": 25,
        "eta_after_min": 12,
    },
    "F-8": {
        "blocked_roads": ["Jinnah Avenue southbound"],
        "alternate_route": "F-8 → F-7 → Margalla Road → hospital",
        "route_coordinates": [
            {"lat": 33.7100, "lng": 73.0400},
            {"lat": 33.7050, "lng": 73.0500},
        ],
        "eta_before_min": 18,
        "eta_after_min": 10,
    },
}

DEFAULT_AMBULANCE = {
    "blocked_roads": ["Primary crisis corridor"],
    "alternate_route": "Bypass via secondary arterial",
    "route_coordinates": [],
    "eta_before_min": 20,
    "eta_after_min": 11,
}


def simulate_ambulance_reroute(
    location: str,
    blocked_roads: list[str] | None = None,
) -> dict:
    """
    Simulate optimal ambulance route around blocked roads.

    Args:
        location: Crisis location string.
        blocked_roads: Optional list of blocked road names from traffic data.

    Returns:
        Structured ambulance routing impact dict.
    """
    key = next((k for k in MOCK_AMBULANCE_ROUTES if k.lower() in location.lower()), None)
    data = dict(MOCK_AMBULANCE_ROUTES.get(key, DEFAULT_AMBULANCE)) if key else dict(DEFAULT_AMBULANCE)

    if blocked_roads:
        data["blocked_roads"] = list(set(data.get("blocked_roads", []) + blocked_roads))

    eta_before = data.get("eta_before_min", 20)
    eta_after = data.get("eta_after_min", 11)

    return {
        "status": "[SIMULATED] success",
        "location": location,
        "action": "ambulance_reroute",
        "blocked_roads": data.get("blocked_roads", []),
        "alternate_route": data.get("alternate_route", ""),
        "route_coordinates": data.get("route_coordinates", []),
        "ambulance_eta_min": {
            "before": eta_before,
            "after": eta_after,
            "change": eta_after - eta_before,
        },
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
    }

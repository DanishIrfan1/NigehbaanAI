"""
traffic_tool.py – Traffic data ingestion tool for ADK agents.

Returns current traffic conditions and incident reports for a location.
Uses mock data for the hackathon prototype.
[SIMULATED] – No real traffic API called.
"""

from __future__ import annotations

import datetime


# Mock traffic database
_TRAFFIC_DB: dict[str, dict] = {
    "g-10": {
        "location": "G-10 Markaz, Islamabad",
        "congestion_level": "severe",
        "speed_kmh": 5,
        "normal_speed_kmh": 60,
        "speed_reduction_pct": 92,
        "incident_flag": True,
        "incident_type": "road_blockage",
        "blocked_roads": [
            "G-10 Markaz → Faizabad via 9th Avenue",
            "G-10/3 internal roads",
        ],
        "affected_lanes": 4,
        "estimated_clearance_min": 120,
        "public_transport_disrupted": True,
    },
    "f-8": {
        "location": "F-8 Markaz, Islamabad",
        "congestion_level": "moderate",
        "speed_kmh": 25,
        "normal_speed_kmh": 60,
        "speed_reduction_pct": 58,
        "incident_flag": False,
        "incident_type": None,
        "blocked_roads": [],
        "affected_lanes": 0,
        "estimated_clearance_min": 0,
        "public_transport_disrupted": False,
    },
    "ijp": {
        "location": "IJP Road, Islamabad",
        "congestion_level": "moderate",
        "speed_kmh": 30,
        "normal_speed_kmh": 60,
        "speed_reduction_pct": 50,
        "incident_flag": False,
        "incident_type": None,
        "blocked_roads": [],
        "affected_lanes": 0,
        "estimated_clearance_min": 0,
        "public_transport_disrupted": False,
    },
}

_DEFAULT = {
    "congestion_level": "normal",
    "speed_kmh": 55,
    "normal_speed_kmh": 60,
    "speed_reduction_pct": 8,
    "incident_flag": False,
    "incident_type": None,
    "blocked_roads": [],
    "affected_lanes": 0,
    "estimated_clearance_min": 0,
    "public_transport_disrupted": False,
}


def fetch_traffic(location: str) -> dict:
    """
    Fetch current traffic conditions for a location.

    Args:
        location: Location string (e.g. "G-10, Islamabad")

    Returns:
        Dict with congestion level, speed, incidents, blocked roads, etc.
    """
    loc_lower = location.lower()
    key = next((k for k in _TRAFFIC_DB if k in loc_lower), None)
    data = _TRAFFIC_DB.get(key, _DEFAULT) if key else _DEFAULT

    return {
        "source": "traffic_api",
        "source_type": "official_sensor",
        "credibility": 0.90,
        "location": location,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "data_quality": "real_time",
        **data,
    }

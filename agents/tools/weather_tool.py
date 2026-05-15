"""
weather_tool.py – Weather data ingestion tool for ADK agents.

Returns current weather conditions for a given location.
Uses mock data for the hackathon prototype.
[SIMULATED] – No real weather API called.
"""

from __future__ import annotations

import datetime


# Mock weather database – keyed by area keywords
_WEATHER_DB: dict[str, dict] = {
    "g-10": {
        "location": "G-10, Islamabad",
        "condition": "heavy_rain",
        "rainfall_mm_per_hour": 45,
        "temperature_c": 28,
        "humidity_pct": 92,
        "wind_speed_kmh": 35,
        "visibility_km": 2,
        "flood_risk": "high",
        "alert_level": "red",
    },
    "f-8": {
        "location": "F-8, Islamabad",
        "condition": "extreme_heat",
        "rainfall_mm_per_hour": 0,
        "temperature_c": 46,
        "humidity_pct": 20,
        "wind_speed_kmh": 8,
        "visibility_km": 10,
        "flood_risk": "none",
        "alert_level": "orange",
    },
    "i-8": {
        "location": "I-8, Islamabad",
        "condition": "partly_cloudy",
        "rainfall_mm_per_hour": 5,
        "temperature_c": 32,
        "humidity_pct": 65,
        "wind_speed_kmh": 12,
        "visibility_km": 8,
        "flood_risk": "low",
        "alert_level": "green",
    },
}

_DEFAULT = {
    "condition": "clear",
    "rainfall_mm_per_hour": 0,
    "temperature_c": 30,
    "humidity_pct": 50,
    "wind_speed_kmh": 10,
    "visibility_km": 10,
    "flood_risk": "none",
    "alert_level": "green",
}


def fetch_weather(location: str) -> dict:
    """
    Fetch current weather conditions for a location.

    Args:
        location: Location string (e.g. "G-10, Islamabad")

    Returns:
        Dict with weather conditions, temperature, rainfall, flood risk, etc.
    """
    loc_lower = location.lower()
    key = next((k for k in _WEATHER_DB if k in loc_lower), None)
    data = _WEATHER_DB.get(key, _DEFAULT) if key else _DEFAULT

    return {
        "source": "weather_api",
        "source_type": "official_sensor",
        "credibility": 0.95,
        "location": location,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "data_quality": "real_time",
        **data,
    }

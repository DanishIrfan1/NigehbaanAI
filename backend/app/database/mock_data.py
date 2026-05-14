"""
Mock crisis datasets used by agent tools and tests.

Each entry simulates data that would come from real external APIs.
Clearly labeled as synthetic / mock data – no personal information included.
"""

MOCK_WEATHER_EVENTS = [
    {
        "location": "G-10, Islamabad",
        "condition": "heavy_rain",
        "rainfall_mm_per_hour": 45,
        "temperature_c": 28,
        "humidity_pct": 92,
    },
    {
        "location": "F-8, Islamabad",
        "condition": "extreme_heat",
        "temperature_c": 46,
        "humidity_pct": 20,
    },
]

MOCK_TRAFFIC_EVENTS = [
    {
        "location": "G-10 Markaz",
        "congestion_level": "severe",
        "speed_kmh": 5,
        "normal_speed_kmh": 60,
        "incident_flag": True,
    },
    {
        "location": "IJP Road",
        "congestion_level": "moderate",
        "speed_kmh": 25,
        "normal_speed_kmh": 60,
        "incident_flag": False,
    },
]

MOCK_SOCIAL_POSTS = [
    {
        "text": "Streets flooded in G-10! Water entering homes. Need help NOW!",
        "location_hint": "G-10",
        "urgency": "high",
        "credibility_score": 0.85,
    },
    {
        "text": "Looks like a water main burst near G-10 markaz, not flooding",
        "location_hint": "G-10",
        "urgency": "medium",
        "credibility_score": 0.60,
    },
    {
        "text": "Elderly people collapsing from heat in F-8. Medical help needed.",
        "location_hint": "F-8",
        "urgency": "high",
        "credibility_score": 0.78,
    },
]

MOCK_RESOURCES = {
    "ambulances": 8,
    "police_units": 12,
    "rescue_teams": 5,
    "water_tankers": 4,
    "generators": 3,
    "drones": 2,
    "shelters": 6,
    "field_teams": 10,
}

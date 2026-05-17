"""
emergency_call_tool.py – Simulated emergency call ingestion tool.

[CREATIVE FEATURE] Simulates an emergency number (1122) receiving calls.
The call is "transcribed" and key information is extracted.
This serves as the highest-credibility signal source.

[SIMULATED] – No real telephony API called.
"""

from __future__ import annotations

import datetime


# Mock emergency call transcriptions
_CALL_DB: dict[str, dict] = {
    "g-10": {
        "call_id": "CALL-2026-0516-001",
        "caller_number": "+92-3XX-XXXXXXX",
        "duration_seconds": 45,
        "language": "urdu",
        "raw_transcription": (
            "Assalam o alaikum, mera naam Rashid hai, main G-10/2 se bol raha hoon. "
            "Yahan pani ghar mein aa raha hai, bohut tez baarish hai aur sarak pe "
            "gaadiyan phans gayi hain. Bachon ko nikalna mushkil ho raha hai. "
            "Please jaldi rescue bhejein!"
        ),
        "raw_transcription_english": (
            "Hello, my name is Rashid, I am calling from G-10/2. "
            "Water is entering our house, there is very heavy rain and "
            "cars are stuck on the road. It is difficult to evacuate children. "
            "Please send rescue quickly!"
        ),
        "extracted_info": {
            "caller_name": "Rashid",
            "location": "G-10/2, Islamabad",
            "crisis_type": "flooding",
            "urgency": "critical",
            "affected_people": "family_with_children",
            "specific_issues": [
                "water_entering_homes",
                "vehicles_stranded",
                "child_evacuation_needed",
            ],
            "requested_help": "rescue_team",
        },
    },
    "f-8": {
        "call_id": "CALL-2026-0516-002",
        "caller_number": "+92-3XX-XXXXXXX",
        "duration_seconds": 30,
        "language": "urdu",
        "raw_transcription": (
            "Main F-8 se bol rahi hoon, mere ammi abbu dono behosh ho gaye hain "
            "garmi ki wajah se. AC band hai bijli nahi hai. "
            "Ambulance bhejein please!"
        ),
        "raw_transcription_english": (
            "I am calling from F-8, both my parents have fainted "
            "due to the heat. AC is off, there is no electricity. "
            "Please send an ambulance!"
        ),
        "extracted_info": {
            "caller_name": "unknown",
            "location": "F-8, Islamabad",
            "crisis_type": "heatwave",
            "urgency": "critical",
            "affected_people": "elderly_couple",
            "specific_issues": [
                "heat_exhaustion",
                "power_outage",
                "elderly_unconscious",
            ],
            "requested_help": "ambulance",
        },
    },
}


def fetch_emergency_call(location: str) -> dict:
    """
    Fetch the latest emergency call transcription for a location.

    This simulates the 1122 emergency number receiving and processing calls.
    The transcription is extracted with key crisis information.

    Args:
        location: Location string (e.g. "G-10, Islamabad")

    Returns:
        Dict with call details, transcription, and extracted crisis info.
        Returns empty call record if no calls exist for the area.
    """
    loc_lower = location.lower()
    key = next((k for k in _CALL_DB if k in loc_lower), None)

    if key and key in _CALL_DB:
        call_data = _CALL_DB[key]
        return {
            "source": "emergency_call_1122",
            "source_type": "emergency_hotline",
            "credibility": 0.98,  # Highest credibility — direct human report
            "location": location,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
            "data_quality": "direct_report",
            "has_call": True,
            **call_data,
        }
    else:
        return {
            "source": "emergency_call_1122",
            "source_type": "emergency_hotline",
            "credibility": 0.98,
            "location": location,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
            "data_quality": "no_data",
            "has_call": False,
            "call_id": None,
            "message": f"No emergency calls received from {location} area.",
        }

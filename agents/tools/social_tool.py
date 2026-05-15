"""
social_tool.py – Social media / citizen report ingestion tool for ADK agents.

Returns social media posts, citizen complaints, and field reports for a location.
Uses mock data for the hackathon prototype.
[SIMULATED] – No real social media API called.
"""

from __future__ import annotations

import datetime


# Mock social media posts database
_SOCIAL_DB: dict[str, list[dict]] = {
    "g-10": [
        {
            "text": "Streets flooded in G-10! Water entering homes. Need help NOW! #Islamabad #flood",
            "text_urdu": "جی-10 میں سڑکیں ڈوب گئی ہیں! پانی گھروں میں آ رہا ہے۔ ابھی مدد چاہیے!",
            "user": "citizen_001",
            "location_hint": "G-10, Islamabad",
            "urgency_language": "high",
            "mention_velocity": 45,  # mentions per hour
            "credibility_score": 0.85,
            "media_attached": True,
            "timestamp": "2026-05-16T02:15:00Z",
        },
        {
            "text": "Looks like a water main burst near G-10 markaz, not flooding from rain",
            "text_urdu": "لگتا ہے جی-10 مارکز کے قریب واٹر مین پھٹ گئی ہے، بارش سے سیلاب نہیں",
            "user": "citizen_002",
            "location_hint": "G-10 Markaz",
            "urgency_language": "medium",
            "mention_velocity": 12,
            "credibility_score": 0.60,
            "media_attached": False,
            "timestamp": "2026-05-16T02:20:00Z",
        },
        {
            "text": "Cars stuck on 9th Avenue near G-10, water level rising fast",
            "text_urdu": "جی-10 کے قریب 9ویں ایونیو پر گاڑیاں پھنسی ہیں، پانی کی سطح تیزی سے بڑھ رہی ہے",
            "user": "citizen_003",
            "location_hint": "9th Avenue, G-10",
            "urgency_language": "high",
            "mention_velocity": 45,
            "credibility_score": 0.78,
            "media_attached": True,
            "timestamp": "2026-05-16T02:22:00Z",
        },
    ],
    "f-8": [
        {
            "text": "Elderly people collapsing from heat in F-8. Medical help needed urgently!",
            "text_urdu": "ایف-8 میں بزرگ لوگ گرمی سے بے ہوش ہو رہے ہیں۔ فوری طبی مدد درکار!",
            "user": "citizen_004",
            "location_hint": "F-8, Islamabad",
            "urgency_language": "high",
            "mention_velocity": 22,
            "credibility_score": 0.78,
            "media_attached": False,
            "timestamp": "2026-05-16T02:30:00Z",
        },
        {
            "text": "No electricity in F-8 sector 2 since morning, AC is off and people are suffering",
            "text_urdu": "ایف-8 سیکٹر 2 میں صبح سے بجلی نہیں، اے سی بند ہے اور لوگ تکلیف میں ہیں",
            "user": "citizen_005",
            "location_hint": "F-8/2, Islamabad",
            "urgency_language": "medium",
            "mention_velocity": 15,
            "credibility_score": 0.72,
            "media_attached": False,
            "timestamp": "2026-05-16T02:35:00Z",
        },
    ],
}


def fetch_social_posts(location: str) -> dict:
    """
    Fetch social media posts and citizen reports for a location.

    Args:
        location: Location string (e.g. "G-10, Islamabad")

    Returns:
        Dict with list of posts, aggregate stats, and overall urgency assessment.
    """
    loc_lower = location.lower()
    key = next((k for k in _SOCIAL_DB if k in loc_lower), None)
    posts = _SOCIAL_DB.get(key, []) if key else []

    # Compute aggregate stats
    total_posts = len(posts)
    avg_credibility = (
        sum(p["credibility_score"] for p in posts) / total_posts
        if total_posts > 0
        else 0.0
    )
    max_urgency = (
        max(p["urgency_language"] for p in posts) if total_posts > 0 else "none"
    )
    total_velocity = (
        sum(p["mention_velocity"] for p in posts) if total_posts > 0 else 0
    )
    has_contradictions = total_posts > 1 and any(
        "not" in p["text"].lower() or "burst" in p["text"].lower() for p in posts
    )

    return {
        "source": "social_media",
        "source_type": "citizen_reports",
        "credibility": round(avg_credibility, 2),
        "location": location,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "data_quality": "crowd_sourced",
        "post_count": total_posts,
        "mention_velocity_per_hour": total_velocity,
        "max_urgency": max_urgency,
        "has_contradictions": has_contradictions,
        "posts": posts,
    }

"""
alert_tool.py – Stakeholder notification simulation tool.

Called by the Executor agent to dispatch tailored alerts to:
  public | emergency_services | hospital | utility | transport | media

[SIMULATED] – No real SMS/push/email API is called in the prototype.
"""

from __future__ import annotations
import datetime

# Template library – each crisis type × channel has a message template
ALERT_TEMPLATES: dict[str, dict[str, str]] = {
    "urban_flooding": {
        "public": (
            "[SIMULATED] ⚠️ Flash flood alert for {location}. "
            "Move to higher ground. Avoid underpasses. Call 1122 for emergencies."
        ),
        "hospital": (
            "[SIMULATED] Flood trauma incoming from {location}. "
            "Prepare {beds} emergency beds and trauma team."
        ),
        "transport_authority": (
            "[SIMULATED] Reroute all buses away from {location}. "
            "Use designated alternate routes."
        ),
        "utility": (
            "[SIMULATED] Possible water-main stress at {location}. "
            "Deploy inspection crew."
        ),
        "media": (
            "[SIMULATED] INCIDENT DECLARED: Urban flooding at {location}. "
            "Severity: {severity}. Response teams deployed."
        ),
        "emergency_services": (
            "[SIMULATED] PRIORITY DISPATCH to {location}. "
            "Urban flooding confirmed. Rescue teams required."
        ),
    },
    "heatwave": {
        "public": (
            "[SIMULATED] ⚠️ Extreme heat warning for {location}. "
            "Stay indoors. Drink water. Check on elderly neighbours."
        ),
        "hospital": (
            "[SIMULATED] Heatstroke cases expected from {location}. "
            "Activate cooling centres. Prepare IV fluids."
        ),
        "transport_authority": (
            "[SIMULATED] Deploy water distribution vehicles in {location}."
        ),
        "utility": (
            "[SIMULATED] Monitor power grid in {location} for surge demand."
        ),
        "media": (
            "[SIMULATED] HEAT EMERGENCY at {location}. "
            "Severity: {severity}. Medical teams deployed."
        ),
        "emergency_services": (
            "[SIMULATED] PRIORITY DISPATCH to {location}. "
            "Heat emergency. Medical outreach required."
        ),
    },
}

DEFAULT_TEMPLATE = (
    "[SIMULATED] ⚠️ Emergency alert for {location}. "
    "Severity: {severity}. Crisis type: {crisis_type}. "
    "Responders are on the way."
)


def send_alert(
    channel: str,
    location: str,
    crisis_type: str,
    severity: str,
    beds: int = 10,
) -> dict:
    """
    Simulate sending a stakeholder alert.

    Args:
        channel:     Target audience (public | hospital | transport_authority |
                     utility | media | emergency_services)
        location:    Crisis location string
        crisis_type: Classified crisis type
        severity:    low | medium | high | critical
        beds:        Number of hospital beds to request (hospital channel only)

    Returns:
        Dict with delivery status and message text.
    """
    templates = ALERT_TEMPLATES.get(crisis_type, {})
    template = templates.get(channel, DEFAULT_TEMPLATE)

    message = template.format(
        location=location,
        severity=severity,
        crisis_type=crisis_type,
        beds=beds,
    )

    return {
        "status": "[SIMULATED] sent",
        "channel": channel,
        "location": location,
        "crisis_type": crisis_type,
        "severity": severity,
        "message": message,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
    }


def retract_alert(
    original_alert_id: str,
    location: str,
    corrected_type: str,
    reason: str,
) -> dict:
    """
    Simulate retracting a previously sent alert (false alarm handling).
    """
    return {
        "status": "[SIMULATED] retracted",
        "original_alert_id": original_alert_id,
        "location": location,
        "corrected_type": corrected_type,
        "reason": reason,
        "apology_note": (
            f"[SIMULATED] We apologise for the earlier alert regarding {location}. "
            f"After field verification, the incident has been reclassified as: {corrected_type}. "
            "All clear for the original crisis type."
        ),
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
    }

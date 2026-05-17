"""
NigehbaanAI – ADK-style Orchestrator

Uses Gemini 2.0 Flash to power a multi-agent pipeline:
  Stage 1 (Parallel): Signal Ingestion — weather, traffic, social, emergency call
  Stage 2 (Sequential): Signal Fusion → Crisis Classification → Severity Prediction
  Stage 3 (Sequential): Resource Planning → Action Execution → Stakeholder Notification
  Stage 4 (Conditional): Verification & False Alarm Handling

Each "agent" is an LLM call with a focused prompt + tool access.
All reasoning traces are logged to JSONL for submission evidence.
"""

from __future__ import annotations

import traceback

from agents.config import log_trace
from agents.tools.weather_tool import fetch_weather
from agents.tools.traffic_tool import fetch_traffic
from agents.tools.social_tool import fetch_social_posts
from agents.tools.emergency_call_tool import fetch_emergency_call

# ── Import Modular Agents ───────────────────────────────────────────────────

# Stage 2: Detection
from agents.detector.signal_fusion_agent import run_signal_fusion
from agents.detector.classifier_agent import run_classifier
from agents.detector.severity_agent import run_severity_predictor

# Stage 3: Response
from agents.planner.resource_agent import run_resource_planner
from agents.executor.action_agent import run_action_executor
from agents.executor.notifier_agent import run_stakeholder_notifier

# Stage 4: Robustness
from agents.verifier.verification_agent import run_verification_agent
from agents.tools.alert_tool import retract_alert


# ── Stage 1: Signal Ingestion (Parallel in concept) ──────────────────────────

def _ingest_signals(signal_id: str, location: str, description: str) -> dict:
    """
    Fetch data from all signal sources.
    In a full ADK setup this would be a ParallelAgent.
    """
    log_trace(signal_id, "orchestrator", "stage1_ingestion_start", {"location": location})

    weather = fetch_weather(location)
    log_trace(signal_id, "weather_ingestor", "data_fetched", {
        "condition": weather.get("condition"),
        "rainfall": weather.get("rainfall_mm_per_hour"),
        "credibility": weather.get("credibility"),
    })

    traffic = fetch_traffic(location)
    log_trace(signal_id, "traffic_ingestor", "data_fetched", {
        "congestion": traffic.get("congestion_level"),
        "speed_kmh": traffic.get("speed_kmh"),
        "incident": traffic.get("incident_flag"),
        "credibility": traffic.get("credibility"),
    })

    social = fetch_social_posts(location)
    log_trace(signal_id, "social_ingestor", "data_fetched", {
        "post_count": social.get("post_count"),
        "max_urgency": social.get("max_urgency"),
        "has_contradictions": social.get("has_contradictions"),
        "credibility": social.get("credibility"),
    })

    emergency = fetch_emergency_call(location)
    log_trace(signal_id, "emergency_call_ingestor", "data_fetched", {
        "has_call": emergency.get("has_call"),
        "credibility": emergency.get("credibility"),
        "language": emergency.get("language", "n/a"),
    })

    log_trace(signal_id, "orchestrator", "stage1_ingestion_complete", {
        "sources_collected": 4,
    })

    return {
        "user_description": description,
        "weather": weather,
        "traffic": traffic,
        "social": social,
        "emergency_call": emergency,
    }


# ── Stage 3d: Impact Assessment (computed, not LLM) ──────────────────────────

def _compute_impact(
    signal_id: str,
    classification: dict,
    execution: dict,
) -> dict:
    """Compute before/after impact metrics."""
    log_trace(signal_id, "impact_assessor", "computing_impact", {})

    # Simulated before/after metrics
    crisis_type = classification.get("crisis_type", "unknown")

    if crisis_type == "urban_flooding":
        impact = {
            "traffic_congestion": {"before_pct": 87, "after_pct": 23, "change": -64},
            "response_time_min": {"before": None, "after": 8},
            "citizens_alerted": {"before": 0, "after": 4200},
            "ambulance_eta_min": {"before": 25, "after": 12, "change": -13},
            "crisis_status": {"before": "ACTIVE", "after": "MANAGED"},
            "rescue_teams_deployed": len(execution.get("executed_actions", [])),
        }
    elif crisis_type == "heatwave":
        impact = {
            "cooling_centers_active": {"before": 0, "after": 3},
            "response_time_min": {"before": None, "after": 12},
            "citizens_alerted": {"before": 0, "after": 2800},
            "medical_teams_deployed": {"before": 0, "after": 5},
            "crisis_status": {"before": "ACTIVE", "after": "MANAGED"},
        }
    else:
        impact = {
            "response_time_min": {"before": None, "after": 15},
            "citizens_alerted": {"before": 0, "after": 1000},
            "crisis_status": {"before": "ACTIVE", "after": "UNDER_REVIEW"},
        }

    log_trace(signal_id, "impact_assessor", "impact_computed", {
        "crisis_status": impact.get("crisis_status", {}).get("after"),
    })

    return impact


def _get_active_incidents(incident_store: dict, signal_id: str) -> list[dict]:
    """Collect other active incidents for resource trade-off reasoning."""
    active_statuses = {"processing", "analyzing", "planning", "executing"}
    return [
        {
            "signal_id": key,
            "type": value.get("detection", {}).get("classification", {}).get("crisis_type"),
            "severity": value.get("detection", {}).get("severity", {}).get("severity"),
        }
        for key, value in incident_store.items()
        if value.get("status") in active_statuses and key != signal_id
    ]


def _run_response_pipeline(
    signal_id: str,
    classification: dict,
    severity: dict,
    incident_store: dict,
) -> tuple[dict, dict]:
    """Run planning, execution, notifications, and impact assessment."""
    active_incidents = _get_active_incidents(incident_store, signal_id)

    plan = run_resource_planner(signal_id, classification, severity, active_incidents)
    execution = run_action_executor(signal_id, classification, plan)
    notifications = run_stakeholder_notifier(signal_id, classification, severity, execution)
    impact = _compute_impact(signal_id, classification, execution)

    response = {
        "plan": plan,
        "execution": execution,
        "notifications": notifications,
    }

    return response, impact


# ══════════════════════════════════════════════════════════════════════════════
# PUBLIC ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

def process_signal(signal_id: str, payload: dict) -> None:
    """
    Main ADK-style orchestration pipeline.

    Pipeline: Ingest → Fuse → Classify → Predict → Plan → Execute → Notify → Assess

    Called as a FastAPI background task.
    """
    from backend.app.database.mock_store import upsert_incident, incident_store

    log_trace(signal_id, "orchestrator", "pipeline_start", {
        "workplan": "Ingest signals → Fuse → Classify → Predict severity → Plan resources → Execute actions → Notify stakeholders → Assess impact",
        "payload": payload,
    })

    upsert_incident(signal_id, {"status": "processing", "payload": payload})

    try:
        location = payload.get("location", "G-10, Islamabad")
        description = payload.get("description", "")

        # ── Stage 1: Signal Ingestion ────────────────────────────────────
        signals = _ingest_signals(signal_id, location, description)

        upsert_incident(signal_id, {
            "status": "analyzing",
            "payload": payload,
            "stage": "signal_ingestion_complete",
        })

        # ── Stage 2: Detection Pipeline ──────────────────────────────────
        fusion = run_signal_fusion(signal_id, signals)
        classification = run_classifier(signal_id, fusion, signals)
        severity = run_severity_predictor(signal_id, classification, signals)

        upsert_incident(signal_id, {
            "status": "planning",
            "payload": payload,
            "stage": "detection_complete",
            "detection": {
                "fusion": fusion,
                "classification": classification,
                "severity": severity,
            },
        })

        # ── Stage 3: Response Pipeline ───────────────────────────────────
        response, impact = _run_response_pipeline(
            signal_id,
            classification,
            severity,
            incident_store,
        )

        # ── Store final result ───────────────────────────────────────────
        result = {
            "status": "completed",
            "signal_id": signal_id,
            "payload": payload,
            "detection": {
                "fusion": fusion,
                "classification": classification,
                "severity": severity,
            },
            "response": response,
            "impact": impact,
        }

        log_trace(signal_id, "orchestrator", "pipeline_complete", {
            "crisis_type": classification.get("crisis_type"),
            "severity": severity.get("severity"),
            "confidence": classification.get("confidence"),
            "actions_executed": len(response.get("execution", {}).get("executed_actions", [])),
            "final_status": impact.get("crisis_status", {}).get("after", "MANAGED"),
        })

        upsert_incident(signal_id, result)

    except Exception as exc:
        error_detail = {
            "status": "error",
            "signal_id": signal_id,
            "error": str(exc),
            "traceback": traceback.format_exc(),
        }
        log_trace(signal_id, "orchestrator", "pipeline_error", {
            "error": str(exc),
        })
        upsert_incident(signal_id, error_detail)


def verify_incident(signal_id: str, field_report: str) -> None:
    """
    Verification pipeline to handle false alarms or corrections.

    Called when a new field report or contradictory signal arrives for
     an existing incident.
    """
    from backend.app.database.mock_store import upsert_incident, incident_store

    log_trace(signal_id, "orchestrator", "verification_pipeline_start", {
        "field_report": field_report,
    })

    record = incident_store.get(signal_id)
    if not record:
        log_trace(signal_id, "orchestrator", "verification_error", {"error": "Incident not found"})
        return

    try:
        original_detection = record.get("detection", {})
        
        # ── Stage 4: Verification Agent ──────────────────────────────────
        verification = run_verification_agent(signal_id, original_detection, field_report)
        
        status = record.get("status")
        if verification.get("verification_status") == "false_alarm":
            status = "false_alarm"
        elif verification.get("verification_status") == "corrected":
            status = "corrected"

        # Execute alert retraction if needed
        retraction_result = None
        if verification.get("is_retraction_needed"):
            log_trace(signal_id, "orchestrator", "executing_retraction", {})
            retraction_result = retract_alert(
                location=original_detection.get("classification", {}).get("location", ""),
                crisis_type=original_detection.get("classification", {}).get("crisis_type", "unknown")
            )

        # Update record
        record.update({
            "status": status,
            "verification": verification,
            "retraction_result": retraction_result,
            "last_field_report": field_report,
        })
        
        log_trace(signal_id, "orchestrator", "verification_pipeline_complete", {
            "new_status": status,
            "verification_status": verification.get("verification_status"),
        })
        
        upsert_incident(signal_id, record)

    except Exception as exc:
        log_trace(signal_id, "orchestrator", "verification_error", {
            "error": str(exc),
            "traceback": traceback.format_exc(),
        })

"""Pydantic schemas for structured LLM outputs."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class FusionOutput(BaseModel):
    fused_summary: str = ""
    source_credibility_scores: dict[str, float] = Field(default_factory=dict)
    contradiction_detected: bool = False
    contradicting_signals: list[str] = Field(default_factory=list)
    contradiction_description: str = ""
    overall_confidence: float = 0.0
    weighted_urgency: str = "medium"
    primary_signal_source: str = ""
    contributing_signals: list[str] = Field(default_factory=list)
    dissenting_signals: list[str] = Field(default_factory=list)


class ClassificationOutput(BaseModel):
    crisis_type: str = "unknown"
    location: str = ""
    confidence: float = 0.0
    alternative_hypothesis: str | None = None
    alternative_confidence: float = 0.0
    classification_reasoning: str = ""
    requires_field_verification: bool = False
    geolocation_confidence: str = "medium"


class SeverityOutput(BaseModel):
    severity: str = "medium"
    affected_radius_km: float = 0.0
    affected_population_estimate: int = 0
    expected_duration_hrs: int = 0
    peak_impact_time: str = ""
    spread_risk: str = "medium"
    uncertainty_range: str = "medium"
    vulnerable_groups: list[str] = Field(default_factory=list)
    escalation_triggers: list[str] = Field(default_factory=list)
    severity_reasoning: str = ""


class DetectionResult(BaseModel):
    fusion: FusionOutput
    classification: ClassificationOutput
    severity: SeverityOutput


class ActionStep(BaseModel):
    step: int = 1
    action: str = ""
    description: str = ""
    resources_needed: dict[str, int] = Field(default_factory=dict)
    expected_duration_min: int = 0
    success_criteria: str = ""
    side_effects: list[str] = Field(default_factory=list)
    fallback: str = ""


class ResponsePlan(BaseModel):
    priority: str = "P2"
    action_plan: list[ActionStep] = Field(default_factory=list)
    total_resources_committed: dict[str, int] = Field(default_factory=dict)
    resources_remaining: dict[str, int] = Field(default_factory=dict)
    reserve_maintained_pct: int = 10
    rationale: str = ""
    multi_crisis_tradeoffs: str = ""
    ambulance_routing_note: str = ""


class NotificationsOutput(BaseModel):
    notifications: dict[str, str] = Field(default_factory=dict)
    notification_count: int = 0
    priority_audience: str = "public"


class VerificationOutput(BaseModel):
    verification_status: str = "confirmed"
    is_retraction_needed: bool = False
    original_type: str | None = None
    new_type: str | None = None
    corrected_crisis_type: str | None = None
    original_severity: str | None = None
    new_severity: str | None = None
    correction_reason: str | None = None
    reasoning: str = ""
    retraction_message: str | None = None
    stakeholder_updates: dict[str, str] = Field(default_factory=dict)
    confidence_after_verification: float | None = None


def detection_to_dict(result: DetectionResult) -> dict[str, Any]:
    return {
        "fusion": result.fusion.model_dump(),
        "classification": result.classification.model_dump(),
        "severity": result.severity.model_dump(),
    }

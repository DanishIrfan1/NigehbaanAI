"""Robustness helpers: degraded mode, fallbacks, duplicate detection."""

from agents.robustness.degraded import (
    apply_fallbacks,
    assess_ingestion,
    detect_duplicate,
)

__all__ = ["apply_fallbacks", "assess_ingestion", "detect_duplicate"]

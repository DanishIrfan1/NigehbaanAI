# NigehbaanAI — API Quick Reference

> **Full reference:** [docs/api-reference.md](../docs/api-reference.md)  
> **Bruno collection:** import the [`bruno/`](.) folder into [Bruno](https://www.usebruno.com/).

This document provides a concise API spec for the NigehbaanAI (CIRO) backend.

## 🚀 Global Configuration
- **Base URL:** `http://localhost:8000`
- **Version Prefix:** `/api/v1`
- **Default Content-Type:** `application/json`

---

## 📡 Signal Ingestion

### 1. Submit Crisis Signal
Triggers the LangGraph crisis pipeline (ingest → detect → plan → execute → notify).

- **Endpoint:** `POST /api/v1/signal`
- **Status Code:** `202 Accepted`
- **Request Body:**
  ```json
  {
    "source": "social_media",           // string: social_media | weather | traffic | sensor | field_report
    "location": "G-10, Islamabad",      // string: District-level location
    "description": "Text in Urdu/Eng",  // string: Raw input from citizen or sensor
    "severity_hint": "high",            // string: low | medium | high | unknown
    "enable_weather": true,             // boolean: Ingest weather signals
    "enable_traffic": true,             // boolean: Ingest traffic signals
    "enable_social": true,              // boolean: Ingest social media signals
    "enable_emergency_call": true       // boolean: Ingest emergency call signals
  }
  ```
- **Expected Response:**
  ```json
  {
    "signal_id": "uuid-v4-string",
    "status": "queued",
    "message": "Signal received. LangGraph pipeline processing in background."
  }
  ```

### 2. Verify/Correct Incident
Submits a field report to the **Verification Agent** to handle false alarms or update a crisis classification.

- **Endpoint:** `POST /api/v1/verify/{signal_id}`
- **Path Param:** `signal_id` (The UUID of the existing incident)
- **Status Code:** `202 Accepted`
- **Request Body:**
  ```json
  {
    "field_report": "Actually a broken water main, not urban flooding."
  }
  ```
- **Expected Response:**
  ```json
  {
    "signal_id": "uuid-v4-string",
    "status": "verifying",
    "message": "Field report received. Verification Agent processing in background."
  }
  ```

---

## 🔍 Intelligence & Results

### 3. Get Full Incident Status
Returns the complete state of the incident, including raw payload and all agent outputs.

- **Endpoint:** `GET /api/v1/status/{signal_id}`
- **Status Code:** `200 OK` | `404 Not Found`
- **Response Shape:**
  ```json
  {
    "status": "completed | processing | analyzing | error",
    "signal_id": "uuid",
    "detection": { "fusion": {}, "classification": {}, "severity": {} },
    "response": { "plan": {}, "execution": {}, "notifications": {} },
    "impact": { "traffic_congestion": {}, "crisis_status": {} }
  }
  ```

### 4. Get Crisis Detection
Focused view of the **Detector Agent** output (Type, Severity, Confidence).

- **Endpoint:** `GET /api/v1/crisis/{signal_id}`
- **Response Shape:**
  ```json
  {
    "signal_id": "uuid",
    "status": "completed",
    "classification": { "crisis_type": "urban_flooding", "confidence": 0.92 },
    "severity": { "severity": "high", "affected_population_estimate": 5000 },
    "fusion": { "overall_confidence": 0.88, "contradiction_detected": false }
  }
  ```

### 5. Get Agent Trace Logs
Retrieves the real-time reasoning logs for the **AgentLogScreen**.

- **Endpoint:** `GET /api/v1/agents/trace/{signal_id}`
- **Response Shape:**
  ```json
  {
    "signal_id": "uuid",
    "trace_count": 12,
    "traces": [
      {
        "ts": "2026-05-17T10:00:00Z",
        "agent": "signal_fusion_agent",
        "event": "fusion_complete",
        "weighted_urgency": "high"
      }
    ]
  }
  ```

### 6. Get Response Actions
Lists all actions recommended by the **Planner** and results from the **Executor**.

- **Endpoint:** `GET /api/v1/actions/{signal_id}`
- **Response Shape:**
  ```json
  {
    "signal_id": "uuid",
    "priority": "P1",
    "actions": [
      {
        "action": "traffic_rerouting",
        "status": "completed",
        "tool_result": { "alternate_route": "..." }
      }
    ],
    "plan_rationale": "Explanation of the resource trade-offs."
  }
  ```

---

## 📊 Analytics & Health

### 7. List All Incidents
Returns a summary of all incidents currently stored in memory.

- **Endpoint:** `GET /api/v1/incidents`
- **Response Shape:**
  ```json
  {
    "incidents": [ { "signal_id": "...", "status": "completed" }, ... ]
  }
  ```

### 8. System Health
Checks service availability.

- **Endpoint:** `GET /health`
- **Response:** `{"status": "ok", "service": "nigehbaan-ai", "version": "0.2.0"}`

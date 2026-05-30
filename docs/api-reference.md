# API Reference

Base URL: `http://localhost:8000` (or your `BACKEND_HOST_PORT`)

Interactive docs: **http://localhost:8000/docs** (Swagger UI)

All crisis endpoints use prefix **`/api/v1`**.

---

## Health

### `GET /health`

```json
{
  "status": "ok",
  "service": "nigehbaan-ai",
  "version": "0.2.0"
}
```

### `GET /api/v1/endpoints`

Returns a JSON map of available routes (for frontend discovery).

---

## Signal ingestion

### `POST /api/v1/signal`

Queues a crisis signal for LangGraph processing. Returns immediately with `202 Accepted`.

**Request body:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `source` | string | `"multi_source"` | Signal origin label |
| `location` | string | `"G-10, Islamabad"` | District-level location |
| `description` | string | `""` | Free-text crisis description |
| `severity_hint` | string | `"unknown"` | `low` \| `medium` \| `high` \| `unknown` |
| `timestamp` | string \| null | null | ISO-8601; server time if omitted |
| `enable_weather` | bool | `true` | Ingest weather tool |
| `enable_traffic` | bool | `true` | Ingest traffic tool |
| `enable_social` | bool | `true` | Ingest social tool |
| `enable_emergency_call` | bool | `true` | Ingest emergency call tool |

**Robustness flags** (optional, in payload extensions used by tests/demos):

| Field | Description |
|-------|-------------|
| `simulate_api_failure` | e.g. `"weather"` — triggers degraded fallbacks |
| `disable_duplicate_detection` | Skip duplicate-location check |

**Example:**

```json
{
  "source": "multi_source",
  "location": "G-10, Islamabad",
  "description": "Streets flooded, water entering homes",
  "severity_hint": "high",
  "enable_weather": true,
  "enable_traffic": true,
  "enable_social": true,
  "enable_emergency_call": true
}
```

**Response (`202`):**

```json
{
  "signal_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "message": "Signal received. LangGraph pipeline processing in background."
}
```

**Client flow:** Poll `GET /api/v1/status/{signal_id}` until `status` is terminal (`completed`, `human_review_required`, `duplicate_detected`, `error`, etc.).

---

### `POST /api/v1/verify/{signal_id}`

Submit a field report for verification (false alarm, correction, confirmation).

**Request body:**

```json
{
  "field_report": "Actually a broken water main, not urban flooding."
}
```

**Response (`202`):**

```json
{
  "signal_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "verifying",
  "message": "Field report received. Verification Agent processing in background."
}
```

---

### `POST /api/v1/scenario/multi-crisis`

Queues two demo signals: G-10 flooding immediately, F-8 heatwave after 2 seconds.

**Response (`202`):**

```json
{
  "status": "queued",
  "flood_signal_id": "uuid-1",
  "heat_signal_id": "uuid-2",
  "message": "Multi-crisis scenario queued (G-10 flood + F-8 heatwave after 2s)."
}
```

---

## Status & results

### `GET /api/v1/status/{signal_id}`

Full incident record — use this for a single poll of everything.

**Response fields (when complete):**

| Field | Description |
|-------|-------------|
| `status` | `queued`, `processing`, `completed`, `human_review_required`, `duplicate_detected`, `error`, … |
| `signal_id` | UUID |
| `payload` | Original request |
| `simulated_llm_pipeline` | `true` if mocks were used for LLM steps |
| `degraded_mode` | `true` if fallbacks were applied |
| `warnings` | List of degradation messages |
| `fallback_sources_used` | Which cached sources were used |
| `detection` | `fusion`, `classification`, `severity` |
| `response` | `plan`, `execution`, `notifications` |
| `impact` | Before/after crisis metrics |
| `verification` | Present after verify flow |

**Example (abbreviated):**

```json
{
  "status": "completed",
  "signal_id": "550e8400-e29b-41d4-a716-446655440000",
  "simulated_llm_pipeline": false,
  "degraded_mode": false,
  "warnings": [],
  "detection": {
    "fusion": { "fused_summary": "...", "overall_confidence": 0.88 },
    "classification": { "crisis_type": "urban_flooding", "confidence": 0.92 },
    "severity": { "severity": "high", "affected_population_estimate": 5000 }
  },
  "response": {
    "plan": { "priority": "P1", "steps": [] },
    "execution": { "executed_actions": [], "alert_ids": [] },
    "notifications": { "notification_count": 6 }
  },
  "impact": {
    "crisis_status": { "before": "ACTIVE", "after": "MANAGED" }
  }
}
```

---

### `GET /api/v1/crisis/{signal_id}`

Detection-only view: classification, severity, fusion.

Returns a processing message if detection is not yet complete.

---

### `GET /api/v1/agents/trace/{signal_id}`

Agent reasoning traces for the Agent Log screen.

```json
{
  "signal_id": "uuid",
  "trace_count": 12,
  "traces": [
    {
      "ts": "2026-05-17T10:00:00Z",
      "signal_id": "uuid",
      "agent": "signal_fusion_agent",
      "event": "fusion_complete",
      "detail": {}
    }
  ]
}
```

Traces are also appended to `agents/traces/trace_log.jsonl` on disk.

---

### `GET /api/v1/actions/{signal_id}`

Executed response actions and plan rationale.

```json
{
  "signal_id": "uuid",
  "status": "completed",
  "priority": "P1",
  "actions": [
    {
      "action": "traffic_rerouting",
      "status": "completed",
      "tool_result": { "alternate_route": "[SIMULATED] ..." }
    }
  ],
  "plan_rationale": "Prioritized G-10 flood due to population exposure.",
  "multi_crisis_tradeoffs": ""
}
```

---

### `GET /api/v1/outcome/{signal_id}`

Impact assessment and notification summary.

```json
{
  "signal_id": "uuid",
  "status": "completed",
  "impact": {
    "crisis_status": { "before": "ACTIVE", "after": "MANAGED" },
    "traffic_congestion": { "before_pct": 85, "after_pct": 45 }
  },
  "notifications": { "public": "...", "emergency_services": "..." },
  "notification_count": 6
}
```

---

### `GET /api/v1/incidents`

List all incidents currently in memory.

```json
{
  "incidents": [
    { "signal_id": "...", "status": "completed", "location": "G-10, Islamabad" }
  ]
}
```

---

## Crisis types

The detector may classify as:

`urban_flooding` | `heatwave` | `fire` | `accident` | `infrastructure_failure` | `power_outage` | `disease_cluster` | `protest` | `unknown`

---

## HTTP status codes

| Code | When |
|------|------|
| `202` | Signal or verify accepted (async processing) |
| `200` | Successful GET |
| `404` | Unknown `signal_id` |

---

## Bruno collection

Import the [`bruno/`](../bruno/) folder into [Bruno](https://www.usebruno.com/) for saved requests and the Local environment (`http://localhost:8000`).

See also [bruno/apis.md](../bruno/apis.md) for a shorter quick reference.

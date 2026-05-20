/** Backend API response shapes for /api/v1 */

export interface SignalPayload {
  source?: string;
  location?: string;
  description: string;
  severity_hint?: string;
  enable_weather?: boolean;
  enable_traffic?: boolean;
  enable_social?: boolean;
  enable_emergency_call?: boolean;
}

export interface SignalResponse {
  signal_id: string;
  status: string;
  message: string;
}

export interface Classification {
  crisis_type?: string;
  location?: string;
  confidence?: number;
  alternative_hypothesis?: string;
  geolocation_confidence?: number;
  requires_field_verification?: boolean;
}

export interface Severity {
  severity?: string;
  affected_radius_km?: number;
  affected_population?: number;
  expected_duration_hrs?: number;
  spread_risk?: string;
}

export interface Fusion {
  fused_summary?: string;
  overall_urgency?: string;
  credibility_scores?: Record<string, number>;
  contradictions?: Array<{ sources?: string[]; detail?: string }>;
  source_signals?: Record<string, unknown>;
}

export interface CrisisResponse {
  signal_id: string;
  status?: string;
  message?: string;
  classification?: Classification;
  severity?: Severity;
  fusion?: Fusion;
}

export interface TraceEntry {
  ts?: string;
  signal_id?: string;
  agent: string;
  event: string;
  [key: string]: unknown;
}

export interface TracesResponse {
  signal_id: string;
  trace_count: number;
  traces: TraceEntry[];
  message?: string;
}

export interface ExecutedAction {
  step?: number;
  action?: string;
  description?: string;
  status?: string;
  tool_result?: Record<string, unknown>;
  side_effects?: string[];
}

export interface ActionsResponse {
  signal_id: string;
  status?: string;
  message?: string;
  priority?: string;
  actions: ExecutedAction[];
  plan_rationale?: string;
  multi_crisis_tradeoffs?: string;
}

export interface MetricPair {
  before?: number | string | null;
  after?: number | string | null;
  change?: number;
}

export interface ImpactMetrics {
  traffic_congestion?: { before_pct?: number; after_pct?: number; change?: number };
  response_time_min?: MetricPair;
  citizens_alerted?: MetricPair;
  crisis_status?: { before?: string; after?: string };
  ambulance_eta_min?: MetricPair & { change?: number };
  rescue_teams_deployed?: number;
  per_action_summary?: Array<{ action?: string; status?: string; side_effects?: string[] }>;
}

export interface OutcomeResponse {
  signal_id: string;
  status?: string;
  message?: string;
  impact?: ImpactMetrics;
  notifications?: Record<string, string>;
  notification_count?: number;
}

export interface Verification {
  verification_status?: string;
  is_retraction_needed?: boolean;
  corrected_crisis_type?: string;
  correction_reason?: string;
  confidence_after_verification?: number;
}

export interface StatusRecord {
  signal_id: string;
  status: string;
  /** True when any agent step used LLM_MODE=mock or auto quota/key fallback. */
  simulated_llm_pipeline?: boolean;
  error?: string;
  error_detail?: string;
  payload?: Record<string, unknown>;
  degraded_mode?: boolean;
  warnings?: string[];
  fallback_sources_used?: string[];
  detection?: {
    fusion?: Fusion;
    classification?: Classification;
    severity?: Severity;
  };
  response?: {
    plan?: Record<string, unknown>;
    execution?: { executed_actions?: ExecutedAction[] };
    notifications?: Record<string, unknown>;
  };
  impact?: ImpactMetrics;
  verification?: Verification;
  completed_at?: string;
}

export interface MultiCrisisResponse {
  status: string;
  flood_signal_id: string;
  heat_signal_id: string;
  message: string;
}

export interface HealthResponse {
  status: string;
  service?: string;
  version?: string;
}

/** UI-normalized types */

export interface UICrisis {
  title: string;
  location: string;
  situationType: string;
  confidence: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  impacts: string[];
  sourceSignals: string[];
  crisisTypeRaw?: string;
}

export interface UILogEntry {
  id: string;
  timestamp: string;
  agent: string;
  message: string;
}

export interface UIAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'PENDING' | 'EXECUTING' | 'DONE' | 'FAILED';
  result?: string;
}

export interface UIOutcomeStat {
  label: string;
  beforeStr: string;
  afterNum?: number;
  afterSuffix?: string;
  afterStrOverride?: string;
  changeStr?: string;
}

export interface SubmitSignalInput {
  text: string;
  location?: string;
  useSocialMedia: boolean;
  useWeather: boolean;
  useTraffic: boolean;
  useEmergencyCall: boolean;
}

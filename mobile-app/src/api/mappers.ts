import type {
  ActionsResponse,
  CrisisResponse,
  ExecutedAction,
  ImpactMetrics,
  OutcomeResponse,
  Severity,
  StatusRecord,
  TraceEntry,
  UICrisis,
  UILogEntry,
  UIAction,
  UIOutcomeStat,
} from './types';

const CRISIS_TYPE_LABELS: Record<string, string> = {
  urban_flooding: 'Urban Flooding',
  heatwave: 'Heatwave',
  infrastructure_failure: 'Infrastructure Failure',
  earthquake: 'Earthquake',
  unknown: 'Unknown Crisis',
};

const ACTION_ICONS: Record<string, string> = {
  traffic_rerouting: 'map-marker-path',
  ambulance_reroute: 'ambulance',
  public_alert: 'bullhorn',
  hospital_alert: 'hospital-building',
  emergency_dispatch: 'ambulance',
  rescue_dispatch: 'account-group',
  cooling_centers: 'snowflake',
};

export function formatCrisisType(raw?: string): string {
  if (!raw) return 'Detecting...';
  return CRISIS_TYPE_LABELS[raw] ?? raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function toSeverityLevel(sev?: string | Severity): 'HIGH' | 'MEDIUM' | 'LOW' {
  const s = typeof sev === 'string' ? sev : sev?.severity;
  const upper = (s ?? 'medium').toUpperCase();
  if (upper === 'HIGH' || upper === 'CRITICAL') return 'HIGH';
  if (upper === 'LOW') return 'LOW';
  return 'MEDIUM';
}

export function confidencePercent(conf?: number): number {
  if (conf == null) return 0;
  return conf <= 1 ? Math.round(conf * 100) : Math.round(conf);
}

function buildImpacts(crisis: CrisisResponse, status?: StatusRecord): string[] {
  const impacts: string[] = [];
  const sev = crisis.severity;
  if (sev?.affected_population) {
    impacts.push(`~${sev.affected_population.toLocaleString()} people potentially affected`);
  }
  if (sev?.affected_radius_km) {
    impacts.push(`Affected radius: ${sev.affected_radius_km} km`);
  }
  if (sev?.spread_risk) {
    impacts.push(`Spread risk: ${sev.spread_risk}`);
  }
  const fusion = crisis.fusion ?? status?.detection?.fusion;
  if (fusion?.fused_summary) {
    impacts.push(fusion.fused_summary);
  }
  if (fusion?.contradictions?.length) {
    fusion.contradictions.forEach((c) => {
      if (c.detail) impacts.push(`Contradiction: ${c.detail}`);
    });
  }
  return impacts.length > 0 ? impacts : ['Analysis in progress...'];
}

function buildSourceSignals(crisis: CrisisResponse, status?: StatusRecord): string[] {
  const signals: string[] = [];
  const fusion = crisis.fusion ?? status?.detection?.fusion;
  const sources = fusion?.source_signals as Record<string, Record<string, unknown>> | undefined;

  if (sources) {
    if (sources.social?.post_count) {
      signals.push(`Social: ${sources.social.post_count} posts detected`);
    }
    if (sources.weather?.condition) {
      signals.push(`Weather: ${sources.weather.condition}`);
    }
    if (sources.traffic?.congestion_level) {
      signals.push(`Traffic: congestion ${sources.traffic.congestion_level}`);
    }
    if (sources.emergency_call?.has_call) {
      const transcript = sources.emergency_call.raw_transcription as string | undefined;
      signals.push(
        transcript
          ? `Emergency call: "${transcript.slice(0, 80)}..."`
          : 'Emergency call: active distress signal'
      );
    }
  }

  if (fusion?.fused_summary && signals.length === 0) {
    signals.push(fusion.fused_summary);
  }

  const cred = fusion?.credibility_scores;
  if (cred) {
    Object.entries(cred).forEach(([src, score]) => {
      signals.push(`${src}: credibility ${Math.round((score as number) * 100)}%`);
    });
  }

  return signals.length > 0 ? signals : ['Awaiting signal fusion...'];
}

export function mapCrisisToUI(crisis: CrisisResponse, status?: StatusRecord): UICrisis {
  const classification = crisis.classification ?? status?.detection?.classification;
  const severity = crisis.severity ?? status?.detection?.severity;
  const crisisType = classification?.crisis_type;

  return {
    title: formatCrisisType(crisisType),
    location: classification?.location ?? 'Unknown Location',
    situationType: formatCrisisType(crisisType),
    confidence: confidencePercent(classification?.confidence),
    severity: toSeverityLevel(severity),
    impacts: buildImpacts(crisis, status),
    sourceSignals: buildSourceSignals(crisis, status),
    crisisTypeRaw: crisisType,
  };
}

export function mapTraceToUI(trace: TraceEntry, index: number): UILogEntry {
  const ts = trace.ts ?? '';
  const timePart = ts.includes('T') ? ts.split('T')[1]?.slice(0, 8) ?? ts : ts;
  const dataMsg =
    typeof trace.message === 'string'
      ? trace.message
      : typeof trace.detail === 'string'
        ? trace.detail
        : trace.event;

  const extras = Object.entries(trace)
    .filter(([k]) => !['ts', 'signal_id', 'agent', 'event', 'message'].includes(k))
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(' ');

  const message = extras ? `${dataMsg} ${extras}`.trim() : String(dataMsg);

  return {
    id: `${trace.agent}-${trace.event}-${index}`,
    timestamp: timePart || '--:--:--',
    agent: trace.agent,
    message,
  };
}

export function mapActionToUI(action: ExecutedAction, index: number): UIAction {
  const name = action.action ?? `step-${action.step ?? index}`;
  const statusRaw = (action.status ?? 'pending').toLowerCase();
  let status: UIAction['status'] = 'PENDING';
  if (statusRaw === 'completed' || statusRaw === 'done') status = 'DONE';
  else if (statusRaw === 'failed') status = 'FAILED';
  else if (statusRaw === 'executing' || statusRaw === 'in_progress') status = 'EXECUTING';

  const toolResult = action.tool_result;
  let result: string | undefined;
  if (toolResult) {
    if (typeof toolResult.status === 'string') result = toolResult.status;
    else if (typeof toolResult.detail === 'string') result = toolResult.detail;
    else if (toolResult.channel) result = `Sent via ${toolResult.channel}`;
  }

  return {
    id: `${name}-${index}`,
    title: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: action.description ?? '',
    icon: ACTION_ICONS[name] ?? 'cog',
    status,
    result,
  };
}

export function mapActionsResponse(res: ActionsResponse): UIAction[] {
  return (res.actions ?? []).map(mapActionToUI);
}

export function mapOutcomeToStats(impact?: ImpactMetrics): UIOutcomeStat[] {
  if (!impact) return [];

  const stats: UIOutcomeStat[] = [];

  if (impact.traffic_congestion) {
    const tc = impact.traffic_congestion;
    stats.push({
      label: 'Traffic Congestion',
      beforeStr: `${tc.before_pct ?? '--'}%`,
      afterNum: tc.after_pct,
      afterSuffix: '%',
      changeStr: tc.change != null ? `${tc.change > 0 ? '+' : ''}${tc.change}%` : undefined,
    });
  }

  if (impact.response_time_min) {
    const rt = impact.response_time_min;
    stats.push({
      label: 'Response Time',
      beforeStr: rt.before != null ? `${rt.before} min` : 'N/A',
      afterNum: typeof rt.after === 'number' ? rt.after : undefined,
      afterSuffix: ' min',
    });
  }

  if (impact.citizens_alerted) {
    const ca = impact.citizens_alerted;
    stats.push({
      label: 'Citizens Alerted',
      beforeStr: String(ca.before ?? 0),
      afterNum: typeof ca.after === 'number' ? ca.after : undefined,
    });
  }

  if (impact.ambulance_eta_min) {
    const ae = impact.ambulance_eta_min;
    stats.push({
      label: 'Ambulance ETA',
      beforeStr: `${ae.before ?? '--'} min`,
      afterNum: typeof ae.after === 'number' ? ae.after : undefined,
      afterSuffix: ' min',
      changeStr:
        ae.change != null ? `${ae.change > 0 ? '+' : ''}${ae.change} min` : undefined,
    });
  }

  if (impact.crisis_status) {
    stats.push({
      label: 'Crisis Status',
      beforeStr: String(impact.crisis_status.before ?? 'ACTIVE'),
      afterStrOverride: String(impact.crisis_status.after ?? 'MANAGED'),
    });
  }

  return stats;
}

export function mapDashboardCrisis(status: StatusRecord, crisis?: CrisisResponse) {
  const classification = crisis?.classification ?? status.detection?.classification;
  const severity = crisis?.severity ?? status.detection?.severity;

  return {
    type: formatCrisisType(classification?.crisis_type),
    location: classification?.location ?? 'Unknown',
    severity: toSeverityLevel(severity),
    confidence: confidencePercent(classification?.confidence),
    impact: mapCrisisToUI(crisis ?? { signal_id: status.signal_id }, status).impacts,
  };
}

export function hasEmergencyCallSignal(status?: StatusRecord, crisis?: CrisisResponse): boolean {
  const sources =
    crisis?.fusion?.source_signals ??
    (status?.detection?.fusion?.source_signals as Record<string, unknown> | undefined);
  if (!sources) return false;
  const ec = sources.emergency_call as { has_call?: boolean } | undefined;
  return Boolean(ec?.has_call);
}

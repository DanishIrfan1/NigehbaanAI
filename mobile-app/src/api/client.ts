import axios from 'axios';
import { Platform } from 'react-native';
import type {
  ActionsResponse,
  CrisisResponse,
  HealthResponse,
  MultiCrisisResponse,
  OutcomeResponse,
  SignalPayload,
  SignalResponse,
  StatusRecord,
  SubmitSignalInput,
  TracesResponse,
} from './types';

function resolveBaseHost(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
}

export const API_HOST = resolveBaseHost();

const api = axios.create({
  baseURL: `${API_HOST}/api/v1`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/** Do not throw on 404 — used while polling before the worker registers the incident (legacy race). */
const accept404 = { validateStatus: (s: number) => s === 200 || s === 404 };

const rootApi = axios.create({
  baseURL: API_HOST,
  timeout: 10000,
});

export function buildSignalPayload(input: SubmitSignalInput): SignalPayload {
  return {
    source: 'multi_source',
    location: input.location ?? 'G-10, Islamabad',
    description: input.text,
    severity_hint: 'high',
    enable_weather: input.useWeather,
    enable_traffic: input.useTraffic,
    enable_social: input.useSocialMedia,
    enable_emergency_call: input.useEmergencyCall,
  };
}

export async function submitSignal(payload: SignalPayload): Promise<SignalResponse> {
  const res = await api.post<SignalResponse>('/signal', payload);
  return res.data;
}

export async function getStatus(signalId: string): Promise<StatusRecord | null> {
  const res = await api.get<StatusRecord>(`/status/${signalId}`, accept404);
  if (res.status === 404) return null;
  return res.data;
}

export async function getCrisis(signalId: string): Promise<CrisisResponse | null> {
  const res = await api.get<CrisisResponse>(`/crisis/${signalId}`, accept404);
  if (res.status === 404) return null;
  return res.data;
}

export async function getTraces(signalId: string): Promise<TracesResponse | null> {
  const res = await api.get<TracesResponse>(`/agents/trace/${signalId}`, accept404);
  if (res.status === 404) return null;
  return res.data;
}

export async function getActions(signalId: string): Promise<ActionsResponse | null> {
  const res = await api.get<ActionsResponse>(`/actions/${signalId}`, accept404);
  if (res.status === 404) return null;
  return res.data;
}

export async function getOutcome(signalId: string): Promise<OutcomeResponse | null> {
  const res = await api.get<OutcomeResponse>(`/outcome/${signalId}`, accept404);
  if (res.status === 404) return null;
  return res.data;
}

export async function verifySignal(
  signalId: string,
  fieldReport: string
): Promise<{ signal_id: string; status: string; message: string }> {
  const res = await api.post(`/verify/${signalId}`, { field_report: fieldReport });
  return res.data;
}

export async function runMultiCrisisScenario(): Promise<MultiCrisisResponse> {
  const res = await api.post<MultiCrisisResponse>('/scenario/multi-crisis');
  return res.data;
}

export async function checkHealth(): Promise<HealthResponse> {
  const res = await rootApi.get<HealthResponse>('/health');
  return res.data;
}

export async function fetchPipelineSnapshot(signalId: string) {
  const [statusRes, crisisRes, tracesRes, actionsRes, outcomeRes] = await Promise.allSettled([
    getStatus(signalId),
    getCrisis(signalId),
    getTraces(signalId),
    getActions(signalId),
    getOutcome(signalId),
  ]);

  return {
    status: statusRes.status === 'fulfilled' ? statusRes.value : null,
    crisis: crisisRes.status === 'fulfilled' ? crisisRes.value : null,
    traces: tracesRes.status === 'fulfilled' ? tracesRes.value : null,
    actions: actionsRes.status === 'fulfilled' ? actionsRes.value : null,
    outcome: outcomeRes.status === 'fulfilled' ? outcomeRes.value : null,
    errors: [statusRes, crisisRes, tracesRes, actionsRes, outcomeRes]
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason)))
      .filter((msg) => !/status code 404/i.test(msg)),
  };
}

export default api;

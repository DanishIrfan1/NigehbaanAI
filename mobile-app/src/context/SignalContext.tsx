import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  buildSignalPayload,
  fetchPipelineSnapshot,
  runMultiCrisisScenario,
  submitSignal,
  verifySignal,
} from '../api/client';
import {
  mapActionsResponse,
  mapCrisisToUI,
  mapDashboardCrisis,
  mapOutcomeToStats,
  mapTraceToUI,
} from '../api/mappers';
import type {
  ActionsResponse,
  CrisisResponse,
  OutcomeResponse,
  StatusRecord,
  SubmitSignalInput,
  TracesResponse,
  UIAction,
  UICrisis,
  UILogEntry,
  UIOutcomeStat,
  Verification,
} from '../api/types';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 90000;

interface SignalContextValue {
  signalId: string | null;
  status: StatusRecord | null;
  crisis: CrisisResponse | null;
  uiCrisis: UICrisis | null;
  dashboardCrisis: ReturnType<typeof mapDashboardCrisis> | null;
  traces: UILogEntry[];
  rawTraces: TracesResponse | null;
  actions: UIAction[];
  rawActions: ActionsResponse | null;
  outcome: OutcomeResponse | null;
  outcomeStats: UIOutcomeStat[];
  notifications: Record<string, string>;
  notificationCount: number;
  degradedMode: boolean;
  /** True when backend used mock / fallback LLM JSON for this incident. */
  simulatedLlmPipeline: boolean;
  warnings: string[];
  verification: Verification | null;
  isPolling: boolean;
  isVerifying: boolean;
  error: string | null;
  lastEmergencyCallEnabled: boolean;
  startAnalysis: (input: SubmitSignalInput) => Promise<void>;
  refresh: () => Promise<void>;
  submitVerification: (fieldReport: string) => Promise<void>;
  loadMultiCrisis: () => Promise<void>;
  clearError: () => void;
  setSignalId: (id: string | null) => void;
}

const SignalContext = createContext<SignalContextValue | null>(null);

export function SignalProvider({ children }: { children: React.ReactNode }) {
  const [signalId, setSignalId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusRecord | null>(null);
  const [crisis, setCrisis] = useState<CrisisResponse | null>(null);
  const [rawTraces, setRawTraces] = useState<TracesResponse | null>(null);
  const [rawActions, setRawActions] = useState<ActionsResponse | null>(null);
  const [outcome, setOutcome] = useState<OutcomeResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEmergencyCallEnabled, setLastEmergencyCallEnabled] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const applySnapshot = useCallback(
    (snapshot: Awaited<ReturnType<typeof fetchPipelineSnapshot>>) => {
      if (snapshot.status) setStatus(snapshot.status);
      if (snapshot.crisis) setCrisis(snapshot.crisis);
      if (snapshot.traces) setRawTraces(snapshot.traces);
      if (snapshot.actions) setRawActions(snapshot.actions);
      if (snapshot.outcome) setOutcome(snapshot.outcome);
      if (snapshot.errors.length > 0 && !snapshot.status && !snapshot.crisis) {
        setError(snapshot.errors[0]);
      }
    },
    []
  );

  const pollOnce = useCallback(
    async (id: string) => {
      try {
        const snapshot = await fetchPipelineSnapshot(id);
        applySnapshot(snapshot);

        if (snapshot.status?.status === 'error') {
          setError(snapshot.status.error ?? 'Pipeline failed');
          stopPolling();
          return;
        }

        const recordStatus = snapshot.status?.status;
        const hasDetection = Boolean(
          snapshot.crisis?.classification?.crisis_type ??
            snapshot.status?.detection?.classification?.crisis_type
        );
        const hasActions = (snapshot.actions?.actions?.length ?? 0) > 0;
        const hasOutcome = Boolean(snapshot.outcome?.impact);

        if (
          recordStatus === 'completed' ||
          (hasDetection && hasActions && hasOutcome)
        ) {
          stopPolling();
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to fetch pipeline data';
        setError(msg);
        stopPolling();
      }
    },
    [applySnapshot, stopPolling]
  );

  const startPolling = useCallback(
    (id: string) => {
      stopPolling();
      setIsPolling(true);
      pollOnce(id);
      pollRef.current = setInterval(() => pollOnce(id), POLL_INTERVAL_MS);
      timeoutRef.current = setTimeout(() => {
        stopPolling();
        setError((prev) => prev ?? 'Pipeline timed out after 90s. Pull to refresh or retry.');
      }, POLL_TIMEOUT_MS);
    },
    [pollOnce, stopPolling]
  );

  const startAnalysis = useCallback(
    async (input: SubmitSignalInput) => {
      setError(null);
      setLastEmergencyCallEnabled(input.useEmergencyCall);
      stopPolling();
      setStatus(null);
      setCrisis(null);
      setRawTraces(null);
      setRawActions(null);
      setOutcome(null);

      try {
        const payload = buildSignalPayload(input);
        const res = await submitSignal(payload);
        setSignalId(res.signal_id);
        startPolling(res.signal_id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to submit signal';
        setError(msg);
        setIsPolling(false);
      }
    },
    [startPolling, stopPolling]
  );

  const refresh = useCallback(async () => {
    if (!signalId) return;
    setError(null);
    await pollOnce(signalId);
  }, [signalId, pollOnce]);

  const submitVerification = useCallback(
    async (fieldReport: string) => {
      if (!signalId || !fieldReport.trim()) return;
      setIsVerifying(true);
      setError(null);
      try {
        await verifySignal(signalId, fieldReport.trim());
        startPolling(signalId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Verification failed';
        setError(msg);
      } finally {
        setIsVerifying(false);
      }
    },
    [signalId, startPolling]
  );

  const loadMultiCrisis = useCallback(async () => {
    setError(null);
    try {
      const res = await runMultiCrisisScenario();
      setSignalId(res.flood_signal_id);
      startPolling(res.flood_signal_id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Multi-crisis scenario failed';
      setError(msg);
    }
  }, [startPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const uiCrisis = useMemo(
    () => (crisis && status ? mapCrisisToUI(crisis, status) : crisis ? mapCrisisToUI(crisis) : null),
    [crisis, status]
  );

  const dashboardCrisis = useMemo(
    () => (status ? mapDashboardCrisis(status, crisis ?? undefined) : null),
    [status, crisis]
  );

  const traces = useMemo(
    () => (rawTraces?.traces ?? []).map(mapTraceToUI),
    [rawTraces]
  );

  const actions = useMemo(
    () => (rawActions ? mapActionsResponse(rawActions) : []),
    [rawActions]
  );

  const outcomeStats = useMemo(() => mapOutcomeToStats(outcome?.impact), [outcome]);

  const value: SignalContextValue = {
    signalId,
    status,
    crisis,
    uiCrisis,
    dashboardCrisis,
    traces,
    rawTraces,
    actions,
    rawActions,
    outcome,
    outcomeStats,
    notifications: outcome?.notifications ?? {},
    notificationCount: outcome?.notification_count ?? 0,
    degradedMode: Boolean(status?.degraded_mode),
    simulatedLlmPipeline: Boolean(status?.simulated_llm_pipeline),
    warnings: status?.warnings ?? [],
    verification: status?.verification ?? null,
    isPolling,
    isVerifying,
    error,
    lastEmergencyCallEnabled,
    startAnalysis,
    refresh,
    submitVerification,
    loadMultiCrisis,
    clearError: () => setError(null),
    setSignalId,
  };

  return <SignalContext.Provider value={value}>{children}</SignalContext.Provider>;
}

export function useSignal() {
  const ctx = useContext(SignalContext);
  if (!ctx) {
    throw new Error('useSignal must be used within SignalProvider');
  }
  return ctx;
}

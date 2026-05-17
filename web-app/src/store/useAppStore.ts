import { create } from 'zustand';
import type { Alert, DetectedCrisis, LogEntry, MapMarkerData } from '../types';
import { initialAlerts, initialLogs, initialMapMarkers } from '../mockData/initialData';

interface AppState {
  isAnalyzing: boolean;
  currentCrisis: DetectedCrisis | null;
  alerts: Alert[];
  logs: LogEntry[];
  mapMarkers: MapMarkerData[];
  
  // Actions
  simulateAnalysis: (text: string) => void;
  dispatchAction: (actionId: string) => void;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAnalyzing: false,
  currentCrisis: null,
  alerts: initialAlerts,
  logs: initialLogs,
  mapMarkers: initialMapMarkers,

  simulateAnalysis: (text: string) => {
    set({ isAnalyzing: true, currentCrisis: null });
    
    // Simulate AI delay
    setTimeout(() => {
      const isFlooding = text.toLowerCase().includes('pani') || text.toLowerCase().includes('flood');
      
      const mockCrisis: DetectedCrisis = {
        id: 'c-' + Date.now(),
        type: isFlooding ? 'Urban Flooding' : 'Unknown Crisis',
        location: 'G-10 Islamabad',
        confidence: 92,
        severity: 'High',
        riskScore: 8.9,
        description: 'Weather alerts combined with social media reports and increased traffic congestion strongly indicate urban flooding.',
        impact: [
          { category: 'Traffic', description: 'Traffic blocked', icon: 'Car' },
          { category: 'Vehicles', description: 'Vehicles stranded', icon: 'AlertTriangle' },
          { category: 'Water', description: 'Water accumulation', icon: 'Droplets' },
          { category: 'Public', description: 'Public movement affected', icon: 'Users' }
        ],
        recommendedActions: [
          { id: 'a1', title: 'Redirect Traffic', description: 'Activate alternate routing', agent: 'Routing AI', status: 'Pending', progress: 0, estimatedImpact: 'High' },
          { id: 'a2', title: 'Dispatch Teams', description: 'Send emergency units to G-10', agent: 'Dispatch AI', status: 'Pending', progress: 0, estimatedImpact: 'Critical' },
          { id: 'a3', title: 'Send Alerts', description: 'Broadcast SMS warning', agent: 'Comms AI', status: 'Pending', progress: 0, estimatedImpact: 'Medium' }
        ]
      };

      const newLog: LogEntry = {
        id: 'l-' + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        eventType: mockCrisis.type,
        agent: 'Analysis Agent',
        decision: 'Detected Situation',
        status: 'Completed',
        severity: mockCrisis.severity
      };

      set((state) => ({ 
        isAnalyzing: false, 
        currentCrisis: mockCrisis,
        logs: [newLog, ...state.logs]
      }));
    }, 3000);
  },

  dispatchAction: (actionId: string) => {
    set((state) => {
      if (!state.currentCrisis) return state;

      const updatedActions = state.currentCrisis.recommendedActions.map(action => 
        action.id === actionId ? { ...action, status: 'Active' as const, progress: 50 } : action
      );

      const dispatchedAction = state.currentCrisis.recommendedActions.find(a => a.id === actionId);
      
      let newLogs = state.logs;
      if (dispatchedAction) {
        newLogs = [{
          id: 'l-act-' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          eventType: 'Action Dispatch',
          agent: dispatchedAction.agent,
          decision: `Started: ${dispatchedAction.title}`,
          status: 'Active',
          severity: 'High'
        }, ...state.logs];
      }

      return {
        currentCrisis: {
          ...state.currentCrisis,
          recommendedActions: updatedActions
        },
        logs: newLogs
      };
    });
  },

  markAlertRead: (id: string) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, isRead: true } : a)
  })),

  clearAlerts: () => set({ alerts: [] })
}));

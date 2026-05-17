export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'Pending' | 'Active' | 'Completed' | 'Failed';

export interface CrisisSignal {
  id: string;
  source: string;
  text: string;
  timestamp: string;
}

export interface DetectedCrisis {
  id: string;
  type: string;
  location: string;
  confidence: number;
  severity: Severity;
  riskScore: number;
  description: string;
  impact: {
    category: string;
    description: string;
    icon: string;
  }[];
  recommendedActions: Action[];
}

export interface Action {
  id: string;
  title: string;
  description: string;
  agent: string;
  status: Status;
  progress: number;
  estimatedImpact: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  agent: string;
  decision: string;
  status: Status;
  severity: Severity;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: Severity;
  time: string;
  isRead: boolean;
  type: 'Emergency' | 'Weather' | 'Traffic' | 'Citizen Safety';
}

export interface MapMarkerData {
  id: string;
  position: [number, number];
  type: string;
  severity: Severity;
  status: Status;
  confidence: number;
  action: string;
}

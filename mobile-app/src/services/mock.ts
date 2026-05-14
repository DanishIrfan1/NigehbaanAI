export const mockCrisisData = {
  id: "c-g10-flood-001",
  title: "اسلام آباد سیکٹر G-10 میں شدید سیلاب",
  description: "نالہ لئی میں طغیانی کے باعث G-10 کے رہائشی علاقوں میں پانی داخل ہو گیا ہے۔ فوری انخلا کی ضرورت ہے۔",
  location: "Sector G-10, Islamabad",
  confidence: 0.92,
  severity: "HIGH",
  timestamp: "2026-05-15T02:00:00Z",
  status: "ACTIVE"
};

export const mockAgentLogs = [
  {
    id: "log-1",
    timestamp: "2026-05-15T02:00:00Z",
    agent: "Detector",
    message: "Detected rising water levels in Sector G-10 via social media signals and IoT sensors.",
    level: "INFO"
  },
  {
    id: "log-2",
    timestamp: "2026-05-15T02:02:15Z",
    agent: "Analyzer",
    message: "Analyzed flood severity. Threat level assessed as HIGH with 92% confidence. 400 households at immediate risk.",
    level: "WARNING"
  },
  {
    id: "log-3",
    timestamp: "2026-05-15T02:05:30Z",
    agent: "Planner",
    message: "Formulated evacuation plan for G-10/4 and dispatching rescue boats to Kashmir Highway.",
    level: "INFO"
  },
  {
    id: "log-4",
    timestamp: "2026-05-15T02:07:45Z",
    agent: "Executor",
    message: "Dispatched automated alerts to 15,000 residents and mobilized CDA emergency response units.",
    level: "ACTION"
  }
];

export const mockActionCards = [
  {
    id: "act-1",
    title: "Evacuate G-10/4",
    description: "Deploy 5 rescue boats to Markaz G-10 for immediate evacuation.",
    priority: "CRITICAL",
    status: "PENDING"
  },
  {
    id: "act-2",
    title: "Dispatch Medical Teams",
    description: "Send 3 PIMS ambulances to Kashmir Highway intersection.",
    priority: "HIGH",
    status: "IN_PROGRESS"
  },
  {
    id: "act-3",
    title: "Setup Relief Camp",
    description: "Establish temporary shelters and food distribution at F-9 Park.",
    priority: "MEDIUM",
    status: "PENDING"
  }
];

export const mockStats = {
  before: {
    evacuatedPercent: 0,
    strandedPeople: 400,
    responseTimeMins: null,
    casualtiesRisk: "HIGH"
  },
  after: {
    evacuatedPercent: 100,
    strandedPeople: 0,
    responseTimeMins: 12,
    casualtiesRisk: "LOW"
  }
};

export const mockSystemHealth = {
  status: "ONLINE",
  activeAgents: 4,
  cpuUsagePercent: 45,
  memoryUsageMB: 1024,
  uptimeHours: 342,
  lastSync: "2026-05-15T02:30:00Z"
};

// Simulated API responses for the 5 endpoints
export const mockEndpoints = {
  getCrisisDetails: () => Promise.resolve(mockCrisisData),
  getAgentLogs: () => Promise.resolve(mockAgentLogs),
  getActionCards: () => Promise.resolve(mockActionCards),
  getImpactStats: () => Promise.resolve(mockStats),
  getSystemHealth: () => Promise.resolve(mockSystemHealth),
};

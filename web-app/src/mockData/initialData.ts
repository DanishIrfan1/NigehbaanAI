import type { Alert, LogEntry, MapMarkerData } from '../types';

export const initialAlerts: Alert[] = [
  {
    id: 'a1',
    title: 'Flood Warning — G-10',
    message: 'Please avoid G-10 Main Road due to flooding. Rescue teams dispatched.',
    severity: 'Critical',
    time: 'Just now',
    isRead: false,
    type: 'Emergency'
  },
  {
    id: 'a2',
    title: 'Traffic Spike Detected',
    message: 'Unusual congestion observed at Blue Area.',
    severity: 'Medium',
    time: '15 mins ago',
    isRead: false,
    type: 'Traffic'
  },
  {
    id: 'a3',
    title: 'Heatwave Alert',
    message: 'Temperatures expected to exceed 42°C in the afternoon.',
    severity: 'High',
    time: '2 hours ago',
    isRead: true,
    type: 'Weather'
  }
];

export const initialLogs: LogEntry[] = [
  {
    id: 'l1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString(),
    eventType: 'Flood Detection',
    agent: 'Analysis Agent',
    decision: 'Dispatch Team',
    status: 'Completed',
    severity: 'High'
  },
  {
    id: 'l2',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString(),
    eventType: 'Traffic Congestion',
    agent: 'Routing Agent',
    decision: 'Reroute Traffic',
    status: 'Active',
    severity: 'Medium'
  },
  {
    id: 'l3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toLocaleTimeString(),
    eventType: 'Weather Forecast',
    agent: 'Monitor Agent',
    decision: 'Issue Public Alert',
    status: 'Completed',
    severity: 'High'
  }
];

export const initialMapMarkers: MapMarkerData[] = [
  {
    id: 'm1',
    position: [33.6844, 73.0479], // Islamabad center
    type: 'Urban Flooding',
    severity: 'Critical',
    status: 'Active',
    confidence: 92,
    action: 'Dispatch Teams'
  },
  {
    id: 'm2',
    position: [33.7104, 73.0611], // Blue area approx
    type: 'Accident',
    severity: 'High',
    status: 'Pending',
    confidence: 85,
    action: 'Reroute Traffic'
  },
  {
    id: 'm3',
    position: [33.6938, 73.0651],
    type: 'Road Blockage',
    severity: 'Medium',
    status: 'Active',
    confidence: 78,
    action: 'Monitor'
  }
];

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useAppStore } from "../store/useAppStore";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ShieldAlert, MapPin, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock route data for Islamabad (G-10 to Blue Area simulation)
const blockedRoute: [number, number][] = [
  [33.6844, 73.0479],
  [33.6900, 73.0500],
  [33.6950, 73.0550]
];

const alternateRoute: [number, number][] = [
  [33.6844, 73.0479],
  [33.6800, 73.0550],
  [33.6900, 73.0650],
  [33.7104, 73.0611]
];

export default function CrisisMap() {
  const { mapMarkers, logs } = useAppStore();

  return (
    <div className="h-[calc(100vh-6rem)] flex space-x-6">
      {/* Map Area */}
      <Card variant="panel" className="flex-1 p-0 overflow-hidden relative border-white/10 rounded-3xl">
        <MapContainer 
          center={[33.6938, 73.0651]} 
          zoom={12} 
          className="w-full h-full z-0"
          zoomControl={false}
        >
          {/* Dark theme map tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Markers */}
          {mapMarkers.map(marker => (
            <Marker key={marker.id} position={marker.position}>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={marker.severity === 'Critical' ? 'danger' : marker.severity === 'High' ? 'warning' : 'info'}>
                      {marker.severity}
                    </Badge>
                    <span className="text-xs text-white/50">{marker.confidence}% Conf.</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{marker.type}</h3>
                  <p className="text-sm text-white/70 mb-3">Status: {marker.status}</p>
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-xs text-accent uppercase tracking-wider font-semibold block mb-1">Recommended Action</span>
                    <span className="text-sm">{marker.action}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Simulated Routes */}
          <Polyline positions={blockedRoute} color="#FF5D73" weight={4} dashArray="10, 10" />
          <Polyline positions={alternateRoute} color="#A970FF" weight={4} />

        </MapContainer>

        {/* Map Overlays */}
        <div className="absolute top-6 left-6 z-10 flex space-x-2">
          <Badge variant="default" className="bg-surface/90 backdrop-blur border-white/10 shadow-lg px-4 py-2 flex items-center">
            <div className="w-3 h-1 bg-action mr-2 rounded-full" />
            Blocked Route
          </Badge>
          <Badge variant="default" className="bg-surface/90 backdrop-blur border-white/10 shadow-lg px-4 py-2 flex items-center">
            <div className="w-3 h-1 bg-accent mr-2 rounded-full" />
            Alternate Route
          </Badge>
        </div>
      </Card>

      {/* Live Feed Panel */}
      <Card className="w-80 flex flex-col h-full border-l-4 border-l-accent overflow-hidden">
        <h2 className="text-xl font-bold mb-4 flex items-center pb-4 border-b border-white/5">
          <Navigation className="w-5 h-5 mr-2 text-accent" />
          Live Signal Feed
        </h2>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
          {logs.map(log => (
            <div key={log.id} className="bg-surface border border-white/5 rounded-xl p-4 transform transition-all hover:scale-105">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-white/40">{log.timestamp}</span>
                <div className={`w-2 h-2 rounded-full ${
                  log.severity === 'High' ? 'bg-action' : log.severity === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                } animate-pulse`} />
              </div>
              <p className="text-sm font-medium text-white/90 leading-tight mb-2">
                {log.eventType}
              </p>
              <div className="flex justify-between items-end">
                <span className="text-xs text-accent">{log.agent}</span>
                <span className="text-[10px] text-white/60 bg-white/5 px-2 py-1 rounded">{log.decision}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

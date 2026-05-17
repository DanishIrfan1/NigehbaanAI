import { useAppStore } from "../store/useAppStore";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Bell, AlertTriangle, CloudRain, Car, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Alerts() {
  const { alerts, markAlertRead, clearAlerts } = useAppStore();

  const getIcon = (type: string) => {
    switch(type) {
      case 'Emergency': return <AlertTriangle className="w-5 h-5" />;
      case 'Weather': return <CloudRain className="w-5 h-5" />;
      case 'Traffic': return <Car className="w-5 h-5" />;
      case 'Citizen Safety': return <Shield className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Alerts Center</h1>
          <p className="text-white/60">System notifications and critical warnings</p>
        </div>
        {alerts.length > 0 && (
          <Button variant="ghost" onClick={clearAlerts} size="sm">
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {alerts.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              layout
            >
              <Card 
                variant="panel" 
                className={`flex gap-4 p-5 border-l-4 ${
                  alert.severity === 'Critical' ? 'border-l-red-500 bg-red-500/5' :
                  alert.severity === 'High' ? 'border-l-yellow-500 bg-yellow-500/5' :
                  'border-l-blue-500 bg-blue-500/5'
                } ${alert.isRead ? 'opacity-70' : ''}`}
              >
                <div className={`p-3 rounded-full h-fit ${
                  alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                  alert.severity === 'High' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {getIcon(alert.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-white/90">{alert.title}</h3>
                    <span className="text-xs text-white/40">{alert.time}</span>
                  </div>
                  <p className="text-white/70 text-sm mb-3">{alert.message}</p>
                  <div className="flex justify-between items-center">
                    <Badge variant="default" className="bg-surface">{alert.type}</Badge>
                    {!alert.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markAlertRead(alert.id)}
                        className="text-xs py-1 h-auto text-accent hover:text-accent-light"
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {alerts.length === 0 && (
          <Card className="text-center py-16">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-medium text-white/70">No active alerts</h3>
            <p className="text-white/40 text-sm">You're all caught up!</p>
          </Card>
        )}
      </div>
    </div>
  );
}

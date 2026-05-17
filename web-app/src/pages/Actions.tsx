import { useAppStore } from "../store/useAppStore";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Activity, Clock, CheckCircle2 } from "lucide-react";

export default function Actions() {
  const { currentCrisis } = useAppStore();

  // Mock actions if no crisis is currently active
  const defaultActions = [
    { id: '1', title: 'Routine Area Scan', agent: 'Monitor Agent', status: 'Completed', progress: 100, estimatedImpact: 'Low', time: '2 hours ago' },
    { id: '2', title: 'Traffic Flow Optimization', agent: 'Routing Agent', status: 'Active', progress: 65, estimatedImpact: 'Medium', time: 'Active now' }
  ];

  const activeActions = currentCrisis ? currentCrisis.recommendedActions : defaultActions;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Execution Center</h1>
          <p className="text-white/60">Live tracking of AI-driven response operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeActions.map((action, idx) => (
          <Card key={idx} variant="panel" className="border-white/10 hover:border-white/20 transition-all flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-surface rounded-lg">
                {action.status === 'Completed' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : action.status === 'Active' ? (
                  <Activity className="w-6 h-6 text-blue-400" />
                ) : (
                  <Clock className="w-6 h-6 text-yellow-400" />
                )}
              </div>
              <Badge variant={action.status === 'Completed' ? 'success' : action.status === 'Active' ? 'info' : 'warning'}>
                {action.status}
              </Badge>
            </div>
            
            <h3 className="text-lg font-bold mb-1">{action.title}</h3>
            <p className="text-sm text-accent mb-6">Assigned to: {action.agent}</p>
            
            <div className="mt-auto space-y-4">
              <div>
                <div className="flex justify-between text-xs text-white/50 mb-1">
                  <span>Execution Progress</span>
                  <span>{action.progress}%</span>
                </div>
                <ProgressBar 
                  progress={action.progress} 
                  color={action.progress === 100 ? "bg-green-400" : "bg-blue-400"} 
                />
              </div>
              
              <div className="bg-surface p-3 rounded-lg border border-white/5 flex justify-between items-center text-xs">
                <span className="text-white/50">Expected Impact:</span>
                <span className={`font-medium ${
                  action.estimatedImpact === 'Critical' ? 'text-red-400' : 'text-white'
                }`}>{action.estimatedImpact}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

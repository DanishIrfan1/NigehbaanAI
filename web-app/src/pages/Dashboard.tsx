import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Switch } from "../components/ui/Switch";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Activity, ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle, Car, Users, Droplets } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [signalText, setSignalText] = useState("");
  const { isAnalyzing, currentCrisis, simulateAnalysis, dispatchAction } = useAppStore();

  const handleAnalyze = () => {
    if (!signalText.trim()) return;
    simulateAnalysis(signalText);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Crisis Command Center</h1>
          <p className="text-white/60">Real-time intelligence and response orchestrator</p>
        </div>
        <div className="flex space-x-4">
          <Badge variant="success" className="px-4 py-2 text-sm border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
            System Active
          </Badge>
        </div>
      </div>

      {/* Input Section */}
      <Card variant="panel" className="relative overflow-hidden border-white/10">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <Activity className="w-5 h-5 mr-2 text-accent" />
            Incident Signal Input
          </h2>
          <div className="flex items-center space-x-4 text-sm text-white/60">
            <label className="flex items-center cursor-pointer">
              <Switch checked={true} onChange={() => {}} className="mr-2" />
              Social Media
            </label>
            <label className="flex items-center cursor-pointer">
              <Switch checked={true} onChange={() => {}} className="mr-2" />
              Citizen Reports
            </label>
          </div>
        </div>
        
        <div className="space-y-4">
          <textarea
            value={signalText}
            onChange={(e) => setSignalText(e.target.value)}
            placeholder="E.g. G-10 mein pani bhar gaya hai, gaariyan phans gayi hain"
            className="w-full h-32 bg-surface border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
          />
          <div className="flex justify-end">
            <Button onClick={handleAnalyze} isLoading={isAnalyzing} size="lg" className="w-full md:w-auto px-12">
              {isAnalyzing ? "AI Analyzing..." : "Analyze Crisis"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Analysis Results */}
      {isAnalyzing && (
        <Card className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
            <ShieldAlert className="w-6 h-6 text-accent absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-medium animate-pulse text-gradient">AI Agents analyzing situation...</h3>
            <p className="text-white/50 text-sm">Cross-referencing weather, traffic, and social signals</p>
          </div>
        </Card>
      )}

      {currentCrisis && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Crisis Info */}
          <Card className="lg:col-span-2 space-y-6 border-l-4 border-l-action">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="danger" className="mb-2">Detected Crisis</Badge>
                <h2 className="text-3xl font-bold mb-1">{currentCrisis.type}</h2>
                <p className="text-lg text-white/70 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-action mr-2" />
                  {currentCrisis.location}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-accent">{currentCrisis.confidence}%</div>
                <div className="text-sm text-white/50 uppercase tracking-wider">Confidence</div>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-4 border border-white/5">
              <h4 className="text-sm text-white/50 mb-2 uppercase tracking-wider font-semibold">AI Reasoning</h4>
              <p className="text-white/90 leading-relaxed">
                "{currentCrisis.description}"
              </p>
            </div>

            <div>
              <h4 className="text-sm text-white/50 mb-4 uppercase tracking-wider font-semibold">Impact Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentCrisis.impact.map((impact, idx) => (
                  <div key={idx} className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 text-accent">
                      {impact.icon === 'Car' && <Car className="w-5 h-5" />}
                      {impact.icon === 'AlertTriangle' && <AlertTriangle className="w-5 h-5" />}
                      {impact.icon === 'Droplets' && <Droplets className="w-5 h-5" />}
                      {impact.icon === 'Users' && <Users className="w-5 h-5" />}
                    </div>
                    <span className="text-xs text-white/70">{impact.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Action Plan */}
          <div className="space-y-6">
            <Card variant="panel">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-action" />
                Response Plan
              </h3>
              <div className="space-y-4">
                {currentCrisis.recommendedActions.map((action) => (
                  <div key={action.id} className="bg-surface border border-white/5 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white/90">{action.title}</h4>
                      {action.status === 'Pending' ? (
                        <Badge variant="warning">Pending</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </div>
                    <p className="text-xs text-white/50 mb-4">{action.description}</p>
                    
                    {action.status === 'Pending' ? (
                      <Button 
                        size="sm" 
                        variant="primary" 
                        className="w-full text-xs"
                        onClick={() => dispatchAction(action.id)}
                      >
                        Execute Action
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/50">
                          <span>Executing by {action.agent}</span>
                          <span>{action.progress}%</span>
                        </div>
                        <ProgressBar progress={action.progress} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}

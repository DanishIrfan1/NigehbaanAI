import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Switch } from "../components/ui/Switch";
import { Button } from "../components/ui/Button";
import { Sliders, Bell, Globe, Database, Moon, Sun } from "lucide-react";

export default function Settings() {
  const [theme, setTheme] = useState(true); // true = dark
  const [notifications, setNotifications] = useState(true);
  const [autoDispatch, setAutoDispatch] = useState(false);
  const [language, setLanguage] = useState("English");
  const [threshold, setThreshold] = useState(75);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">System Settings</h1>
          <p className="text-white/60">Configure Nigehbaan AI parameters and integrations</p>
        </div>
        <Button variant="primary">Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-3 bg-surface border border-white/10 rounded-xl text-accent font-medium flex items-center">
            <Sliders className="w-4 h-4 mr-3" /> General
          </button>
          <button className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl text-white/60 hover:text-white transition-colors flex items-center">
            <Bell className="w-4 h-4 mr-3" /> Notifications
          </button>
          <button className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl text-white/60 hover:text-white transition-colors flex items-center">
            <Database className="w-4 h-4 mr-3" /> Integrations
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-6">
          <Card variant="panel" className="space-y-6">
            <h2 className="text-xl font-bold border-b border-white/5 pb-4">Preferences</h2>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-white/90">Theme Mode</h4>
                <p className="text-sm text-white/50">Toggle between dark and light futuristic UI.</p>
              </div>
              <div className="flex items-center space-x-3 bg-surface p-1 rounded-full border border-white/5">
                <button 
                  onClick={() => setTheme(false)} 
                  className={`p-2 rounded-full ${!theme ? 'bg-white/10 text-white' : 'text-white/40'}`}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setTheme(true)} 
                  className={`p-2 rounded-full ${theme ? 'bg-accent/20 text-accent' : 'text-white/40'}`}
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-white/90">System Language</h4>
                <p className="text-sm text-white/50">Primary language for AI reasoning output.</p>
              </div>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-surface border border-white/10 text-white text-sm rounded-xl focus:ring-accent focus:border-accent block p-2.5 outline-none"
              >
                <option value="English">English</option>
                <option value="Urdu">Urdu</option>
              </select>
            </div>
          </Card>

          <Card variant="panel" className="space-y-6">
            <h2 className="text-xl font-bold border-b border-white/5 pb-4">AI Configuration</h2>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-white/90">Autonomous Dispatch</h4>
                <p className="text-sm text-white/50">Allow AI to execute critical actions without human approval.</p>
              </div>
              <Switch checked={autoDispatch} onChange={setAutoDispatch} />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-white/90">Crisis Detection Sensitivity</h4>
                  <p className="text-sm text-white/50">Lower threshold increases false positives.</p>
                </div>
                <span className="text-accent font-mono">{threshold}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          </Card>

          <Card variant="panel" className="space-y-6 opacity-70">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Globe className="w-5 h-5 mr-2 text-white/50" /> API Integrations
              </h2>
              <span className="text-xs bg-white/10 px-2 py-1 rounded text-white/50">Coming Soon</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-white/5 bg-surface rounded-xl flex items-center justify-between">
                <span className="text-white/70 text-sm">Weather API</span>
                <div className="w-2 h-2 rounded-full bg-white/20" />
              </div>
              <div className="p-4 border border-white/5 bg-surface rounded-xl flex items-center justify-between">
                <span className="text-white/70 text-sm">Maps API</span>
                <div className="w-2 h-2 rounded-full bg-white/20" />
              </div>
              <div className="p-4 border border-white/5 bg-surface rounded-xl flex items-center justify-between">
                <span className="text-white/70 text-sm">Social Media Feed</span>
                <div className="w-2 h-2 rounded-full bg-white/20" />
              </div>
              <div className="p-4 border border-white/5 bg-surface rounded-xl flex items-center justify-between">
                <span className="text-white/70 text-sm">Traffic DB</span>
                <div className="w-2 h-2 rounded-full bg-white/20" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

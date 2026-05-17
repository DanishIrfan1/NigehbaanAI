import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { User, Shield, Zap, Target, Award } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockActivityData = [
  { name: 'Mon', actions: 12 },
  { name: 'Tue', actions: 19 },
  { name: 'Wed', actions: 15 },
  { name: 'Thu', actions: 25 },
  { name: 'Fri', actions: 22 },
  { name: 'Sat', actions: 30 },
  { name: 'Sun', actions: 28 },
];

export default function Profile() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Administrator Profile</h1>
          <p className="text-white/60">System access and performance metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="flex flex-col items-center text-center p-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-action p-1 mb-4">
            <div className="w-full h-full bg-surface rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white/50" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-1">System Admin</h2>
          <Badge variant="success" className="mb-4">Level 5 Clearance</Badge>
          <p className="text-sm text-white/50 mb-6">Nigehbaan Command Center</p>
          
          <div className="w-full space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/50 text-sm">ID</span>
              <span className="font-mono text-sm">ADM-9942</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/50 text-sm">Status</span>
              <span className="text-green-400 text-sm">Online</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/50 text-sm">Region</span>
              <span className="text-sm">Islamabad Capital</span>
            </div>
          </div>
        </Card>

        {/* Stats & Activity */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card variant="panel" className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-accent/20 text-accent rounded-xl">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white/50">Crises Detected</p>
                <p className="text-2xl font-bold">1,204</p>
              </div>
            </Card>
            <Card variant="panel" className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-action/20 text-action rounded-xl">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white/50">Actions Executed</p>
                <p className="text-2xl font-bold">8,432</p>
              </div>
            </Card>
            <Card variant="panel" className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white/50">Avg Response Time</p>
                <p className="text-2xl font-bold">1.2s</p>
              </div>
            </Card>
            <Card variant="panel" className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white/50">System Uptime</p>
                <p className="text-2xl font-bold">99.9%</p>
              </div>
            </Card>
          </div>

          <Card variant="panel" className="h-[300px] p-6">
            <h3 className="text-lg font-bold mb-4">Orchestration Activity (7 Days)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockActivityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A970FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#A970FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171728', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="actions" stroke="#A970FF" strokeWidth={3} fillOpacity={1} fill="url(#colorActions)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}

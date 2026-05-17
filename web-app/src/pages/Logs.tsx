import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Search, Filter } from "lucide-react";

export default function Logs() {
  const { logs } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Emergency", "Traffic", "Weather", "Alerts"];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.agent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "All" || log.eventType.includes(filter); // Basic simulation
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">System Logs</h1>
          <p className="text-white/60">Immutable trace of AI decisions and system events</p>
        </div>
      </div>

      <Card variant="panel" className="border-white/10 p-0 overflow-hidden">
        {/* Controls */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search logs by event or agent..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${
                  filter === f 
                    ? 'bg-accent text-white' 
                    : 'bg-surface border border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-light/50 text-white/50 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Event Type</th>
                <th className="p-4 font-medium">Agent</th>
                <th className="p-4 font-medium">Decision</th>
                <th className="p-4 font-medium">Severity</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white/70 text-sm">{log.timestamp}</td>
                  <td className="p-4 font-medium text-white/90">{log.eventType}</td>
                  <td className="p-4 text-accent text-sm">{log.agent}</td>
                  <td className="p-4 text-white/80 text-sm">{log.decision}</td>
                  <td className="p-4">
                    <Badge variant={log.severity === 'Critical' ? 'danger' : log.severity === 'High' ? 'warning' : 'info'}>
                      {log.severity}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center text-xs font-medium ${
                      log.status === 'Completed' ? 'text-green-400' : 'text-blue-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        log.status === 'Completed' ? 'bg-green-400' : 'bg-blue-400 animate-pulse'
                      }`} />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/50">
                    No logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-white/5 flex justify-between items-center text-sm text-white/50">
          <span>Showing {filteredLogs.length} entries</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded bg-surface border border-white/10 hover:bg-white/5 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 rounded bg-surface border border-white/10 hover:bg-white/5 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}

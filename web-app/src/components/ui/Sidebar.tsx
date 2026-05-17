import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  ScrollText, 
  Activity, 
  Bell, 
  User, 
  Settings,
  ShieldAlert
} from "lucide-react";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/map', label: 'Crisis Map', icon: MapIcon },
  { path: '/logs', label: 'Logs', icon: ScrollText },
  { path: '/actions', label: 'Actions', icon: Activity },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <div className="w-64 h-screen border-r border-white/5 bg-surface-light/50 backdrop-blur-xl flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-light to-accent flex items-center justify-center shadow-lg shadow-accent/20">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Nigehbaan <span className="text-accent">AI</span></h1>
          <p className="text-[10px] text-white/50 uppercase tracking-wider">Orchestrator</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all relative group overflow-hidden",
              isActive 
                ? "text-white bg-white/10" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent border-l-2 border-accent"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 relative z-10", isActive && "text-accent")} />
                <span className="font-medium relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/5">
        <div className="bg-surface rounded-xl p-4 border border-white/5">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-white/80">System Active</span>
          </div>
          <p className="text-[10px] text-white/40 mt-1">All AI agents operational</p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { 
  LayoutDashboard, 
  Radio,
  Network,
  BarChart3, 
  TrainTrack
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isWsConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isWsConnected 
}) => {
  // Dashboard on top, followed by Live Simulation as its own section, then Network, Analytics
  const navItems = [
    { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
    { id: 'simulation', label: 'Live Train Simulation', icon: Radio, highlight: true },
    { id: 'network', label: 'Network Conditions', icon: Network },
    { id: 'analytics', label: 'ML Model Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen select-none shadow-xs">
      {/* Top Branding */}
      <div>
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <TrainTrack className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">RailETA</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  SIH
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                Dynamic Train ETA & Operations
              </p>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 flex items-center space-x-1.5 font-mono uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-md border border-slate-150">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
            <span>Ministry of Railways Demo</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Indicators */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60 text-[11px] font-mono space-y-2">
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
          System Telemetry Status
        </div>
        
        <div className="flex items-center justify-between text-slate-700">
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Simulation</span>
          </span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">ONLINE</span>
        </div>

        <div className="flex items-center justify-between text-slate-700">
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>ETA Engine</span>
          </span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">ONLINE</span>
        </div>

        <div className="flex items-center justify-between text-slate-700">
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>ML Regressor</span>
          </span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">ONLINE</span>
        </div>

        <div className="flex items-center justify-between text-slate-700 pt-2 border-t border-slate-200">
          <span className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-blue-600 animate-pulse' : 'bg-amber-500'}`}></span>
            <span>WebSocket</span>
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
            isWsConnected 
              ? 'text-blue-700 bg-blue-50 border-blue-200' 
              : 'text-amber-700 bg-amber-50 border-amber-200'
          }`}>
            {isWsConnected ? 'STREAMING' : 'POLLING'}
          </span>
        </div>
      </div>
    </aside>
  );
};

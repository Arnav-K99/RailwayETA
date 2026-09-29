import React from 'react';
import { 
  Flame, 
  AlertTriangle, 
  Wrench, 
  Clock, 
  CloudRain, 
  Trash2, 
  X
} from 'lucide-react';
import { OperationalEvent } from '../types/types';

interface EventTriggerPanelProps {
  activeEvents: OperationalEvent[];
  onTriggerEvent: (type: string, title?: string, impact?: number) => void;
  onDeleteEvent: (id: string) => void;
  onClearAll: () => void;
}

export const EventTriggerPanel: React.FC<EventTriggerPanelProps> = ({
  activeEvents,
  onTriggerEvent,
  onDeleteEvent,
  onClearAll,
}) => {
  const eventButtons = [
    {
      type: 'congestion',
      label: 'Traffic Congestion',
      impact: '+8 min',
      icon: Flame,
      color: 'bg-amber-50 hover:bg-amber-100/80 text-amber-900 border-amber-200',
    },
    {
      type: 'speed_restriction',
      label: 'TSR 30 km/h',
      impact: '+7 min',
      icon: AlertTriangle,
      color: 'bg-orange-50 hover:bg-orange-100/80 text-orange-900 border-orange-200',
    },
    {
      type: 'maintenance_block',
      label: 'Maintenance Block',
      impact: '+12 min',
      icon: Wrench,
      color: 'bg-red-50 hover:bg-red-100/80 text-red-900 border-red-200',
    },
    {
      type: 'unscheduled_halt',
      label: 'Unscheduled Halt',
      impact: '+6 min',
      icon: Clock,
      color: 'bg-rose-50 hover:bg-rose-100/80 text-rose-900 border-rose-200',
    },
    {
      type: 'heavy_rain',
      label: 'Heavy Monsoon Rain',
      impact: '1.15x Drag',
      icon: CloudRain,
      color: 'bg-sky-50 hover:bg-sky-100/80 text-sky-900 border-sky-200',
    },
  ];

  return (
    <div className="unicolor-card space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Operational Event Injection Engine</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Inject real-time corridor anomalies to test dynamic ETA recalculation & downstream propagation.
          </p>
        </div>

        {activeEvents.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition-all shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Trigger Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {eventButtons.map((btn) => {
          const Icon = btn.icon;
          const isTriggered = activeEvents.some((e) => e.type === btn.type);

          return (
            <button
              key={btn.type}
              onClick={() => onTriggerEvent(btn.type)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 text-center transition-all duration-150 active:scale-95 shadow-2xs ${
                btn.color
              } ${isTriggered ? 'ring-2 ring-blue-500 font-bold' : ''}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="font-bold text-xs">{btn.label}</div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/80 border border-slate-200/80 font-bold">
                {btn.impact}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Disruption Chips with 1-click Resolve */}
      {activeEvents.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider mb-2">
            Active Corridor Disruptions ({activeEvents.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {activeEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center space-x-2 text-xs text-slate-800 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span className="font-semibold">{ev.title}</span>
                <span className="font-mono text-amber-700 font-bold bg-amber-50 px-1 rounded border border-amber-200">+{ev.impact_minutes}m</span>
                <button
                  onClick={() => onDeleteEvent(ev.id)}
                  className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                  title="Resolve / Remove Disruption"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

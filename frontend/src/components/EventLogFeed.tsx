import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { OperationalEvent } from '../types/types';

interface EventLogFeedProps {
  activeEvents: OperationalEvent[];
  simTime: string;
}

interface LogEntry {
  id: string;
  time: string;
  text: string;
  type: 'EVENT' | 'ETA_UPDATE' | 'SYSTEM';
}

export const EventLogFeed: React.FC<EventLogFeedProps> = ({ 
  activeEvents, 
  simTime 
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      time: '18:35:00',
      text: 'Train 12951 Rajdhani Express departed Kota Junction (+15m baseline delay)',
      type: 'SYSTEM'
    },
    {
      id: 'init-2',
      time: '18:35:01',
      text: 'ETA Engine: Initialized section traversal predictions for 5 upcoming stations',
      type: 'ETA_UPDATE'
    }
  ]);

  useEffect(() => {
    if (activeEvents.length > 0) {
      const latest = activeEvents[activeEvents.length - 1];
      const newEntry: LogEntry = {
        id: `ev-${Date.now()}`,
        time: simTime || '18:40:00',
        text: `⚠ ${latest.title} on ${latest.section_id} (+${latest.impact_minutes}m). Recalculating downstream stations...`,
        type: 'EVENT'
      };
      setLogs((prev) => [newEntry, ...prev.slice(0, 15)]);
    }
  }, [activeEvents.length, simTime]);

  return (
    <div className="unicolor-card flex flex-col h-full">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Control Office Activity Feed
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE</span>
        </span>
      </div>

      <div className="space-y-1.5 flex-1 overflow-y-auto font-mono text-[11px] pr-1">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`p-2 rounded-lg border leading-tight ${
              log.type === 'EVENT'
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : log.type === 'ETA_UPDATE'
                ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between opacity-80 text-[10px] mb-1">
              <span className="font-bold">{log.time}</span>
              <span className="uppercase text-[9px] font-bold px-1 py-0.2 rounded bg-white/70 border border-slate-200">
                {log.type}
              </span>
            </div>
            <div>{log.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

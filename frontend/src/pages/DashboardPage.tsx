import React, { useState, useEffect } from 'react';
import { 
  Train as TrainIcon, 
  CheckCircle2, 
  Clock, 
  Target, 
  Wrench, 
  ArrowUpRight 
} from 'lucide-react';
import { Train } from '../types/types';
import { api } from '../services/api';

export const DashboardPage: React.FC<{ onSelectTrain: (id: string) => void }> = ({ onSelectTrain }) => {
  const [fleet, setFleet] = useState<Train[]>([]);
  const [kpis, setKpis] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [trainsData, kpiData] = await Promise.all([
          api.getTrains(),
          api.getKPIs()
        ]);
        setFleet(trainsData);
        setKpis(kpiData);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Divisional Railway Operations Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time fleet monitoring, sectional headway tracking, and dynamic arrival forecasting.
          </p>
        </div>
        <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-semibold flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>WCR KOTA DIVISION • NCR AGRA DIVISION</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Active Trains */}
        <div className="unicolor-card">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Active Trains</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <TrainIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {kpis?.active_trains ?? 24}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-blue-700 font-bold">100%</span>
            <span>monitored via RTIS</span>
          </div>
        </div>

        {/* On Time */}
        <div className="unicolor-card">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px]">On-Time Running</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">
            {kpis?.on_time ?? 14}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-700 font-bold">{kpis?.on_time_percentage ?? 58.3}%</span> punctuality
          </div>
        </div>

        {/* Delayed */}
        <div className="unicolor-card">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Delayed Coaching</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">
            {kpis?.delayed ?? 10}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Avg delay: <span className="text-amber-700 font-bold">+18.4m</span>
          </div>
        </div>

        {/* ML ETA Mean Absolute Error */}
        <div className="unicolor-card">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Avg ETA Error (MAE)</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-sky-600 font-mono">
            {kpis?.avg_eta_error_minutes ?? 3.72} <span className="text-sm font-normal text-slate-500">min</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Baseline IR error: <span className="text-red-600 font-bold">14.6m</span>
          </div>
        </div>

        {/* Active Track Blocks */}
        <div className="unicolor-card">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Active Track Blocks</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-600 font-mono">
            {kpis?.active_blocks_count ?? 2}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            TSRs & OHE maintenance
          </div>
        </div>
      </div>

      {/* Fleet Monitored Table */}
      <div className="unicolor-card p-0 overflow-hidden shadow-xs">
        <div className="mac-panel-header">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Coaching Fleet Telemetry & Ahead Predictions
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select any train to monitor live dynamic section arrivals.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            {fleet.length} Trains in Network Context
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="mac-table">
            <thead>
              <tr>
                <th>Train No. & Name</th>
                <th>Corridor Route</th>
                <th>Current Loc</th>
                <th>Next Station</th>
                <th>Speed</th>
                <th>Delay</th>
                <th>Zone</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fleet.map((tr) => {
                const isPrimary = tr.id === '12951';
                const isLate = tr.current_delay_min > 5;
                const delayBadge = tr.current_delay_min <= 2
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isLate
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <tr
                    key={tr.id}
                    className={isPrimary ? 'bg-blue-50/40 hover:bg-blue-50/70 font-medium' : ''}
                  >
                    <td>
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-1.5 rounded-lg ${isPrimary ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <TrainIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                            <span>{tr.train_number} {tr.name}</span>
                            {isPrimary && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 border border-blue-200">
                                LIVE TARGET
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            ID: {tr.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="text-slate-700 font-medium">
                      {tr.origin} → {tr.destination}
                    </td>

                    <td className="font-mono text-slate-700">
                      {tr.current_station || 'Kota Junction'}
                    </td>

                    <td className="font-medium text-slate-800">
                      {tr.next_station || 'Sawai Madhopur'}
                    </td>

                    <td className="font-mono font-semibold text-slate-800">
                      {tr.speed_kmh} km/h
                    </td>

                    <td>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${delayBadge}`}>
                        {tr.current_delay_min > 0 ? `+${tr.current_delay_min}m` : 'ON TIME'}
                      </span>
                    </td>

                    <td className="font-mono text-slate-500">
                      {tr.zone || 'WCR'}
                    </td>

                    <td className="text-right">
                      <button
                        onClick={() => onSelectTrain(tr.id)}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-md text-xs font-semibold border border-blue-200 transition-all inline-flex items-center space-x-1 shadow-2xs"
                      >
                        <span>Live Sim</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

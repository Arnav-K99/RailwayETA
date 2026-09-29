import React, { useState, useEffect } from 'react';
import { CheckCircle2, Radio, Server } from 'lucide-react';
import { api } from '../services/api';

export const DataFeedsPage: React.FC = () => {
  const [dataSources, setDataSources] = useState<any>(null);

  useEffect(() => {
    async function loadSources() {
      try {
        const data = await api.getDataSources();
        setDataSources(data);
      } catch (e) {
        console.error(e);
      }
    }
    loadSources();
  }, []);

  const active = dataSources?.active_source;
  const enterprise = dataSources?.enterprise_adapter;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Enterprise Data Source Architecture & Telemetry Connectors
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Decoupled DataSource abstraction allowing plug-and-play transition from simulation to live Indian Railways feeds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Source (Simulation) */}
        <div className="unicolor-card border-emerald-300 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{active?.type || 'SimulationDataSource'}</h3>
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">
                  ● ACTIVE FOR SIH PROTOTYPE
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              CONNECTED
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {active?.description || 'Physics-based simulation engine generating realistic train acceleration, sectional progress, speed limits, and operational anomalies.'}
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs font-mono text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Update Frequency:</span>
              <span className="text-slate-900 font-bold">500 ms (2 Hz)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Telemetry Channel:</span>
              <span className="text-slate-900 font-bold">Full-Duplex WebSockets</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Synthetic Data Flag:</span>
              <span className="text-amber-700 font-bold bg-amber-50 px-1 rounded border border-amber-200">TRUE (Demo Mode)</span>
            </div>
          </div>
        </div>

        {/* Enterprise Adapter (Live CRIS) */}
        <div className="unicolor-card border-blue-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{enterprise?.type || 'LiveRailwayDataSource'}</h3>
                <span className="text-[10px] font-mono text-blue-700 font-bold uppercase">
                  ARCHITECTED FOR PRODUCTION
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
              STANDBY / READY
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Pre-defined abstract interfaces ready to hook into official Indian Railways divisional servers upon internal intranet authorization.
          </p>

          <div className="space-y-1.5 pt-2">
            <div className="text-[10px] font-mono text-slate-500 font-semibold uppercase tracking-wider">
              Target Live Data Pipelines:
            </div>
            {enterprise?.integration_targets?.map((target: string, idx: number) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{target}</span>
              </div>
            )) || (
              <div className="text-xs text-slate-500">Configuring enterprise pipeline connectors...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

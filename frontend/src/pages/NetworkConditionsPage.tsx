import React, { useState, useEffect } from 'react';
import { NetworkSection, Train } from '../types/types';
import { api } from '../services/api';
import { 
  AlertTriangle, 
  Wrench, 
  Flame, 
  CheckCircle, 
  TrainTrack, 
  ArrowRight,
  ShieldCheck,
  Clock,
  Gauge,
  Info
} from 'lucide-react';

export const NetworkConditionsPage: React.FC = () => {
  const [trains, setTrains] = useState<Train[]>([]);
  const [selectedTrainId, setSelectedTrainId] = useState<string>('12951');
  const [sections, setSections] = useState<NetworkSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<NetworkSection | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Load all 6 trains
  useEffect(() => {
    async function loadTrains() {
      try {
        const data = await api.getTrains();
        setTrains(data);
      } catch (e) {
        console.error('Failed to load fleet:', e);
      }
    }
    loadTrains();
  }, []);

  // Load network sections whenever selected train changes
  useEffect(() => {
    async function loadConditions() {
      setLoading(true);
      try {
        const data = await api.getNetworkConditions(
          selectedTrainId === 'ALL' ? undefined : selectedTrainId
        );
        setSections(data);
        if (data.length > 0) {
          setSelectedSection(data[0]);
        }
      } catch (e) {
        console.error('Failed to load network conditions:', e);
      } finally {
        setLoading(false);
      }
    }
    loadConditions();
    const interval = setInterval(loadConditions, 3000);
    return () => clearInterval(interval);
  }, [selectedTrainId]);

  const activeTrain = trains.find((t) => t.id === selectedTrainId || t.train_number === selectedTrainId);

  // Compute stats for current train view
  const totalImpact = sections.reduce((acc, s) => acc + (s.expected_impact_min || 0), 0);
  const disruptionCount = sections.filter((s) => s.has_maintenance || s.has_congestion || s.has_speed_restriction).length;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Train-Wise Corridor Operating Conditions</span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-bold">
            Live Feed
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select any train to inspect active track blocks, caution orders (TSR), and junction congestion along its exact path.
        </p>
      </div>

      {/* Train Selector Pills (Train-Wise Navigation) */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
          Click Train to Filter Route Conditions
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {/* Option: All Corridor Sections */}
          <button
            onClick={() => setSelectedTrainId('ALL')}
            className={`text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between shadow-2xs ${
              selectedTrainId === 'ALL'
                ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="font-mono text-xs font-extrabold text-slate-900">
              ALL SECTIONS
            </div>
            <div className="text-[11px] font-bold text-slate-700 mt-1">
              Entire Corridor
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              General Overview
            </div>
          </button>

          {/* 6 Specific Trains */}
          {trains.map((t) => {
            const isSelected = selectedTrainId === t.id || selectedTrainId === t.train_number;
            const hasDelay = t.current_delay_min > 5;

            return (
              <button
                key={t.id}
                onClick={() => setSelectedTrainId(t.id)}
                className={`text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between shadow-2xs ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-slate-900">
                    {t.train_number}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                      hasDelay
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {t.current_delay_min > 0 ? `+${Math.round(t.current_delay_min)}m` : 'On Time'}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-800 truncate mt-1">
                  {t.name.split(' ')[0]} {t.name.split(' ')[1] || ''}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                  {t.origin.split(' ')[0]} → {t.destination.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Train Route Summary Ribbon */}
      <div className="unicolor-card p-4 bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <TrainTrack className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  {selectedTrainId === 'ALL' ? 'FULL NETWORK' : activeTrain?.train_number}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {selectedTrainId === 'ALL' ? 'Delhi–Mumbai Central Main Trunk' : activeTrain?.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {selectedTrainId === 'ALL' 
                  ? 'Western Central Railway & Northern Railway Operational Division'
                  : `${activeTrain?.origin} → ${activeTrain?.destination} (${activeTrain?.zone})`}
              </p>
            </div>
          </div>

          {/* Aggregate Corridor Metrics for this train */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Corridor Sections</div>
              <div className="font-bold text-slate-900">{sections.length} blocks</div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Cautions / TSRs</div>
              <div className={`font-bold ${disruptionCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {disruptionCount} active {disruptionCount === 1 ? 'alert' : 'alerts'}
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Added Route Drag</div>
              <div className={`font-bold ${totalImpact > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                +{Math.round(totalImpact)} min delay
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Sections for Selected Train */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((sec) => {
          const isMaint = sec.has_maintenance;
          const isCongested = sec.has_congestion;
          const isTsr = sec.has_speed_restriction;
          const isSelected = selectedSection?.section_id === sec.section_id;

          let cardBorder = 'border-slate-200';
          let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          let icon = <CheckCircle className="w-4 h-4 text-emerald-600" />;

          if (isMaint) {
            cardBorder = 'border-red-300';
            statusBadge = 'bg-red-50 text-red-700 border-red-200';
            icon = <Wrench className="w-4 h-4 text-red-600" />;
          } else if (isCongested) {
            cardBorder = 'border-amber-300';
            statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
            icon = <Flame className="w-4 h-4 text-amber-600" />;
          } else if (isTsr) {
            cardBorder = 'border-orange-300';
            statusBadge = 'bg-orange-50 text-orange-700 border-orange-200';
            icon = <AlertTriangle className="w-4 h-4 text-orange-600" />;
          }

          return (
            <div
              key={sec.section_id}
              onClick={() => setSelectedSection(sec)}
              className={`unicolor-card flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-150 ${cardBorder} ${
                isSelected ? 'ring-2 ring-blue-500/30 shadow-md' : 'hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                      Section ID: {sec.section_id}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 tracking-tight mt-0.5">
                      {sec.section_name}
                    </h3>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    {icon}
                  </div>
                </div>

                <div className={`mt-3 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${statusBadge}`}>
                  {sec.status}
                </div>
              </div>

              {/* Specs & Impact on This Train */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-lg p-3 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Section Distance:</span>
                  <span className="font-bold">{sec.distance_km} km</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Permissible Speed Limit:</span>
                  <span className="font-bold">{sec.max_permissible_speed_kmh} km/h</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Nominal Run Time:</span>
                  <span className="font-bold">{sec.historical_avg_time_min} min</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 pt-1.5 border-t border-slate-200">
                  <span className="text-slate-500">Delay Impact on Train:</span>
                  <span className={`font-bold ${sec.expected_impact_min > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {sec.expected_impact_min > 0 ? `+${sec.expected_impact_min} min` : 'Nominal (0m)'}
                  </span>
                </div>
              </div>

              {/* Disruption details if any */}
              {sec.active_events && sec.active_events.length > 0 && (
                <div className="text-[11px] font-mono text-amber-800 bg-amber-50/80 p-2 rounded border border-amber-200 space-y-0.5">
                  <div className="font-bold text-[10px] uppercase text-amber-900">Active Caution Order:</div>
                  <div>{sec.active_events[0].title}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Section Deep Operational Diagnostics Panel */}
      {selectedSection && (
        <div className="unicolor-card bg-white border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Section Controller Diagnostics: {selectedSection.section_name} ({selectedSection.section_id})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.2">
                  Operating intelligence for section clearance, signaling headway, and train precedence.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Track Type: {selectedSection.track_type || 'Double Line Electrified Broad Gauge'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Signaling Protocol</div>
              <div className="font-bold text-slate-900 mt-0.5">4-Aspect Automatic Signaling</div>
              <div className="text-[10px] text-slate-500 mt-1">1.0 km block headway clearance</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Precedence Regulation</div>
              <div className="font-bold text-blue-700 mt-0.5">Premier Express First Priority</div>
              <div className="text-[10px] text-slate-500 mt-1">Freight trains looped on siding</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Traction Power Supply</div>
              <div className="font-bold text-slate-900 mt-0.5">25 kV AC 50 Hz OverHead (OHE)</div>
              <div className="text-[10px] text-slate-500 mt-1">Feeder substation nominal</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Dynamic ML Traversal Time</div>
              <div className="font-bold text-slate-900 mt-0.5">
                {(selectedSection.historical_avg_time_min + (selectedSection.expected_impact_min || 0)).toFixed(1)} min
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Baseline: {selectedSection.historical_avg_time_min}m | Drag: +{selectedSection.expected_impact_min || 0}m
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

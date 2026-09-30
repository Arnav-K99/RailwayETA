import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NetworkSection, Train } from '../types/types';
import { api } from '../services/api';
import { stationCode } from '../utils/stationCode';
import {
  AlertTriangle,
  Wrench,
  Flame,
  CheckCircle,
  TrainTrack,
  ChevronRight,
  Info,
  X
} from 'lucide-react';

const sectionStyle = (sec: NetworkSection) => {
  if (sec.has_maintenance) {
    return { badge: 'bg-red-50 text-red-700 border-red-200', icon: <Wrench className="w-4 h-4 text-red-600" /> };
  }
  if (sec.has_congestion) {
    return { badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Flame className="w-4 h-4 text-amber-600" /> };
  }
  if (sec.has_speed_restriction) {
    return { badge: 'bg-orange-50 text-orange-700 border-orange-200', icon: <AlertTriangle className="w-4 h-4 text-orange-600" /> };
  }
  return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle className="w-4 h-4 text-emerald-600" /> };
};

export const NetworkConditionsPage: React.FC = () => {
  const [trains, setTrains] = useState<Train[]>([]);
  // Train whose details window is open ('ALL' = whole corridor, null = closed)
  const [openTrainId, setOpenTrainId] = useState<string | null>(null);
  const [sections, setSections] = useState<NetworkSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

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

  // Load (and keep refreshing) sections while a train's window is open
  useEffect(() => {
    if (!openTrainId) return;
    setSections([]);
    setSelectedSectionId(null);
    async function loadConditions() {
      try {
        const data = await api.getNetworkConditions(openTrainId === 'ALL' ? undefined : openTrainId!);
        setSections(data);
      } catch (e) {
        console.error('Failed to load network conditions:', e);
      }
    }
    loadConditions();
    const interval = setInterval(loadConditions, 3000);
    return () => clearInterval(interval);
  }, [openTrainId]);

  // Esc closes the window
  useEffect(() => {
    if (!openTrainId) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenTrainId(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openTrainId]);

  const activeTrain = trains.find((t) => t.id === openTrainId || t.train_number === openTrainId);
  const isAll = openTrainId === 'ALL';
  const selectedSection = sections.find((s) => s.section_id === selectedSectionId) ?? sections[0];

  const totalImpact = sections.reduce((acc, s) => acc + (s.expected_impact_min || 0), 0);
  const disruptionCount = sections.filter((s) => s.has_maintenance || s.has_congestion || s.has_speed_restriction).length;

  const rows = [
    { id: 'ALL', number: 'ALL', name: 'Entire Corridor', route: 'All sections', zone: 'WCR / NR', delay: null as number | null },
    ...trains.map((t) => ({
      id: t.id,
      number: t.train_number,
      name: t.name,
      route: `${stationCode(t.origin)} → ${stationCode(t.destination)}`,
      zone: t.zone ?? '',
      delay: t.current_delay_min
    }))
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1100px] mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Train-Wise Corridor Operating Conditions</span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-bold">
            Live Feed
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Click a train to see track blocks, caution orders (TSR) and congestion along its path.
        </p>
      </div>

      {/* Vertical train list */}
      <div className="unicolor-card p-0 overflow-hidden bg-white">
        <ul className="divide-y divide-slate-100">
          {rows.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => setOpenTrainId(r.id)}
                className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <TrainTrack className="w-4 h-4" />
                </div>
                <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded w-14 text-center shrink-0">
                  {r.number}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{r.name}</div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {r.route}{r.zone && <span className="text-slate-400"> · {r.zone}</span>}
                  </div>
                </div>
                {r.delay !== null && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border shrink-0 ${
                    r.delay > 5
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {r.delay > 0 ? `+${Math.round(r.delay)}m` : 'On Time'}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Details window (portal: the page's fade-in transform would otherwise trap position:fixed) */}
      {openTrainId && createPortal(
        <div
          className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setOpenTrainId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Window header */}
            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    {isAll ? 'ALL' : activeTrain?.train_number}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {isAll ? 'Entire Corridor' : activeTrain?.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isAll
                    ? 'All monitored sections · WCR & NR divisions'
                    : `${activeTrain?.origin} → ${activeTrain?.destination} · ${activeTrain?.zone ?? ''}`}
                </p>
              </div>
              <button
                onClick={() => setOpenTrainId(null)}
                aria-label="Close"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Sections</div>
                  <div className="font-bold text-slate-900">{sections.length} blocks</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Alerts</div>
                  <div className={`font-bold ${disruptionCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {disruptionCount} {disruptionCount === 1 ? 'alert' : 'alerts'}
                  </div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Added Delay</div>
                  <div className={`font-bold ${totalImpact > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    +{Math.round(totalImpact)} min
                  </div>
                </div>
              </div>

              {/* Sections */}
              {sections.length === 0 ? (
                <div className="py-10 text-center text-xs font-mono text-slate-400">Loading sections…</div>
              ) : (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {sections.map((sec) => {
                    const { badge, icon } = sectionStyle(sec);
                    const isSelected = selectedSection?.section_id === sec.section_id;
                    const isPassed = sec.train_state === 'PASSED';
                    const isCurrent = sec.train_state === 'CURRENT';
                    return (
                      <button
                        key={sec.section_id}
                        onClick={() => setSelectedSectionId(sec.section_id)}
                        className={`w-full text-left px-4 py-3 transition-colors ${isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'} ${isPassed ? 'opacity-55' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-white border border-slate-200 shrink-0">{icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 truncate">{sec.section_name}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shrink-0 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  Train here · {Math.round(sec.progress_percent ?? 0)}% · {Math.round(sec.live_speed_kmh ?? 0)} km/h
                                </span>
                              )}
                              {isPassed && (
                                <span className="text-[10px] font-mono text-slate-400 shrink-0">Passed</span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              {sec.distance_km} km · max {sec.max_permissible_speed_kmh} km/h · {sec.historical_avg_time_min} min run
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${badge}`}>
                            {sec.status}
                          </span>
                          <span className={`text-xs font-mono font-bold w-14 text-right shrink-0 ${
                            sec.expected_impact_min > 0 ? 'text-amber-700' : 'text-emerald-700'
                          }`}>
                            {sec.expected_impact_min > 0 ? `+${sec.expected_impact_min}m` : '0m'}
                          </span>
                        </div>
                        {sec.active_events && sec.active_events.length > 0 && (
                          <div className="mt-2 ml-11 text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            Caution order: {sec.active_events[0].title}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Diagnostics for the highlighted section */}
              {selectedSection && (
                <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      {selectedSection.section_name} · {selectedSection.section_id}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Track</div>
                      <div className="font-bold text-slate-900 mt-0.5">{selectedSection.track_type || 'Double Line Electrified BG'}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">ML Traversal Time</div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {(selectedSection.historical_avg_time_min + (selectedSection.expected_impact_min || 0)).toFixed(1)} min
                        <span className="text-slate-400 font-normal"> (base {selectedSection.historical_avg_time_min}m + {selectedSection.expected_impact_min || 0}m)</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Signalling</div>
                      <div className="font-bold text-slate-900 mt-0.5">4-Aspect Automatic · 1 km headway</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Traction</div>
                      <div className="font-bold text-slate-900 mt-0.5">25 kV AC 50 Hz OHE</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

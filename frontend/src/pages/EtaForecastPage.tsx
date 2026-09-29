import React, { useState, useEffect, useMemo } from 'react';
import { SimulationState, Train } from '../types/types';
import { api } from '../services/api';
import { 
  ShieldAlert, 
  Cpu, 
  CheckCircle, 
  Search, 
  TrainTrack, 
  Clock, 
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface EtaForecastPageProps {
  state: SimulationState | null;
  initialTrainId?: string;
}

export const EtaForecastPage: React.FC<EtaForecastPageProps> = ({ state, initialTrainId }) => {
  const [trains, setTrains] = useState<Train[]>([]);
  const [selectedTrainId, setSelectedTrainId] = useState<string>(initialTrainId || '12951');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [trainEtaData, setTrainEtaData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialTrainId) {
      setSelectedTrainId(initialTrainId);
    }
  }, [initialTrainId]);

  // Load all 6 fleet trains
  useEffect(() => {
    async function loadFleet() {
      try {
        const data = await api.getTrains();
        setTrains(data);
      } catch (e) {
        console.error('Failed to load fleet:', e);
      }
    }
    loadFleet();
  }, []);

  // Fetch selected train's dynamic ETA data
  useEffect(() => {
    async function loadEta() {
      setLoading(true);
      try {
        const data = await api.getTrainEta(selectedTrainId);
        setTrainEtaData(data);
      } catch (e) {
        console.error(`Failed to load ETA for ${selectedTrainId}:`, e);
      } finally {
        setLoading(false);
      }
    }
    loadEta();
  }, [selectedTrainId]);

  // If 12951 is selected and live simulation state is active, synchronize live state
  const activeTrainData = useMemo(() => {
    if (selectedTrainId === '12951' && state?.train) {
      return {
        train_id: '12951',
        train_number: state.train.train_number,
        train_name: state.train.name,
        origin: 'New Delhi (NDLS)',
        destination: 'Mumbai Central (MMCT)',
        current_station: state.train.current_station,
        next_station: state.train.next_station,
        speed_kmh: state.train.speed_kmh,
        current_delay_min: state.train.current_delay_min,
        status: state.train.status,
        upcoming_stations: state.upcoming_stations ?? [],
        why_eta_changed: state.why_eta_changed ?? [],
        is_simulation_target: true,
      };
    }
    return trainEtaData;
  }, [selectedTrainId, state, trainEtaData]);

  // Filter trains by search term
  const filteredTrains = useMemo(() => {
    if (!searchTerm.trim()) return trains;
    const term = searchTerm.toLowerCase().trim();
    return trains.filter(
      (t) =>
        t.train_number.toLowerCase().includes(term) ||
        t.name.toLowerCase().includes(term) ||
        t.origin.toLowerCase().includes(term) ||
        t.destination.toLowerCase().includes(term)
    );
  }, [trains, searchTerm]);

  const currentDelay = activeTrainData?.current_delay_min ?? 0;
  const upcomingStations = activeTrainData?.upcoming_stations ?? [];
  const whyEtaChanged = activeTrainData?.why_eta_changed ?? [];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Title & Train Search Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Dynamic ETA Forecasting & Ahead-of-Train Prediction</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-bold">
              6 Trains Active
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare static legacy schedule extrapolation with RailETA ML section-traversal intelligence.
          </p>
        </div>

        {/* Search by Train Number or Name */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by train no. (e.g. 12002, 22436)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-mono"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Train Selector Pills (All 6 Trains) */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
          Select Monitored Coaching Train
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {filteredTrains.length === 0 ? (
            <div className="col-span-full py-3 text-center text-xs text-slate-500 font-mono bg-white rounded-lg border border-slate-200">
              No trains found matching "{searchTerm}". Try train numbers 12951, 12002, 22436, 12260, 12414, 12953.
            </div>
          ) : (
            filteredTrains.map((t) => {
              const isSelected = selectedTrainId === t.id || selectedTrainId === t.train_number;
              const isLate = t.current_delay_min > 5;
              const isOnTime = t.current_delay_min <= 5;

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
                        isLate
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {t.current_delay_min > 0 ? `+${Math.round(t.current_delay_min)}m` : 'On Time'}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 truncate mt-1">
                    {t.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                    {t.origin.split(' ')[0]} → {t.destination.split(' ')[0]}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Train Header Banner */}
      {activeTrainData && (
        <div className="unicolor-card p-4 bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <TrainTrack className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    {activeTrainData.train_number}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {activeTrainData.train_name}
                  </h3>
                  {activeTrainData.is_simulation_target && (
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live Simulation Link</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center space-x-1.5">
                  <span>{activeTrainData.origin}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span>{activeTrainData.destination}</span>
                </p>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Location</div>
                <div className="font-bold text-slate-900">{activeTrainData.current_station}</div>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Speed</div>
                <div className="font-bold text-blue-700">{Math.round(activeTrainData.speed_kmh)} km/h</div>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Delay</div>
                <div className={`font-bold ${currentDelay > 5 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {currentDelay > 0 ? `+${Math.round(currentDelay)} min` : 'On Time'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Architectural Comparison Infographic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Legacy / Flawed Approach */}
        <div className="bg-red-50/50 border border-red-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-red-700 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Legacy Approach (Static Schedule + Current Delay)</span>
          </div>
          <div className="font-mono text-xs text-slate-800 bg-white p-3 rounded-lg border border-red-200 shadow-2xs space-y-1">
            <div className="text-slate-500">Scheduled Timetable Arrival</div>
            <div className="text-slate-500">+ Static Current Delay (+{Math.round(currentDelay)}m)</div>
            <div className="text-slate-500">+ Fixed Slack Buffer (-2m)</div>
            <div className="text-red-600 font-bold pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>= Naive Extrapolated ETA:</span>
              <span>Blind to Oncoming Track Conditions</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-red-800">Operational Failure Mode: </strong>
            Indian Railways currently relies primarily on static schedule offsets. If a speed restriction or freight queue exists 50 km ahead, the legacy system continues reporting nominal timings until the train is physically blocked.
          </p>
        </div>

        {/* RailETA Dynamic Approach */}
        <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>RailETA Dynamic Approach (Section-wise Traversal ML)</span>
          </div>
          <div className="font-mono text-xs text-slate-800 bg-white p-3 rounded-lg border border-blue-200 shadow-2xs space-y-1">
            <div className="text-slate-500">Live Satellite Telemetry + Current Delay (+{Math.round(currentDelay)}m)</div>
            <div className="text-slate-500">+ Gradient Boosted Regressor Sectional Traversal</div>
            <div className="text-amber-700">+ Active TSRs, Precedence, Maintenance Blocks Ahead</div>
            <div className="text-blue-700 font-bold pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>= Ahead-of-Train Dynamic ETA:</span>
              <span className="text-emerald-700">Early Warning Enabled</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-blue-900">RailETA SIH Solution: </strong>
            Evaluates each consecutive block ahead of the locomotive. Dynamically forecasts downstream cascading delay, empowering section controllers to re-sequence crossings and notify passengers in advance.
          </p>
        </div>
      </div>

      {/* Downstream Stations Comparison Table */}
      <div className="unicolor-card p-0 overflow-hidden shadow-xs">
        <div className="mac-panel-header">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Downstream Corridor Propagation Audit: {activeTrainData?.train_number} {activeTrainData?.train_name}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Next Stop: <span className="text-blue-600 font-semibold">{activeTrainData?.next_station}</span> | Base Delay: <span className="text-amber-700 font-mono font-bold bg-amber-50 px-1 rounded border border-amber-200">+{Math.round(currentDelay)}m</span>
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Continuously Recalculating</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="mac-table">
            <thead>
              <tr>
                <th>Upcoming Station</th>
                <th>Scheduled Time</th>
                <th>Legacy Naive ETA</th>
                <th>RailETA Dynamic Forecast</th>
                <th>Early Warning Delta</th>
                <th>Confidence Interval</th>
                <th>Ahead Disruption Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {upcomingStations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    Journey finished or no upcoming stations for this train.
                  </td>
                </tr>
              ) : (
                upcomingStations.map((st: any) => {
                  const scheduledParts = (st.scheduled_arrival || '12:00').split(':');
                  const schedMins = parseInt(scheduledParts[0]) * 60 + parseInt(scheduledParts[1]);
                  const naiveMins = schedMins + Math.round(currentDelay);
                  const naiveH = Math.floor(naiveMins / 60) % 24;
                  const naiveM = naiveMins % 60;
                  const naiveTimeStr = `${String(naiveH).padStart(2, '0')}:${String(naiveM).padStart(2, '0')}`;

                  const predParts = (st.predicted_eta || '12:00').split(':');
                  const predMins = parseInt(predParts[0]) * 60 + parseInt(predParts[1]);
                  const deltaMin = predMins - naiveMins;

                  return (
                    <tr key={st.station_id || st.station_code}>
                      <td>
                        <div className="font-semibold text-slate-900 flex items-center space-x-2">
                          <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                            {st.station_code}
                          </span>
                          <span>{st.station_name}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Dist: {st.distance_km} km
                        </div>
                      </td>

                      <td className="font-mono text-slate-500 font-medium">
                        {st.scheduled_arrival}
                      </td>

                      <td className="font-mono text-slate-500">
                        {naiveTimeStr} <span className="text-[10px] text-slate-400 font-normal">(+{Math.round(currentDelay)}m)</span>
                      </td>

                      <td>
                        <div className="font-mono font-bold text-xs text-blue-700">
                          {st.predicted_eta}
                        </div>
                        <div className="text-[10px] font-mono text-amber-700 font-medium">
                          +{Math.round(st.delay_minutes)} min late
                        </div>
                      </td>

                      <td>
                        {deltaMin !== 0 ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                            deltaMin > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {deltaMin > 0 ? `+${deltaMin}m slower` : `${deltaMin}m recovery`}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">Identical</span>
                        )}
                      </td>

                      <td>
                        <div className="font-mono text-slate-800 text-xs font-semibold">
                          {st.confidence_range}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {st.confidence_percent}% confidence
                        </div>
                      </td>

                      <td>
                        {st.has_active_disruption ? (
                          <span className="px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold inline-flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Section Disruption Ahead</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold inline-flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Nominal Headway</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Train-Specific Explainability Waterfall Breakdown */}
      {whyEtaChanged.length > 0 && (
        <div className="unicolor-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                Root-Cause Explainability Decomposition: {activeTrainData?.train_number}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Dynamic delay decomposition showing why ETA diverged from scheduled timetable.
              </p>
            </div>
            <span className="text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded font-bold">
              Ahead-of-Train Explainability
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {whyEtaChanged.map((item: any, idx: number) => {
              const impact = item.impact_min || 0;
              let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
              if (item.category === 'MAINTENANCE' || impact >= 10) {
                badgeColor = 'bg-red-50 text-red-700 border-red-200';
              } else if (item.category === 'CONGESTION' || item.category === 'TSR' || impact >= 5) {
                badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
              } else if (impact === 0) {
                badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              }

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                        {item.factor}
                      </h4>
                    </div>
                    <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded border ${badgeColor}`}>
                      {impact > 0 ? `+${impact}m` : impact < 0 ? `${impact}m` : '0m'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

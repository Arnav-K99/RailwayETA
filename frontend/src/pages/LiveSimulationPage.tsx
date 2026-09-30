import React, { useState, useEffect, useMemo } from 'react';
import { RouteData, SimulationState, Train } from '../types/types';
import { LiveMap } from '../components/LiveMap';
import { api } from '../services/api';
import { 
  Search, 
  Train as TrainIcon, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface LiveSimulationPageProps {
  state: SimulationState | null;
  routeData: RouteData | null;
  onTriggerEvent: (type: string, title?: string, impact?: number) => void;
  onDeleteEvent: (id: string) => void;
  onClearAll: () => void;
  onStartSimulation: () => Promise<void> | void;
  onResetSimulation: () => Promise<void> | void;
  initialTrainId?: string;
}

// Complete geographic coordinates for all 6 train corridors
const STATION_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  NDLS: { lat: 28.6431, lon: 77.2197, name: 'New Delhi' },
  NZM: { lat: 28.5889, lon: 77.2534, name: 'Hazrat Nizamuddin' },
  JAT: { lat: 32.7060, lon: 74.8800, name: 'Jammu Tawi' },
  BKN: { lat: 28.0229, lon: 73.3119, name: 'Bikaner' },
  GGN: { lat: 28.4595, lon: 77.0266, name: 'Gurgaon' },
  RE: { lat: 28.1928, lon: 76.6239, name: 'Rewari Jn' },
  AWR: { lat: 27.5530, lon: 76.6346, name: 'Alwar Jn' },
  BKI: { lat: 27.0500, lon: 76.5700, name: 'Bandikui Jn' },
  JP: { lat: 26.9196, lon: 75.7878, name: 'Jaipur Jn' },
  AII: { lat: 26.4499, lon: 74.6399, name: 'Ajmer Jn' },
  MTJ: { lat: 27.4924, lon: 77.6737, name: 'Mathura Jn' },
  BTE: { lat: 27.2152, lon: 77.4930, name: 'Bharatpur' },
  GGC: { lat: 26.4716, lon: 76.7188, name: 'Gangapur City' },
  SWM: { lat: 25.9928, lon: 76.3683, name: 'Sawai Madhopur' },
  KOTA: { lat: 25.2138, lon: 75.8648, name: 'Kota Jn' },
  RTM: { lat: 23.3315, lon: 75.0367, name: 'Ratlam Jn' },
  AGC: { lat: 27.1593, lon: 77.9942, name: 'Agra Cantt' },
  DHO: { lat: 26.7025, lon: 77.8934, name: 'Dholpur Jn' },
  GWL: { lat: 26.2183, lon: 78.1828, name: 'Gwalior Jn' },
  VGLJ: { lat: 25.4484, lon: 78.5685, name: 'Jhansi Jn' },
  BPL: { lat: 23.2599, lon: 77.4126, name: 'Bhopal Jn' },
  CNB: { lat: 26.4537, lon: 80.3507, name: 'Kanpur Central' },
  PRYJ: { lat: 25.4497, lon: 81.8282, name: 'Prayagraj Jn' },
  BSB: { lat: 25.3216, lon: 82.9876, name: 'Varanasi Jn' },
  DHN: { lat: 23.7957, lon: 86.4304, name: 'Dhanbad Jn' },
  ASN: { lat: 23.6889, lon: 86.9661, name: 'Asansol Jn' },
  DGR: { lat: 23.5204, lon: 87.3119, name: 'Durgapur' },
  BWN: { lat: 23.2324, lon: 87.8615, name: 'Barddhaman Jn' },
  SDAH: { lat: 22.5697, lon: 88.3697, name: 'Sealdah' },
  MMCT: { lat: 18.9696, lon: 72.8193, name: 'Mumbai Central' }
};

// Full, fixed stop sequence per train (mirrors backend train_fleet_data / corridor_data).
// The map always draws the whole journey; live data only says where along it the train is.
const TRAIN_ROUTES: Record<string, string[]> = {
  '12951': ['KOTA', 'SWM', 'GGC', 'BTE', 'MTJ', 'AGC'],
  '12002': ['MTJ', 'AGC', 'DHO', 'GWL', 'VGLJ', 'BPL'],
  '22436': ['CNB', 'PRYJ', 'BSB'],
  '12260': ['DHN', 'ASN', 'DGR', 'BWN', 'SDAH'],
  '12414': ['GGN', 'RE', 'AWR', 'BKI', 'JP', 'AII'],
  '12953': ['NZM', 'MTJ', 'SWM', 'KOTA', 'RTM', 'MMCT'],
};

export const LiveSimulationPage: React.FC<LiveSimulationPageProps> = ({
  state,
  routeData,
  onTriggerEvent,
  onDeleteEvent,
  onClearAll,
  onStartSimulation,
  onResetSimulation,
  initialTrainId
}) => {
  const [trains, setTrains] = useState<Train[]>([]);
  // Train picked on the dashboard ("Live Sim" button) opens selected here
  const [selectedTrainId, setSelectedTrainId] = useState<string>(initialTrainId || '12951');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTrainEta, setSelectedTrainEta] = useState<any>(null);

  // Every visit to this section restarts the run from the first station
  useEffect(() => {
    (async () => {
      await onResetSimulation();
      await onStartSimulation();
    })();
  }, []);

  // Load all 6 monitored trains
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

  // Fetch selected train dynamic ETA data
  useEffect(() => {
    async function loadEta() {
      setSelectedTrainEta(null); // don't show the previous train's stops while this one loads
      try {
        const data = await api.getTrainEta(selectedTrainId);
        setSelectedTrainEta(data);
      } catch (e) {
        console.error('Failed to load train ETA:', e);
      }
    }
    loadEta();
  }, [selectedTrainId]);

  // Synchronize live moving train coordinates if primary simulation train is active
  const currentTrain = useMemo(() => {
    if (selectedTrainId === '12951' && state?.train) {
      return {
        id: '12951',
        train_number: state.train.train_number,
        name: state.train.name,
        origin: 'New Delhi (NDLS)',
        destination: 'Mumbai Central (MMCT)',
        current_station: state.train.current_station,
        next_station: state.train.next_station,
        next_station_code: state.train.next_station_code,
        latitude: state.train.latitude,
        longitude: state.train.longitude,
        speed_kmh: state.train.speed_kmh,
        current_delay_min: state.train.current_delay_min,
        status: state.train.status,
        upcoming_stations: state.upcoming_stations ?? [],
        is_simulation_target: true
      };
    }
    return selectedTrainEta || trains.find(t => t.id === selectedTrainId || t.train_number === selectedTrainId) || null;
  }, [selectedTrainId, state, selectedTrainEta, trains]);

  // Filter trains by search input
  const filteredTrains = useMemo(() => {
    if (!searchTerm.trim()) return trains;
    const term = searchTerm.toLowerCase().trim();
    return trains.filter(
      t =>
        t.train_number.toLowerCase().includes(term) ||
        t.name.toLowerCase().includes(term) ||
        t.origin.toLowerCase().includes(term) ||
        t.destination.toLowerCase().includes(term)
    );
  }, [trains, searchTerm]);

  // Stations list from the API (ETAs for every stop after the train's starting point)
  const stationsList = useMemo(() => {
    return currentTrain?.upcoming_stations ?? [];
  }, [currentTrain]);

  // 12951 is driven by the backend simulator; the other trains are animated here
  const isLiveTrain = selectedTrainId === '12951';

  // Fixed stop sequence for the selected train
  const routeCodes = useMemo(
    () => (TRAIN_ROUTES[selectedTrainId] ?? []).filter(code => STATION_COORDS[code]),
    [selectedTrainId]
  );

  // Where each stop sits along the route, as a 0..1 fraction of total length
  const stopFractions = useMemo(() => {
    const stops = routeCodes.map(code => STATION_COORDS[code]);
    const cumulative = [0];
    for (let i = 1; i < stops.length; i++) {
      const kmScale = Math.cos((stops[i].lat * Math.PI) / 180); // shrink longitude degrees
      cumulative.push(cumulative[i - 1] + Math.hypot(
        stops[i].lat - stops[i - 1].lat,
        (stops[i].lon - stops[i - 1].lon) * kmScale
      ));
    }
    const total = cumulative[cumulative.length - 1] || 1;
    return cumulative.map(d => d / total);
  }, [routeCodes]);

  // Current speed multiplier from state
  const speedMultiplier = state?.simulation?.speed_multiplier ?? 10;
  const isSimPaused = state?.simulation?.is_paused ?? false;

  // Journey progress (0 = origin, 1 = destination) for the non-simulated trains
  const [animProgress, setAnimProgress] = useState<number>(0);

  // Each train starts its journey from the origin when selected
  useEffect(() => setAnimProgress(0), [selectedTrainId]);

  useEffect(() => {
    // Only an explicit pause stops these; 12951 finishing its run (is_running=false) must not freeze them
    if (isLiveTrain || isSimPaused) return;

    // Whole journey takes ~400s / speed (10x ≈ 40s, 50x ≈ 8s, same pace as 12951), then holds at its destination
    const step = speedMultiplier / 8000;
    const timer = setInterval(() => {
      setAnimProgress(prev => Math.min(1, prev + step));
    }, 50);
    return () => clearInterval(timer);
  }, [isLiveTrain, speedMultiplier, isSimPaused]);

  // Index of the next stop: live code for 12951, otherwise the first stop beyond the train
  const arrived = isLiveTrain
    ? state?.train?.status === 'COMPLETED'
    : animProgress >= 1;
  const nextIdx = arrived
    ? -1
    : isLiveTrain
      ? routeCodes.indexOf(currentTrain?.next_station_code ?? '')
      : stopFractions.findIndex(f => f > animProgress);
  const lastLeftIdx = arrived ? routeCodes.length - 1 : nextIdx - 1;
  const nextCode: string | undefined = routeCodes[nextIdx];

  // Table rows: only the stops still ahead of the train
  const tableStations = useMemo(() => {
    if (arrived) return [];
    if (isLiveTrain) return stationsList;
    return stationsList.filter((st: any) => routeCodes.indexOf(st.station_code || st.station_id) >= nextIdx);
  }, [arrived, isLiveTrain, stationsList, routeCodes, nextIdx]);

  // Map stations = whole route; flags only mark where the train is along it
  const mapStations = useMemo(() => {
    const upcoming = new Map<string, any>(
      tableStations.map((st: any) => [st.station_code || st.station_id, st])
    );
    return routeCodes.map((code, i) => {
      const coord = STATION_COORDS[code];
      const st = upcoming.get(code);
      return {
        code,
        name: st?.station_name || coord.name,
        lat: coord.lat,
        lon: coord.lon,
        isNext: i === nextIdx,
        isCurrent: i === lastLeftIdx,
        scheduled_arrival: st?.scheduled_arrival,
        predicted_eta: st?.predicted_eta
      };
    });
  }, [routeCodes, tableStations, nextIdx, lastLeftIdx]);

  // Build route polyline from the fixed route only, so it (and the map zoom) changes per train, not per tick
  const routePolyline: Array<[number, number]> = useMemo(() => {
    const stops = routeCodes.map(code => STATION_COORDS[code]);
    if (stops.length < 2) return [];

    const points: Array<[number, number]> = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const s1 = stops[i];
      const s2 = stops[i + 1];
      const steps = 30;
      for (let step = 0; step < steps; step++) {
        const t = step / steps;
        points.push([
          s1.lat + (s2.lat - s1.lat) * t,
          s1.lon + (s2.lon - s1.lon) * t
        ]);
      }
    }
    const last = stops[stops.length - 1];
    points.push([last.lat, last.lon]);
    return points;
  }, [routeCodes]);

  // Dynamic moving train object along the track
  const mapTrain = useMemo(() => {
    if (!currentTrain) return null;
    let lat = currentTrain.latitude;
    let lon = currentTrain.longitude;

    if (isLiveTrain && state?.train) {
      lat = state.train.latitude;
      lon = state.train.longitude;
    } else if (arrived && mapStations.length > 0) {
      const last = mapStations[mapStations.length - 1];
      lat = last.lat;
      lon = last.lon;
    } else if (nextIdx > 0) {
      // Between the stop it last left and its next stop, by distance along the route
      const s1 = mapStations[nextIdx - 1];
      const s2 = mapStations[nextIdx];
      const t = (animProgress - stopFractions[nextIdx - 1]) / (stopFractions[nextIdx] - stopFractions[nextIdx - 1]);
      lat = s1.lat + (s2.lat - s1.lat) * t;
      lon = s1.lon + (s2.lon - s1.lon) * t;
    }

    return {
      train_number: currentTrain.train_number,
      name: currentTrain.name,
      latitude: lat,
      longitude: lon,
      speed_kmh: arrived ? 0 : (currentTrain.speed_kmh ?? 78),
      current_delay_min: currentTrain.current_delay_min ?? 0,
      current_station: mapStations[lastLeftIdx]?.name,
      next_station: mapStations[nextIdx]?.name, // undefined once arrived
    };
  }, [currentTrain, isLiveTrain, state, mapStations, arrived, nextIdx, lastLeftIdx, stopFractions, animProgress]);

  const currentDelay = currentTrain?.current_delay_min ?? 0;

  return (
    <div className="p-6 space-y-4 max-w-[1700px] mx-auto">
      {/* 1. TOP SECTION: Clean Search Input & Train Selection Pills (No top Rajdhani banner) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search train no. (e.g. 12951, 12002) or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Train Quick-Select Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
          {filteredTrains.map((t) => {
            const isSelected = selectedTrainId === t.id || selectedTrainId === t.train_number;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTrainId(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span className="font-extrabold mr-1">{t.train_number}</span>
                <span className="opacity-90">{t.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN VIEW: Left = Stations & Delay & Confidence | Right = Bold Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[600px]">
        {/* LEFT COLUMN (5 cols): Stations, Delay, Original Time, Confidence */}
        <div className="lg:col-span-5 unicolor-card p-0 overflow-hidden shadow-xs flex flex-col bg-white rounded-2xl">
          <div className="mac-panel-header shrink-0 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                {currentTrain?.train_number}
              </span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                {currentTrain?.name ?? currentTrain?.train_name}
              </h3>
            </div>
            <div className="text-xs font-mono">
              <span className={`px-2 py-0.5 rounded font-bold border ${
                currentDelay > 5
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {currentDelay > 0 ? `+${Math.round(currentDelay)}m Delay` : 'On Time'}
              </span>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            <table className="mac-table w-full [&_th]:px-3 [&_td]:px-3">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Sched</th>
                  <th>ETA</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {tableStations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 text-xs font-mono">
                      {arrived
                        ? `Arrived at ${mapStations[mapStations.length - 1]?.name ?? 'destination'}.`
                        : 'No upcoming station stops for this journey.'}
                    </td>
                  </tr>
                ) : (
                  tableStations.map((st: any) => {
                    const isNext = nextCode === (st.station_code || st.station_id);
                    const delayMin = Math.round(st.delay_minutes || 0);

                    return (
                      <tr 
                        key={st.station_id || st.station_code}
                        className={isNext ? 'bg-emerald-50/40 font-medium' : ''}
                      >
                        {/* Station Name & Code */}
                        <td>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                              {st.station_code}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">
                              {st.station_name}
                            </span>
                            {isNext && (
                              <span className="text-[9px] font-mono uppercase font-black px-1.5 py-0.2 rounded bg-emerald-600 text-white animate-pulse">
                                NEXT
                              </span>
                            )}
                          </div>
                          {st.distance_km && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {st.distance_km} km
                            </div>
                          )}
                        </td>

                        {/* Original Scheduled Time */}
                        <td className="font-mono text-slate-600 font-semibold text-xs">
                          {st.scheduled_arrival}
                        </td>

                        {/* Predicted Dynamic ETA: red = late, green = early */}
                        <td className="font-mono text-xs">
                          <div className={`font-bold ${
                            delayMin > 1 ? 'text-red-600' : delayMin < -1 ? 'text-emerald-600' : 'text-slate-800'
                          }`}>
                            {st.predicted_eta}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {delayMin > 1 ? `+${delayMin}m late` : delayMin < -1 ? `${-delayMin}m early` : 'on time'}
                          </div>
                        </td>

                        {/* Confidence */}
                        <td>
                          <div className="font-mono text-slate-800 text-xs font-semibold">
                            {st.confidence_percent || 90}%
                          </div>
                          {st.confidence_range && (
                            <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                              {st.confidence_range}
                            </div>
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

        {/* RIGHT COLUMN (7 cols): The Map with bold highlighted stations & moving train */}
        <div className="lg:col-span-7 h-[600px]">
          <LiveMap 
            train={mapTrain} 
            stations={mapStations} 
            routePolyline={routePolyline} 
          />
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { INDIA_PATH, INDIA_VIEWBOX, projectIndia } from './indiaOutline';

interface LiveMapProps {
  train: {
    train_number: string;
    name: string;
    latitude: number;
    longitude: number;
    speed_kmh: number;
    current_delay_min: number;
    current_station?: string;
    next_station?: string;
  } | null;
  stations: Array<{
    code: string;
    name: string;
    lat: number;
    lon: number;
    isNext?: boolean;
    isCurrent?: boolean;
    scheduled_arrival?: string;
    predicted_eta?: string;
  }>;
  routePolyline: Array<[number, number]>;
}

// OSM tiles, greyed out via CSS (className below) so the route is the loudest thing on screen
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

// Controller to automatically fit map bounds so the ENTIRE route track is visible
function RouteBoundsController({ points }: { points: Array<[number, number]> }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length >= 2) {
      const validPoints = points.filter(
        pt => Array.isArray(pt) && Number.isFinite(pt[0]) && Number.isFinite(pt[1])
      );
      if (validPoints.length >= 2) {
        map.fitBounds(L.latLngBounds(validPoints), {
          // extra room top-right for the India inset, bottom-left for the progress card
          paddingTopLeft: [40, 140],
          paddingBottomRight: [80, 100],
          animate: true,
          maxZoom: 10
        });
      }
    }
  }, [points, map]);
  return null;
}

const LABEL_HALO = 'text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 3px #fff';

// Station dot + bold name label; scheduled/predicted times live in the hover tooltip
const createStationIcon = (name: string, isNext: boolean, isCurrent: boolean) => {
  const dot = isNext
    ? '<span class="absolute w-5 h-5 rounded-full bg-emerald-400/40 animate-ping"></span><span class="relative w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow"></span>'
    : isCurrent
      ? '<span class="relative w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow"></span>'
      : '<span class="relative w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-500"></span>';

  const label = isNext
    ? `<span class="absolute left-full ml-1.5 whitespace-nowrap bg-white text-[11px] font-extrabold text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-300 shadow-sm">Next · ${name}</span>`
    : `<span class="absolute left-full ml-1 whitespace-nowrap text-[11px] font-extrabold ${isCurrent ? 'text-blue-700' : 'text-slate-800'}" style="${LABEL_HALO}">${name}</span>`;

  return L.divIcon({
    className: 'station-pin',
    html: `<div class="relative w-5 h-5 flex items-center justify-center select-none">${dot}${label}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Compact locomotive marker; speed lives in the progress card, not on the map
const createTrainIcon = () => L.divIcon({
  className: 'custom-train-marker',
  html: `
    <div class="relative w-8 h-8 flex items-center justify-center select-none pointer-events-none">
      <span class="absolute w-8 h-8 rounded-full bg-blue-500/20 animate-radar"></span>
      <div class="relative w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V5c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8 1.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-7H6V5h12v5z"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

type LatLon = [number, number];

// Telemetry arrives in steps (every ~250ms). Glide from the last shown position to each new one
// over the same interval, so the train moves at a steady speed instead of jumping.
function useSmoothPosition(target: LatLon | null, trainKey: string): LatLon | null {
  const [shown, setShown] = useState<LatLon | null>(target);
  const anim = useRef({ key: trainKey, from: target, to: target, current: target, start: 0, duration: 0, lastUpdate: 0 });
  const frame = useRef(0);

  useEffect(() => {
    const a = anim.current;
    const now = performance.now();
    cancelAnimationFrame(frame.current);

    // First fix or a different train: snap, don't glide across the country
    if (!target || !a.current || a.key !== trainKey) {
      Object.assign(a, { key: trainKey, from: target, to: target, current: target, lastUpdate: now });
      setShown(target);
      return;
    }

    Object.assign(a, {
      from: a.current,
      to: target,
      start: now,
      // steady speed: take as long as the gap since the previous update (bounded for pauses/halts)
      duration: Math.min(400, Math.max(16, now - a.lastUpdate)),
      lastUpdate: now
    });

    const step = (t: number) => {
      const k = Math.min(1, (t - a.start) / a.duration);
      a.current = [a.from![0] + (a.to![0] - a.from![0]) * k, a.from![1] + (a.to![1] - a.from![1]) * k];
      setShown(a.current);
      if (k < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }, [target?.[0], target?.[1], trainKey]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return shown;
}

// Split the route at the point nearest the train into travelled / remaining parts
function splitRoute(points: Array<[number, number]>, train: [number, number] | null) {
  if (points.length < 2 || !train) return { done: [] as Array<[number, number]>, ahead: points, progress: 0 };
  let idx = 0;
  let best = Infinity;
  points.forEach(([lat, lon], i) => {
    const d = (lat - train[0]) ** 2 + (lon - train[1]) ** 2;
    if (d < best) { best = d; idx = i; }
  });
  const done = [...points.slice(0, idx + 1), train];
  const ahead = [train, ...points.slice(idx + 1)];
  const length = (pts: Array<[number, number]>) =>
    pts.reduce((sum, p, i) => (i ? sum + L.latLng(pts[i - 1]).distanceTo(p) : 0), 0);
  const total = length(points);
  return { done, ahead, progress: total ? Math.min(1, length(done) / total) : 0 };
}

const IndiaInset: React.FC<{ route: Array<[number, number]>; train: [number, number] | null }> = ({ route, train }) => {
  const routePts = route.map(([lat, lon]) => projectIndia(lat, lon).join(',')).join(' ');
  const trainPt = train ? projectIndia(train[0], train[1]) : null;
  return (
    <div className="absolute top-3 right-3 z-[1000] w-[110px] bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-sm p-2 pointer-events-none">
      <svg viewBox={INDIA_VIEWBOX} className="w-full h-auto">
        <path d={INDIA_PATH} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.2} strokeLinejoin="round" />
        <polyline points={routePts} fill="none" stroke="#2563eb" strokeWidth={5} strokeLinecap="round" />
        {trainPt && <circle cx={trainPt[0]} cy={trainPt[1]} r={6} fill="#2563eb" stroke="#fff" strokeWidth={2} />}
      </svg>
      <div className="text-[9px] font-mono text-slate-400 text-center mt-0.5">Corridor in India</div>
    </div>
  );
};

export const LiveMap: React.FC<LiveMapProps> = ({ train, stations, routePolyline }) => {
  const targetPos: LatLon | null =
    train && Number.isFinite(train.latitude) && Number.isFinite(train.longitude)
      ? [train.latitude, train.longitude]
      : null;
  // Marker, travelled line and inset all follow the smoothed position so they stay in sync
  const trainPos = useSmoothPosition(targetPos, train?.train_number ?? '');

  const trainIcon = useMemo(createTrainIcon, []);
  const { done, ahead, progress } = useMemo(
    () => splitRoute(routePolyline, trainPos),
    [routePolyline, trainPos?.[0], trainPos?.[1]]
  );

  const validStations = stations.filter(st => Number.isFinite(st.lat) && Number.isFinite(st.lon));
  const destination = validStations[validStations.length - 1];

  // The map re-renders every animation frame; only rebuild station pins when their state changes
  const stationIconKey = validStations.map(st => `${st.name}|${st.isNext}|${st.isCurrent}`).join(',');
  const stationIcons = useMemo(
    () => validStations.map(st => createStationIcon(st.name, st.isNext ?? false, st.isCurrent ?? false)),
    [stationIconKey]
  );

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs bg-slate-100 select-none min-h-[580px]">
      <IndiaInset route={routePolyline} train={trainPos} />

      {/* Journey progress card */}
      <div className="absolute bottom-3 left-3 z-[1000] w-64 bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-sm px-3 py-2.5 pointer-events-none">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {train?.train_number ?? '—'}
          </span>
          <span className="font-bold text-blue-700">{Math.round(train?.speed_kmh ?? 0)} km/h</span>
        </div>
        <div className="mt-1.5 text-xs text-slate-500 truncate">
          {train?.next_station ? (
            <>Next stop: <b className="font-extrabold text-emerald-700">{train.next_station}</b></>
          ) : (
            <>Arrived at <b className="font-extrabold text-slate-800">{destination?.name}</b></>
          )}
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>{Math.round(progress * 100)}% covered</span>
          {destination?.predicted_eta && (
            <span className="truncate ml-2">{destination.code} ETA <b className="text-slate-800">{destination.predicted_eta}</b></span>
          )}
        </div>
      </div>

      <MapContainer
        key={`${train?.train_number || '12951'}`}
        center={trainPos ?? [25.2138, 75.8648]}
        zoom={8}
        zoomSnap={0.25}
        className="w-full h-full"
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={TILE_URL}
          className="grayscale opacity-60"
          maxZoom={18}
        />

        <RouteBoundsController points={routePolyline} />

        {/* Remaining track: dashed & muted */}
        {ahead.length > 1 && (
          <Polyline positions={ahead} pathOptions={{ color: '#475569', weight: 3, opacity: 0.9, dashArray: '6 8' }} />
        )}
        {/* Travelled track: solid blue */}
        {done.length > 1 && (
          <Polyline positions={done} pathOptions={{ color: '#2563eb', weight: 5, opacity: 1, lineCap: 'round' }} />
        )}

        {validStations.map((st, i) => (
          <Marker
            key={st.code}
            position={[st.lat, st.lon]}
            icon={stationIcons[i]}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <div className="bg-white border border-slate-200 rounded-lg shadow-md px-2.5 py-1.5 font-mono text-[11px] text-slate-700">
                <div className="font-bold text-slate-900">{st.name} <span className="text-slate-400">{st.code}</span></div>
                {st.isCurrent ? (
                  <div className="text-blue-700">Departed</div>
                ) : !st.predicted_eta ? (
                  <div className="text-slate-400">Passed</div>
                ) : (
                  <div>{st.scheduled_arrival} → <b className="text-blue-700">{st.predicted_eta}</b></div>
                )}
              </div>
            </Tooltip>
          </Marker>
        ))}

        {trainPos && <Marker position={trainPos} icon={trainIcon} interactive={false} />}
      </MapContainer>
    </div>
  );
};

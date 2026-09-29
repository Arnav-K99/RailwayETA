import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

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

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

// Controller to automatically fit map bounds so the ENTIRE route track is visible
function RouteBoundsController({ points }: { points: Array<[number, number]> }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length >= 2) {
      const validPoints = points.filter(
        pt => Array.isArray(pt) && Number.isFinite(pt[0]) && Number.isFinite(pt[1])
      );
      if (validPoints.length >= 2) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, {
          paddingTopLeft: [75, 50],
          paddingBottomRight: [55, 50],
          animate: true,
          maxZoom: 10
        });
      }
    }
  }, [points, map]);
  return null;
}

// BOLD, HIGHLIGHTED STATION SIGNBOARD MARKER (CLEAN MODERN WHITE THEME)
const createBoldStationIcon = (name: string, code: string, isNext: boolean, isCurrent: boolean) => {
  if (isNext) {
    // Next upcoming station: Clean white badge with emerald highlights & pulsing dot
    return L.divIcon({
      className: 'bold-station-pin-next',
      html: `
        <div class="relative w-6 h-6 flex items-center justify-center pointer-events-none select-none">
          <!-- Radar Pulse Effect -->
          <span class="absolute w-8 h-8 rounded-full bg-emerald-400 opacity-60 animate-ping"></span>
          
          <!-- Station Circle on Track -->
          <div class="relative z-20 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xl ring-4 ring-emerald-400/50"></div>
          
          <!-- Bold Station Signboard Badge directly above the circle -->
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center pointer-events-none whitespace-nowrap z-50">
            <div class="bg-white text-slate-900 font-mono text-[11px] px-2.5 py-1 rounded-lg shadow-xl border-2 border-emerald-600 ring-4 ring-emerald-500/20 flex items-center space-x-1.5 tracking-tight">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="font-black text-emerald-700 uppercase tracking-tight">NEXT:</span>
              <span class="font-extrabold text-slate-900">${name}</span>
              <span class="font-black text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-300">[${code}]</span>
            </div>
            <div class="w-2 h-2 bg-white rotate-45 -mt-1 border-r-2 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  if (isCurrent) {
    // Current / Departure station: Clean white badge with royal blue accents
    return L.divIcon({
      className: 'bold-station-pin-current',
      html: `
        <div class="relative w-6 h-6 flex items-center justify-center pointer-events-none select-none">
          <!-- Station Circle on Track -->
          <div class="relative z-20 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xl ring-4 ring-blue-400/50"></div>
          
          <!-- Bold Station Signboard Badge directly above the circle -->
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center pointer-events-none whitespace-nowrap z-40">
            <div class="bg-white text-slate-900 font-mono text-[11px] px-2.5 py-0.5 rounded-lg shadow-lg border-2 border-blue-600 ring-3 ring-blue-500/20 flex items-center space-x-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span class="font-black text-blue-700 uppercase">DEPARTED:</span>
              <span class="font-extrabold text-slate-900">${name}</span>
              <span class="font-bold text-blue-600 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">[${code}]</span>
            </div>
            <div class="w-2 h-2 bg-white rotate-45 -mt-1 border-r-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  // Intermediate / upcoming involved stations: Clean Modern White badge with dark navy border and blue station dot
  return L.divIcon({
    className: 'bold-station-pin-regular',
    html: `
      <div class="relative w-6 h-6 flex items-center justify-center pointer-events-none select-none">
        <!-- Station Circle on Track (Blue dot with crisp white border) -->
        <div class="relative z-20 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md ring-2 ring-blue-500/40"></div>
        
        <!-- Bold Clean Modern White Signboard Badge directly above the circle -->
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 flex flex-col items-center pointer-events-none whitespace-nowrap z-30">
          <div class="bg-white text-slate-900 font-mono text-[10px] px-2.5 py-0.5 rounded-md shadow-md border-2 border-slate-800 flex items-center space-x-1.5">
            <span class="font-extrabold text-slate-900">${name}</span>
            <span class="font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">[${code}]</span>
          </div>
          <div class="w-1.5 h-1.5 bg-white rotate-45 -mt-1 border-r-2 border-b-2 border-slate-800"></div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// HIGH-VISIBILITY LOCOMOTIVE TRAIN MARKER (MOVING PERFECTLY ALONG TRACK)
const createMovingTrainIcon = (trainNo: string, speed: number) => {
  return L.divIcon({
    className: 'custom-train-marker',
    html: `
      <div class="relative w-11 h-11 flex items-center justify-center select-none pointer-events-none">
        <!-- Pulsing Active Navigation Ping Rings -->
        <span class="absolute w-12 h-12 rounded-full bg-blue-500/30 animate-ping"></span>
        <span class="absolute w-9 h-9 rounded-full bg-blue-600/25"></span>

        <!-- Locomotive Body Badge (Electric Blue & Gold Styling) -->
        <div class="relative z-30 w-9 h-9 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 border-2 border-white shadow-2xl flex items-center justify-center text-white ring-4 ring-blue-500/40">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-current text-white drop-shadow" viewBox="0 0 24 24">
            <path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V5c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8 1.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-7H6V5h12v5z"/>
          </svg>
        </div>

        <!-- Train Speed & Number Tag directly below locomotive -->
        <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-40 bg-slate-950 text-white border border-slate-700 font-mono text-[9px] font-black px-2 py-0.5 rounded-full shadow-xl flex items-center space-x-1.5 whitespace-nowrap">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>${trainNo}</span>
          <span class="text-blue-300 font-bold">•</span>
          <span class="text-amber-300 font-extrabold">${Math.round(speed)} km/h</span>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
};

export const LiveMap: React.FC<LiveMapProps> = ({ train, stations, routePolyline }) => {
  const trainLat = train?.latitude ?? 25.2138;
  const trainLon = train?.longitude ?? 75.8648;

  const defaultCenter: [number, number] = useMemo(() => {
    return [trainLat, trainLon];
  }, [trainLat, trainLon]);

  const trainIcon = useMemo(() => {
    return createMovingTrainIcon(train?.train_number ?? '12951', train?.speed_kmh ?? 78);
  }, [train?.train_number, train?.speed_kmh]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs bg-slate-100 select-none min-h-[580px]">
      {/* Floating Minimal Telemetry HUD */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-lg text-xs shadow-xs flex items-center space-x-2.5 font-mono pointer-events-none">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-800">RTIS ISRO NavIC</span>
        </div>
        <span className="text-slate-300">|</span>
        <span className="text-blue-700 font-bold">{Math.round(train?.speed_kmh ?? 78)} km/h</span>
        {train?.next_station && (
          <>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700 font-semibold truncate max-w-[160px]">
              Next: {train.next_station}
            </span>
          </>
        )}
      </div>

      <MapContainer
        key={`${train?.train_number || '12951'}`}
        center={defaultCenter}
        zoom={8}
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
          url={OSM_TILE_URL}
          maxZoom={18}
        />

        {/* Fit the ENTIRE route on screen automatically so whole track is visible */}
        <RouteBoundsController points={routePolyline} />

        {/* Railway Corridor Polyline (Bold Double-Rail Appearance) */}
        {routePolyline.length > 1 && (
          <>
            {/* Outer Dark Ballast Sleeper Line */}
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: '#0f172a',
                weight: 7,
                opacity: 0.45,
              }}
            />
            {/* Inner Bold Railway Blue Line */}
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: '#2563eb',
                weight: 4,
                opacity: 1.0,
              }}
            />
          </>
        )}

        {/* BOLD, HIGHLIGHTED INVOLVED STATIONS */}
        {stations.filter(st => Number.isFinite(st.lat) && Number.isFinite(st.lon)).map((st) => (
          <Marker
            key={st.code}
            position={[st.lat, st.lon]}
            icon={createBoldStationIcon(st.name, st.code, st.isNext ?? false, st.isCurrent ?? false)}
          />
        ))}

        {/* LIVE MOVING TRAIN LOCOMOTIVE ICON */}
        {train && Number.isFinite(train.latitude) && Number.isFinite(train.longitude) && (
          <Marker position={[train.latitude, train.longitude]} icon={trainIcon} />
        )}
      </MapContainer>
    </div>
  );
};

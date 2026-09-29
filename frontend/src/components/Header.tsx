import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Gauge, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  ArrowRight
} from 'lucide-react';
import { SimulationState } from '../types/types';

interface HeaderProps {
  state: SimulationState | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSetSpeed: (speed: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onStart,
  onPause,
  onResume,
  onReset,
  onSetSpeed,
}) => {
  const train = state?.train;
  const sim = state?.simulation;
  const isRunning = sim?.is_running ?? false;
  const isPaused = sim?.is_paused ?? false;
  const [selectedSpeed, setSelectedSpeed] = React.useState<number>(Math.round(sim?.speed_multiplier ?? 10));

  React.useEffect(() => {
    if (sim?.speed_multiplier) {
      setSelectedSpeed(Math.round(sim.speed_multiplier));
    }
  }, [sim?.speed_multiplier]);

  const currentDelay = train?.current_delay_min ?? 15.0;
  const delayColor = currentDelay <= 5 
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
    : currentDelay <= 20 
    ? 'text-amber-700 bg-amber-50 border-amber-200' 
    : 'text-red-700 bg-red-50 border-red-200';

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs">
      {/* Left: Universal RailETA System Branding */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
          IR
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-extrabold text-sm text-slate-900 tracking-tight">
              RailETA Operations Intelligence
            </h1>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              MINISTRY OF RAILWAYS
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Dynamic Arrival Forecasting & Network Corridor Management
          </p>
        </div>
      </div>

      {/* Right: Simulation Clock & Quick Controls */}
      <div className="flex items-center space-x-4">
        {/* Simulation Clock */}
        <div className="bg-slate-50 border border-slate-200 px-3.5 py-1 rounded-lg flex items-center space-x-2.5">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <div>
            <div className="text-[9px] uppercase font-bold tracking-widest text-slate-500 flex items-center space-x-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning && !isPaused ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>Live Sim</span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-900 tracking-wider">
              {sim?.sim_time || '18:35:00'}
            </div>
          </div>
        </div>

        {/* Speed Multiplier Segmented Buttons */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 space-x-0.5">
          {[1, 5, 10, 20, 50].map((rate) => (
            <button
              key={rate}
              onClick={() => {
                setSelectedSpeed(rate);
                onSetSpeed(rate);
              }}
              className={`px-2 py-0.5 rounded text-xs font-mono font-semibold transition-all ${
                selectedSpeed === rate
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center space-x-2">
          {!isRunning || isPaused ? (
            <button
              onClick={isRunning ? onResume : onStart}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPaused ? 'Resume' : 'Start'}</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={onReset}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-lg border border-slate-200 transition-all active:scale-95"
            title="Reset Simulation to Initial Kota State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

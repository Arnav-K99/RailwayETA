import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { UpcomingStation } from '../types/types';
import { BarChart3 } from 'lucide-react';

interface EtaTimelineChartProps {
  stations: UpcomingStation[];
  currentDelay: number;
}

export const EtaTimelineChart: React.FC<EtaTimelineChartProps> = ({ 
  stations, 
  currentDelay 
}) => {
  const chartData = stations.map((st) => {
    const staticDelay = Math.max(0, currentDelay);
    const dynamicDelay = Math.max(0, Math.round(st.delay_minutes));

    return {
      name: st.station_code,
      stationName: st.station_name,
      scheduled: 0,
      naiveStatic: staticDelay,
      railEtaDynamic: dynamicDelay,
    };
  });

  return (
    <div className="unicolor-card flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Ahead-of-Train Prediction vs Naive Static Extrapolation
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Downstream Delay (Minutes)
        </span>
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            No upcoming station metrics available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} 
              />
              <YAxis 
                stroke="#94a3b8" 
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                unit="m"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '8px',
                  color: '#0f172a',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono, monospace',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)'
                }}
                formatter={(value: any, name: any) => {
                  if (name === 'naiveStatic') return [`+${value} min`, 'Naive Static Delay'];
                  if (name === 'railEtaDynamic') return [`+${value} min`, 'RailETA Dynamic Forecast'];
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.name === label);
                  return item ? `${item.stationName} (${label})` : label;
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => {
                  if (value === 'naiveStatic') return 'Naive IR Approach (Scheduled + Current Delay)';
                  if (value === 'railEtaDynamic') return 'RailETA Dynamic Forecast (Ahead-of-Train)';
                  return value;
                }}
              />
              <Bar dataKey="naiveStatic" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="naiveStatic" />
              <Bar dataKey="railEtaDynamic" fill="#2563eb" radius={[4, 4, 0, 0]} name="railEtaDynamic" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-2 text-[10px] text-slate-500 font-mono text-center">
        RailETA forecasts downstream divergence when congestion or TSRs occur ahead of the locomotive.
      </div>
    </div>
  );
};

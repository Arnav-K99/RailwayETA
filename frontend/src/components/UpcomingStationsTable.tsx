import React from 'react';
import { UpcomingStation } from '../types/types';
import { AlertCircle, Clock } from 'lucide-react';

interface UpcomingStationsTableProps {
  stations: UpcomingStation[];
  nextStationCode?: string;
}

export const UpcomingStationsTable: React.FC<UpcomingStationsTableProps> = ({ 
  stations, 
  nextStationCode 
}) => {
  return (
    <div className="unicolor-card p-0 overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="mac-panel-header">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Upcoming Stations & Dynamic ETA Forecast
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Downstream Sectional Prediction
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="mac-table">
          <thead>
            <tr>
              <th>Station</th>
              <th>Scheduled</th>
              <th>Predicted ETA</th>
              <th>Delay</th>
              <th>Expected Range</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {stations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                  Journey completed or no upcoming stations.
                </td>
              </tr>
            ) : (
              stations.map((st, idx) => {
                const isNext = st.station_code === nextStationCode || idx === 0;
                const isLate = st.delay_minutes > 5;
                const isSevere = st.delay_minutes > 20;

                const delayBadge = isSevere 
                  ? 'text-red-700 bg-red-50 border-red-200'
                  : isLate 
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200';

                return (
                  <tr 
                    key={st.station_id}
                    className={isNext ? 'bg-blue-50/40 hover:bg-blue-50/70 font-medium' : ''}
                  >
                    {/* Station Name & Code */}
                    <td>
                      <div className="flex items-center space-x-2">
                        {isNext ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                            <span>{st.station_name}</span>
                            {st.has_active_disruption && (
                              <span title="Disruption ahead in section">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {st.station_code} • {st.distance_km} km
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Scheduled Time */}
                    <td className="font-mono text-slate-500 font-medium">
                      {st.scheduled_arrival}
                    </td>

                    {/* Dynamic Predicted ETA */}
                    <td className="font-mono font-bold text-xs text-blue-700">
                      {st.predicted_eta}
                    </td>

                    {/* Delay */}
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${delayBadge}`}>
                        {st.delay_minutes > 0 ? `+${st.delay_minutes}m` : 'ON TIME'}
                      </span>
                    </td>

                    {/* Uncertainty Range */}
                    <td className="font-mono text-[11px] text-slate-600">
                      {st.confidence_range}
                    </td>

                    {/* Confidence */}
                    <td>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              st.confidence_percent >= 85 ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${st.confidence_percent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-slate-600">
                          {st.confidence_percent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React from 'react';
import { WhyEtaChangedItem } from '../types/types';
import { HelpCircle, TrendingUp, AlertTriangle, ShieldCheck, Flame, Wrench, CloudRain, Clock } from 'lucide-react';

interface WhyEtaChangedPanelProps {
  items: WhyEtaChangedItem[];
  currentDelay: number;
}

export const WhyEtaChangedPanel: React.FC<WhyEtaChangedPanelProps> = ({ 
  items, 
  currentDelay 
}) => {
  const totalPredictedDelay = items.reduce((sum, item) => sum + item.impact_min, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CONGESTION':
        return <Flame className="w-3.5 h-3.5 text-amber-600" />;
      case 'TSR':
        return <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />;
      case 'MAINTENANCE':
        return <Wrench className="w-3.5 h-3.5 text-red-600" />;
      case 'WEATHER':
        return <CloudRain className="w-3.5 h-3.5 text-sky-600" />;
      case 'HALT':
        return <Clock className="w-3.5 h-3.5 text-rose-600" />;
      case 'BASE_DELAY':
        return <Clock className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CONGESTION':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'TSR':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MAINTENANCE':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'WEATHER':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'HALT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'BASE_DELAY':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const maxVal = Math.max(...items.map((i) => Math.abs(i.impact_min)), 12);

  return (
    <div className="unicolor-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Explainable AI: Why Did ETA Change?
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono font-bold">
          <span className="text-slate-400">Delay Trajectory:</span>
          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">+{currentDelay}m</span>
          <span className="text-slate-300">→</span>
          <span className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">+{Math.max(0, Math.round(totalPredictedDelay))}m</span>
        </div>
      </div>

      {/* Waterfall Attribution Items */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Train running on clear corridor under baseline nominal headway.
          </div>
        ) : (
          items.map((item, idx) => {
            const barWidthPercent = Math.min(100, Math.max(8, (Math.abs(item.impact_min) / maxVal) * 100));
            const isNegative = item.impact_min < 0;

            return (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`p-1 rounded border ${getCategoryColor(item.category)}`}>
                      {getCategoryIcon(item.category)}
                    </span>
                    <span className="font-semibold text-slate-800">{item.factor}</span>
                  </div>
                  <span className={`font-mono font-bold ${isNegative ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {item.impact_min > 0 ? `+${item.impact_min} min` : `${item.impact_min} min`}
                  </span>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isNegative 
                        ? 'bg-emerald-500' 
                        : item.category === 'MAINTENANCE' 
                        ? 'bg-red-500' 
                        : item.category === 'TSR'
                        ? 'bg-orange-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${barWidthPercent}%` }}
                  />
                </div>

                <div className="text-[10px] text-slate-500 font-medium">
                  {item.description}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Explanatory Operations Takeaway */}
      <div className="mt-3 pt-3 border-t border-slate-100 bg-blue-50/60 -mx-4 -mb-4 p-3 rounded-b-xl flex items-start space-x-2.5">
        <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-700 leading-relaxed font-sans">
          <strong className="text-blue-900 font-bold">Operations Intelligence: </strong>
          RailETA calculates dynamic sectional traversal delays ahead of the locomotive, preventing downstream platform cascading bottlenecks.
        </div>
      </div>
    </div>
  );
};

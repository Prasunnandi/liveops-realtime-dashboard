import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Sliders, 
  Zap, 
  Radio
} from 'lucide-react';

export default function RealtimeStreamsView({ streams, onCustomizeStream }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'CRITICAL_ALARM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1 text-rose-400" />
            CRITICAL ALARM
          </span>
        );
      case 'WARNING_THRESHOLD':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3 mr-1 text-amber-400" />
            WARNING THRESHOLD
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
            NOMINAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            High-Frequency Real-Time Telemetry Stream Canvas
          </h2>
          <p className="text-xs text-slate-400">
            Sub-second operational telemetry streams, threshold governors, and live sparkline histories.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded border border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Streaming Rate: 100Hz Telemetry Buffer Active
        </div>
      </div>

      {/* Grid of Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.map((stream) => {
          const isCritical = stream.alarmStatus === 'CRITICAL_ALARM';
          const isWarning = stream.alarmStatus === 'WARNING_THRESHOLD';

          // Simple SVG sparkline points calculation
          const min = Math.min(...stream.history);
          const max = Math.max(...stream.history, stream.thresholdCritical);
          const range = max - min || 1;
          const points = stream.history.map((val, idx) => {
            const x = (idx / (stream.history.length - 1)) * 220;
            const y = 50 - ((val - min) / range) * 45;
            return `${x},${y}`;
          }).join(' ');

          return (
            <div 
              key={stream.id}
              className={`bg-slate-900 rounded-xl border p-5 flex flex-col justify-between shadow-sm transition-all hover:border-slate-700 ${
                isCritical 
                  ? 'border-rose-500/40 bg-gradient-to-b from-slate-900 to-rose-950/10' 
                  : isWarning 
                    ? 'border-amber-500/40' 
                    : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {stream.id}
                  </span>
                  {getStatusBadge(stream.alarmStatus)}
                </div>

                <h3 className="text-sm font-bold text-white mt-1 font-mono">{stream.metricKey}</h3>
                <p className="text-[11px] text-slate-400">{stream.serviceName}</p>

                {/* Main Metric Value */}
                <div className="mt-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-baseline justify-between">
                  <div className="text-3xl font-black font-mono tracking-tight text-white">
                    {stream.currentValue.toLocaleString()}
                    <span className="text-xs text-slate-400 font-sans font-medium ml-1.5">{stream.unit}</span>
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-400">
                    <div>Warn: {stream.thresholdWarning}</div>
                    <div className="text-rose-400 font-bold">Crit: {stream.thresholdCritical}</div>
                  </div>
                </div>

                {/* SVG Sparkline */}
                <div className="mt-3 p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
                  <div className="text-[10px] text-slate-500 font-mono uppercase mb-1 flex justify-between">
                    <span>Telemetry Window (-5m)</span>
                    <span className={isCritical ? 'text-rose-400' : 'text-emerald-400'}>
                      Trend Active
                    </span>
                  </div>
                  <svg className="w-full h-12 overflow-visible">
                    <polyline
                      fill="none"
                      stroke={isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#10b981'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points}
                    />
                  </svg>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onCustomizeStream(stream)}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Configure Alarm Thresholds</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

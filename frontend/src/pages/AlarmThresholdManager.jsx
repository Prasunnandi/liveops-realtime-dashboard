import React from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';

export default function AlarmThresholdManager({ streams }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BellRing className="w-5 h-5 text-emerald-400" />
          Real-Time Alarm Governance & Threshold Rules
        </h2>
        <p className="text-xs text-slate-400">
          Continuous threshold rule enforcement across all connected telemetry feeds.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Configured Guardrail Policies
          </h3>
          <span className="text-xs font-mono text-slate-400">{streams.length} Guardrails</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 uppercase">
                <th className="py-3 px-4">Metric Identifier</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Current Value</th>
                <th className="py-3 px-4">Warning Cap</th>
                <th className="py-3 px-4">Critical Cap</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {streams.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 text-white font-bold">{s.metricKey}</td>
                  <td className="py-3 px-4 text-slate-300 font-sans">{s.serviceName}</td>
                  <td className="py-3 px-4 text-white font-bold">{s.currentValue} {s.unit}</td>
                  <td className="py-3 px-4 text-amber-400 font-bold">{s.thresholdWarning} {s.unit}</td>
                  <td className="py-3 px-4 text-rose-400 font-bold">{s.thresholdCritical} {s.unit}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.alarmStatus === 'CRITICAL_ALARM'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : s.alarmStatus === 'WARNING_THRESHOLD'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {s.alarmStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

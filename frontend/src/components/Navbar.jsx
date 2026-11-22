import React from 'react';
import { Bell, Search, Activity, Radio, Play, Pause, RefreshCw } from 'lucide-react';

export default function Navbar({ summary, isLive, onToggleLive, onManualTick }) {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Metric Stream, Service, Gauge..."
            className="w-80 bg-slate-800/80 border border-slate-700/60 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <button
          onClick={onToggleLive}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
            isLive 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {isLive ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-slate-400" />}
          <span>{isLive ? 'LIVE STREAM ACTIVE' : 'STREAM PAUSED'}</span>
        </button>

        <button
          onClick={onManualTick}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
          title="Emit Single Telemetry Tick"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
            {summary?.criticalAlarmsCount || 1} Critical
          </div>
          <div className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
            {summary?.warningAlarmsCount || 1} Warning
          </div>
          <div className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            {summary?.nominalStreamsCount || 4} Nominal
          </div>
        </div>

        <div className="h-7 w-[1px] bg-slate-800"></div>

        <button className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        <div className="flex items-center space-x-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-xs font-bold text-emerald-300">
            LO
          </div>
          <div className="text-left text-xs">
            <div className="font-semibold text-slate-200">LiveOps SRE</div>
            <div className="text-[10px] text-slate-400">Stream Operator</div>
          </div>
        </div>
      </div>
    </header>
  );
}

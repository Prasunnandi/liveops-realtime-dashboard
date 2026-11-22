import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Radio 
} from 'lucide-react';

export default function CustomWidgetCanvas({ streams, onUpdateStream, onAddStream }) {
  const [selectedStreamId, setSelectedStreamId] = useState(streams[0]?.id || 'STM-101');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWidget, setNewWidget] = useState({
    metricKey: 'kafka_partition_lag',
    serviceName: 'Event Streaming Broker',
    currentValue: 120,
    unit: 'messages',
    thresholdWarning: 500,
    thresholdCritical: 1500
  });

  const currentStream = streams.find(s => s.id === selectedStreamId) || streams[0];

  const handleThresholdUpdate = (field, val) => {
    onUpdateStream(currentStream.id, {
      ...currentStream,
      [field]: parseFloat(val)
    });
  };

  const handleCreateWidget = (e) => {
    e.preventDefault();
    onAddStream({
      id: `STM-${Math.floor(200 + Math.random() * 800)}`,
      ...newWidget,
      alarmStatus: 'NOMINAL',
      history: [100, 110, 105, 115, newWidget.currentValue]
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-emerald-400" />
            Custom Telemetry Widget Canvas & Alarm Tuner
          </h2>
          <p className="text-xs text-slate-400">
            Customize widget thresholds, define new metric feeds, and fine-tune anomaly alarms.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-lg shadow-emerald-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Metric Widget</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stream Selector & Threshold Sliders (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Configure Alarm Guardrails
            </h3>
            <span className="text-xs text-slate-400 font-mono">Stream Guard</span>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">Select Metric Stream</label>
            <select
              value={selectedStreamId}
              onChange={(e) => setSelectedStreamId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
            >
              {streams.map(s => (
                <option key={s.id} value={s.id}>
                  {s.metricKey} ({s.serviceName})
                </option>
              ))}
            </select>
          </div>

          {currentStream && (
            <div className="space-y-4 pt-2">
              {/* Warning Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium">Warning Alarm Threshold</label>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {currentStream.thresholdWarning} {currentStream.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={Math.floor(currentStream.thresholdWarning * 0.2)}
                  max={Math.floor(currentStream.thresholdCritical * 1.5)}
                  step="1"
                  value={currentStream.thresholdWarning}
                  onChange={(e) => handleThresholdUpdate('thresholdWarning', e.target.value)}
                  className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Critical Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium">Critical Alarm Threshold</label>
                  <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    {currentStream.thresholdCritical} {currentStream.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={Math.floor(currentStream.thresholdWarning * 0.5)}
                  max={Math.floor(currentStream.thresholdCritical * 2.5)}
                  step="1"
                  value={currentStream.thresholdCritical}
                  onChange={(e) => handleThresholdUpdate('thresholdCritical', e.target.value)}
                  className="w-full accent-rose-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Widget Preview (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {currentStream && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Live Widget Render Preview
                </h3>
                <span className="text-xs font-mono text-emerald-400">Stream Online</span>
              </div>

              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800/80 text-center space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                  {currentStream.metricKey}
                </span>
                <div className="text-4xl font-black text-white font-mono">
                  {currentStream.currentValue.toLocaleString()} {currentStream.unit}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Active Status:{' '}
                  <span className={`font-bold ${
                    currentStream.alarmStatus === 'CRITICAL_ALARM' 
                      ? 'text-rose-400' 
                      : currentStream.alarmStatus === 'WARNING_THRESHOLD' 
                        ? 'text-amber-400' 
                        : 'text-emerald-400'
                  }`}>
                    {currentStream.alarmStatus}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-950/20 rounded-lg border border-emerald-500/30 text-xs">
                <div className="text-[11px] font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Real-Time Alarm Evaluation
                </div>
                <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                  When values exceed <strong>{currentStream.thresholdWarning} {currentStream.unit}</strong>, warning status is triggered. Exceeding <strong>{currentStream.thresholdCritical} {currentStream.unit}</strong> automatically sends pager notifications.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Widget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Add Custom Telemetry Stream
            </h3>

            <form onSubmit={handleCreateWidget} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Metric Key Name</label>
                <input
                  type="text"
                  value={newWidget.metricKey}
                  onChange={(e) => setNewWidget({ ...newWidget, metricKey: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Source Service</label>
                <input
                  type="text"
                  value={newWidget.serviceName}
                  onChange={(e) => setNewWidget({ ...newWidget, serviceName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Current Baseline Value</label>
                  <input
                    type="number"
                    value={newWidget.currentValue}
                    onChange={(e) => setNewWidget({ ...newWidget, currentValue: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Unit</label>
                  <input
                    type="text"
                    value={newWidget.unit}
                    onChange={(e) => setNewWidget({ ...newWidget, unit: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Warning Threshold</label>
                  <input
                    type="number"
                    value={newWidget.thresholdWarning}
                    onChange={(e) => setNewWidget({ ...newWidget, thresholdWarning: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Critical Threshold</label>
                  <input
                    type="number"
                    value={newWidget.thresholdCritical}
                    onChange={(e) => setNewWidget({ ...newWidget, thresholdCritical: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Create Widget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

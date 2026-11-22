import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import RealtimeStreamsView from './pages/RealtimeStreamsView';
import CustomWidgetCanvas from './pages/CustomWidgetCanvas';
import AlarmThresholdManager from './pages/AlarmThresholdManager';
import { fetchStreams, fetchSummary, simulateTelemetryTick, fallbackStreams } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('streams');
  const [streams, setStreams] = useState(fallbackStreams);
  const [summary, setSummary] = useState({
    totalStreamsMonitored: 6,
    criticalAlarmsCount: 1,
    warningAlarmsCount: 1,
    nominalStreamsCount: 4,
    streamHealthScore: 94.8
  });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function load() {
      const s = await fetchStreams();
      if (s && s.length) setStreams(s);
      const sum = await fetchSummary();
      if (sum) setSummary(sum);
    }
    load();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isLive) {
      interval = setInterval(async () => {
        const updated = await simulateTelemetryTick(streams);
        setStreams(updated);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, streams]);

  const handleManualTick = async () => {
    const updated = await simulateTelemetryTick(streams);
    setStreams(updated);
  };

  const handleUpdateStream = (streamId, updatedStream) => {
    setStreams(prev => prev.map(s => s.id === streamId ? updatedStream : s));
  };

  const handleAddStream = (newStream) => {
    setStreams(prev => [...prev, newStream]);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          summary={summary} 
          isLive={isLive} 
          onToggleLive={() => setIsLive(!isLive)} 
          onManualTick={handleManualTick} 
        />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'streams' && (
              <RealtimeStreamsView 
                streams={streams} 
                onCustomizeStream={() => setActiveTab('canvas')} 
              />
            )}
            {activeTab === 'canvas' && (
              <CustomWidgetCanvas 
                streams={streams} 
                onUpdateStream={handleUpdateStream} 
                onAddStream={handleAddStream} 
              />
            )}
            {activeTab === 'alarms' && (
              <AlarmThresholdManager 
                streams={streams} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initialStreams } from './data.js';

const app = express();
const PORT = process.env.PORT || 5006;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

let streams = [...initialStreams];

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'LiveOps Real-Time Telemetry & Operations Dashboard',
    version: '1.0.0'
  });
});

// Telemetry summary
app.get('/api/v1/telemetry/summary', (req, res) => {
  const total = streams.length;
  const critical = streams.filter(s => s.alarmStatus === 'CRITICAL_ALARM').length;
  const warning = streams.filter(s => s.alarmStatus === 'WARNING_THRESHOLD').length;
  const nominal = total - critical - warning;

  res.json({
    totalStreamsMonitored: total,
    criticalAlarmsCount: critical,
    warningAlarmsCount: warning,
    nominalStreamsCount: nominal,
    streamHealthScore: 94.8
  });
});

// List streams
app.get('/api/v1/telemetry/streams', (req, res) => {
  res.json(streams);
});

// Simulate a live telemetry tick
app.post('/api/v1/telemetry/simulate-tick', (req, res) => {
  streams = streams.map(s => {
    const jitter = (Math.random() - 0.48) * 0.05 * s.currentValue;
    const nextVal = Math.max(0, Math.round((s.currentValue + jitter) * 10) / 10);
    const updatedHistory = [...s.history.slice(1), nextVal];

    let status = 'NOMINAL';
    if (nextVal >= s.thresholdCritical) {
      status = 'CRITICAL_ALARM';
    } else if (nextVal >= s.thresholdWarning) {
      status = 'WARNING_THRESHOLD';
    }

    return {
      ...s,
      currentValue: nextVal,
      alarmStatus: status,
      history: updatedHistory
    };
  });

  res.json(streams);
});

app.listen(PORT, () => {
  console.log(`LiveOps backend listening on port http://localhost:${PORT}`);
});

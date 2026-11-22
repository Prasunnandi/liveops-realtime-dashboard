// LiveOps Real-Time Streams Seed Data

export const initialStreams = [
  {
    id: "STM-101",
    metricKey: "cluster_ingress_qps",
    serviceName: "API Gateway Envoy",
    currentValue: 4820,
    unit: "req/s",
    thresholdWarning: 6000,
    thresholdCritical: 8500,
    alarmStatus: "NOMINAL",
    history: [4400, 4520, 4650, 4710, 4820]
  },
  {
    id: "STM-102",
    metricKey: "order_processing_latency_p95",
    serviceName: "Checkout Microservice",
    currentValue: 142,
    unit: "ms",
    thresholdWarning: 300,
    thresholdCritical: 750,
    alarmStatus: "NOMINAL",
    history: [138, 140, 145, 139, 142]
  },
  {
    id: "STM-103",
    metricKey: "database_conn_pool_saturation",
    serviceName: "PostgreSQL Primary RDS",
    currentValue: 88.4,
    unit: "%",
    thresholdWarning: 75.0,
    thresholdCritical: 90.0,
    alarmStatus: "WARNING_THRESHOLD",
    history: [72.0, 78.5, 82.0, 85.1, 88.4]
  },
  {
    id: "STM-104",
    metricKey: "memory_rss_utilization",
    serviceName: "Redis Cluster Node 03",
    currentValue: 94.2,
    unit: "%",
    thresholdWarning: 80.0,
    thresholdCritical: 92.0,
    alarmStatus: "CRITICAL_ALARM",
    history: [84.0, 88.5, 91.0, 93.4, 94.2]
  },
  {
    id: "STM-105",
    metricKey: "active_websocket_connections",
    serviceName: "Realtime Edge Push",
    currentValue: 18450,
    unit: "sockets",
    thresholdWarning: 25000,
    thresholdCritical: 40000,
    alarmStatus: "NOMINAL",
    history: [17800, 18050, 18200, 18350, 18450]
  },
  {
    id: "STM-106",
    metricKey: "error_rate_5xx_ratio",
    serviceName: "Payment Webhook Ingress",
    currentValue: 0.14,
    unit: "%",
    thresholdWarning: 1.0,
    thresholdCritical: 3.0,
    alarmStatus: "NOMINAL",
    history: [0.18, 0.16, 0.15, 0.15, 0.14]
  }
];

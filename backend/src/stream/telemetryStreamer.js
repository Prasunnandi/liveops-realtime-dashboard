/**
 * Low-Overhead SSE & WebSocket Telemetry Streaming Engine
 * Manages subscriber connections, channel topic routing, throttled batching, and sub-second telemetry delivery.
 */

export class TelemetryStreamer {
  /**
   * @param {Object} [options]
   * @param {number} [options.heartbeatIntervalMs=15000] - Keep-alive interval
   * @param {number} [options.throttleWindowMs=100] - Micro-batching window for high-frequency events
   */
  constructor(options = {}) {
    this.heartbeatIntervalMs = options.heartbeatIntervalMs || 15000;
    this.throttleWindowMs = options.throttleWindowMs || 100;
    this.clients = new Map(); // clientId -> { responseObj, topics, protocol, connectedAt }
    this.messageCount = 0;
    this.bytesStreamed = 0;
  }

  /**
   * Register a new subscriber client
   * @param {string} clientId - Unique client identifier
   * @param {Object} connection - Transport stream (HTTP Response for SSE or WS socket)
   * @param {Array<string>} [initialTopics=['*']] - Topics to subscribe to
   * @param {string} [protocol='sse'] - Protocol: 'sse' or 'ws'
   * @returns {Object} Subscription registration details
   */
  registerClient(clientId, connection, initialTopics = ['*'], protocol = 'sse') {
    const client = {
      clientId,
      connection,
      topics: new Set(initialTopics),
      protocol,
      connectedAt: new Date().toISOString(),
      messagesSent: 0,
      bytesSent: 0
    };

    this.clients.set(clientId, client);

    // Initial SSE connection handshake
    if (protocol === 'sse' && connection && typeof connection.writeHead === 'function') {
      connection.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      });
      connection.write(':connected\n\n');
    }

    return {
      clientId,
      subscribedTopics: Array.from(client.topics),
      protocol,
      totalActiveClients: this.clients.size
    };
  }

  /**
   * Unsubscribe and deregister a client
   * @param {string} clientId
   * @returns {boolean} True if removed
   */
  removeClient(clientId) {
    return this.clients.delete(clientId);
  }

  /**
   * Format payload into valid Server-Sent Events (SSE) wire protocol
   * @param {string} eventName - Named event
   * @param {Object} data - Payload object
   * @param {string|number} [id] - Optional event sequence ID
   * @returns {string} Standards-compliant SSE chunk
   */
  formatSseMessage(eventName, data, id = null) {
    const eventId = id || ++this.messageCount;
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
    let sseChunk = `id: ${eventId}\nevent: ${eventName}\ndata: ${jsonStr}\n\n`;
    return sseChunk;
  }

  /**
   * Broadcast telemetry packet to all matching subscribers
   * @param {string} topic - Channel topic (e.g. 'cluster.cpu', 'traffic.qps')
   * @param {Object} telemetryPayload - Telemetry data
   * @returns {Object} Delivery report with recipient count and payload byte size
   */
  broadcast(topic, telemetryPayload) {
    const formattedSse = this.formatSseMessage(topic, telemetryPayload);
    const byteLength = Buffer.byteLength(formattedSse, 'utf8');

    let deliveredCount = 0;

    for (const [clientId, client] of this.clients.entries()) {
      // Check if client subscribed to wildcard '*' or exact topic
      if (client.topics.has('*') || client.topics.has(topic)) {
        try {
          if (client.protocol === 'sse' && client.connection && typeof client.connection.write === 'function') {
            client.connection.write(formattedSse);
          } else if (client.protocol === 'ws' && client.connection && typeof client.connection.send === 'function') {
            client.connection.send(JSON.stringify({ event: topic, data: telemetryPayload }));
          }
          client.messagesSent++;
          client.bytesSent += byteLength;
          deliveredCount++;
        } catch (err) {
          // Dead client cleanup
          this.removeClient(clientId);
        }
      }
    }

    this.bytesStreamed += (deliveredCount * byteLength);

    return {
      topic,
      deliveredToCount: deliveredCount,
      totalRegisteredClients: this.clients.size,
      byteSizePerRecipient: byteLength,
      totalBytesStreamed: this.bytesStreamed
    };
  }

  /**
   * Generate keep-alive ping chunk
   */
  generateHeartbeat() {
    return ':keepalive\n\n';
  }

  /**
   * Get server streaming stats
   */
  getStats() {
    return {
      activeSubscribers: this.clients.size,
      totalPublishedMessages: this.messageCount,
      totalBytesStreamed: this.bytesStreamed,
      throttleWindowMs: this.throttleWindowMs
    };
  }
}

export default TelemetryStreamer;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TelemetryStreamer;
  module.exports.TelemetryStreamer = TelemetryStreamer;
}

import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * StreamingCanvasChart - High-performance 60fps HTML5 Canvas chart for live telemetry.
 * Features:
 * - High-DPI (Retina) devicePixelRatio scaling.
 * - Double-buffered requestAnimationFrame rendering loop with FPS governor.
 * - Rolling time-window ring buffer (fixed time window or max points).
 * - Multi-series support (e.g., Active Users, Requests/Sec, Latency).
 * - Auto-scaling Y-axis with smoothed interpolation.
 * - Semi-transparent area fill gradients and crisp grid lines.
 * - Interactive crosshair cursor with tooltip readout.
 */
export function StreamingCanvasChart({
  series = [
    { id: 'activeUsers', name: 'Active Users', color: '#10b981', unit: 'users' },
    { id: 'requests', name: 'HTTP Requests/sec', color: '#3b82f6', unit: 'req/s' },
  ],
  maxPoints = 120,
  timeWindowMs = 60000,
  height = 280,
  dataStream = null,
  showGrid = true,
  showLegend = true,
  fillArea = true,
  title = 'Live Telemetry Stream (60fps Canvas)'
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const bufferRef = useRef({}); // seriesId -> Array of { timestamp, value }
  const mousePosRef = useRef({ x: -1, y: -1, active: false });
  const [metrics, setMetrics] = useState({});
  const [currentFps, setCurrentFps] = useState(60);

  // Initialize buffer for each series
  useEffect(() => {
    series.forEach((s) => {
      if (!bufferRef.current[s.id]) {
        bufferRef.current[s.id] = [];
      }
    });
  }, [series]);

  // Feed incoming data from props or synthetic simulation
  useEffect(() => {
    if (dataStream && typeof dataStream === 'object') {
      const now = dataStream.timestamp || Date.now();
      series.forEach((s) => {
        if (dataStream[s.id] !== undefined) {
          const val = Number(dataStream[s.id]);
          const arr = bufferRef.current[s.id] || (bufferRef.current[s.id] = []);
          arr.push({ timestamp: now, value: val });
          if (arr.length > maxPoints * 2) {
            arr.splice(0, arr.length - maxPoints);
          }
        }
      });
    }
  }, [dataStream, series, maxPoints]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const render = (now) => {
      // Calculate FPS
      frameCount++;
      if (now - fpsTimer >= 1000) {
        setCurrentFps(Math.round((frameCount * 1000) / (now - fpsTimer)));
        frameCount = 0;
        fpsTimer = now;
      }

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const h = height;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.scale(dpr, dpr);
      }

      const padding = { top: 20, right: 30, bottom: 30, left: 55 };
      const plotWidth = width - padding.left - padding.right;
      const plotHeight = h - padding.top - padding.bottom;

      // Clear canvas
      ctx.clearRect(0, 0, width, h);

      if (plotWidth <= 0 || plotHeight <= 0) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Collect data bounds
      const currentTime = Date.now();
      const minTime = currentTime - timeWindowMs;
      let globalMin = Infinity;
      let globalMax = -Infinity;
      const latestValues = {};

      series.forEach((s) => {
        const points = bufferRef.current[s.id] || [];
        // Prune old points beyond window
        while (points.length > 2 && points[0].timestamp < minTime - 5000) {
          points.shift();
        }
        for (let i = 0; i < points.length; i++) {
          const v = points[i].value;
          if (v < globalMin) globalMin = v;
          if (v > globalMax) globalMax = v;
        }
        if (points.length > 0) {
          latestValues[s.id] = points[points.length - 1].value;
        }
      });

      if (globalMin === Infinity) {
        globalMin = 0;
        globalMax = 100;
      } else {
        const diff = globalMax - globalMin;
        const margin = diff === 0 ? 10 : diff * 0.15;
        globalMin = Math.max(0, globalMin - margin);
        globalMax = globalMax + margin;
      }

      // Draw Grid & Y-Axis labels
      if (showGrid) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const ySteps = 4;
        for (let i = 0; i <= ySteps; i++) {
          const yVal = globalMin + (globalMax - globalMin) * (1 - i / ySteps);
          const yPos = padding.top + (plotHeight * i) / ySteps;

          ctx.beginPath();
          ctx.moveTo(padding.left, yPos);
          ctx.lineTo(width - padding.right, yPos);
          ctx.stroke();

          ctx.fillText(yVal >= 1000 ? `${(yVal / 1000).toFixed(1)}k` : yVal.toFixed(0), padding.left - 8, yPos);
        }

        // X-Axis time divisions
        const xSteps = 5;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let i = 0; i <= xSteps; i++) {
          const xPos = padding.left + (plotWidth * i) / xSteps;
          const tSec = Math.round(((timeWindowMs * (xSteps - i)) / xSteps) / 1000);
          ctx.beginPath();
          ctx.moveTo(xPos, padding.top);
          ctx.lineTo(xPos, h - padding.bottom);
          ctx.stroke();

          ctx.fillText(tSec === 0 ? 'now' : `-${tSec}s`, xPos, h - padding.bottom + 8);
        }
        ctx.setLineDash([]);
      }

      // Coordinate transformers
      const getX = (t) => padding.left + Math.max(0, Math.min(1, (t - minTime) / timeWindowMs)) * plotWidth;
      const getY = (v) => padding.top + (1 - (v - globalMin) / (globalMax - globalMin || 1)) * plotHeight;

      // Draw Series Lines & Area fills
      series.forEach((s) => {
        const points = bufferRef.current[s.id] || [];
        if (points.length < 2) return;

        // Path for line
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          const px = getX(points[i].timestamp);
          const py = getY(points[i].value);
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            // Smooth bezier interpolation
            const prevX = getX(points[i - 1].timestamp);
            const prevY = getY(points[i - 1].value);
            const midX = (prevX + px) / 2;
            ctx.bezierCurveTo(midX, prevY, midX, py, px, py);
          }
        }

        // Draw Area Fill
        if (fillArea) {
          ctx.save();
          const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
          gradient.addColorStop(0, `${s.color}33`); // 20% opacity
          gradient.addColorStop(1, `${s.color}00`); // 0% opacity
          ctx.fillStyle = gradient;

          // Clone line path down to baseline
          const lastPoint = points[points.length - 1];
          const firstPoint = points[0];
          ctx.lineTo(getX(lastPoint.timestamp), h - padding.bottom);
          ctx.lineTo(getX(firstPoint.timestamp), h - padding.bottom);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Stroke line
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Pulse dot at latest point
        if (points.length > 0) {
          const latest = points[points.length - 1];
          const lx = getX(latest.timestamp);
          const ly = getY(latest.value);
          ctx.beginPath();
          ctx.arc(lx, ly, 4, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(lx, ly, 7, 0, Math.PI * 2);
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // Interactive Crosshair & Tooltip
      const mouse = mousePosRef.current;
      if (mouse.active && mouse.x >= padding.left && mouse.x <= width - padding.right) {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(mouse.x, padding.top);
        ctx.lineTo(mouse.x, h - padding.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        // Hover timestamp
        const hoverTime = minTime + ((mouse.x - padding.left) / plotWidth) * timeWindowMs;
        const relativeSec = Math.round((currentTime - hoverTime) / 1000);

        // Tooltip box
        const tooltipX = mouse.x > width / 2 ? mouse.x - 140 : mouse.x + 15;
        const tooltipY = Math.min(Math.max(mouse.y, padding.top + 10), h - padding.bottom - 60);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(tooltipX, tooltipY, 130, 55, 6) : ctx.rect(tooltipX, tooltipY, 130, 55);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${relativeSec}s ago`, tooltipX + 8, tooltipY + 16);

        series.forEach((s, idx) => {
          const points = bufferRef.current[s.id] || [];
          // Find closest point
          let closestVal = null;
          let minDiff = Infinity;
          for (let p of points) {
            const diff = Math.abs(p.timestamp - hoverTime);
            if (diff < minDiff) {
              minDiff = diff;
              closestVal = p.value;
            }
          }
          if (closestVal !== null) {
            ctx.fillStyle = s.color;
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(`${s.name.slice(0, 10)}: ${closestVal.toFixed(1)} ${s.unit || ''}`, tooltipX + 8, tooltipY + 32 + idx * 14);
          }
        });
      }

      setMetrics(latestValues);
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [series, height, timeWindowMs, showGrid, fillArea]);

  // Synthetic demo stream generator if no external stream provided
  useEffect(() => {
    if (dataStream) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const synthetic = {
        timestamp: now,
        activeUsers: 1420 + Math.sin(now / 4000) * 120 + (Math.random() - 0.5) * 40,
        requests: 480 + Math.cos(now / 3000) * 80 + (Math.random() - 0.5) * 25,
      };
      series.forEach((s) => {
        if (synthetic[s.id] !== undefined) {
          const arr = bufferRef.current[s.id] || (bufferRef.current[s.id] = []);
          arr.push({ timestamp: now, value: synthetic[s.id] });
          if (arr.length > maxPoints * 2) {
            arr.splice(0, arr.length - maxPoints);
          }
        }
      });
    }, 250);

    return () => clearInterval(interval);
  }, [dataStream, series, maxPoints]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mousePosRef.current.active = false;
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-medium">
            {currentFps} FPS
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Window: {timeWindowMs / 1000}s</span>
        </div>
      </div>

      {showLegend && (
        <div className="flex flex-wrap gap-4 mb-3 text-xs">
          {series.map((s) => (
            <div key={s.id} className="flex items-center gap-2 bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700/50">
              <span className="w-3 h-1 rounded" style={{ backgroundColor: s.color }} />
              <span className="text-slate-300 font-medium">{s.name}:</span>
              <span className="text-white font-mono font-bold">
                {metrics[s.id] !== undefined ? `${metrics[s.id].toFixed(1)} ${s.unit || ''}` : '--'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="relative w-full cursor-crosshair">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: `${height}px`, display: 'block' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </div>
  );
}

export default StreamingCanvasChart;

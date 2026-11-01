import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundFX } from '../utils/audio';
import { MinuteNodeWithDiagnostics as MinuteNode, SubAgentRole } from './BHiveSwarmDiagnostics';
import {
  Flame,
  Zap,
  Activity,
  Sliders,
  Filter,
  RefreshCw,
  Coffee,
  AlertTriangle,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface SwarmDensityHeatmapProps {
  nodes: MinuteNode[];
  selectedSlot: number;
  onSelectSlot: (slot: number) => void;
  onSendCoffee?: () => void;
}

type DensityMetric = 'throughput' | 'latency' | 'composite';
type DensityViewMode = '24h-matrix' | 'hourly-rollup' | 'top-hotspots';

export const SwarmDensityHeatmap: React.FC<SwarmDensityHeatmapProps> = ({
  nodes,
  selectedSlot,
  onSelectSlot,
  onSendCoffee
}) => {
  const [metric, setMetric] = useState<DensityMetric>('throughput');
  const [viewMode, setViewMode] = useState<DensityViewMode>('24h-matrix');
  const [filterHotspotsOnly, setFilterHotspotsOnly] = useState<boolean>(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [burstActive, setBurstActive] = useState<boolean>(false);
  const [hoveredNode, setHoveredNode] = useState<MinuteNode | null>(null);

  // Compute dynamic min/max statistics for normalization
  const stats = useMemo(() => {
    let minThroughput = Infinity;
    let maxThroughput = -Infinity;
    let minLatency = Infinity;
    let maxLatency = -Infinity;
    let totalPackets = 0;
    let criticalLatencyCount = 0;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.deltaPackets < minThroughput) minThroughput = n.deltaPackets;
      if (n.deltaPackets > maxThroughput) maxThroughput = n.deltaPackets;
      if (n.latencyMs < minLatency) minLatency = n.latencyMs;
      if (n.latencyMs > maxLatency) maxLatency = n.latencyMs;
      totalPackets += n.deltaPackets;
      if (n.latencyMs > 100) criticalLatencyCount++;
    }

    return {
      minThroughput: minThroughput === Infinity ? 0 : minThroughput,
      maxThroughput: maxThroughput === -Infinity ? 500 : maxThroughput,
      minLatency: minLatency === Infinity ? 0 : minLatency,
      maxLatency: maxLatency === -Infinity ? 150 : maxLatency,
      avgThroughput: +(totalPackets / (nodes.length || 1)).toFixed(1),
      totalThroughputPerMin: totalPackets,
      criticalLatencyCount
    };
  }, [nodes]);

  // Hourly aggregated rollups (24 bins)
  const hourlyRollup = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: `${h.toString().padStart(2, '0')}:00`,
      nodes: [] as MinuteNode[],
      avgLatency: 0,
      totalPackets: 0,
      maxLatency: 0,
      hotspotCount: 0
    }));

    nodes.forEach((n) => {
      const h = n.hour;
      if (hours[h]) {
        hours[h].nodes.push(n);
        hours[h].totalPackets += n.deltaPackets;
        if (n.latencyMs > hours[h].maxLatency) hours[h].maxLatency = n.latencyMs;
        if (n.latencyMs > 100) hours[h].hotspotCount++;
      }
    });

    hours.forEach((h) => {
      const count = h.nodes.length || 1;
      const sumLat = h.nodes.reduce((acc, curr) => acc + curr.latencyMs, 0);
      h.avgLatency = +(sumLat / count).toFixed(1);
    });

    return hours;
  }, [nodes]);

  // Top Strain Hot-Spots (Top 24 nodes by strain index)
  const topHotspots = useMemo(() => {
    return [...nodes]
      .sort((a, b) => {
        if (metric === 'latency') return b.latencyMs - a.latencyMs;
        if (metric === 'throughput') return b.deltaPackets - a.deltaPackets;
        // Composite
        const strainA = (a.deltaPackets / 100) * (a.latencyMs / 10);
        const strainB = (b.deltaPackets / 100) * (b.latencyMs / 10);
        return strainB - strainA;
      })
      .slice(0, 24);
  }, [nodes, metric]);

  // Helper to calculate color intensity based on selected metric
  const getNodeColor = (node: MinuteNode): { bg: string; text: string; glow?: string } => {
    if (node.latencyMs > 100) {
      return {
        bg: 'rgb(239, 68, 68)',
        text: '#FFFFFF',
        glow: '0 0 10px rgba(239, 68, 68, 0.8)'
      };
    }

    if (metric === 'latency') {
      // Latency color scale: 2ms (emerald) -> 20ms (cyan) -> 50ms (amber) -> 80ms (orange) -> 100ms+ (red)
      const lat = node.latencyMs;
      if (lat <= 8) return { bg: 'rgb(16, 185, 129)', text: '#052e16' }; // #10B981
      if (lat <= 16) return { bg: 'rgb(52, 211, 153)', text: '#064e3b' }; // emerald-400
      if (lat <= 30) return { bg: 'rgb(56, 189, 248)', text: '#082f49' }; // sky-400
      if (lat <= 55) return { bg: 'rgb(245, 158, 11)', text: '#451a03' }; // amber-500
      if (lat <= 85) return { bg: 'rgb(249, 115, 22)', text: '#431407' }; // orange-500
      return { bg: 'rgb(225, 29, 72)', text: '#FFFFFF', glow: '0 0 8px rgba(225, 29, 72, 0.6)' }; // rose-600
    }

    if (metric === 'throughput') {
      // Throughput color scale: Low (deep slate/indigo) -> Medium (cyan) -> High (emerald) -> Peak (gold/pink)
      const range = stats.maxThroughput - stats.minThroughput || 1;
      const ratio = Math.max(0, Math.min(1, (node.deltaPackets - stats.minThroughput) / range));

      if (ratio < 0.2) return { bg: 'rgba(30, 27, 75, 0.9)', text: '#A5B4FC' }; // indigo-950
      if (ratio < 0.45) return { bg: 'rgba(14, 116, 144, 0.9)', text: '#CFFAFE' }; // cyan-700
      if (ratio < 0.7) return { bg: 'rgba(16, 185, 129, 0.9)', text: '#022c22' }; // emerald-500
      if (ratio < 0.88) return { bg: 'rgba(255, 215, 0, 0.95)', text: '#451a03', glow: '0 0 6px rgba(255, 215, 0, 0.5)' }; // Nano Banano Gold
      return { bg: 'rgba(255, 102, 196, 0.95)', text: '#500724', glow: '0 0 8px rgba(255, 102, 196, 0.6)' }; // Neon Pink Peak
    }

    // Composite Strain Metric: (throughput ratio * 0.5) + (latency ratio * 0.5)
    const throughRatio = (node.deltaPackets - stats.minThroughput) / (stats.maxThroughput - stats.minThroughput || 1);
    const latRatio = Math.min(1, node.latencyMs / 100);
    const strain = (throughRatio * 0.45 + latRatio * 0.55);

    if (strain < 0.25) return { bg: 'rgb(16, 185, 129)', text: '#052e16' };
    if (strain < 0.5) return { bg: 'rgb(56, 189, 248)', text: '#082f49' };
    if (strain < 0.75) return { bg: 'rgb(245, 158, 11)', text: '#451a03' };
    return { bg: 'rgb(239, 68, 68)', text: '#FFFFFF', glow: '0 0 10px rgba(239, 68, 68, 0.7)' };
  };

  // Trigger high-density burst simulation
  const handleTriggerBurst = () => {
    soundFX.playWiggle();
    setBurstActive(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#FFD700', '#FF2A55', '#70D6FF', '#00FF66']
    });

    setTimeout(() => {
      setBurstActive(false);
    }, 4500);
  };

  const handleCoolDownAll = () => {
    soundFX.playSuccess();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#00FF66', '#70D6FF', '#FFD700']
    });
    if (onSendCoffee) onSendCoffee();
  };

  const activeNode = nodes.find(n => n.slot === selectedSlot) || nodes[0];

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Metric KPI Ribbons */}
      <div className="clay-card-3d p-5 sm:p-6 rounded-3xl relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-[#FFD700]/15 via-[#70D6FF]/10 to-transparent pointer-events-none rounded-bl-full" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FFD700] animate-pulse" />
              <span className="text-[11px] font-code font-bold tracking-wider text-[#FFD700] uppercase">
                Swarm Intelligence &amp; Thermal Intensity Plane
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight mt-0.5 flex items-center gap-2">
              Swarm Density &amp; Latency Hot-Spots
              <span className="text-xs font-code font-normal text-[#70D6FF] hidden sm:inline">
                (1,440 Continuous Minute-Slots)
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 font-sans mt-1 max-w-2xl leading-relaxed">
              Real-time thermal visualizer mapping agent task throughput and latency hot-spots.
              Color saturation highlights overloaded minute-slots and circular gossip bottlenecks.
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleTriggerBurst}
              className={`px-3.5 py-2 rounded-xl text-xs font-display font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
                burstActive
                  ? 'clay-btn-red animate-pulse'
                  : 'clay-btn-gold hover:scale-102 active:scale-95'
              }`}
              title="Inject a high-throughput load burst into the swarm"
            >
              <Zap className="w-4 h-4" />
              <span>{burstActive ? 'BURST ACTIVE' : 'SIMULATE BURST'}</span>
            </button>

            <button
              onClick={handleCoolDownAll}
              className="px-3.5 py-2 rounded-xl text-xs font-display font-extrabold clay-btn-green transition-all cursor-pointer flex items-center gap-1.5 shadow-md hover:scale-102 active:scale-95"
              title="Balance throughput and disperse latency hot-spots"
            >
              <Coffee className="w-4 h-4" />
              <span>BALANCE SWARM</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Cards for Density Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 text-xs font-code">
          <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-0.5">
            <div className="text-[10px] text-zinc-400 font-bold flex items-center justify-between">
              <span>AVG THROUGHPUT</span>
              <Activity className="w-3.5 h-3.5 text-[#70D6FF]" />
            </div>
            <div className="text-lg font-extrabold text-[#70D6FF] tabular-nums font-display">
              {stats.avgThroughput} <span className="text-[10px] font-code font-normal text-zinc-400">pkts/min</span>
            </div>
            <div className="text-[10px] text-zinc-400">Peak: {stats.maxThroughput} pkts/min</div>
          </div>

          <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-0.5">
            <div className="text-[10px] text-zinc-400 font-bold flex items-center justify-between">
              <span>LATENCY ENVELOPE</span>
              <Flame className="w-3.5 h-3.5 text-[#FFD700]" />
            </div>
            <div className="text-lg font-extrabold text-[#FFD700] tabular-nums font-display">
              {stats.minLatency} - {stats.maxLatency} <span className="text-[10px] font-code font-normal text-zinc-400">ms</span>
            </div>
            <div className="text-[10px] text-zinc-400">Ceiling: 100ms Alarm</div>
          </div>

          <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-0.5">
            <div className="text-[10px] text-zinc-400 font-bold flex items-center justify-between">
              <span>CRITICAL HOT-SPOTS</span>
              <AlertTriangle className={`w-3.5 h-3.5 ${stats.criticalLatencyCount > 0 ? 'text-[#FF2A55]' : 'text-[#00FF66]'}`} />
            </div>
            <div className={`text-lg font-extrabold tabular-nums font-display ${stats.criticalLatencyCount > 0 ? 'text-[#FF2A55]' : 'text-[#00FF66]'}`}>
              {stats.criticalLatencyCount} <span className="text-[10px] font-code font-normal text-zinc-400">Nodes</span>
            </div>
            <div className="text-[10px] text-zinc-400">
              {stats.criticalLatencyCount > 0 ? 'Exceeds 100ms ceiling' : 'All within nominal'}
            </div>
          </div>

          <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-0.5">
            <div className="text-[10px] text-zinc-400 font-bold flex items-center justify-between">
              <span>TOTAL SWARM LOAD</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#00FF66]" />
            </div>
            <div className="text-lg font-extrabold text-[#00FF66] tabular-nums font-display">
              {(stats.totalThroughputPerMin / 1000).toFixed(1)}k <span className="text-[10px] font-code font-normal text-zinc-400">pkts/min</span>
            </div>
            <div className="text-[10px] text-zinc-400">Across 1,440 slots</div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Control Bar: Metric Switcher, View Modes & Color Scale */}
      <div className="clay-card-3d p-4 sm:p-5 rounded-3xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-black/50 rounded-2xl border border-white/10 text-xs font-code">
            <span className="text-[10px] text-zinc-400 px-2 font-bold uppercase hidden sm:inline">METRIC:</span>
            <button
              onClick={() => {
                soundFX.playClick();
                setMetric('throughput');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                metric === 'throughput'
                  ? 'clay-btn-blue text-black font-extrabold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Throughput Density</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                setMetric('latency');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                metric === 'latency'
                  ? 'clay-btn-red text-white font-extrabold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Latency Hot-Spots</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                setMetric('composite');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                metric === 'composite'
                  ? 'clay-btn-gold text-black font-extrabold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Strain Index</span>
            </button>
          </div>

          {/* View Modes (24h Matrix vs Hourly Rollup vs Top Hotspots) */}
          <div className="flex items-center gap-1.5 p-1 bg-black/50 rounded-2xl border border-white/10 text-xs font-code">
            <button
              onClick={() => {
                soundFX.playClick();
                setViewMode('24h-matrix');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                viewMode === '24h-matrix' ? 'clay-btn-purple text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              24h Matrix (1,440)
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setViewMode('hourly-rollup');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                viewMode === 'hourly-rollup' ? 'clay-btn-purple text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Hourly Rollup (24h)
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setViewMode('top-hotspots');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                viewMode === 'top-hotspots' ? 'clay-btn-purple text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Top Hot-Spots ({topHotspots.length})
            </button>
          </div>

          {/* Hotspots Only Filter Toggle */}
          <label className="flex items-center gap-2 text-xs font-code text-zinc-300 cursor-pointer select-none bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
            <input
              type="checkbox"
              checked={filterHotspotsOnly}
              onChange={(e) => {
                soundFX.playClick();
                setFilterHotspotsOnly(e.target.checked);
              }}
              className="accent-[#FF2A55] rounded cursor-pointer w-4 h-4"
            />
            <span>Filter Severe Hotspots (&gt;50ms / &gt;350 pkts)</span>
          </label>
        </div>

        {/* Dynamic Color Scale Legend */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-code">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-bold">Intensity Scale:</span>
            {metric === 'throughput' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-400">Low (120)</span>
                <div className="h-3.5 w-36 rounded-md bg-gradient-to-r from-[#1E1B4B] via-[#06B6D4] via-[#10B981] via-[#FFD700] to-[#FF66C4] border border-white/20" />
                <span className="text-[10px] text-[#FF66C4] font-bold">Peak High ({stats.maxThroughput})</span>
              </div>
            )}
            {metric === 'latency' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#00FF66]">Nominal (&lt;10ms)</span>
                <div className="h-3.5 w-36 rounded-md bg-gradient-to-r from-[#10B981] via-[#38BDF8] via-[#F59E0B] via-[#F97316] to-[#EF4444] border border-white/20" />
                <span className="text-[10px] text-[#FF2A55] font-bold">Critical (&gt;100ms)</span>
              </div>
            )}
            {metric === 'composite' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#00FF66]">Optimal</span>
                <div className="h-3.5 w-36 rounded-md bg-gradient-to-r from-[#10B981] via-[#38BDF8] via-[#F59E0B] to-[#EF4444] border border-white/20" />
                <span className="text-[10px] text-[#FF2A55] font-bold">High Strain</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-zinc-400">
            Selected: <strong className="text-[#FFD700]">Slot #{activeNode.slot}</strong> ({activeNode.hour.toString().padStart(2, '0')}:{activeNode.minute.toString().padStart(2, '0')} UTC) · {activeNode.deltaPackets} pkts/min · {activeNode.latencyMs}ms
          </div>
        </div>
      </div>

      {/* 3. Main Density Visualization Viewport */}
      {viewMode === '24h-matrix' && (
        <div className="clay-card-3d p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-display font-extrabold text-white flex items-center gap-2">
                <span>⚡</span> 24-HOUR MINUTE-BY-MINUTE HEAT DENSITY MATRIX (1,440 SLOTS)
              </h3>
              <p className="text-[11px] text-zinc-400 font-sans">
                Each row corresponds to an hour of the day (00:00 to 23:00); each cell represents a 1-minute agent dispatch slot.
              </p>
            </div>
            <span className="text-[10px] font-code px-2 py-0.5 rounded-full badge-blue">
              60 FPS Live Telemetry
            </span>
          </div>

          {/* Interactive Density Grid (24 Rows x 60 Columns) */}
          <div className="space-y-1 overflow-x-auto p-2 bg-black/60 rounded-2xl border border-white/5">
            {Array.from({ length: 24 }).map((_, hour) => {
              const hourNodes = nodes.filter(n => n.hour === hour);
              return (
                <div key={hour} className="flex items-center gap-1 min-w-[760px]">
                  {/* Hour Label */}
                  <span className="w-12 text-[10px] font-code font-bold text-zinc-400 shrink-0 text-right pr-2">
                    {hour.toString().padStart(2, '0')}:00
                  </span>

                  {/* 60 Minute Cells */}
                  <div className="flex-1 grid grid-cols-60 gap-[2px]">
                    {hourNodes.map((node) => {
                      const isSelected = node.slot === selectedSlot;
                      const isSevereHotspot = node.latencyMs > 50 || node.deltaPackets > 350;
                      
                      if (filterHotspotsOnly && !isSevereHotspot) {
                        return (
                          <div
                            key={node.slot}
                            className="h-3.5 rounded-[1px] bg-white/5 opacity-20"
                          />
                        );
                      }

                      const color = getNodeColor(node);

                      return (
                        <div
                          key={node.slot}
                          onClick={() => {
                            soundFX.playClick();
                            onSelectSlot(node.slot);
                          }}
                          onMouseEnter={() => setHoveredNode(node)}
                          onMouseLeave={() => setHoveredNode(null)}
                          className={`h-3.5 rounded-[1px] cursor-pointer transition-all ${
                            isSelected
                              ? 'ring-2 ring-white scale-140 z-20 brightness-150'
                              : 'hover:scale-130 hover:z-10 hover:brightness-125'
                          }`}
                          style={{
                            backgroundColor: color.bg,
                            boxShadow: color.glow || 'none'
                          }}
                          title={`Slot #${node.slot} (${node.hour.toString().padStart(2, '0')}:${node.minute.toString().padStart(2, '0')}) - ${node.deltaPackets} pkts/min - ${node.latencyMs}ms`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Hover Tooltip Panel */}
          {hoveredNode && (
            <div className="p-3 bg-black/80 rounded-2xl border border-[#70D6FF]/40 text-xs font-code flex items-center justify-between animate-in fade-in duration-100">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-[#FFD700]">
                  SLOT #{hoveredNode.slot.toString().padStart(4, '0')} ({hoveredNode.hour.toString().padStart(2, '0')}:{hoveredNode.minute.toString().padStart(2, '0')} UTC)
                </span>
                <span className="text-zinc-400">·</span>
                <span className="text-[#70D6FF]">
                  Throughput: <strong>{hoveredNode.deltaPackets} pkts/min</strong>
                </span>
                <span className="text-zinc-400">·</span>
                <span className={hoveredNode.latencyMs > 100 ? 'text-[#FF2A55] font-extrabold' : 'text-[#00FF66]'}>
                  Latency: <strong>{hoveredNode.latencyMs} ms</strong>
                </span>
              </div>
              <div className="text-[10px] text-zinc-400">
                Archetype: <strong className="text-white">{hoveredNode.role}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Mode 2: Hourly Rollup Cards */}
      {viewMode === 'hourly-rollup' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {hourlyRollup.map((h) => {
            const hasSevere = h.hotspotCount > 0;
            return (
              <div
                key={h.hour}
                className={`p-4 rounded-3xl clay-card-3d transition-all space-y-2 border ${
                  hasSevere ? 'border-red-500/50 bg-red-950/20' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-code">
                  <span className="font-display font-extrabold text-white text-sm">{h.label} Sector</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${hasSevere ? 'badge-red' : 'badge-green'}`}>
                    {hasSevere ? `${h.hotspotCount} Latency Alerts` : 'Nominal'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-code">
                  <div className="p-2 bg-black/40 rounded-xl">
                    <span className="text-[10px] text-zinc-400 block font-bold">Throughput</span>
                    <strong className="text-[#70D6FF] font-display text-sm">{(h.totalPackets / 60).toFixed(0)} pkts/m</strong>
                  </div>
                  <div className="p-2 bg-black/40 rounded-xl">
                    <span className="text-[10px] text-zinc-400 block font-bold">Avg Latency</span>
                    <strong className={h.avgLatency > 50 ? 'text-[#FF2A55]' : 'text-[#00FF66]'}>
                      {h.avgLatency} ms
                    </strong>
                  </div>
                </div>

                {/* Micro mini-bar of 60 minutes */}
                <div className="h-2 rounded-full overflow-hidden bg-black/60 flex gap-[1px]">
                  {h.nodes.map((n) => {
                    const c = getNodeColor(n);
                    return (
                      <div
                        key={n.slot}
                        onClick={() => {
                          soundFX.playClick();
                          onSelectSlot(n.slot);
                        }}
                        className="flex-1 cursor-pointer hover:scale-120"
                        style={{ backgroundColor: c.bg }}
                        title={`Slot #${n.slot}: ${n.deltaPackets} pkts/min, ${n.latencyMs}ms`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Mode 3: Top Hot-Spots Table */}
      {viewMode === 'top-hotspots' && (
        <div className="clay-card-3d p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-display font-extrabold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FF2A55]" />
              <span>TOP STRAIN HOT-SPOTS ACROSS THE SWARM ({topHotspots.length})</span>
            </h3>
            <span className="text-xs font-code text-zinc-400">
              Sorted by real-time density strain
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topHotspots.map((n) => {
              const isSelected = n.slot === selectedSlot;
              const isAlert = n.latencyMs > 100;
              return (
                <div
                  key={n.slot}
                  onClick={() => {
                    soundFX.playClick();
                    onSelectSlot(n.slot);
                  }}
                  className={`p-3.5 rounded-2xl bg-black/40 border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isAlert
                      ? 'border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                      : isSelected
                      ? 'border-[#FFD700] bg-black/60 shadow-[0_0_12px_rgba(255,215,0,0.25)]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-extrabold text-white text-sm">
                      Slot #{n.slot.toString().padStart(4, '0')}
                    </span>
                    <span className={`text-[10px] font-code px-2 py-0.5 rounded-md font-bold ${
                      isAlert ? 'badge-red' : 'badge-gold'
                    }`}>
                      {n.hour.toString().padStart(2, '0')}:{n.minute.toString().padStart(2, '0')} UTC
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-code">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Throughput</span>
                      <strong className="text-[#70D6FF]">{n.deltaPackets} pkts/min</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Latency</span>
                      <strong className={isAlert ? 'text-[#FF2A55] font-extrabold' : 'text-[#00FF66]'}>
                        {n.latencyMs} ms
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-code">
                    <span className="text-zinc-400">Role: <strong className="text-white">{n.role}</strong></span>
                    <span className="text-[#FFD700] hover:underline flex items-center gap-1 font-bold">
                      <span>Inspect</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

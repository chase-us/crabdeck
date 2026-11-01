import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { MinuteNodeWithDiagnostics as MinuteNode, SubAgentRole } from './BHiveSwarmDiagnostics';
import { soundFX } from '../utils/audio';
import { Activity, Info, Flame, AlertCircle } from 'lucide-react';

interface BHiveLatencyD3HeatmapProps {
  nodes: MinuteNode[];
  selectedSlot: number;
  onSelectSlot: (slot: number) => void;
  hasLatencyAlert?: boolean;
}

export interface LatencyClusterBucket {
  id: string;
  epochIndex: number;
  bucketIndex: number;
  startSlot: number;
  endSlot: number;
  timeRange: string;
  peerCount: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  hazardCount: number;
  primaryRole: SubAgentRole;
}

export const BHiveLatencyD3Heatmap: React.FC<BHiveLatencyD3HeatmapProps> = ({
  nodes,
  selectedSlot,
  onSelectSlot,
  hasLatencyAlert = false
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredBucket, setHoveredBucket] = useState<LatencyClusterBucket | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Group 1,440 nodes into 12 2-hour cognitive epochs x 6 buckets per epoch (72 clusters, 20 slots each)
  const clusterData = useMemo(() => {
    const buckets: LatencyClusterBucket[] = [];
    const totalBuckets = 72; // 12 rows (epochs) x 6 cols (20-min chunks)
    const slotsPerBucket = 20;

    for (let b = 0; b < totalBuckets; b++) {
      const startSlot = b * slotsPerBucket;
      const endSlot = startSlot + slotsPerBucket;
      const bucketNodes = nodes.slice(startSlot, endSlot);

      const startH = Math.floor(startSlot / 60);
      const startM = startSlot % 60;
      const endH = Math.floor(endSlot / 60);
      const endM = endSlot % 60;
      const timeRange = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')} - ${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

      const activeNodes = bucketNodes.filter(n => n.health >= 80);
      const peerCount = activeNodes.length;
      const latencies = activeNodes.map(n => n.latencyMs);
      const avgLatency = latencies.length > 0 ? +(Number(d3.mean(latencies)) || 0).toFixed(1) : 0;
      const minLatency = latencies.length > 0 ? +(Number(d3.min(latencies)) || 0).toFixed(1) : 0;
      const maxLatency = latencies.length > 0 ? +(Number(d3.max(latencies)) || 0).toFixed(1) : 0;
      const hazardCount = bucketNodes.filter(n => n.latencyMs > 100).length;

      const roles = bucketNodes.map(n => n.role);
      const primaryRole = (roles[0] || 'Architect') as SubAgentRole;

      buckets.push({
        id: `cluster-${b}`,
        epochIndex: Math.floor(b / 6),
        bucketIndex: b % 6,
        startSlot,
        endSlot,
        timeRange,
        peerCount,
        avgLatency,
        minLatency,
        maxLatency,
        hazardCount,
        primaryRole
      });
    }

    return buckets;
  }, [nodes]);

  // Render D3 Heatmap
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 480;
    const height = 180;
    const margin = { top: 12, right: 12, bottom: 22, left: 32 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const cols = 6;
    const rows = 12;
    const cellWidth = innerWidth / cols;
    const cellHeight = innerHeight / rows;

    // Color Interpolator:
    // <= 8ms: Vibrant Cyan (#00f3ff)
    // 8ms - 25ms: Emerald/Mint (#00ff66)
    // 25ms - 60ms: Cyber Gold (#ffd700)
    // 60ms - 100ms: Amber Orange (#ff8800)
    // > 100ms: Neon Crimson Alert (#ff2a55)
    const getColor = (latency: number, hazards: number) => {
      if (hazards > 0 || latency > 100) return '#FF2A55';
      if (latency <= 6.0) return '#00F3FF';
      if (latency <= 12.0) return '#00FF66';
      if (latency <= 35.0) return '#FFD700';
      return '#FF7A00';
    };

    // Y Axis Labels (Epoch 1 to 12)
    const yAxisG = g.append('g').attr('class', 'y-axis');
    for (let r = 0; r < rows; r += 2) {
      yAxisG
        .append('text')
        .attr('x', -6)
        .attr('y', r * cellHeight + cellHeight / 2 + 3)
        .attr('text-anchor', 'end')
        .attr('fill', '#71717a')
        .attr('font-size', '8px')
        .attr('font-family', 'ui-monospace, monospace')
        .text(`E${(r + 1).toString().padStart(2, '0')}`);
    }

    // X Axis Labels (20m increments)
    const xAxisG = g.append('g').attr('class', 'x-axis');
    const xLabels = ['00m', '20m', '40m', '60m', '80m', '100m'];
    xLabels.forEach((label, c) => {
      xAxisG
        .append('text')
        .attr('x', c * cellWidth + cellWidth / 2)
        .attr('y', innerHeight + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#71717a')
        .attr('font-size', '8px')
        .attr('font-family', 'ui-monospace, monospace')
        .text(label);
    });

    // Render cells
    const cellGroup = g.append('g').attr('class', 'cells');

    clusterData.forEach(d => {
      const x = d.bucketIndex * cellWidth;
      const y = d.epochIndex * cellHeight;
      const isSelected = selectedSlot >= d.startSlot && selectedSlot < d.endSlot;
      const hasHazard = d.hazardCount > 0;

      const rect = cellGroup
        .append('rect')
        .attr('x', x + 1)
        .attr('y', y + 1)
        .attr('width', Math.max(2, cellWidth - 2))
        .attr('height', Math.max(2, cellHeight - 2))
        .attr('rx', 2.5)
        .attr('ry', 2.5)
        .attr('fill', getColor(d.avgLatency, d.hazardCount))
        .attr('fill-opacity', isSelected ? 1.0 : hasHazard ? 0.95 : 0.72)
        .attr('stroke', isSelected ? '#FFFFFF' : hasHazard ? '#FF2A55' : 'rgba(255,255,255,0.08)')
        .attr('stroke-width', isSelected ? 1.5 : hasHazard ? 1.5 : 0.5)
        .attr('class', 'cursor-pointer transition-opacity duration-150')
        .style('filter', isSelected ? 'drop-shadow(0 0 4px #FFD700)' : hasHazard ? 'drop-shadow(0 0 6px #FF2A55)' : 'none');

      // Interactivity
      rect
        .on('mouseenter', (event: MouseEvent) => {
          d3.select(event.currentTarget as SVGElement)
            .attr('fill-opacity', 1.0)
            .attr('stroke', '#FFD700')
            .attr('stroke-width', 1.5);

          const bounds = container.getBoundingClientRect();
          setTooltipPos({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top
          });
          setHoveredBucket(d);
        })
        .on('mousemove', (event: MouseEvent) => {
          const bounds = container.getBoundingClientRect();
          setTooltipPos({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top
          });
        })
        .on('mouseleave', (event: MouseEvent) => {
          d3.select(event.currentTarget as SVGElement)
            .attr('fill-opacity', isSelected ? 1.0 : hasHazard ? 0.95 : 0.72)
            .attr('stroke', isSelected ? '#FFFFFF' : hasHazard ? '#FF2A55' : 'rgba(255,255,255,0.08)')
            .attr('stroke-width', isSelected ? 1.5 : hasHazard ? 1.5 : 0.5);

          setHoveredBucket(null);
          setTooltipPos(null);
        })
        .on('click', () => {
          soundFX.playClick();
          onSelectSlot(d.startSlot);
        });
    });

  }, [clusterData, selectedSlot, onSelectSlot]);

  return (
    <div
      ref={containerRef}
      className="p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-[#70D6FF]/30 transition-all relative flex flex-col justify-between"
    >
      {/* Title & Micro Summary */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#00F3FF]" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider font-display">
            D3 Latency Heatmap
          </span>
          <span className="text-[9px] font-code text-zinc-400">
            (72 Clusters · 1,440 Slots)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[9px] font-code">
          <span className="flex items-center gap-1 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F3FF]" />
            &lt;6ms
          </span>
          <span className="flex items-center gap-1 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
            12ms
          </span>
          <span className="flex items-center gap-1 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
            35ms
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A55] animate-ping" />
            &gt;100ms
          </span>
        </div>
      </div>

      {/* SVG Canvas for D3 Heatmap */}
      <div className="w-full overflow-hidden flex items-center justify-center">
        <svg ref={svgRef} className="w-full block" />
      </div>

      {/* Footer Info */}
      <div className="pt-2 mt-1 border-t border-white/5 flex items-center justify-between text-[10px] font-code text-zinc-400">
        <span>Click any cluster to inspect slots</span>
        <span className="text-[#70D6FF] truncate font-bold">
          {hasLatencyAlert ? '🚨 High Latency Anomalies Detected' : 'Mesh Distribution: 98.4% Nominal'}
        </span>
      </div>

      {/* Interactive Floating D3 Tooltip */}
      {hoveredBucket && tooltipPos && (
        <div
          className="absolute z-30 pointer-events-none p-2.5 rounded-xl bg-black/95 border border-[#70D6FF]/50 shadow-2xl backdrop-blur-md text-[10px] font-code w-52 space-y-1"
          style={{
            left: Math.min(Math.max(10, tooltipPos.x - 100), (containerRef.current?.clientWidth || 300) - 215),
            top: Math.max(10, tooltipPos.y - 95)
          }}
        >
          <div className="flex items-center justify-between text-white font-bold border-b border-white/10 pb-1">
            <span>Epoch {hoveredBucket.epochIndex + 1} Cluster</span>
            <span className="text-[#FFD700]">{hoveredBucket.timeRange}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span>Active Peers:</span>
            <strong className="text-white">{hoveredBucket.peerCount} / 20</strong>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span>Avg Latency:</span>
            <strong className={hoveredBucket.avgLatency > 100 ? 'text-[#FF2A55] animate-pulse' : 'text-[#70D6FF]'}>
              {hoveredBucket.avgLatency} ms
            </strong>
          </div>
          <div className="flex items-center justify-between text-zinc-400 text-[9px]">
            <span>Min / Peak:</span>
            <span>{hoveredBucket.minLatency}ms · {hoveredBucket.maxLatency}ms</span>
          </div>
          {hoveredBucket.hazardCount > 0 && (
            <div className="text-[#FF2A55] font-bold text-[9px] pt-0.5 border-t border-red-500/30 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{hoveredBucket.hazardCount} peer(s) &gt; 100ms breach!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

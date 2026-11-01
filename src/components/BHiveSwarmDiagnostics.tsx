import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Network,
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Server,
  Layers,
  Radio,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';

export type SubAgentRole = 'Architect' | 'Weaver' | 'Breaker';

export interface HopTrace {
  hopNumber: number;
  targetSlot: number;
  targetRole: SubAgentRole;
  interHopLatencyMs: number;
  protocol: 'Direct-QUIC' | 'Gossip-v2' | 'Chronos-Sync' | 'Fallback-Mesh';
  transitStatus: 'FORWARDED' | 'ACK_VERIFIED' | 'ROUTE_OPTIMAL' | 'RE_ROUTED' | 'DROPPED';
}

export interface PacketDropStats {
  totalDrops: number;
  rxDrops: number; // Ingress packet drops
  txDrops: number; // Egress packet drops
  bufferOverflows: number; // Ring buffer congestions
  dropRatePercent: number; // Drop rate ratio
  retransmissionRequests: number; // Retransmits
  dropSeverity: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
}

export interface RoutingHopStats {
  currentHopCount: number; // Hops to reach consensus
  maxHopLimit: number; // Max TTL hops
  nextHopSlot: number; // Next physical slot target
  meanHopLatencyMs: number; // Average latency per hop
  routeEfficiencyScore: number; // Percentage efficiency
  hopTraceGrid: HopTrace[];
}

export interface NodeDiagnostics {
  packetDrops: PacketDropStats;
  routingHops: RoutingHopStats;
}

export interface MinuteNodeWithDiagnostics {
  slot: number; // 0 to 1439
  hour: number; // 0 to 23
  minute: number; // 0 to 59
  status: 'active' | 'gossip_sync' | 'idle' | 'rotating';
  role: SubAgentRole;
  latencyMs: number;
  deltaPackets: number;
  health: number;
  diagnostics: NodeDiagnostics;
}

/**
 * Computes deterministic and real-time responsive diagnostic metrics
 * for any node in the 1,440-minute slot swarm mesh.
 */
export const computeNodeDiagnostics = (
  slot: number,
  latencyMs: number,
  role: SubAgentRole,
  deltaPackets: number,
  health: number
): NodeDiagnostics => {
  const isHighLatency = latencyMs > 100;

  // 1. Raw Packet Drops Computation
  let totalDrops = 0;
  let rxDrops = 0;
  let txDrops = 0;
  let bufferOverflows = 0;
  let dropRatePercent = 0.0;
  let retransmissionRequests = 0;
  let dropSeverity: 'NOMINAL' | 'ELEVATED' | 'CRITICAL' = 'NOMINAL';

  if (isHighLatency) {
    totalDrops = Math.floor(48 + (latencyMs - 100) * 0.8 + (slot % 13));
    rxDrops = Math.floor(totalDrops * 0.64);
    txDrops = totalDrops - rxDrops;
    bufferOverflows = Math.floor(12 + (latencyMs - 100) * 0.22);
    dropRatePercent = +((totalDrops / Math.max(1, deltaPackets * 10)) * 100).toFixed(2);
    retransmissionRequests = Math.floor(totalDrops * 1.85);
    dropSeverity = 'CRITICAL';
  } else {
    totalDrops = slot % 19 === 0 ? 3 : slot % 7 === 0 ? 1 : 0;
    rxDrops = Math.floor(totalDrops * 0.6);
    txDrops = totalDrops - rxDrops;
    bufferOverflows = slot % 43 === 0 ? 1 : 0;
    dropRatePercent = +((totalDrops / Math.max(1, deltaPackets * 12)) * 100).toFixed(3);
    retransmissionRequests = totalDrops * 2;
    dropSeverity = totalDrops > 0 ? 'ELEVATED' : 'NOMINAL';
  }

  // 2. Routing Hop Counts Computation
  const currentHopCount = isHighLatency
    ? Math.min(16, 5 + (slot % 3))
    : Math.max(1, (slot % 3) + 2); // 2 to 4 hops nominally
  const maxHopLimit = 16;
  const nextHopSlot = (slot + 17) % 1440;
  const meanHopLatencyMs = +(latencyMs / Math.max(1, currentHopCount)).toFixed(2);
  const routeEfficiencyScore = isHighLatency
    ? +(64.2 - Math.min(22, (latencyMs - 100) * 0.25)).toFixed(1)
    : +(99.8 - totalDrops * 0.4).toFixed(1);

  // Hop trace path generation
  const roles: SubAgentRole[] = ['Architect', 'Weaver', 'Breaker'];
  const hopTraceGrid: HopTrace[] = [];

  for (let i = 1; i <= currentHopCount; i++) {
    const hopSlot = (slot + i * 23) % 1440;
    const hopRole = roles[(slot + i) % 3];
    const isLastHop = i === currentHopCount;
    const isProblematicHop = isHighLatency && i === Math.floor(currentHopCount / 2);

    hopTraceGrid.push({
      hopNumber: i,
      targetSlot: hopSlot,
      targetRole: hopRole,
      interHopLatencyMs: isProblematicHop
        ? +(latencyMs * 0.62).toFixed(1)
        : +((latencyMs / currentHopCount) * (0.88 + ((i * 3) % 4) * 0.08)).toFixed(1),
      protocol: isLastHop ? 'Direct-QUIC' : i % 2 === 0 ? 'Gossip-v2' : 'Chronos-Sync',
      transitStatus: isProblematicHop
        ? 'RE_ROUTED'
        : isLastHop
        ? 'ROUTE_OPTIMAL'
        : 'ACK_VERIFIED'
    });
  }

  return {
    packetDrops: {
      totalDrops,
      rxDrops,
      txDrops,
      bufferOverflows,
      dropRatePercent,
      retransmissionRequests,
      dropSeverity
    },
    routingHops: {
      currentHopCount,
      maxHopLimit,
      nextHopSlot,
      meanHopLatencyMs,
      routeEfficiencyScore,
      hopTraceGrid
    }
  };
};

interface TechnicalDiagnosticsProps {
  slot: number;
  diagnostics: NodeDiagnostics;
  compact?: boolean;
}

/**
 * High-fidelity Data Grid visualizing Raw Packet Drop Counts and Routing Hop Counts
 */
export const TechnicalDiagnosticsDataGrid: React.FC<TechnicalDiagnosticsProps> = ({
  slot,
  diagnostics,
  compact = false
}) => {
  const { packetDrops, routingHops } = diagnostics;
  const isCritical = packetDrops.dropSeverity === 'CRITICAL';

  return (
    <div className="space-y-4 pt-3 border-t border-white/10 font-mono text-white text-xs">
      {/* Diagnostics Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 animate-ping' : 'bg-[#70D6FF]'}`} />
          <span className="font-bold text-[#70D6FF] tracking-wider text-xs uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Technical Diagnostics
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
            DATA GRID // SLOT #{slot.toString().padStart(4, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span
            className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
              isCritical
                ? 'bg-red-950 text-red-400 border border-red-500 animate-pulse'
                : packetDrops.dropSeverity === 'ELEVATED'
                ? 'bg-amber-950 text-amber-300 border border-amber-600'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-700'
            }`}
          >
            {packetDrops.dropSeverity} DROP PROFILE ({packetDrops.dropRatePercent}%)
          </span>
        </div>
      </div>

      {/* ========================================================
          1. RAW PACKET DROP COUNTS DATA GRID
         ======================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
          <span className="flex items-center gap-1.5 text-zinc-200">
            <ArrowDownToLine className="w-3.5 h-3.5 text-sky-400" />
            RAW PACKET DROP COUNTS
          </span>
          <span className="text-[10px] text-zinc-400 font-normal">
            Ingress / Egress Loss Breakdown
          </span>
        </div>

        {/* Metric Summary Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">TOTAL PACKET DROPS</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={`text-lg font-black ${packetDrops.totalDrops > 10 ? 'text-red-400' : 'text-white'}`}>
                {packetDrops.totalDrops}
              </span>
              <span className="text-[10px] text-zinc-400">pkts</span>
            </div>
            <span className="text-[9px] text-zinc-500 mt-0.5">Rate: {packetDrops.dropRatePercent}%</span>
          </div>

          <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">INGRESS (RX) DROPS</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-sky-300">
                {packetDrops.rxDrops}
              </span>
              <span className="text-[10px] text-zinc-400">pkts</span>
            </div>
            <span className="text-[9px] text-zinc-500 mt-0.5">RingBuffer-0 queue</span>
          </div>

          <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">EGRESS (TX) DROPS</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-indigo-300">
                {packetDrops.txDrops}
              </span>
              <span className="text-[10px] text-zinc-400">pkts</span>
            </div>
            <span className="text-[9px] text-zinc-500 mt-0.5">Gossip-Tx buffer</span>
          </div>

          <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">BUFFER OVERFLOWS</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={`text-lg font-black ${packetDrops.bufferOverflows > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
                {packetDrops.bufferOverflows}
              </span>
              <span className="text-[10px] text-zinc-400">events</span>
            </div>
            <span className="text-[9px] text-zinc-500 mt-0.5">Retransmits: {packetDrops.retransmissionRequests}</span>
          </div>
        </div>

        {/* Detailed Raw Packet Drop Data Grid Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/70 shadow-inner">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-white/5 text-zinc-400 text-[10px] uppercase border-b border-white/10 font-bold">
              <tr>
                <th className="px-3 py-2">Packet Drop Channel</th>
                <th className="px-3 py-2">Raw Drop Count</th>
                <th className="px-3 py-2">Channel Ratio</th>
                <th className="px-3 py-2">Buffer Ring Location</th>
                <th className="px-3 py-2 text-right">Diagnostic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-200">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-3 py-2 font-medium flex items-center gap-1.5">
                  <span className="text-sky-400 font-bold">●</span> Ingress Socket Buffer (RX)
                </td>
                <td className="px-3 py-2 font-bold text-white">
                  {packetDrops.rxDrops} <span className="text-zinc-400 font-normal">pkts</span>
                </td>
                <td className="px-3 py-2 text-zinc-400">
                  {(packetDrops.rxDrops / Math.max(1, packetDrops.totalDrops) * 100).toFixed(1)}%
                </td>
                <td className="px-3 py-2 text-zinc-400 font-mono text-[10px]">
                  /dev/shm/ring_rx_slot_{slot}
                </td>
                <td className="px-3 py-2 text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    packetDrops.rxDrops > 15
                      ? 'bg-red-950 text-red-400 border border-red-500 animate-pulse'
                      : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                  }`}>
                    {packetDrops.rxDrops > 15 ? 'OVERFLOW_TRIPPED' : 'NOMINAL_FLOW'}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-3 py-2 font-medium flex items-center gap-1.5">
                  <span className="text-indigo-400 font-bold">●</span> Egress Gossip Queue (TX)
                </td>
                <td className="px-3 py-2 font-bold text-white">
                  {packetDrops.txDrops} <span className="text-zinc-400 font-normal">pkts</span>
                </td>
                <td className="px-3 py-2 text-zinc-400">
                  {(packetDrops.txDrops / Math.max(1, packetDrops.totalDrops) * 100).toFixed(1)}%
                </td>
                <td className="px-3 py-2 text-zinc-400 font-mono text-[10px]">
                  megabrain_gossip_tx.pipe
                </td>
                <td className="px-3 py-2 text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    packetDrops.txDrops > 10
                      ? 'bg-red-950 text-red-400 border border-red-500 animate-pulse'
                      : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                  }`}>
                    {packetDrops.txDrops > 10 ? 'TX_CONGESTION' : 'NOMINAL_FLOW'}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-3 py-2 font-medium flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">●</span> Ring Buffer Overrun
                </td>
                <td className="px-3 py-2 font-bold text-white">
                  {packetDrops.bufferOverflows} <span className="text-zinc-400 font-normal">events</span>
                </td>
                <td className="px-3 py-2 text-zinc-400">{packetDrops.dropRatePercent}% rate</td>
                <td className="px-3 py-2 text-zinc-400 font-mono text-[10px]">
                  FastAPI WS Loopback (127.0.0.1)
                </td>
                <td className="px-3 py-2 text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    packetDrops.bufferOverflows > 0
                      ? 'bg-amber-950 text-amber-300 border border-amber-600'
                      : 'bg-white/5 text-zinc-400'
                  }`}>
                    {packetDrops.bufferOverflows > 0 ? 'BACKPRESSURE_ACTUATED' : 'HEADROOM_CLEAR'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          2. ROUTING HOP COUNTS DATA GRID
         ======================================================== */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
          <span className="flex items-center gap-1.5 text-zinc-200">
            <Network className="w-3.5 h-3.5 text-[#FFD700]" />
            ROUTING HOP COUNTS &amp; TOPOLOGY PATH
          </span>
          <span className="text-[10px] text-[#70D6FF]">
            NEXT HOP: SLOT #{routingHops.nextHopSlot.toString().padStart(4, '0')}
          </span>
        </div>

        {/* Routing Hop Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">CURRENT HOP COUNT</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-[#FFD700]">
                {routingHops.currentHopCount}
              </span>
              <span className="text-[10px] text-zinc-400">/ {routingHops.maxHopLimit} Max TTL</span>
            </div>
            <span className="text-[9px] text-zinc-500 mt-0.5">Consensus reach hops</span>
          </div>

          <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">NEXT HOP SLOT TARGET</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-[#70D6FF]">
                #{routingHops.nextHopSlot.toString().padStart(4, '0')}
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 mt-0.5">P2P gossip partner</span>
          </div>

          <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">MEAN HOP TRANSIT</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-emerald-400">
                {routingHops.meanHopLatencyMs}
              </span>
              <span className="text-[10px] text-zinc-400">ms / hop</span>
            </div>
            <span className="text-[9px] text-zinc-500 mt-0.5">Single-hop latency</span>
          </div>

          <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">ROUTE EFFICIENCY</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-[#FF66C4]">
                {routingHops.routeEfficiencyScore}%
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 mt-0.5">Direct path ratio</span>
          </div>
        </div>

        {/* Detailed Routing Hop Constellation Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/70 shadow-inner">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-white/5 text-zinc-400 text-[10px] uppercase border-b border-white/10 font-bold">
              <tr>
                <th className="px-3 py-2">Hop #</th>
                <th className="px-3 py-2">Peer Slot Target</th>
                <th className="px-3 py-2">Sub-Agent Role</th>
                <th className="px-3 py-2">Transit Protocol</th>
                <th className="px-3 py-2">Inter-Hop Latency</th>
                <th className="px-3 py-2 text-right">Hop State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-200">
              {routingHops.hopTraceGrid.map((hop) => (
                <tr key={hop.hopNumber} className="hover:bg-white/5 transition-colors">
                  <td className="px-3 py-2 font-bold text-[#FFD700] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
                    HOP {hop.hopNumber.toString().padStart(2, '0')}
                  </td>
                  <td className="px-3 py-2 font-bold text-white">
                    Slot #{hop.targetSlot.toString().padStart(4, '0')}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        hop.targetRole === 'Architect'
                          ? 'bg-amber-950 text-[#FFD700]'
                          : hop.targetRole === 'Weaver'
                          ? 'bg-emerald-950 text-[#00FF66]'
                          : 'bg-rose-950 text-[#FF2A55]'
                      }`}
                    >
                      {hop.targetRole}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-zinc-400 font-mono text-[10px]">
                    {hop.protocol}
                  </td>
                  <td className="px-3 py-2 font-bold text-sky-300">
                    {hop.interHopLatencyMs} ms
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hop.transitStatus === 'RE_ROUTED'
                          ? 'bg-red-950 text-red-400 border border-red-500 animate-pulse'
                          : hop.transitStatus === 'ROUTE_OPTIMAL'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : 'bg-white/10 text-zinc-300'
                      }`}
                    >
                      {hop.transitStatus}
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
};

interface SwarmNodeCardProps {
  node: MinuteNodeWithDiagnostics;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
  onSendCoffee?: () => void;
}

/**
 * Expandable Swarm Node Card with rich telemetry summary and Technical Diagnostics data grid
 */
export const SwarmNodeCard: React.FC<SwarmNodeCardProps> = ({
  node,
  isSelected,
  isExpanded,
  onToggleExpand,
  onSelect,
  onSendCoffee
}) => {
  const isCriticalLatency = node.latencyMs > 100;
  const diag = node.diagnostics;

  const roleColor =
    node.role === 'Architect'
      ? '#FFD700'
      : node.role === 'Weaver'
      ? '#00FF66'
      : '#FF2A55';

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 p-4 font-mono ${
        isCriticalLatency
          ? 'bg-red-950/25 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)]'
          : isSelected
          ? 'bg-[#120D2C] border-white/40 shadow-lg ring-1 ring-white/20'
          : 'bg-[#0A071A]/90 border-white/10 hover:border-white/25 shadow-md'
      }`}
    >
      {/* Node Header Row */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div
          onClick={onSelect}
          className="flex items-center gap-2 cursor-pointer group"
          title="Click to inspect this slot in the 1,440 matrix"
        >
          <span className="text-base group-hover:scale-110 transition-transform">
            {isCriticalLatency ? '🚨' : node.role === 'Architect' ? '📐' : node.role === 'Weaver' ? '🧵' : '🔨'}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white group-hover:text-[#70D6FF] transition-colors">
                SLOT #{node.slot.toString().padStart(4, '0')}
              </span>
              <span className="text-[10px] text-zinc-400">
                ({node.hour.toString().padStart(2, '0')}:{node.minute.toString().padStart(2, '0')} UTC)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              node.role === 'Architect'
                ? 'bg-amber-950 text-[#FFD700] border border-amber-800'
                : node.role === 'Weaver'
                ? 'bg-emerald-950 text-[#00FF66] border border-emerald-800'
                : 'bg-rose-950 text-[#FF2A55] border border-rose-800'
            }`}
          >
            {node.role}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isCriticalLatency
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-white/10 text-zinc-300'
            }`}
          >
            {isCriticalLatency ? 'HAZARD' : node.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Metric Strip */}
      <div className="grid grid-cols-3 gap-2 py-2.5 text-xs">
        <div className="p-2 bg-black/40 rounded-xl border border-white/5">
          <span className="text-[9px] text-zinc-400 block font-bold">LATENCY</span>
          <span
            className={`font-black text-sm ${
              isCriticalLatency ? 'text-red-400 animate-pulse' : 'text-emerald-400'
            }`}
          >
            {node.latencyMs} ms
          </span>
        </div>

        <div className="p-2 bg-black/40 rounded-xl border border-white/5">
          <span className="text-[9px] text-zinc-400 block font-bold">PACKET DROPS</span>
          <span
            className={`font-black text-sm ${
              diag.packetDrops.totalDrops > 10 ? 'text-red-400' : 'text-white'
            }`}
          >
            {diag.packetDrops.totalDrops} pkts
          </span>
        </div>

        <div className="p-2 bg-black/40 rounded-xl border border-white/5">
          <span className="text-[9px] text-zinc-400 block font-bold">ROUTING HOPS</span>
          <span className="font-black text-sm text-[#FFD700]">
            {diag.routingHops.currentHopCount} hops
          </span>
        </div>
      </div>

      {/* Expand / Collapse Technical Diagnostics Trigger Button */}
      <div className="pt-1 flex items-center justify-between gap-2">
        <button
          onClick={onToggleExpand}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
            isExpanded
              ? 'bg-[#70D6FF]/20 text-[#70D6FF] border border-[#70D6FF]/40'
              : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10'
          }`}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Hide Technical Diagnostics</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Technical Diagnostics (Data Grid)</span>
            </>
          )}
        </button>

        {onSendCoffee && (
          <button
            onClick={onSendCoffee}
            title="Send Virtual Coffee to this node"
            className="py-1.5 px-2.5 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] rounded-xl text-xs border border-[#FFD700]/30 transition-all cursor-pointer"
          >
            ☕
          </button>
        )}
      </div>

      {/* Expandable Technical Diagnostics Data Grid Section */}
      {isExpanded && (
        <div className="animate-in fade-in duration-300">
          <TechnicalDiagnosticsDataGrid slot={node.slot} diagnostics={diag} />
        </div>
      )}
    </div>
  );
};

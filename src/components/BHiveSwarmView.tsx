import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundFX } from '../utils/audio';
import { ChevronDown, ChevronUp, Network, Activity, AlertTriangle, Layers, Filter, Radio, Wifi, Zap, RefreshCw, Cpu } from 'lucide-react';
import {
  SubAgentRole,
  HopTrace,
  PacketDropStats,
  RoutingHopStats,
  NodeDiagnostics,
  MinuteNodeWithDiagnostics as MinuteNode,
  computeNodeDiagnostics,
  TechnicalDiagnosticsDataGrid,
  SwarmNodeCard
} from './BHiveSwarmDiagnostics';
import { SwarmDensityHeatmap } from './SwarmDensityHeatmap';
import { BHiveLatencyD3Heatmap } from './BHiveLatencyD3Heatmap';
import { BHiveGossipRechartsGraph } from './BHiveGossipRechartsGraph';

export type { SubAgentRole, HopTrace, PacketDropStats, RoutingHopStats, NodeDiagnostics, MinuteNode };

export interface GossipDeltaEvent {
  id: string;
  timestamp: string;
  sourceSlot: number;
  targetSlot: number;
  digestHash: string;
  payloadKb: number;
  role: SubAgentRole;
  status: 'ACK' | 'SYNC' | 'RE-ROUTE';
}

export interface BHiveSwarmViewProps {
  onNavigateToChatRoom?: () => void;
}

export const BHiveSwarmView: React.FC<BHiveSwarmViewProps> = ({
  onNavigateToChatRoom
}) => {
  // Chronos 15-second pulse state
  const [chronosCountdown, setChronosCountdown] = useState<number>(15.0);
  const [pulseCount, setPulseCount] = useState<number>(1042);
  const [pollingRate, setPollingRate] = useState<'5s-Fast' | '15s-Standard' | '30s-Eco'>('15s-Standard');
  const [activeRotationRole, setActiveRotationRole] = useState<SubAgentRole>('Architect');

  // Weighted round-robin weights
  const [weights, setWeights] = useState({
    Architect: 50,
    Weaver: 30,
    Breaker: 20
  });

  // Selected node for inspection
  const [selectedSlot, setSelectedSlot] = useState<number>(720); // 12:00 PM slot
  const [filterRole, setFilterRole] = useState<'ALL' | SubAgentRole>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAlarmAudioMuted, setIsAlarmAudioMuted] = useState<boolean>(false);
  const [autoJitterEnabled, setAutoJitterEnabled] = useState<boolean>(false);

  // Expandable Diagnostics State for Node Cards
  const [expandedSlots, setExpandedSlots] = useState<Set<number>>(() => new Set([720]));
  const [isInspectorDiagnosticsExpanded, setIsInspectorDiagnosticsExpanded] = useState<boolean>(true);
  const [nodeClusterMode, setNodeClusterMode] = useState<'NEIGHBORS' | 'HAZARDS' | 'ACTIVE_ROSTER'>('NEIGHBORS');
  const [activeSwarmTab, setActiveSwarmTab] = useState<'swarm-density' | 'topology-grid' | 'diagnostics-cluster' | 'all'>('swarm-density');

  // Generate initial 1,440 Minute-slot node grid state with real diagnostics data
  const generateInitialNodes = (): MinuteNode[] => {
    const list: MinuteNode[] = [];
    const roles: SubAgentRole[] = ['Architect', 'Weaver', 'Breaker'];
    for (let slot = 0; slot < 1440; slot++) {
      const hour = Math.floor(slot / 60);
      const minute = slot % 60;
      const role = roles[slot % 3];
      const isPeak = (hour >= 9 && hour <= 17);
      const latencyMs = +(4.2 + (slot % 13) * 0.4 + (isPeak ? 2.1 : 0)).toFixed(1);
      const deltaPackets = 120 + ((slot * 7) % 340);
      const health = slot % 47 === 0 ? 98.4 : 100;
      const status: MinuteNode['status'] =
        slot % 11 === 0 ? 'gossip_sync' : slot % 19 === 0 ? 'rotating' : 'active';
      const diagnostics = computeNodeDiagnostics(slot, latencyMs, role, deltaPackets, health);

      list.push({
        slot,
        hour,
        minute,
        status,
        role,
        latencyMs,
        deltaPackets,
        health,
        diagnostics
      });
    }
    return list;
  };

  const [nodes, setNodes] = useState<MinuteNode[]>(generateInitialNodes);

  // Latency Alert System (> 100ms)
  const criticalLatencyNodes = useMemo(() => {
    return nodes.filter(n => n.latencyMs > 100);
  }, [nodes]);

  const hasLatencyAlert = criticalLatencyNodes.length > 0;
  const peakLatency = useMemo(() => {
    if (criticalLatencyNodes.length === 0) return 0;
    return criticalLatencyNodes.reduce((max, n) => Math.max(max, n.latencyMs), 0);
  }, [criticalLatencyNodes]);

  // Audio Warning Sound Trigger (soundFX.playAlarm) when latency exceeds 100ms
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (hasLatencyAlert && !isAlarmAudioMuted) {
      // Trigger warning sound immediately on breach
      soundFX.playAlarm();

      // Repeat warning sound at a steady, urgent cadence every 2.5 seconds
      alarmIntervalRef.current = setInterval(() => {
        soundFX.playAlarm();
      }, 2500);
    } else {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    }

    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    };
  }, [hasLatencyAlert, isAlarmAudioMuted]);

  // Handler to inject a high latency spike (>100ms) for testing and verification
  const handleInjectLatencySpike = (targetSlot?: number, targetLatency: number = 142.5) => {
    const slotToSpike = targetSlot !== undefined ? targetSlot : (selectedSlot || 720);
    
    setNodes(prev => prev.map(node => {
      if (node.slot === slotToSpike) {
        const newLatency = +(targetLatency).toFixed(1);
        const newHealth = 84.2;
        return {
          ...node,
          latencyMs: newLatency,
          health: newHealth,
          status: 'gossip_sync',
          diagnostics: computeNodeDiagnostics(node.slot, newLatency, node.role, node.deltaPackets, newHealth)
        };
      }
      return node;
    }));

    setSelectedSlot(slotToSpike);
    setExpandedSlots(prev => new Set([...prev, slotToSpike]));

    // Audio cue
    soundFX.playAlarm();

    // Log to gossip delta stream
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    setGossipEvents(evts => [
      {
        id: `g-spike-${Date.now()}`,
        timestamp: timeStr,
        sourceSlot: slotToSpike,
        targetSlot: (slotToSpike + 1) % 1440,
        digestHash: '0xLATENCY_BREACH_100MS_ALERT',
        payloadKb: 64.8,
        role: 'Breaker',
        status: 'RE-ROUTE'
      },
      ...evts.slice(0, 19)
    ]);
  };

  // Handler to resolve all latency spikes and restore healthy state
  const handleResolveAllSpikes = () => {
    setNodes(prev => prev.map(node => {
      if (node.latencyMs > 100) {
        const restoredLatency = +(4.5 + (node.slot % 7) * 0.5).toFixed(1);
        const restoredHealth = 100;
        return {
          ...node,
          latencyMs: restoredLatency,
          health: restoredHealth,
          status: 'active',
          diagnostics: computeNodeDiagnostics(node.slot, restoredLatency, node.role, node.deltaPackets, restoredHealth)
        };
      }
      return node;
    }));

    soundFX.playChime();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Handler to set selected node latency
  const handleSetSelectedNodeLatency = (latency: number) => {
    const newLatency = +latency.toFixed(1);
    setNodes(prev => prev.map(n => {
      if (n.slot === selectedSlot) {
        return {
          ...n,
          latencyMs: newLatency,
          diagnostics: computeNodeDiagnostics(n.slot, newLatency, n.role, n.deltaPackets, n.health)
        };
      }
      return n;
    }));
    if (latency > 100) {
      soundFX.playAlarm();
    }
  };

  // Live streaming Gossip-Delta events
  const [gossipEvents, setGossipEvents] = useState<GossipDeltaEvent[]>([
    {
      id: 'g-001',
      timestamp: '14:24:02.112',
      sourceSlot: 864,
      targetSlot: 865,
      digestHash: '0x8f2a...c0de',
      payloadKb: 4.8,
      role: 'Architect',
      status: 'ACK'
    },
    {
      id: 'g-002',
      timestamp: '14:24:03.490',
      sourceSlot: 104,
      targetSlot: 142,
      digestHash: '0x7b11...99ef',
      payloadKb: 12.4,
      role: 'Weaver',
      status: 'SYNC'
    },
    {
      id: 'g-003',
      timestamp: '14:24:04.810',
      sourceSlot: 1210,
      targetSlot: 1211,
      digestHash: '0x3c49...fa10',
      payloadKb: 2.1,
      role: 'Breaker',
      status: 'ACK'
    }
  ]);

  // Sourced from Heartbeat Telemetry: Active Peer Count, Network Latency, and Gossip-Delta Sync Frequency
  const activePeerCount = useMemo(() => {
    return nodes.filter(n => n.health >= 80 && n.status !== 'rotating').length;
  }, [nodes]);

  const activeArchitectsCount = useMemo(() => {
    return nodes.filter(n => n.role === 'Architect' && n.health >= 80).length;
  }, [nodes]);

  const activeWeaversCount = useMemo(() => {
    return nodes.filter(n => n.role === 'Weaver' && n.health >= 80).length;
  }, [nodes]);

  const activeBreakersCount = useMemo(() => {
    return nodes.filter(n => n.role === 'Breaker' && n.health >= 80).length;
  }, [nodes]);

  const averageLatencyMs = useMemo(() => {
    if (nodes.length === 0) return 0;
    const sum = nodes.reduce((acc, n) => acc + n.latencyMs, 0);
    return +(sum / nodes.length).toFixed(1);
  }, [nodes]);

  const minLatencyMs = useMemo(() => {
    if (nodes.length === 0) return 0;
    return +(Math.min(...nodes.map(n => n.latencyMs))).toFixed(1);
  }, [nodes]);

  // Gossip-Delta Synchronization Frequency mapped to heartbeat polling mode
  const gossipSyncFrequencyHz = useMemo(() => {
    switch (pollingRate) {
      case '5s-Fast': return 2.5; // 400ms interval
      case '15s-Standard': return 2.0; // 500ms canonical interval
      case '30s-Eco': return 0.5; // 2,000ms adaptive backoff
      default: return 2.0;
    }
  }, [pollingRate]);

  const gossipIntervalMs = useMemo(() => {
    return Math.round(1000 / gossipSyncFrequencyHz);
  }, [gossipSyncFrequencyHz]);

  const gossipPayloadRateKb = useMemo(() => {
    return +(gossipEvents.slice(0, 5).reduce((acc, e) => acc + e.payloadKb, 0) / Math.max(1, Math.min(5, gossipEvents.length))).toFixed(1);
  }, [gossipEvents]);

  const [isHeartbeatPinging, setIsHeartbeatPinging] = useState(false);

  const handleManualHeartbeatPing = () => {
    soundFX.playPulse();
    setIsHeartbeatPinging(true);
    setPulseCount(c => c + 1);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    setGossipEvents(evts => [
      {
        id: `g-${Date.now()}`,
        timestamp: timeStr,
        sourceSlot: 0,
        targetSlot: selectedSlot,
        digestHash: `0xHEARTBEAT_P2P_${Math.random().toString(16).slice(2, 6)}`,
        payloadKb: 6.4,
        role: activeRotationRole,
        status: 'SYNC'
      },
      ...evts.slice(0, 19)
    ]);

    setTimeout(() => {
      setIsHeartbeatPinging(false);
    }, 600);
  };

  // Chronos-Sync 15s pulse ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setChronosCountdown((prev) => {
        if (prev <= 0.2) {
          // Pulse triggers!
          soundFX.playPulse();
          setPulseCount((c) => c + 1);

          // Append simulated gossip delta
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
          const roles: SubAgentRole[] = ['Architect', 'Weaver', 'Breaker'];
          const randRole = roles[Math.floor(Math.random() * roles.length)];
          const randSrc = Math.floor(Math.random() * 1440);
          const randTgt = (randSrc + 1) % 1440;

          setGossipEvents((evts) => [
            {
              id: `g-${Date.now()}`,
              timestamp: timeStr,
              sourceSlot: randSrc,
              targetSlot: randTgt,
              digestHash: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
              payloadKb: +(1.5 + Math.random() * 14).toFixed(1),
              role: randRole,
              status: Math.random() > 0.15 ? 'ACK' : 'SYNC'
            },
            ...evts.slice(0, 19)
          ]);

          return 15.0;
        }
        return +(prev - 0.2).toFixed(1);
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const selectedNode = nodes[selectedSlot] || nodes[0];

  // Dispatch simulated test task using weighted round-robin
  const handleDispatchTestTask = () => {
    soundFX.playWiggle();
    const total = weights.Architect + weights.Weaver + weights.Breaker;
    const rand = Math.random() * total;
    let chosenRole: SubAgentRole = 'Architect';
    if (rand < weights.Architect) {
      chosenRole = 'Architect';
    } else if (rand < weights.Architect + weights.Weaver) {
      chosenRole = 'Weaver';
    } else {
      chosenRole = 'Breaker';
    }

    setActiveRotationRole(chosenRole);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    const target = Math.floor(Math.random() * 1440);

    setGossipEvents((evts) => [
      {
        id: `g-${Date.now()}`,
        timestamp: timeStr,
        sourceSlot: 0,
        targetSlot: target,
        digestHash: `0xWRR_${chosenRole.toUpperCase()}_DISPATCH`,
        payloadKb: 8.6,
        role: chosenRole,
        status: 'ACK'
      },
      ...evts.slice(0, 19)
    ]);
  };

  const handleSendCoffeeToNode = (slot?: number) => {
    const targetSlot = slot !== undefined ? slot : selectedSlot;
    setNodes(prev => prev.map(n => {
      if (n.slot === targetSlot) {
        const cooledLatency = Math.min(n.latencyMs, +(4.2 + (targetSlot % 13) * 0.4).toFixed(1));
        return {
          ...n,
          latencyMs: cooledLatency,
          health: 100,
          diagnostics: computeNodeDiagnostics(n.slot, cooledLatency, n.role, n.deltaPackets, 100)
        };
      }
      return n;
    }));
    soundFX.playChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      if (filterRole !== 'ALL' && n.role !== filterRole) return false;
      if (searchQuery) {
        const timeStr = `${n.hour.toString().padStart(2, '0')}:${n.minute.toString().padStart(2, '0')}`;
        const slotStr = `slot-${n.slot}`;
        if (!timeStr.includes(searchQuery) && !slotStr.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [nodes, filterRole, searchQuery]);

  const toggleSlotExpansion = (slot: number) => {
    soundFX.playClick();
    setExpandedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) {
        next.delete(slot);
      } else {
        next.add(slot);
      }
      return next;
    });
  };

  const displayedClusterNodes = useMemo(() => {
    if (nodeClusterMode === 'HAZARDS') {
      if (criticalLatencyNodes.length > 0) {
        return criticalLatencyNodes;
      }
      return [...nodes].sort((a, b) => b.latencyMs - a.latencyMs).slice(0, 6);
    }

    if (nodeClusterMode === 'NEIGHBORS') {
      const cluster: MinuteNode[] = [];
      for (let offset = -3; offset <= 4; offset++) {
        const targetSlot = (selectedSlot + offset + 1440) % 1440;
        const found = nodes[targetSlot];
        if (found) cluster.push(found);
      }
      return cluster;
    }

    return filteredNodes.slice(0, 12);
  }, [nodeClusterMode, criticalLatencyNodes, nodes, selectedSlot, filteredNodes]);

  const allVisibleExpanded = useMemo(() => {
    if (displayedClusterNodes.length === 0) return false;
    return displayedClusterNodes.every((n) => expandedSlots.has(n.slot));
  }, [displayedClusterNodes, expandedSlots]);

  const handleToggleAllDiagnostics = () => {
    soundFX.playClick();
    setExpandedSlots((prev) => {
      const next = new Set(prev);
      if (allVisibleExpanded) {
        displayedClusterNodes.forEach((n) => next.delete(n.slot));
      } else {
        displayedClusterNodes.forEach((n) => next.add(n.slot));
      }
      return next;
    });
  };

  return (
    <div className={`space-y-6 font-code text-white transition-all duration-300 ${hasLatencyAlert ? 'ring-2 ring-red-500/50 p-2 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.25)]' : ''}`}>
      {/* Visual Flashing Red Emergency Alert Banner when Latency Exceeds 100ms */}
      {hasLatencyAlert && (
        <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-red-950/95 via-rose-900/90 to-red-950/95 border-2 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.6)] animate-pulse flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🚨</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-xs uppercase tracking-wider animate-pulse">
                  CRITICAL LATENCY BREACH
                </span>
                <span className="text-xs text-red-300 font-bold">
                  THRESHOLD: &gt; 100.0 ms
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white font-sans mt-0.5 tracking-wide">
                Swarm Node Latency Hazard Detected ({criticalLatencyNodes.length} node{criticalLatencyNodes.length > 1 ? 's' : ''} compromised)
              </h3>
              <p className="text-xs text-red-200/90">
                Peak Latency: <strong className="text-white underline">{peakLatency.toFixed(1)} ms</strong>. Active consensus drift risk. Warning siren triggered.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                soundFX.playClick();
                setSelectedSlot(criticalLatencyNodes[0].slot);
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-1.5"
            >
              <span>🔍</span> Inspect Slot #{criticalLatencyNodes[0].slot}
            </button>
            <button
              onClick={handleResolveAllSpikes}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-1.5"
            >
              <span>🛡️</span> Resolve &amp; Cool Down
            </button>
            <button
              onClick={() => setIsAlarmAudioMuted(!isAlarmAudioMuted)}
              title={isAlarmAudioMuted ? 'Unmute Audio Warning Siren' : 'Mute Audio Warning Siren'}
              className="px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-bold rounded-xl border border-white/20 cursor-pointer transition-all flex items-center gap-1"
            >
              <span>{isAlarmAudioMuted ? '🔇 Unmute Siren' : '🔊 Mute Siren'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Banner / Chronos Heartbeat Synchronization Bar */}
      <div className={`p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[#0C081E] via-[#140D2D] to-[#0A0618] border transition-all duration-300 shadow-xl backdrop-blur-xl ${
        hasLatencyAlert ? 'border-red-500/80' : 'border-[#FFD700]/30'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌐</span>
              <h2 className="text-xl font-extrabold text-white font-sans tracking-wide">
                bHive 1,440-Node Swarm Mesh &amp; Intelligence Grid
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Scales across 1,440 continuous minute-slots (24h circular pipeline). Real-time telemetry with &gt;100ms latency audio/visual warning alarms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Testing Controls for Latency Alerts */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">ALERT TEST:</span>
              <button
                onClick={() => handleInjectLatencySpike(undefined, 148.6)}
                className="px-2.5 py-1 bg-red-600/90 hover:bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shadow-sm"
              >
                <span>⚡</span> Spike &gt; 100ms
              </button>
              {hasLatencyAlert && (
                <button
                  onClick={handleResolveAllSpikes}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
                >
                  Clear Spike
                </button>
              )}
            </div>

            {/* Quick Link to 1,440-Node Chat Room */}
            {onNavigateToChatRoom && (
              <button
                onClick={() => {
                  soundFX.playClick();
                  onNavigateToChatRoom();
                }}
                className="px-3 py-2 bg-gradient-to-r from-purple-950/80 via-[#191433] to-purple-900/60 hover:from-purple-900 hover:to-purple-800 text-purple-200 border border-purple-500/50 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                title="Open 1,440-Node Swarm Chat Room"
              >
                <span>💬</span>
                <span>Swarm Chat Room</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}

            {/* Chronos-Sync 15s Radial Pulse */}
            <div className="flex items-center gap-4 bg-black/50 px-4 py-2.5 rounded-xl border border-white/10">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke={hasLatencyAlert ? '#FF2A55' : '#FFD700'}
                    strokeWidth="3"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 * (1 - chronosCountdown / 15.0)}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-200"
                  />
                </svg>
                <span className={`absolute text-[11px] font-bold ${hasLatencyAlert ? 'text-red-400' : 'text-[#FFD700]'}`}>
                  {Math.ceil(chronosCountdown)}s
                </span>
              </div>

              <div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">CHRONOS-SYNC 15s PULSE</div>
                <div className={`text-xs font-extrabold flex items-center gap-1.5 ${
                  hasLatencyAlert ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${hasLatencyAlert ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-ping'}`} />
                  {hasLatencyAlert ? 'HAZARD // LATENCY &gt; 100ms' : `PULSE #${pulseCount} // IN SYNC`}
                </div>
              </div>

              {/* Dynamic Polling Throttling Selector */}
              <div className="border-l border-white/10 pl-3">
                <span className="text-[9px] text-zinc-400 block font-bold mb-1">DYNAMIC POLLING</span>
                <div className="flex items-center gap-1 text-[10px]">
                  {(['5s-Fast', '15s-Standard', '30s-Eco'] as const).map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        soundFX.playClick();
                        setPollingRate(rate);
                      }}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                        pollingRate === rate
                          ? 'bg-[#FFD700] text-black font-extrabold'
                          : 'bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {rate.split('-')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HEARTBEAT TELEMETRY PANEL: Active Peer Count, Network Latency, & Gossip-Delta Sync Frequency */}
      <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0e0922]/95 via-[#160d33]/90 to-[#090616]/95 border shadow-xl backdrop-blur-xl transition-all duration-300 ${
        hasLatencyAlert ? 'border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.25)]' : 'border-[#FFD700]/30 hover:border-[#FFD700]/50'
      }`}>
        {/* Panel Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 shadow-md ${
              isHeartbeatPinging ? 'clay-btn-gold animate-bounce' : 'clay-btn-purple'
            }`}>
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-extrabold text-sm text-white tracking-wide uppercase">
                  Heartbeat Telemetry
                </span>
                <span className="text-[10px] text-zinc-400 font-code font-bold">
                  // P2P MESH RUNTIME
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-code font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-code flex items-center gap-2 flex-wrap mt-0.5">
                <span>Registry: <strong className="text-zinc-300 font-mono">~/.bee2bee/heartbeat.json</strong></span>
                <span className="text-zinc-600">·</span>
                <span>Channel: <strong className="text-[#70D6FF] font-mono">crabdeck:events:bhive:*</strong></span>
                <span className="text-zinc-600">·</span>
                <span>Port: <strong className="text-zinc-300 font-mono">127.0.0.1:4003</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualHeartbeatPing}
              disabled={isHeartbeatPinging}
              className="px-3 py-1.5 rounded-xl clay-btn-blue text-xs font-code font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-transform"
              title="Broadcast manual heartbeat ping & update peer telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isHeartbeatPinging ? 'animate-spin' : ''}`} />
              <span>{isHeartbeatPinging ? 'Pinging...' : 'Ping Telemetry'}</span>
            </button>
          </div>
        </div>

        {/* 3 Telemetry Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Metric 1: Active Peer Count */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-[#70D6FF]/30 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-[#70D6FF]" />
                <span>ACTIVE PEER COUNT</span>
              </span>
              <span className="text-emerald-400 text-[10px] font-mono">
                {((activePeerCount / 1440) * 100).toFixed(1)}% UP
              </span>
            </div>

            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-display font-extrabold text-[#70D6FF] tracking-tight">
                {activePeerCount.toLocaleString()}
                <span className="text-xs font-code text-zinc-500 font-normal"> / 1,440</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#70D6FF] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${(activePeerCount / 1440) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 text-[10px] text-zinc-400 font-code flex items-center justify-between">
              <span>Roster Breakdown:</span>
              <span className="text-zinc-200 font-bold">
                A:{activeArchitectsCount} · W:{activeWeaversCount} · B:{activeBreakersCount}
              </span>
            </div>
          </div>

          {/* Metric 2: Network Latency */}
          <div className={`p-3.5 rounded-xl bg-black/40 border transition-all flex flex-col justify-between ${
            hasLatencyAlert ? 'border-red-500/50 bg-red-950/20' : 'border-white/5 hover:border-[#FFD700]/30'
          }`}>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <Radio className={`w-3.5 h-3.5 ${hasLatencyAlert ? 'text-red-400 animate-pulse' : 'text-[#FFD700]'}`} />
                <span>NETWORK LATENCY</span>
              </span>
              <span className={`text-[10px] font-mono font-bold ${hasLatencyAlert ? 'text-red-400 animate-pulse' : 'text-[#FFD700]'}`}>
                {hasLatencyAlert ? 'HAZARD SPIKE' : 'NOMINAL RTT'}
              </span>
            </div>

            <div className="my-1">
              <div className={`text-2xl sm:text-3xl font-display font-extrabold tracking-tight ${
                hasLatencyAlert ? 'text-red-400' : 'text-[#FFD700]'
              }`}>
                {averageLatencyMs}
                <span className="text-xs font-code text-zinc-500 font-normal"> ms</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    hasLatencyAlert ? 'bg-red-500' : 'bg-[#FFD700]'
                  }`}
                  style={{ width: `${Math.min(100, (averageLatencyMs / 100) * 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 text-[10px] text-zinc-400 font-code flex items-center justify-between">
              <span>Min / Peak / Jitter:</span>
              <span className="text-zinc-200 font-bold">
                {minLatencyMs}ms · {peakLatency > 0 ? peakLatency.toFixed(1) : '8.6'}ms (±0.3ms)
              </span>
            </div>
          </div>

          {/* Metric 3: Gossip-Delta Synchronization Frequency */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-[#00FF66]/30 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#00FF66]" />
                <span>GOSSIP-DELTA SYNC</span>
              </span>
              <span className="text-emerald-400 text-[10px] font-mono">
                {pollingRate.split('-')[0]} CADENCE
              </span>
            </div>

            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-display font-extrabold text-[#00FF66] tracking-tight flex items-baseline gap-1.5">
                <span>{gossipSyncFrequencyHz.toFixed(1)}</span>
                <span className="text-xs font-code text-zinc-500 font-normal">Hz</span>
                <span className="text-xs font-code text-zinc-400 font-normal">
                  ({gossipIntervalMs}ms)
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#00FF66] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${(gossipSyncFrequencyHz / 5.0) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 text-[10px] text-zinc-400 font-code flex items-center justify-between">
              <span>Payload Stream:</span>
              <span className="text-zinc-200 font-bold">
                ~{gossipPayloadRateKb} KB/event (Redis Pub/Sub)
              </span>
            </div>
          </div>
        </div>

        {/* Real-Time Telemetry Visualizers: D3 Latency Heatmap + Recharts Gossip Sync Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 pt-3.5 mt-3.5 border-t border-white/10">
          {/* 1. D3 Latency Heatmap */}
          <BHiveLatencyD3Heatmap
            nodes={nodes}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            hasLatencyAlert={hasLatencyAlert}
          />

          {/* 2. Recharts Gossip-Delta Sync Graph (Last 60s) */}
          <BHiveGossipRechartsGraph
            currentFrequencyHz={gossipSyncFrequencyHz}
            pollingRate={pollingRate}
            pulseCount={pulseCount}
          />
        </div>
      </div>

      {/* bHive Swarm Mesh Visualization Modes Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-[#080514]/90 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* TAB 1: Swarm Density & Hot-Spots (Requested feature) */}
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveSwarmTab('swarm-density');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
              activeSwarmTab === 'swarm-density'
                ? 'bg-gradient-to-r from-[#FFD700] via-[#FFA800] to-[#FF66C4] text-black font-extrabold shadow-[0_0_20px_rgba(255,215,0,0.45)] scale-102 ring-2 ring-[#FFD700]/50'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-base">🔥</span>
            <span>Swarm Density &amp; Hot-Spots</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
              activeSwarmTab === 'swarm-density' ? 'bg-black/30 text-black' : 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30'
            }`}>
              REAL-TIME HEATMAP
            </span>
          </button>

          {/* TAB 2: 1,440 Topology Matrix */}
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveSwarmTab('topology-grid');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
              activeSwarmTab === 'topology-grid'
                ? 'bg-gradient-to-r from-[#70D6FF] to-[#00b4d8] text-black font-extrabold shadow-[0_0_20px_rgba(112,214,255,0.4)] scale-102 ring-2 ring-[#70D6FF]/50'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-base">⚡</span>
            <span>1,440 Topology Matrix</span>
          </button>

          {/* TAB 3: Technical Diagnostics Cluster */}
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveSwarmTab('diagnostics-cluster');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
              activeSwarmTab === 'diagnostics-cluster'
                ? 'bg-gradient-to-r from-[#A855F7] to-[#7928CA] text-white font-extrabold shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-102 ring-2 ring-[#A855F7]/50'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-base">🖧</span>
            <span>Technical Diagnostics</span>
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 text-[9px]">
              DATA GRIDS
            </span>
          </button>

          {/* TAB 4: Unified Stack */}
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveSwarmTab('all');
            }}
            className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSwarmTab === 'all'
                ? 'bg-white/20 text-white font-extrabold border border-white/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>📑</span>
            <span>Unified View</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-400 px-2">
          <span>Selected Slot:</span>
          <span className="px-2 py-0.5 rounded bg-black/40 text-[#70D6FF] font-mono font-bold border border-white/10">
            Node_{selectedSlot.toString().padStart(4, '0')} ({Math.floor(selectedSlot/60).toString().padStart(2, '0')}:{(selectedSlot%60).toString().padStart(2, '0')})
          </span>
        </div>
      </div>

      {/* VIEW 1: Swarm Density & Hot-Spots Real-Time Color Intensity Heatmap */}
      {(activeSwarmTab === 'swarm-density' || activeSwarmTab === 'all') && (
        <SwarmDensityHeatmap
          nodes={nodes}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          onSendCoffee={() => handleSendCoffeeToNode(selectedSlot)}
        />
      )}

      {/* VIEW 2: 1,440 Constellation Matrix + Sub-Agent Role Rotation & Inspector */}
      {(activeSwarmTab === 'topology-grid' || activeSwarmTab === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 1,440-Node Minute-Slot Matrix (2 cols) */}
        <div className={`lg:col-span-2 p-5 rounded-2xl bg-[#080514]/90 border shadow-lg backdrop-blur-xl space-y-4 transition-all duration-300 ${
          hasLatencyAlert ? 'border-red-500/40' : 'border-[#70D6FF]/25'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#70D6FF] flex items-center gap-2">
                <span>⚡</span> 1,440 MINUTE-SLOT TOPOLOGY MATRIX
              </h3>
              <p className="text-[11px] text-zinc-400">
                Displaying 1,440 slots (24 hours x 60 min). Color-coded by active role (flashes red when latency &gt; 100ms).
              </p>
            </div>

            {/* Role Filter & Search */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 text-xs">
                {(['ALL', 'Architect', 'Weaver', 'Breaker'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      soundFX.playClick();
                      setFilterRole(r);
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                      filterRole === r
                        ? 'bg-[#70D6FF] text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search slot or HH:MM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-2.5 py-1 text-xs bg-black/50 border border-white/15 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#70D6FF]"
              />
            </div>
          </div>

          {/* Micro Grid View of 1,440 Nodes (Rendered in dense mini-blocks for 60fps performance) */}
          <div className="p-3 bg-black/60 rounded-xl border border-white/5">
            <div className="flex justify-between text-[10px] text-zinc-400 mb-2 font-bold px-1">
              <span>00:00 (SLOT 0000)</span>
              <span>06:00 (SLOT 0360)</span>
              <span>12:00 (SLOT 0720)</span>
              <span>18:00 (SLOT 1080)</span>
              <span>23:59 (SLOT 1439)</span>
            </div>

            <div className="max-h-[340px] overflow-y-auto pr-1 grid grid-cols-24 sm:grid-cols-30 md:grid-cols-40 lg:grid-cols-48 gap-1 p-1">
              {filteredNodes.slice(0, 1440).map((n) => {
                const isSelected = selectedSlot === n.slot;
                const isCriticalLatency = n.latencyMs > 100;

                const defaultColor =
                  n.role === 'Architect'
                    ? '#FFD700' // Gold
                    : n.role === 'Weaver'
                    ? '#00FF66' // Neon Green
                    : '#FF2A55'; // Red

                return (
                  <div
                    key={n.slot}
                    onClick={() => {
                      soundFX.playClick();
                      setSelectedSlot(n.slot);
                    }}
                    title={`Slot ${n.slot} (${n.hour.toString().padStart(2, '0')}:${n.minute.toString().padStart(2, '0')}) - ${n.role} - ${n.latencyMs}ms ${isCriticalLatency ? '⚠️ LATENCY BREACH (>100ms)' : ''}`}
                    className={`h-4 rounded-[2px] transition-all cursor-pointer flex items-center justify-center text-[7px] font-mono ${
                      isCriticalLatency
                        ? 'bg-red-600 animate-pulse ring-2 ring-red-300 scale-125 z-20 shadow-[0_0_12px_#ff0033]'
                        : isSelected
                        ? 'ring-2 ring-white scale-125 z-10 brightness-150'
                        : 'hover:scale-110 hover:brightness-125 opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: isCriticalLatency ? '#EF4444' : defaultColor,
                      boxShadow: isCriticalLatency
                        ? '0 0 10px #FF0055'
                        : isSelected
                        ? `0 0 8px ${defaultColor}`
                        : 'none'
                    }}
                  />
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-zinc-400 mt-3 pt-2 border-t border-white/5 px-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#FFD700]" /> Architect (50%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#00FF66]" /> Weaver (30%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#FF2A55]" /> Breaker (20%)
                </span>
                <span className="flex items-center gap-1.5 text-red-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-600 animate-pulse" /> &gt;100ms Hazard Alert
                </span>
              </div>
              <span className="text-zinc-500">Showing {filteredNodes.length} of 1,440 Nodes</span>
            </div>
          </div>

          {/* Live Gossip-Delta Dispatch Stream */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FF66C4] flex items-center gap-1.5">
                <span>📡</span> GOSSIP-DELTA DISPATCH PROTOCOL STREAM
              </span>
              <span className="text-[10px] text-zinc-400">P2P Digest Sync</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {gossipEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    evt.digestHash.includes('LATENCY_BREACH')
                      ? 'bg-red-950/60 border-red-500 text-red-200 animate-pulse'
                      : 'bg-black/40 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-mono text-[10px]">{evt.timestamp}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        evt.digestHash.includes('LATENCY_BREACH')
                          ? 'bg-red-600 text-white'
                          : evt.role === 'Architect'
                          ? 'bg-amber-950 text-[#FFD700]'
                          : evt.role === 'Weaver'
                          ? 'bg-emerald-950 text-[#00FF66]'
                          : 'bg-rose-950 text-[#FF2A55]'
                      }`}
                    >
                      {evt.role}
                    </span>
                    <span className="text-zinc-300">
                      Slot #{evt.sourceSlot} ➔ Slot #{evt.targetSlot}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400 font-mono">{evt.digestHash}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded font-bold text-white">
                      {evt.payloadKb} KB
                    </span>
                    <span className={`text-[10px] font-bold ${evt.digestHash.includes('LATENCY_BREACH') ? 'text-red-400' : 'text-emerald-400'}`}>
                      {evt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Node Inspector & Sub-Agent Role Rotation Router (1 col) */}
        <div className="flex flex-col gap-5">
          {/* Selected Node Human-Friendly Inspector Card */}
          <div className={`p-5 rounded-2xl bg-[#0D0A22]/90 border shadow-lg backdrop-blur-xl space-y-4 transition-all duration-300 ${
            selectedNode.latencyMs > 100
              ? 'border-red-500 bg-red-950/20 shadow-[0_0_25px_rgba(239,68,68,0.4)]'
              : 'border-[#FFD700]/30'
          }`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {selectedNode.latencyMs > 100 ? '🚨' : selectedNode.role === 'Architect' ? '📐' : selectedNode.role === 'Weaver' ? '🧵' : '🔨'}
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    SLOT #{selectedNode.slot.toString().padStart(4, '0')}
                  </h4>
                  <p className="text-[10px] text-[#FFD700]">
                    Scheduled Time: {selectedNode.hour.toString().padStart(2, '0')}:{selectedNode.minute.toString().padStart(2, '0')} UTC
                  </p>
                </div>
              </div>

              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                selectedNode.latencyMs > 100
                  ? 'bg-red-950 text-red-400 border-red-600 animate-pulse'
                  : 'bg-emerald-950 text-emerald-400 border-emerald-800'
              }`}>
                {selectedNode.latencyMs > 100 ? 'LATENCY HAZARD' : 'ACTIVE'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">Assigned Role</div>
                <div className="text-[#FFD700] font-extrabold text-sm">{selectedNode.role}</div>
                <p className="text-[11px] text-zinc-400">
                  {selectedNode.role === 'Architect'
                    ? 'Synthesizes high-level system plans and manages schema orchestration.'
                    : selectedNode.role === 'Weaver'
                    ? 'Refactors code ASTs, patches broken types, and compiles packages.'
                    : 'Audits invariants, runs security smoke tests, and detects anomalies.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border transition-all ${
                  selectedNode.latencyMs > 100
                    ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                    : 'bg-black/30 border-white/5'
                }`}>
                  <span className="text-[10px] text-zinc-400 block font-bold">LATENCY</span>
                  <span className={`font-extrabold text-sm ${selectedNode.latencyMs > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {selectedNode.latencyMs} ms
                  </span>
                  {selectedNode.latencyMs > 100 && (
                    <span className="text-[9px] text-red-300 block font-bold">&gt;100ms LIMIT!</span>
                  )}
                </div>
                <div className="p-2.5 bg-black/30 rounded-xl border border-white/5">
                  <span className="text-[10px] text-zinc-400 block font-bold">HEALTH</span>
                  <span className="text-white font-extrabold text-sm">{selectedNode.health}%</span>
                </div>
              </div>

              <div className="p-2.5 bg-black/30 rounded-xl border border-white/5">
                <span className="text-[10px] text-zinc-400 block font-bold">GOSSIP DELTAS PROCESSED</span>
                <span className="text-[#70D6FF] font-extrabold text-sm">{selectedNode.deltaPackets} pkts/min</span>
              </div>

              {/* Latency Threshold Injector / Calibration Slider */}
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-400 font-bold uppercase">Manual Latency Tuner:</span>
                  <span className={`font-mono font-bold ${selectedNode.latencyMs > 100 ? 'text-red-400 font-extrabold' : 'text-emerald-400'}`}>
                    {selectedNode.latencyMs} ms
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="220"
                  step="0.5"
                  value={selectedNode.latencyMs}
                  onChange={(e) => handleSetSelectedNodeLatency(parseFloat(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
                <div className="flex items-center justify-between text-[9px] text-zinc-500">
                  <span>2ms (Nominal)</span>
                  <span className="text-red-400 font-bold">100ms (Alarm Line)</span>
                  <span>220ms (Severe)</span>
                </div>
              </div>

              {selectedNode.latencyMs > 100 ? (
                <button
                  onClick={() => handleSetSelectedNodeLatency(6.2)}
                  className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold rounded-xl text-xs hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>🛡️</span> EMERGENCY RE-ROUTE &amp; COOL DOWN
                </button>
              ) : (
                <button
                  onClick={handleSendCoffeeToNode}
                  className="w-full py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA800] text-black font-extrabold rounded-xl text-xs hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>☕</span> SEND VIRTUAL COFFEE
                </button>
              )}

              {/* Expandable Technical Diagnostics Data Grid for Selected Node */}
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setIsInspectorDiagnosticsExpanded(!isInspectorDiagnosticsExpanded);
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                    isInspectorDiagnosticsExpanded
                      ? 'bg-[#70D6FF]/20 text-[#70D6FF] border border-[#70D6FF]/40'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10'
                  }`}
                >
                  {isInspectorDiagnosticsExpanded ? (
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

                {isInspectorDiagnosticsExpanded && (
                  <div className="mt-2 animate-in fade-in duration-300">
                    <TechnicalDiagnosticsDataGrid
                      slot={selectedNode.slot}
                      diagnostics={selectedNode.diagnostics}
                      compact={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Sub-Agent Role Rotation & Weighted Round-Robin (WRR) */}
          <div className="p-5 rounded-2xl bg-[#0F0A26]/90 border border-[#A855F7]/30 shadow-lg backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs text-[#A855F7] font-bold tracking-wider flex items-center gap-1.5">
                <span>🔄</span> SUB-AGENT ROLE ROTATION (WRR)
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">WEIGHTED ROUND-ROBIN</span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Dynamically rotate autonomous agent duties to prevent hallucination bias and optimize AST throughput.
            </p>

            {/* Role Sliders */}
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-[#FFD700] font-bold">Architect Weight:</span>
                  <span className="font-extrabold">{weights.Architect}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={weights.Architect}
                  onChange={(e) => setWeights({ ...weights, Architect: parseInt(e.target.value) })}
                  className="w-full accent-[#FFD700] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-[#00FF66] font-bold">Weaver Weight:</span>
                  <span className="font-extrabold">{weights.Weaver}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={weights.Weaver}
                  onChange={(e) => setWeights({ ...weights, Weaver: parseInt(e.target.value) })}
                  className="w-full accent-[#00FF66] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-[#FF2A55] font-bold">Breaker Weight:</span>
                  <span className="font-extrabold">{weights.Breaker}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={weights.Breaker}
                  onChange={(e) => setWeights({ ...weights, Breaker: parseInt(e.target.value) })}
                  className="w-full accent-[#FF2A55] cursor-pointer"
                />
              </div>
            </div>

            {/* Test WRR Task Dispatch */}
            <button
              onClick={handleDispatchTestTask}
              className="w-full py-2.5 bg-[#A855F7] text-white font-extrabold rounded-xl text-xs hover:bg-[#9333EA] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <span>⚡</span> DISPATCH WRR TASK ({activeRotationRole})
            </button>
          </div>
        </div>
      </div>
      )}

      {/* VIEW 3: Interactive Swarm Node Cards & Diagnostics Cluster */}
      {(activeSwarmTab === 'diagnostics-cluster' || activeSwarmTab === 'all') && (
      <div className="p-5 md:p-6 rounded-2xl bg-[#080514]/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🖧</span>
              <h3 className="text-base font-extrabold text-white font-sans tracking-wide">
                Swarm Peer Node Cluster &amp; Diagnostics Cards
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#70D6FF]/15 text-[#70D6FF] border border-[#70D6FF]/30 text-[10px] font-bold">
                EXPANDABLE DATA GRIDS
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Select or expand individual node cards to reveal raw packet drop counts (RX / TX / buffer overflows) and topology hop routing data grids.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View filter mode */}
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setNodeClusterMode('NEIGHBORS');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  nodeClusterMode === 'NEIGHBORS'
                    ? 'bg-[#70D6FF] text-black font-extrabold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Local Cluster (±4 Slots)
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  setNodeClusterMode('HAZARDS');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  nodeClusterMode === 'HAZARDS'
                    ? 'bg-red-500 text-white font-extrabold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🚨</span> Hazards &amp; Spikes ({criticalLatencyNodes.length})
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  setNodeClusterMode('ACTIVE_ROSTER');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  nodeClusterMode === 'ACTIVE_ROSTER'
                    ? 'bg-[#FFD700] text-black font-extrabold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Active Roster (12 Nodes)
              </button>
            </div>

            {/* Expand / Collapse All */}
            <button
              onClick={handleToggleAllDiagnostics}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/15 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {allVisibleExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{allVisibleExpanded ? 'Collapse All Grids' : 'Expand All Grids'}</span>
            </button>
          </div>
        </div>

        {/* Node Cards Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedClusterNodes.map((node) => (
            <SwarmNodeCard
              key={node.slot}
              node={node}
              isSelected={selectedSlot === node.slot}
              isExpanded={expandedSlots.has(node.slot)}
              onToggleExpand={() => toggleSlotExpansion(node.slot)}
              onSelect={() => {
                soundFX.playClick();
                setSelectedSlot(node.slot);
              }}
              onSendCoffee={() => {
                soundFX.playChime();
                confetti({
                  particleCount: 40,
                  spread: 50,
                  origin: { y: 0.7 }
                });
              }}
            />
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

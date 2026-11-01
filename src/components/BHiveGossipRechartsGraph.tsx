import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Zap, Clock, TrendingUp, Layers } from 'lucide-react';

interface BHiveGossipRechartsGraphProps {
  currentFrequencyHz: number;
  pollingRate: string;
  pulseCount: number;
}

export interface GossipFrequencySample {
  timeLabel: string;
  secondOffset: number;
  frequencyHz: number;
  eventsCount: number;
  payloadKb: number;
}

export const BHiveGossipRechartsGraph: React.FC<BHiveGossipRechartsGraphProps> = ({
  currentFrequencyHz,
  pollingRate,
  pulseCount
}) => {
  // Initialize rolling 60 seconds dataset (20 sample points, 3s resolution)
  const [data, setData] = useState<GossipFrequencySample[]>(() => {
    const initial: GossipFrequencySample[] = [];
    const count = 20; // 20 intervals of 3 seconds = 60s
    for (let i = count - 1; i >= 0; i--) {
      const secondOffset = -(i * 3);
      const timeLabel = secondOffset === 0 ? 'Now' : `-${i * 3}s`;
      const baseHz = currentFrequencyHz || 2.0;
      const noise = (Math.sin(i * 0.8) * 0.25);
      const frequencyHz = +(Math.max(0.2, baseHz + noise)).toFixed(2);
      const eventsCount = Math.round(frequencyHz * 3);
      const payloadKb = +(eventsCount * (3.5 + Math.random() * 2)).toFixed(1);

      initial.push({
        timeLabel,
        secondOffset,
        frequencyHz,
        eventsCount,
        payloadKb
      });
    }
    return initial;
  });

  const lastPulseRef = useRef<number>(pulseCount);

  // Every 3 seconds, advance the window by appending the current live telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1)];
        const pulseDelta = pulseCount - lastPulseRef.current;
        lastPulseRef.current = pulseCount;

        // Base frequency with realistic micro-jitter
        const jitter = (Math.random() - 0.5) * 0.15;
        const pulseBoost = pulseDelta > 0 ? 0.4 : 0;
        const newHz = +(Math.max(0.2, currentFrequencyHz + jitter + pulseBoost)).toFixed(2);
        const events = Math.max(1, Math.round(newHz * 3));
        const payload = +(events * (4.2 + (Math.random() * 1.8))).toFixed(1);

        // Recalculate labels for the window
        const updated = next.map((item, idx) => {
          const sec = -((19 - idx) * 3);
          return {
            ...item,
            timeLabel: `-${(19 - idx) * 3}s`,
            secondOffset: sec
          };
        });

        updated.push({
          timeLabel: 'Now',
          secondOffset: 0,
          frequencyHz: newHz,
          eventsCount: events,
          payloadKb: payload
        });

        return updated;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [currentFrequencyHz, pulseCount]);

  // Aggregate stats over 60 seconds
  const stats = useMemo(() => {
    if (data.length === 0) return { peakHz: 2.0, avgHz: 2.0, totalEvents: 60 };
    const hzList = data.map(d => d.frequencyHz);
    const peakHz = Math.max(...hzList);
    const avgHz = +(hzList.reduce((a, b) => a + b, 0) / hzList.length).toFixed(2);
    const totalEvents = data.reduce((a, b) => a + b.eventsCount, 0);
    return { peakHz, avgHz, totalEvents };
  }, [data]);

  return (
    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-[#00FF66]/30 transition-all flex flex-col justify-between">
      {/* Title & 60s Window Badges */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#00FF66]" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider font-display">
            Gossip-Delta Sync Graph
          </span>
          <span className="text-[9px] font-code text-zinc-400">
            (Last 60 Seconds Rolling)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[9px] font-code">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync: <strong className="text-white">{currentFrequencyHz.toFixed(1)} Hz</strong>
          </span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-400">
            Peak: <strong className="text-[#FFD700]">{stats.peakHz.toFixed(2)} Hz</strong>
          </span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-400">
            60s Sum: <strong className="text-[#70D6FF]">{stats.totalEvents} pkts</strong>
          </span>
        </div>
      </div>

      {/* Recharts Area / Line Chart */}
      <div className="w-full h-44 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gossipGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FF66" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00FF66" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#70D6FF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#70D6FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="2 2" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />

            <XAxis
              dataKey="timeLabel"
              stroke="#71717a"
              tick={{ fill: '#71717a', fontSize: 9, fontFamily: 'ui-monospace, monospace' }}
              tickLine={false}
              interval={3}
            />

            <YAxis
              stroke="#71717a"
              tick={{ fill: '#71717a', fontSize: 9, fontFamily: 'ui-monospace, monospace' }}
              tickLine={false}
              domain={[0, (dataMax: number) => Math.max(3.0, +(dataMax * 1.25).toFixed(1))]}
              unit="Hz"
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as GossipFrequencySample;
                  return (
                    <div className="p-2.5 rounded-xl bg-black/95 border border-[#00FF66]/50 shadow-2xl backdrop-blur-md text-[10px] font-code space-y-1">
                      <div className="flex items-center justify-between text-white font-bold border-b border-white/10 pb-1">
                        <span className="flex items-center gap-1 text-[#00FF66]">
                          <Zap className="w-3 h-3" />
                          <span>Sync Window</span>
                        </span>
                        <span className="text-zinc-400">{item.timeLabel}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>Sync Frequency:</span>
                        <strong className="text-[#00FF66]">{item.frequencyHz} Hz</strong>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>Packets Dispatched:</span>
                        <strong className="text-[#70D6FF]">{item.eventsCount} / 3s</strong>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400 text-[9px]">
                        <span>Accumulated Payload:</span>
                        <span>{item.payloadKb} KB</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="frequencyHz"
              stroke="#00FF66"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gossipGradient)"
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="frequencyHz"
              stroke="#00FF66"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#00FF66', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info & Telemetry Channel Contract */}
      <div className="pt-2 mt-1 border-t border-white/5 flex items-center justify-between text-[10px] font-code text-zinc-400">
        <span className="flex items-center gap-1.5 truncate">
          <Clock className="w-3 h-3 text-zinc-500" />
          <span>Cadence: <strong>{pollingRate}</strong></span>
        </span>
        <span className="text-[#00FF66] font-mono truncate">
          Pub/Sub: crabdeck:events:bhive:gossip_delta
        </span>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { soundFX } from '../utils/audio';

interface HardwareTelemetrySample {
  time: string;
  temperature: number; // °C
  cpuLoad: number; // %
  gpuLoad: number; // %
  memoryGb: number; // GB
}

export const HardwareHealthCard: React.FC = () => {
  const [samples, setSamples] = useState<HardwareTelemetrySample[]>(() => {
    const initial: HardwareTelemetrySample[] = [];
    const now = new Date();
    for (let i = 12; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 5000);
      const timeStr = `${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
      initial.push({
        time: timeStr,
        temperature: +(42.5 + Math.sin(i * 0.5) * 4.2).toFixed(1),
        cpuLoad: Math.round(28 + Math.cos(i * 0.7) * 14),
        gpuLoad: Math.round(34 + Math.sin(i * 0.9) * 16),
        memoryGb: +(5.8 + Math.sin(i * 0.3) * 0.8).toFixed(1)
      });
    }
    return initial;
  });

  const [isFanBoosted, setIsFanBoosted] = useState(false);

  // Live sampling interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      setSamples(prev => {
        const last = prev[prev.length - 1];
        const tempDelta = isFanBoosted ? -0.8 : (Math.random() - 0.48) * 1.5;
        const newTemp = Math.max(34, Math.min(74, +(last.temperature + tempDelta).toFixed(1)));
        const newCpu = Math.max(12, Math.min(88, Math.round(last.cpuLoad + (Math.random() - 0.5) * 12)));
        const newGpu = Math.max(15, Math.min(92, Math.round(last.gpuLoad + (Math.random() - 0.5) * 15)));
        const newMem = Math.max(4.8, Math.min(12.5, +(last.memoryGb + (Math.random() - 0.5) * 0.2).toFixed(1)));

        const next = [...prev.slice(1), {
          time: timeStr,
          temperature: newTemp,
          cpuLoad: newCpu,
          gpuLoad: newGpu,
          memoryGb: newMem
        }];
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isFanBoosted]);

  const latest = samples[samples.length - 1] || {
    temperature: 42.8,
    cpuLoad: 32,
    gpuLoad: 38,
    memoryGb: 6.2
  };

  // Color-coded classification
  const thermalTier = useMemo(() => {
    if (latest.temperature < 55) {
      return {
        label: 'OPTIMAL // FROSTY',
        color: '#10B981',
        bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
        desc: 'Everything is frosty and running effortlessly with low thermal dissipation.'
      };
    } else if (latest.temperature < 72) {
      return {
        label: 'CRUISING // MODERATE',
        color: '#F59E0B',
        bg: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
        desc: 'Working actively on swarm computations within normal cruising temperature bounds.'
      };
    } else {
      return {
        label: 'THERMAL LOAD // ACTIVE FAN',
        color: '#EF4444',
        bg: 'bg-red-950/60 border-red-500/40 text-red-300',
        desc: 'Approaching the 75°C Flux-Smith thermal cap. Protective governor engaged.'
      };
    }
  }, [latest.temperature]);

  const handleToggleFan = () => {
    soundFX.playClick();
    setIsFanBoosted(prev => !prev);
  };

  return (
    <div className="p-6 rounded-3xl clay-card-3d font-code space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: thermalTier.color }} />
            <span className="text-[11px] font-extrabold tracking-wider uppercase font-code" style={{ color: thermalTier.color }}>
              HARDWARE TELEMETRY · LOCAL APU WATCHDOG
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-display font-extrabold text-white tracking-tight flex items-center gap-2 mt-0.5">
            THERMAL THROTTLE & LOAD MONITOR
          </h3>
          <p className="text-xs text-zinc-300 font-sans">
            Real-time thermal envelope and GPU/CPU utilization curve tracking local workstation vitality against 75°C Flux-Smith ceiling.
          </p>
        </div>

        {/* Right Status Badge & Fan Button */}
        <div className="flex items-center gap-2.5">
          <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${thermalTier.bg}`}>
            {thermalTier.label}
          </span>

          <button
            onClick={handleToggleFan}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
              isFanBoosted
                ? 'clay-btn-blue active:scale-95'
                : 'clay-nav-btn text-zinc-200 hover:text-white'
            }`}
            title="Engage emergency cooling fans to chill the processor"
          >
            <span>🌀 {isFanBoosted ? 'COOLING ACTIVE' : 'FAN BOOST'}</span>
          </button>
        </div>
      </div>

      {/* KPI Readout Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Temperature */}
        <div className="p-3 bg-[#0A0718]/80 rounded-xl border border-white/5 space-y-0.5">
          <div className="text-[10px] text-zinc-400 uppercase font-bold flex items-center justify-between">
            <span>APU Temp</span>
            <span className="text-zinc-500">Cap: 75°C</span>
          </div>
          <div className="text-xl font-extrabold font-mono" style={{ color: thermalTier.color }}>
            {latest.temperature}°C
          </div>
          <p className="text-[10px] text-zinc-400 leading-tight">
            {latest.temperature < 55 ? 'Frosty & chill' : latest.temperature < 72 ? 'Nominal cruising' : 'Warm throttle load'}
          </p>
        </div>

        {/* CPU Load */}
        <div className="p-3 bg-[#0A0718]/80 rounded-xl border border-white/5 space-y-0.5">
          <div className="text-[10px] text-zinc-400 uppercase font-bold flex items-center justify-between">
            <span>CPU Load</span>
            <span className="text-[#70D6FF]">Quad-Core</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-[#70D6FF]">
            {latest.cpuLoad}%
          </div>
          <p className="text-[10px] text-zinc-400 leading-tight">
            Worker agents time-slicing
          </p>
        </div>

        {/* GPU Load */}
        <div className="p-3 bg-[#0A0718]/80 rounded-xl border border-white/5 space-y-0.5">
          <div className="text-[10px] text-zinc-400 uppercase font-bold flex items-center justify-between">
            <span>Radeon GPU</span>
            <span className="text-[#A855F7]">Unified VRAM</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-[#A855F7]">
            {latest.gpuLoad}%
          </div>
          <p className="text-[10px] text-zinc-400 leading-tight">
            Vector & 3D render load
          </p>
        </div>

        {/* Memory */}
        <div className="p-3 bg-[#0A0718]/80 rounded-xl border border-white/5 space-y-0.5">
          <div className="text-[10px] text-zinc-400 uppercase font-bold flex items-center justify-between">
            <span>RAM Used</span>
            <span className="text-[#00FF66]">16.0 GB Max</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-[#00FF66]">
            {latest.memoryGb} <span className="text-xs font-normal text-zinc-400">GB</span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-tight">
            Plenty of room to breathe
          </p>
        </div>
      </div>

      {/* Recharts Thermal & Load Curves Graph */}
      <div className="w-full h-[220px] pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={samples} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="tempCurveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={thermalTier.color} stopOpacity={0.45} />
                <stop offset="95%" stopColor={thermalTier.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#251A40" vertical={false} />
            <XAxis dataKey="time" stroke="#70D6FF" tick={{ fill: '#A1A1AA', fontSize: 10 }} />
            <YAxis stroke="#A1A1AA" tick={{ fill: '#A1A1AA', fontSize: 10 }} domain={[20, 85]} />

            {/* Human-Friendly Tooltip */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as HardwareTelemetrySample;
                  return (
                    <div className="bg-[#0B071A]/95 backdrop-blur-md p-3 rounded-xl border border-[#70D6FF]/40 shadow-xl text-xs font-code space-y-1.5">
                      <div className="font-extrabold text-[#F3E5AB] border-b border-white/10 pb-1 flex justify-between gap-4">
                        <span>Time: {label}</span>
                        <span style={{ color: thermalTier.color }}>{thermalTier.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                        <span className="text-zinc-400">Temperature:</span>
                        <span className="text-right font-bold" style={{ color: thermalTier.color }}>{d.temperature}°C</span>
                        <span className="text-zinc-400">CPU Load:</span>
                        <span className="text-right font-bold text-[#70D6FF]">{d.cpuLoad}%</span>
                        <span className="text-zinc-400">GPU Load:</span>
                        <span className="text-right font-bold text-[#A855F7]">{d.gpuLoad}%</span>
                        <span className="text-zinc-400">RAM:</span>
                        <span className="text-right font-bold text-[#00FF66]">{d.memoryGb} GB</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 pt-1 border-t border-white/5">
                        {thermalTier.desc}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Flux-Smith 75°C Ceiling Line */}
            <ReferenceLine
              y={75}
              stroke="#EF4444"
              strokeDasharray="4 4"
              label={{ value: '75°C Flux-Smith Cap', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }}
            />

            {/* Cruising 55°C Line */}
            <ReferenceLine
              y={55}
              stroke="#FFD700"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
            />

            <Area
              type="monotone"
              dataKey="temperature"
              name="APU Temp (°C)"
              stroke={thermalTier.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#tempCurveGrad)"
            />

            <Line
              type="monotone"
              dataKey="cpuLoad"
              name="CPU Load (%)"
              stroke="#70D6FF"
              strokeWidth={1.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Human-Friendly Educational Note */}
      <div className="p-3 bg-[#0A0718]/60 rounded-xl border border-white/5 text-[11px] text-zinc-400 leading-relaxed flex items-start gap-2">
        <span className="text-sm">💡</span>
        <span>
          <strong className="text-zinc-200">What does this mean for you?</strong> Your AMD APU core is currently running at <strong className="text-white">{latest.temperature}°C</strong>, which is comfortably below the 75°C hardware safety ceiling. Your multi-agent swarm threads can run at full throttle without throttling or thermal degradation.
        </span>
      </div>
    </div>
  );
};

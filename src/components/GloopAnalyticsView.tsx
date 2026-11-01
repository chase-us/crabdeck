import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { SystemMetrics } from '../types';
import { NanoBanano3D } from './NanoBanano3D';
import { GloopReportModal } from './GloopReportModal';
import { soundFX } from '../utils/audio';
import { FileText, Download, Printer } from 'lucide-react';

interface GloopAnalyticsViewProps {
  metrics: SystemMetrics;
  onGloopBoost?: () => void;
  onFlushCache?: () => void;
  isClayMode?: boolean;
}

// 6-Color Dark Mode Palette Tokens
const PALETTE = {
  red: '#FF2A55',
  gold: '#FFD700',
  babyBlue: '#70D6FF',
  purple: '#A855F7',
  pink: '#FF66C4',
  neonGreen: '#00FF66',
  darkBg: '#070512',
  cardBg: '#0E0920'
};

interface HistoryDataPoint {
  time: string;
  sludgeLtrs: number;
  gloopSaturation: number;
  viscosityCP: number;
  flowRateLps: number;
  purityScore: number;
}

export const GloopAnalyticsView: React.FC<GloopAnalyticsViewProps> = ({
  metrics,
  onGloopBoost,
  onFlushCache,
  isClayMode = false
}) => {
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '24h'>('24h');
  const [selectedMetric, setSelectedMetric] = useState<'both' | 'sludge' | 'saturation'>('both');
  const [simulatedInjections, setSimulatedInjections] = useState<number>(0);
  const [bananoMood, setBananoMood] = useState<'happy' | 'overclock' | 'chillin' | 'gloop-drip'>('gloop-drip');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  const handleGenerateReport = () => {
    soundFX.playClick();
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      soundFX.playHotSwap();
      setIsReportModalOpen(true);
    }, 550);
  };

  // Baseline Historical Data
  const baseHistory: HistoryDataPoint[] = useMemo(() => {
    const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', 'Now'];
    const currentSludge = metrics.totalSludgeLtrs || 18450;
    const currentSat = metrics.gloopSaturation || 68.5;

    return hours.map((hour, idx) => {
      const progress = idx / (hours.length - 1);
      const randomJitter = Math.sin(idx * 0.8) * 1200;
      const sludgeVal = Math.max(5000, Math.round(currentSludge * (0.65 + progress * 0.35) + randomJitter));
      const satVal = Math.min(98, Math.max(35, +(currentSat * (0.8 + progress * 0.2) + Math.sin(idx) * 6).toFixed(1)));
      const visc = Math.round(1100 + satVal * 6.5);
      const flow = +(7.2 + Math.cos(idx) * 1.8).toFixed(1);
      const purity = +(96.5 + Math.sin(idx * 1.2) * 2.8).toFixed(1);

      return {
        time: hour,
        sludgeLtrs: sludgeVal,
        gloopSaturation: satVal,
        viscosityCP: visc,
        flowRateLps: flow,
        purityScore: purity
      };
    });
  }, [metrics.totalSludgeLtrs, metrics.gloopSaturation]);

  // Dynamic history including user live injections
  const historyData = useMemo(() => {
    if (simulatedInjections === 0) return baseHistory;
    return baseHistory.map((item, idx) => {
      if (idx === baseHistory.length - 1) {
        return {
          ...item,
          sludgeLtrs: item.sludgeLtrs + simulatedInjections * 1500,
          gloopSaturation: Math.min(100, +(item.gloopSaturation + simulatedInjections * 4.5).toFixed(1)),
          viscosityCP: item.viscosityCP + simulatedInjections * 40
        };
      }
      return item;
    });
  }, [baseHistory, simulatedInjections]);

  // Composition of Gloop Sludge (Pie chart data)
  const gloopComposition = useMemo(() => [
    { name: 'Potassium Electrolyte (Banano Core)', value: 38, color: PALETTE.gold },
    { name: 'Quantum Neural Carrier Fluid', value: 24, color: PALETTE.babyBlue },
    { name: 'Viscous Synthetic Sludge Matrix', value: 16, color: PALETTE.purple },
    { name: 'Enzymatic Banano Extract', value: 12, color: PALETTE.pink },
    { name: 'Bio-Regenerative Neon Coolant', value: 7, color: PALETTE.neonGreen },
    { name: 'Thermal Friction Impurities', value: 3, color: PALETTE.red }
  ], []);

  // Flow velocity breakdown by sector
  const sectorVelocity = useMemo(() => [
    { sector: 'Sector 01 (Core)', inflow: 4200, outflow: 3900, delta: '+300' },
    { sector: 'Sector 02 (Mesh)', inflow: 3100, outflow: 3250, delta: '-150' },
    { sector: 'Sector 03 (Vault)', inflow: 5800, outflow: 5200, delta: '+600' },
    { sector: 'Sector 04 (APU)', inflow: 2400, outflow: 2400, delta: '0' },
    { sector: 'Sector 05 (Banano)', inflow: 6100, outflow: 5400, delta: '+700' }
  ], []);

  // Interactive Injections
  const handleQuickInject = () => {
    soundFX.playGloop();
    setSimulatedInjections(prev => prev + 1);
    setBananoMood('overclock');
    if (onGloopBoost) onGloopBoost();
  };

  const handlePurifyFlush = () => {
    soundFX.playHotSwap();
    setSimulatedInjections(0);
    setBananoMood('happy');
    if (onFlushCache) onFlushCache();
  };

  return (
    <div className={`space-y-6 font-code transition-all ${isClayMode ? 'font-rubik' : ''}`}>
      {/* Hero Header with 6-Color Dark Mode Highlights */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#170E32] via-[#0E0A22] to-[#080516] border border-[#A855F7]/40 shadow-[0_0_40px_rgba(168,85,247,0.18)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00FF66] animate-ping" />
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFD700]/15 border border-[#FFD700]/50 text-[#FFD700]">
                🍌 NANO BANANO // GLOOP DYNAMICS
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-xs text-[#70D6FF] font-mono">RECHARTS TELEMETRY ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FF66C4] to-[#70D6FF] font-serif-luxury tracking-tight flex items-center gap-3">
              GLOOP & SLUDGE HYDRAULIC ANALYTICS
            </h2>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              Real-time and historical telemetry evaluating viscous sludge accumulation, chemical gloop saturation thresholds, and Nano Banano enzymatic flow stabilization across the quantum monorepo.
            </p>
          </div>

          {/* Action Buttons styled with vibrant 6-color palette */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="px-4 py-2.5 rounded-xl font-extrabold text-xs text-black bg-gradient-to-r from-[#FFD700] via-[#FF66C4] to-[#70D6FF] shadow-[0_0_25px_rgba(255,215,0,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-[#FFD700]/50"
              title="Generate simulated or downloadable PDF audit report"
            >
              {isGeneratingReport ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>COMPILING REPORT...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-black" />
                  <span>GENERATE REPORT</span>
                  <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded text-black font-mono font-black">PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handleQuickInject}
              className="px-4 py-2.5 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-[#FF2A55] via-[#FF66C4] to-[#A855F7] shadow-[0_0_20px_rgba(255,42,85,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>🧪 INJECT +1,500L SLUDGE</span>
            </button>
            <button
              onClick={handlePurifyFlush}
              className="px-4 py-2.5 rounded-xl font-extrabold text-xs text-black bg-gradient-to-r from-[#FFD700] to-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>🍌 ENZYMATIC PURIFY</span>
            </button>
          </div>
        </div>

        {/* 6-Color Live KPI Dashboard Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-white/10">
          {/* 1. Sludge Accumulation (Purple) */}
          <div className="p-3 bg-[#130D2A]/85 rounded-xl border border-[#A855F7]/30 space-y-1">
            <div className="text-[10px] text-[#C084FC] uppercase tracking-wider font-bold">Sludge Reserves</div>
            <div className="text-xl font-extrabold text-[#A855F7]">
              {(historyData[historyData.length - 1]?.sludgeLtrs || 18450).toLocaleString()} <span className="text-xs text-zinc-400">L</span>
            </div>
            <div className="text-[10px] text-zinc-500">Max Capacity: 50,000L</div>
          </div>

          {/* 2. Gloop Saturation (Neon Green) */}
          <div className="p-3 bg-[#0A1A12]/85 rounded-xl border border-[#00FF66]/30 space-y-1">
            <div className="text-[10px] text-[#00FF66] uppercase tracking-wider font-bold">Gloop Saturation</div>
            <div className="text-xl font-extrabold text-[#00FF66]">
              {historyData[historyData.length - 1]?.gloopSaturation || 68.5}%
            </div>
            <div className="text-[10px] text-zinc-500">Optimum: 45% - 75%</div>
          </div>

          {/* 3. Viscosity (Gold) */}
          <div className="p-3 bg-[#1E1708]/85 rounded-xl border border-[#FFD700]/30 space-y-1">
            <div className="text-[10px] text-[#FFD700] uppercase tracking-wider font-bold">Kinematic Viscosity</div>
            <div className="text-xl font-extrabold text-[#FFD700]">
              {historyData[historyData.length - 1]?.viscosityCP || 1420} <span className="text-xs text-zinc-400">cP</span>
            </div>
            <div className="text-[10px] text-zinc-500">Laminar Flow Regulated</div>
          </div>

          {/* 4. Hydro-Flow (Baby Blue) */}
          <div className="p-3 bg-[#0A1828]/85 rounded-xl border border-[#70D6FF]/30 space-y-1">
            <div className="text-[10px] text-[#70D6FF] uppercase tracking-wider font-bold">Quantum Flow Rate</div>
            <div className="text-xl font-extrabold text-[#70D6FF]">
              8.4 <span className="text-xs text-zinc-400">L/s</span>
            </div>
            <div className="text-[10px] text-zinc-500">Pressure: 4.2 Bar</div>
          </div>

          {/* 5. Banano Purity (Pink) */}
          <div className="p-3 bg-[#240A1E]/85 rounded-xl border border-[#FF66C4]/30 space-y-1">
            <div className="text-[10px] text-[#FF66C4] uppercase tracking-wider font-bold">Banano Purity</div>
            <div className="text-xl font-extrabold text-[#FF66C4]">
              99.4%
            </div>
            <div className="text-[10px] text-zinc-500">Enzymatic Catalyst Active</div>
          </div>

          {/* 6. Cavitation Alert (Red) */}
          <div className="p-3 bg-[#240810]/85 rounded-xl border border-[#FF2A55]/30 space-y-1">
            <div className="text-[10px] text-[#FF2A55] uppercase tracking-wider font-bold">Cavitation Margin</div>
            <div className="text-xl font-extrabold text-[#FF2A55]">
              SAFE
            </div>
            <div className="text-[10px] text-zinc-500">Threshold Cap: 85% Sat</div>
          </div>
        </div>
      </div>

      {/* Main Historical Recharts Area Chart & 3D Nano Banano Mascot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recharts History Graph (2 Columns) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0D081F]/90 border border-[#A855F7]/30 shadow-[0_0_30px_rgba(0,0,0,0.8)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#FFD700] tracking-wide flex items-center gap-2">
                <span>📈</span> SLUDGE ACCUMULATION & GLOOP SATURATION OVER TIME
              </h3>
              <p className="text-xs text-zinc-400">Multi-axis historical progression with automated threshold safeguards</p>
            </div>

            {/* Timeframe & Metric Filter Tabs */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#1A1235] p-1 rounded-lg border border-white/10 text-xs">
                {(['both', 'sludge', 'saturation'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMetric(m)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                      selectedMetric === m
                        ? 'bg-[#A855F7] text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-[#1A1235] p-1 rounded-lg border border-white/10 text-xs">
                {(['15m', '1h', '24h'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeRange(t)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                      timeRange === t
                        ? 'bg-[#70D6FF] text-black shadow-sm font-extrabold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateReport}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Generate PDF Report from this telemetry"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Report PDF</span>
              </button>
            </div>
          </div>

          {/* Recharts Area & Line Chart */}
          <div className="w-full h-[320px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <defs>
                  {/* Purple Gradient for Sludge */}
                  <linearGradient id="sludgeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.purple} stopOpacity={0.65} />
                    <stop offset="95%" stopColor={PALETTE.purple} stopOpacity={0.05} />
                  </linearGradient>

                  {/* Neon Green Gradient for Saturation */}
                  <linearGradient id="satGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.neonGreen} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={PALETTE.neonGreen} stopOpacity={0.0} />
                  </linearGradient>

                  {/* Baby Blue Line Gradient */}
                  <linearGradient id="blueLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={PALETTE.babyBlue} />
                    <stop offset="100%" stopColor={PALETTE.gold} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#251A45" vertical={false} />

                <XAxis
                  dataKey="time"
                  stroke="#70D6FF"
                  tick={{ fill: '#A1A1AA', fontSize: 11 }}
                  axisLine={{ stroke: '#3E2A70' }}
                />

                {/* Left Axis: Sludge Accumulation in Liters */}
                {(selectedMetric === 'both' || selectedMetric === 'sludge') && (
                  <YAxis
                    yAxisId="left"
                    stroke={PALETTE.purple}
                    tick={{ fill: '#C084FC', fontSize: 11 }}
                    axisLine={{ stroke: '#5B3798' }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k L`}
                    domain={[0, 45000]}
                  />
                )}

                {/* Right Axis: Gloop Saturation % */}
                {(selectedMetric === 'both' || selectedMetric === 'saturation') && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke={PALETTE.neonGreen}
                    tick={{ fill: '#00FF66', fontSize: 11 }}
                    axisLine={{ stroke: '#00AA44' }}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 100]}
                  />
                )}

                {/* Custom Styled Recharts Tooltip */}
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0B071A]/95 backdrop-blur-md p-3 rounded-xl border border-[#A855F7]/50 shadow-[0_0_25px_rgba(0,0,0,0.9)] text-xs font-code space-y-1">
                          <div className="font-extrabold text-[#FFD700] border-b border-white/10 pb-1 flex items-center justify-between gap-4">
                            <span>TIMECODE: {label}</span>
                            <span className="text-[10px] text-[#70D6FF]">SYNCED</span>
                          </div>
                          {payload.map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4 text-[11px]">
                              <span style={{ color: entry.color }} className="flex items-center gap-1.5 font-bold">
                                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                                {entry.name}:
                              </span>
                              <span className="font-extrabold text-white">
                                {entry.name === 'Sludge Accumulation'
                                  ? `${Number(entry.value).toLocaleString()} Liters`
                                  : entry.name === 'Gloop Saturation'
                                  ? `${entry.value}%`
                                  : entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontFamily: 'monospace' }}
                  iconType="circle"
                />

                {/* Safe & Critical Reference Lines */}
                <ReferenceLine
                  yAxisId="right"
                  y={85}
                  stroke={PALETTE.red}
                  strokeDasharray="4 4"
                  label={{ value: 'Cavitation Warning (85%)', fill: PALETTE.red, fontSize: 10, position: 'insideTopRight' }}
                />
                <ReferenceLine
                  yAxisId="right"
                  y={50}
                  stroke={PALETTE.gold}
                  strokeDasharray="3 3"
                  label={{ value: 'Optimal Equilibrium (50%)', fill: PALETTE.gold, fontSize: 10, position: 'insideBottomRight' }}
                />

                {/* Sludge Area */}
                {(selectedMetric === 'both' || selectedMetric === 'sludge') && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="sludgeLtrs"
                    name="Sludge Accumulation"
                    stroke={PALETTE.purple}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#sludgeGrad)"
                  />
                )}

                {/* Saturation Line / Area */}
                {(selectedMetric === 'both' || selectedMetric === 'saturation') && (
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="gloopSaturation"
                    name="Gloop Saturation"
                    stroke={PALETTE.neonGreen}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#satGrad)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: 3D Cartoon Nano Banano Mascot Module */}
        <div className="space-y-4">
          <NanoBanano3D mood={bananoMood} size="md" />

          {/* Banano Tactical Gloop Valve Controller */}
          <div className="p-4 rounded-xl bg-[#0D081F] border border-[#FFD700]/30 space-y-3 font-code">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#FFD700] flex items-center gap-1.5">
                <span>🍌</span> NANO BANANO FLOW REGULATOR
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              The 3D Nano Banano bot mechanically catalyzes sludge breakdown via potassium ion exchange, stabilizing gloop viscosity within nominal parameters.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-zinc-500 block">CATALYST EFFICIENCY</span>
                <span className="font-bold text-[#00FF66]">99.8% Nominal</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-zinc-500 block">ENZYME RECOVERY</span>
                <span className="font-bold text-[#FF66C4]">0.42 sec Latency</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Analytics Row: Composition Pie Chart & Sector Inflow/Outflow Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biochemical Gloop Composition Pie Chart */}
        <div className="p-5 rounded-2xl bg-[#0D081F]/90 border border-[#FF66C4]/30 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#FF66C4] tracking-wide flex items-center gap-2">
                <span>🧪</span> BIOCHEMICAL GLOOP COMPOSITION (NANO BANANO SPEC)
              </h3>
              <p className="text-xs text-zinc-400">Multi-component spectral breakdown of recirculated fluidic medium</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-[240px]">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gloopComposition}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {gloopComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#070512" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="bg-[#0B071A]/95 p-2 rounded-lg border border-white/20 text-xs font-code">
                            <span className="font-bold" style={{ color: data.payload.color }}>
                              {data.name}: {data.value}%
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart Legend */}
            <div className="w-full sm:w-1/2 space-y-1.5 text-xs">
              {gloopComposition.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: item.color }} />
                    <span className="truncate max-w-[150px]">{item.name}</span>
                  </span>
                  <span className="font-extrabold font-mono" style={{ color: item.color }}>
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sector Inflow & Consumption Velocity Bar Chart */}
        <div className="p-5 rounded-2xl bg-[#0D081F]/90 border border-[#70D6FF]/30 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#70D6FF] tracking-wide flex items-center gap-2">
                <span>⚡</span> SECTOR SLUDGE FLOW & CONSUMPTION DELTA
              </h3>
              <p className="text-xs text-zinc-400">Inflow vs extraction rates across the 5 monorepo sectors</p>
            </div>
          </div>

          <div className="w-full h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorVelocity} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#251A45" vertical={false} />
                <XAxis dataKey="sector" stroke="#A1A1AA" tick={{ fontSize: 10 }} />
                <YAxis stroke="#A1A1AA" tick={{ fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0B071A]/95 p-2.5 rounded-lg border border-white/20 text-xs font-code space-y-1">
                          <div className="font-bold text-[#70D6FF]">{label}</div>
                          <div className="text-[#FF66C4]">Inflow: {payload[0]?.value} L/hr</div>
                          <div className="text-[#00FF66]">Outflow: {payload[1]?.value} L/hr</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="inflow" name="Hydraulic Inflow (L/hr)" fill={PALETTE.pink} radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" name="Engine Outflow (L/hr)" fill={PALETTE.neonGreen} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Simulated & Downloadable PDF Audit Report Modal */}
      <GloopReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        metrics={metrics}
        historyData={historyData}
        gloopComposition={gloopComposition}
        sectorVelocity={sectorVelocity}
        simulatedInjections={simulatedInjections}
        isClayMode={isClayMode}
      />
    </div>
  );
};

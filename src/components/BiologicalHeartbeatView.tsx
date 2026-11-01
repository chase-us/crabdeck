import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { SystemMetrics } from '../types';
import { soundFX } from '../utils/audio';

interface BiologicalHeartbeatViewProps {
  metrics: SystemMetrics;
  onUpdateMetrics?: (updater: (prev: SystemMetrics) => SystemMetrics) => void;
  isClayMode?: boolean;
}

export type WaveformChannel = 'ecg' | 'stability' | 'gloop' | 'composite';
export type CardiacPhase = 'Systole' | 'Flow' | 'Diastole' | 'Return';

interface WavePoint {
  id: number;
  time: number; // in seconds
  ecg: number; // microvolts (-500 to +1800)
  stability: number; // percentage (90 to 100)
  gloopPressure: number; // mPa.s
  phase: string;
  isPeak?: boolean;
}

interface StabilityAlert {
  id: string;
  timestamp: string;
  type: 'INFO' | 'ARRHYTHMIA' | 'RESONANCE' | 'RESYNC';
  message: string;
  stability: number;
}

export const BiologicalHeartbeatView: React.FC<BiologicalHeartbeatViewProps> = ({
  metrics,
  onUpdateMetrics,
  isClayMode = false
}) => {
  // Configurable Parameters
  const [bpm, setBpm] = useState<number>(72); // 72 BPM = 1.20 Hz
  const [amplitudeGain, setAmplitudeGain] = useState<number>(1.2);
  const [activeChannel, setActiveChannel] = useState<WaveformChannel>('composite');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [heartbeatAudio, setHeartbeatAudio] = useState<boolean>(true);
  const [anomalyMode, setAnomalyMode] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<CardiacPhase>('Systole');
  const [alerts, setAlerts] = useState<StabilityAlert[]>([
    {
      id: 'al-1',
      timestamp: '00:00:01',
      type: 'INFO',
      message: 'Autonomous Biological Homeostasis monitor initialized. Biorhythm synchrony: 100%.',
      stability: 99.8
    }
  ]);

  // Derived telemetry metrics
  const [dynamicStability, setDynamicStability] = useState<number>(metrics.systemStability || 99.8);
  const [hrvMs, setHrvMs] = useState<number>(44.2); // Heart Rate Variability (RMSSD)
  const [cellularEntropy, setCellularEntropy] = useState<number>(0.038); // nats/sec
  const [phaseCoherence, setPhaseCoherence] = useState<number>(0.994); // Phi index
  const [snrRatioDb, setSnrRatioDb] = useState<number>(38.4); // Signal to Noise ratio

  // SVG & Tooltip D3 References
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<WavePoint | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Time & Points Buffer
  const bufferLength = 180;
  const dataRef = useRef<WavePoint[]>([]);
  const frameCountRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const lastBeatTimeRef = useRef<number>(0);

  // Anomaly recovery timeout ref
  const anomalyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Biological agent nodes data
  const agentVitals = useMemo(() => [
    {
      id: 'hermes',
      name: 'Hermes-3-Bio',
      role: 'Cardiac Pacemaker (SA Node)',
      temp: '37.1°C',
      sync: '99.9%',
      tone: 'Sympathetic',
      state: 'STABLE'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek-R1-Vagus',
      role: 'Vagal Homeostasis Regulator',
      temp: '36.8°C',
      sync: '99.7%',
      tone: 'Parasympathetic',
      state: 'STABLE'
    },
    {
      id: 'qwen',
      name: 'Qwen-Cellular',
      role: 'Metabolic & ATP Flow',
      temp: '37.3°C',
      sync: '99.5%',
      tone: 'Balanced',
      state: 'STABLE'
    },
    {
      id: 'claw-alpha',
      name: 'Claw-Alpha-Hemodynamics',
      role: 'Micro-Fluidic Gloop Pump',
      temp: '37.0°C',
      sync: '100.0%',
      tone: 'Laminar',
      state: 'SYNCED'
    }
  ], []);

  // Compute ECG point for current cardiac cycle phase
  const generateEcgSample = useCallback((cycleProgress: number, gain: number, isAnomaly: boolean): { ecg: number; phase: string; isPeak: boolean } => {
    // cycleProgress goes 0.0 to 1.0 within one heartbeat cycle
    let ecg = 0;
    let phase = 'ISO';
    let isPeak = false;

    if (isAnomaly) {
      // Chaotic Ventricular Fibrillation / Tachycardia jitter
      ecg = (Math.sin(cycleProgress * Math.PI * 8) * 450 + (Math.random() - 0.5) * 600) * gain;
      phase = 'ARRHYTHMIA';
      return { ecg, phase, isPeak: Math.random() > 0.85 };
    }

    // P-wave (Atrial Depolarization): 0.12 to 0.20
    if (cycleProgress >= 0.12 && cycleProgress < 0.20) {
      const p = (cycleProgress - 0.12) / 0.08;
      ecg = Math.sin(p * Math.PI) * 160;
      phase = 'P-Wave (Atrial)';
    }
    // PR-segment: 0.20 to 0.28
    else if (cycleProgress >= 0.20 && cycleProgress < 0.28) {
      ecg = (Math.random() - 0.5) * 15;
      phase = 'PR Segment';
    }
    // Q-wave (Septal Depolarization): 0.28 to 0.31
    else if (cycleProgress >= 0.28 && cycleProgress < 0.31) {
      const q = (cycleProgress - 0.28) / 0.03;
      ecg = -Math.sin(q * Math.PI) * 220;
      phase = 'Q-Dip';
    }
    // R-wave (Ventricular Depolarization Spike): 0.31 to 0.37
    else if (cycleProgress >= 0.31 && cycleProgress < 0.37) {
      const r = (cycleProgress - 0.31) / 0.06;
      ecg = Math.sin(r * Math.PI) * 1450; // sharp peak
      phase = 'QRS (Systole R-Peak)';
      if (r > 0.4 && r < 0.6) {
        isPeak = true;
      }
    }
    // S-wave (Late Ventricular Depolarization): 0.37 to 0.41
    else if (cycleProgress >= 0.37 && cycleProgress < 0.41) {
      const s = (cycleProgress - 0.37) / 0.04;
      ecg = -Math.sin(s * Math.PI) * 380;
      phase = 'S-Dip';
    }
    // ST segment: 0.41 to 0.50
    else if (cycleProgress >= 0.41 && cycleProgress < 0.50) {
      ecg = (Math.random() - 0.5) * 20;
      phase = 'ST-Segment';
    }
    // T-wave (Ventricular Repolarization): 0.50 to 0.68
    else if (cycleProgress >= 0.50 && cycleProgress < 0.68) {
      const t = (cycleProgress - 0.50) / 0.18;
      ecg = Math.sin(t * Math.PI) * 340;
      phase = 'T-Wave (Diastole)';
    }
    // Isoelectric baseline: 0.68 to 1.00
    else {
      ecg = (Math.random() - 0.5) * 25;
      phase = 'Isoelectric Rest';
    }

    // Add gentle high-frequency biological neural noise
    ecg += (Math.random() - 0.5) * 35;
    return { ecg: ecg * gain, phase, isPeak };
  }, []);

  // Initialize buffer
  useEffect(() => {
    const initial: WavePoint[] = [];
    const now = Date.now() / 1000;
    for (let i = 0; i < bufferLength; i++) {
      const time = now - (bufferLength - i) * 0.025;
      initial.push({
        id: i,
        time,
        ecg: 0,
        stability: 99.8,
        gloopPressure: 1400,
        phase: 'Rest'
      });
    }
    dataRef.current = initial;
  }, []);

  // Main Streaming & Animation Loop using D3
  useEffect(() => {
    if (isPaused) return;

    let localFrame = 0;
    const hz = bpm / 60; // cycles per second
    const cycleDuration = 1 / hz;

    const tick = () => {
      localFrame++;
      frameCountRef.current = localFrame;

      const currentTime = performance.now() / 1000;
      const cycleProgress = (currentTime % cycleDuration) / cycleDuration;
      const isAnomaly = Boolean(anomalyMode);

      // Check R-peak for audio pulse
      if (cycleProgress >= 0.32 && cycleProgress < 0.36) {
        if (currentTime - lastBeatTimeRef.current > cycleDuration * 0.75) {
          lastBeatTimeRef.current = currentTime;
          if (heartbeatAudio) {
            soundFX.playHeartbeat(isAnomaly);
          }
        }
      }

      // Determine active cardiac phase
      let currentPhase: CardiacPhase = 'Systole';
      if (cycleProgress < 0.25) currentPhase = 'Systole';
      else if (cycleProgress < 0.5) currentPhase = 'Flow';
      else if (cycleProgress < 0.75) currentPhase = 'Diastole';
      else currentPhase = 'Return';
      setActivePhase(currentPhase);

      // Calculate ECG
      const { ecg, phase, isPeak } = generateEcgSample(cycleProgress, amplitudeGain, isAnomaly);

      // Stability and Gloop hemodynamics calculations
      const stabilityBase = isAnomaly ? 74 + Math.sin(localFrame * 0.1) * 12 : 99.6 + Math.sin(localFrame * 0.05) * 0.35;
      const gloopVal = 1420 + Math.sin(currentTime * 1.5) * 110 + (isAnomaly ? (Math.random() - 0.5) * 200 : 0);

      // Update metrics state periodically
      if (localFrame % 10 === 0) {
        setDynamicStability(+stabilityBase.toFixed(1));
        setHrvMs(+(42 + Math.random() * 5).toFixed(1));
        setCellularEntropy(+(isAnomaly ? 0.38 + Math.random() * 0.1 : 0.035 + Math.random() * 0.008).toFixed(3));
        setPhaseCoherence(+(isAnomaly ? 0.72 : 0.992 + Math.random() * 0.006).toFixed(3));
        setSnrRatioDb(+(isAnomaly ? 18.2 : 38.5 + (Math.random() - 0.5) * 1.2).toFixed(1));

        if (onUpdateMetrics) {
          onUpdateMetrics(prev => ({
            ...prev,
            systemStability: +stabilityBase.toFixed(1),
            heartbeatPhase: currentPhase
          }));
        }
      }

      // Push to dataRef buffer
      const newPoint: WavePoint = {
        id: localFrame,
        time: currentTime,
        ecg,
        stability: stabilityBase,
        gloopPressure: gloopVal,
        phase,
        isPeak
      };

      const buf = dataRef.current;
      buf.push(newPoint);
      if (buf.length > bufferLength) {
        buf.shift();
      }

      // Draw SVG with D3
      renderD3Graph();

      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [bpm, amplitudeGain, activeChannel, isPaused, heartbeatAudio, anomalyMode, generateEcgSample, onUpdateMetrics]);

  // D3 Render Function
  const renderD3Graph = useCallback(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const data = dataRef.current;
    if (data.length < 2) return;

    const width = svgEl.clientWidth || 800;
    const height = svgEl.clientHeight || 280;
    const margin = { top: 25, right: 35, bottom: 35, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);

    // X Scale (Time Window)
    const xMin = data[0].time;
    const xMax = data[data.length - 1].time;
    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([margin.left, width - margin.right]);

    // Y Scale depending on channel
    let yDomain: [number, number] = [-600, 2000];
    if (activeChannel === 'stability') {
      yDomain = [60, 105];
    } else if (activeChannel === 'gloop') {
      yDomain = [1100, 1800];
    } else if (activeChannel === 'composite') {
      yDomain = [-700, 2100];
    }

    const yScale = d3.scaleLinear().domain(yDomain).range([height - margin.bottom, margin.top]);

    // Grid rendering
    const gridG = svg.select<SVGGElement>('.grid-layer');
    if (!gridG.empty()) {
      // Horizontal grid lines
      const yTicks = yScale.ticks(6);
      const gridLines = gridG.selectAll<SVGLineElement, number>('.y-grid-line').data(yTicks);

      gridLines
        .enter()
        .append('line')
        .attr('class', 'y-grid-line')
        .merge(gridLines)
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .attr('stroke', 'rgba(212, 175, 55, 0.08)')
        .attr('stroke-dasharray', '3 3');

      gridLines.exit().remove();
    }

    // Axes
    const xAxisG = svg.select<SVGGElement>('.x-axis');
    if (!xAxisG.empty()) {
      const xAxis = d3
        .axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => `-${(xMax - Number(d)).toFixed(1)}s`);
      xAxisG.attr('transform', `translate(0, ${height - margin.bottom})`).call(xAxis);
      xAxisG.select('.domain').attr('stroke', 'rgba(212, 175, 55, 0.3)');
      xAxisG.selectAll('text').attr('fill', '#A1A1AA').attr('font-size', '10px').attr('font-family', 'monospace');
      xAxisG.selectAll('line').attr('stroke', 'rgba(212, 175, 55, 0.2)');
    }

    const yAxisG = svg.select<SVGGElement>('.y-axis');
    if (!yAxisG.empty()) {
      const yAxis = d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat(d => {
          if (activeChannel === 'stability') return `${d}%`;
          if (activeChannel === 'gloop') return `${d} cP`;
          return `${d} µV`;
        });
      yAxisG.attr('transform', `translate(${margin.left}, 0)`).call(yAxis);
      yAxisG.select('.domain').attr('stroke', 'rgba(212, 175, 55, 0.3)');
      yAxisG.selectAll('text').attr('fill', '#A1A1AA').attr('font-size', '10px').attr('font-family', 'monospace');
      yAxisG.selectAll('line').attr('stroke', 'rgba(212, 175, 55, 0.2)');
    }

    // Main Waveform Path & Area Generator
    const lineGenerator = d3
      .line<WavePoint>()
      .x(d => xScale(d.time))
      .y(d => {
        if (activeChannel === 'stability') {
          return yScale(d.stability);
        } else if (activeChannel === 'gloop') {
          return yScale(d.gloopPressure);
        } else {
          return yScale(d.ecg);
        }
      })
      .curve(d3.curveMonotoneX);

    const areaGenerator = d3
      .area<WavePoint>()
      .x(d => xScale(d.time))
      .y0(height - margin.bottom)
      .y1(d => {
        if (activeChannel === 'stability') {
          return yScale(d.stability);
        } else if (activeChannel === 'gloop') {
          return yScale(d.gloopPressure);
        } else {
          return yScale(d.ecg);
        }
      })
      .curve(d3.curveMonotoneX);

    // Update Area Path
    svg.select<SVGPathElement>('.wave-area').datum(data).attr('d', areaGenerator);

    // Update Line Path
    svg
      .select<SVGPathElement>('.wave-path')
      .datum(data)
      .attr('d', lineGenerator)
      .attr('stroke', anomalyMode ? '#EF4444' : 'url(#goldWaveGradient)');

    // Secondary line for Composite Channel (Stability envelope over ECG)
    const secondaryPath = svg.select<SVGPathElement>('.secondary-wave-path');
    if (activeChannel === 'composite') {
      const stabilityOverlayScale = d3.scaleLinear().domain([60, 100]).range([margin.top + 30, margin.top + 80]);
      const secondaryLine = d3
        .line<WavePoint>()
        .x(d => xScale(d.time))
        .y(d => stabilityOverlayScale(d.stability))
        .curve(d3.curveBasis);

      secondaryPath
        .style('display', 'block')
        .datum(data)
        .attr('d', secondaryLine)
        .attr('stroke', '#00F0FF')
        .attr('stroke-width', '1.5')
        .attr('stroke-dasharray', '4 2')
        .attr('opacity', '0.75');
    } else {
      secondaryPath.style('display', 'none');
    }

    // Pulse Blip at the leading head of the waveform
    const latest = data[data.length - 1];
    if (latest) {
      const headX = xScale(latest.time);
      const headY = activeChannel === 'stability' ? yScale(latest.stability) : activeChannel === 'gloop' ? yScale(latest.gloopPressure) : yScale(latest.ecg);

      const pulseBlip = svg.select('.pulse-blip');
      pulseBlip.attr('cx', headX).attr('cy', headY).attr('fill', anomalyMode ? '#EF4444' : '#FFD700');

      const pulseHalo = svg.select('.pulse-halo');
      pulseHalo.attr('cx', headX).attr('cy', headY).attr('stroke', anomalyMode ? '#EF4444' : '#D4AF37');
    }
  }, [activeChannel, anomalyMode]);

  // Handle interactive SVG hover scrubbing
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    const yPos = e.clientY - rect.top;

    const data = dataRef.current;
    if (!data.length) return;

    const margin = { left: 55, right: 35 };
    const width = rect.width;
    const xMin = data[0].time;
    const xMax = data[data.length - 1].time;
    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([margin.left, width - margin.right]);

    const hoveredTime = xScale.invert(xPos);
    const bisect = d3.bisector<WavePoint, number>(d => d.time).center;
    const idx = bisect(data, hoveredTime);
    const point = data[idx];

    if (point) {
      setHoveredPoint(point);
      setMousePos({ x: xPos, y: yPos });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setMousePos(null);
  };

  // Trigger Anomaly Simulation
  const triggerAnomaly = (type: string) => {
    soundFX.playWiggle();
    setAnomalyMode(type);

    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    setAlerts(prev => [
      {
        id: `al-${Date.now()}`,
        timestamp,
        type: 'ARRHYTHMIA',
        message: `Injected Anomaly: [${type}]. Depolarization flux destabilized.`,
        stability: 72.4
      },
      ...prev.slice(0, 7)
    ]);

    // Schedule auto-recovery in 6.5 seconds
    if (anomalyTimerRef.current) clearTimeout(anomalyTimerRef.current);
    anomalyTimerRef.current = setTimeout(() => {
      setAnomalyMode(null);
      const recTime = new Date();
      const recTimestamp = `${recTime.getHours().toString().padStart(2, '0')}:${recTime.getMinutes().toString().padStart(2, '0')}:${recTime.getSeconds().toString().padStart(2, '0')}`;
      setAlerts(prev => [
        {
          id: `al-${Date.now()}`,
          timestamp: recTimestamp,
          type: 'RESYNC',
          message: 'Autonomous Vagal feedback restored cellular equilibrium. Homeostasis re-locked.',
          stability: 99.8
        },
        ...prev.slice(0, 7)
      ]);
    }, 6500);
  };

  // Trigger Instant Force Resync
  const handleForceResync = () => {
    soundFX.playHotSwap();
    if (anomalyTimerRef.current) clearTimeout(anomalyTimerRef.current);
    setAnomalyMode(null);
    setDynamicStability(99.9);

    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setAlerts(prev => [
      {
        id: `al-${Date.now()}`,
        timestamp,
        type: 'RESYNC',
        message: 'Manual Quantum-Biological Resync executed. All 4 nodal pacemakers phase-aligned at 4.20 GHz harmonic.',
        stability: 99.9
      },
      ...prev.slice(0, 7)
    ]);
  };

  return (
    <div className={`space-y-6 font-code transition-all ${isClayMode ? 'font-rubik' : ''}`}>
      {/* View Header Banner */}
      <div className="sophisticated-card rounded-2xl p-5 md:p-6 border border-[#D4AF37]/35 shadow-[0_0_35px_rgba(212,175,55,0.12)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${anomalyMode ? 'bg-red-500 animate-ping' : 'bg-[#D4AF37] animate-pulse'}`} />
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#D4AF37]">
                BIO-QUANTUM TELEMETRY // SYSTEM STABILITY MONITOR
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-xs text-zinc-400">D3 WAVEFORM SYNTHESIZER</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#F3E5AB] font-serif-luxury tracking-tight flex items-center gap-3">
              BIOLOGICAL HEARTBEAT
              <span className={`text-xs px-2.5 py-1 rounded-md border font-bold ${
                anomalyMode
                  ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                  : 'bg-[#D4AF37]/15 border-[#D4AF37]/50 text-[#F3E5AB]'
              }`}>
                {anomalyMode ? `ALERT: ${anomalyMode}` : 'HOMEOSTASIS LOCKED'}
              </span>
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Continuous multi-channel physiological monitoring of neural agent cluster stability. Evaluates real-time ventricular depolarization, phase coherence, and fluidic gloop circulation.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleForceResync}
              className="px-4 py-2.5 gold-gradient-bg text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>⚡ FORCE BIOLOGICAL RESYNC</span>
            </button>

            <button
              onClick={() => setIsPaused(p => !p)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                isPaused
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-white'
              }`}
            >
              {isPaused ? '▶ RESUME SWEEP' : '⏸ PAUSE SWEEP'}
            </button>

            <button
              onClick={() => setHeartbeatAudio(a => !a)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                heartbeatAudio
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#F3E5AB]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
              title="Toggle Lub-Dub Cardiac Synthesizer Audio"
            >
              {heartbeatAudio ? '🔊 CARDIAC AUDIO' : '🔇 MUTED'}
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-[#D4AF37]/20">
          <div className="p-3 bg-[#0A0A0F]/80 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Stability Equilibrium</div>
            <div className={`text-xl font-extrabold ${dynamicStability > 95 ? 'text-[#10B981]' : dynamicStability > 80 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>
              {dynamicStability.toFixed(1)}%
            </div>
            <div className="text-[10px] text-zinc-500">Target &gt; 99.0%</div>
          </div>

          <div className="p-3 bg-[#0A0A0F]/80 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Heart Rate / Pulse</div>
            <div className="text-xl font-extrabold text-[#F3E5AB]">
              {bpm} <span className="text-xs font-normal text-zinc-400">BPM</span>
            </div>
            <div className="text-[10px] text-zinc-500">{(bpm / 60).toFixed(2)} Hz Oscillator</div>
          </div>

          <div className="p-3 bg-[#0A0A0F]/80 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Cardiac Cycle Phase</div>
            <div className="text-xl font-extrabold text-[#D4AF37] uppercase">
              {activePhase}
            </div>
            <div className="text-[10px] text-zinc-500">4-Phase Ventricular Loop</div>
          </div>

          <div className="p-3 bg-[#0A0A0F]/80 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">HRV (RMSSD)</div>
            <div className="text-xl font-extrabold text-[#00F0FF]">
              {hrvMs} <span className="text-xs font-normal text-zinc-400">ms</span>
            </div>
            <div className="text-[10px] text-zinc-500">Vagal Tone Balance</div>
          </div>

          <div className="p-3 bg-[#0A0A0F]/80 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Shannon Entropy (ΔS)</div>
            <div className="text-xl font-extrabold text-[#E5C158]">
              {cellularEntropy} <span className="text-xs font-normal text-zinc-400">nats</span>
            </div>
            <div className="text-[10px] text-zinc-500">Microstate Chaos Index</div>
          </div>

          <div className="p-3 bg-[#0A0A0F]/80 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Phase Coherence (Φ)</div>
            <div className="text-xl font-extrabold text-[#D4AF37]">
              {phaseCoherence}
            </div>
            <div className="text-[10px] text-zinc-500">SNR: {snrRatioDb} dB</div>
          </div>
        </div>
      </div>

      {/* Main D3 Oscilloscope Canvas Section */}
      <div className="sophisticated-card rounded-2xl p-5 md:p-6 border border-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.08)] space-y-4">
        {/* Oscilloscope Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4AF37]/20 pb-4">
          {/* Channel Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-[#020205] p-1 rounded-xl border border-white/10 text-xs">
            <span className="px-2.5 py-1 text-zinc-400 font-bold text-[11px]">CHANNEL:</span>
            <button
              onClick={() => setActiveChannel('composite')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeChannel === 'composite'
                  ? 'gold-gradient-bg text-black shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ⚡ MULTI-LEAD COMPOSITE
            </button>
            <button
              onClick={() => setActiveChannel('ecg')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeChannel === 'ecg'
                  ? 'bg-[#D4AF37]/25 text-[#F3E5AB] border border-[#D4AF37]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              LEAD II (ECG)
            </button>
            <button
              onClick={() => setActiveChannel('stability')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeChannel === 'stability'
                  ? 'bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              HOMEOSTATIC ENVELOPE
            </button>
            <button
              onClick={() => setActiveChannel('gloop')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeChannel === 'gloop'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              GLOOP HEMODYNAMICS
            </button>
          </div>

          {/* Real-time Oscilloscope Telemetry Badge */}
          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1 rounded-lg bg-[#0A0A0F] border border-[#D4AF37]/40 text-[#F3E5AB] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
              <span>TIME WINDOW: 4.5s</span>
              <span className="text-zinc-600">|</span>
              <span>SAMPLING: 250 Hz</span>
            </div>
          </div>
        </div>

        {/* D3 SVG Container */}
        <div
          ref={containerRef}
          className="relative w-full h-[320px] bg-[#020205] rounded-xl border border-[#D4AF37]/25 overflow-hidden shadow-inner group cursor-crosshair"
        >
          {/* Subtle Background Cyber Grid */}
          <div className="absolute inset-0 cyber-grid pointer-events-none opacity-25" />

          {/* D3 SVG Canvas */}
          <svg
            ref={svgRef}
            className="w-full h-full block"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {/* Linear Gradient for Waveform Path */}
              <linearGradient id="goldWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8C7322" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.9" />
                <stop offset="90%" stopColor="#F3E5AB" stopOpacity="1" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
              </linearGradient>

              {/* Area Gradient for Soft Glow Under Curve */}
              <linearGradient id="goldAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
              </linearGradient>

              {/* Alert Gradient */}
              <linearGradient id="alertAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </linearGradient>

              {/* Glowing Filter */}
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* D3 Render Layers */}
            <g className="grid-layer" />
            <g className="x-axis" />
            <g className="y-axis" />

            {/* Waveform Area Fill */}
            <path
              className="wave-area"
              fill={anomalyMode ? 'url(#alertAreaGradient)' : 'url(#goldAreaGradient)'}
            />

            {/* Secondary Waveform (Stability Index Ribbon or Overlay) */}
            <path className="secondary-wave-path" fill="none" />

            {/* Main Primary Waveform Path */}
            <path
              className="wave-path"
              fill="none"
              strokeWidth="2.5"
              filter="url(#goldGlow)"
            />

            {/* Leading Edge Scanning Pulse Blip */}
            <circle className="pulse-halo" r="8" fill="none" strokeWidth="2" opacity="0.6" />
            <circle className="pulse-blip" r="3.5" />

            {/* Hover Scrub Line & Crosshair */}
            {mousePos && (
              <g className="hover-crosshair pointer-events-none">
                <line
                  x1={mousePos.x}
                  x2={mousePos.x}
                  y1={25}
                  y2={285}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={mousePos.x}
                  cy={mousePos.y}
                  r="4"
                  fill="#00F0FF"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              </g>
            )}
          </svg>

          {/* Interactive D3 Tooltip */}
          {hoveredPoint && mousePos && (
            <div
              className="absolute z-20 pointer-events-none bg-[#0A0A0F]/95 backdrop-blur-md border border-[#D4AF37]/50 rounded-lg p-2.5 shadow-[0_0_20px_rgba(0,0,0,0.9)] text-[11px] text-zinc-200 space-y-1 transform -translate-x-1/2 -translate-y-full"
              style={{
                left: Math.max(80, Math.min(mousePos.x, (containerRef.current?.clientWidth || 600) - 100)),
                top: Math.max(10, mousePos.y - 12)
              }}
            >
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1">
                <span className="font-extrabold text-[#F3E5AB]">{hoveredPoint.phase}</span>
                <span className="text-[10px] text-zinc-400 font-mono">t: {hoveredPoint.time.toFixed(2)}s</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                <span className="text-zinc-400">ECG Amplitude:</span>
                <span className="text-right font-bold text-[#D4AF37]">{hoveredPoint.ecg.toFixed(0)} µV</span>
                <span className="text-zinc-400">Stability Index:</span>
                <span className="text-right font-bold text-[#10B981]">{hoveredPoint.stability.toFixed(1)}%</span>
                <span className="text-zinc-400">Gloop Flow:</span>
                <span className="text-right font-bold text-[#00F0FF]">{hoveredPoint.gloopPressure.toFixed(0)} cP</span>
              </div>
            </div>
          )}

          {/* Overlay Legend */}
          <div className="absolute bottom-3 right-4 flex items-center gap-4 bg-[#0A0A0F]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-zinc-400 pointer-events-none">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#D4AF37] inline-block" />
              Lead II Waveform (µV)
            </span>
            {activeChannel === 'composite' && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#00F0FF] inline-block" />
                Stability Target Envelope (%)
              </span>
            )}
            <span className="text-zinc-600">|</span>
            <span className="text-[#10B981]">QRS LOCK: VALID</span>
          </div>
        </div>

        {/* Waveform Signal Tuning Deck */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* BPM Frequency Slider */}
          <div className="p-3.5 bg-[#0A0A0F]/80 rounded-xl border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-300 font-bold">CARDIAC FREQUENCY (BPM):</span>
              <span className="text-[#F3E5AB] font-extrabold text-sm">{bpm} BPM</span>
            </div>
            <input
              type="range"
              min="40"
              max="160"
              step="2"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>40 BPM (Bradycardia)</span>
              <span>72 BPM (Resting)</span>
              <span>160 BPM (Tachy)</span>
            </div>
          </div>

          {/* Waveform Amplitude / Voltage Gain */}
          <div className="p-3.5 bg-[#0A0A0F]/80 rounded-xl border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-300 font-bold">VOLTAGE SENSITIVITY GAIN:</span>
              <span className="text-[#E5C158] font-extrabold text-sm">{amplitudeGain.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={amplitudeGain}
              onChange={(e) => setAmplitudeGain(parseFloat(e.target.value))}
              className="w-full accent-[#E5C158] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>0.5x (Attenuated)</span>
              <span>1.0x (Standard)</span>
              <span>2.5x (Ultra-Gain)</span>
            </div>
          </div>

          {/* Anomaly Injection Simulation Stress Suite */}
          <div className="p-3.5 bg-[#0A0A0F]/80 rounded-xl border border-white/10 space-y-2">
            <div className="text-xs text-zinc-300 font-bold">STRESS TEST / ANOMALY INJECTION:</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => triggerAnomaly('Ventricular Tachycardia')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-950/60 border border-red-800 text-red-300 hover:bg-red-900/60 transition-all cursor-pointer"
              >
                ⚡ TACHYCARDIA
              </button>
              <button
                onClick={() => triggerAnomaly('Quantum Decoherence Noise')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 hover:bg-amber-900/60 transition-all cursor-pointer"
              >
                🌀 DECOHERENCE
              </button>
              <button
                onClick={() => triggerAnomaly('Gloop Cavitation')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-950/60 border border-purple-800 text-purple-300 hover:bg-purple-900/60 transition-all cursor-pointer"
              >
                🧪 CAVITATION
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Biological Node Network & Stability Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Organ Vitals (2 cols) */}
        <div className="lg:col-span-2 sophisticated-card rounded-2xl p-5 border border-[#D4AF37]/25 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#F3E5AB] tracking-wide flex items-center gap-2">
                <span>🧬</span> BIOLOGICAL AGENT SYNCHRONY MATRIX
              </h3>
              <p className="text-xs text-zinc-400">Pacemaker and vagal nerve node allocations across the omni-layer</p>
            </div>
            <span className="text-[11px] font-bold text-[#10B981] bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800">
              4 / 4 NODES ONLINE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agentVitals.map((node) => (
              <div
                key={node.id}
                className="p-3.5 bg-[#0A0A0F]/85 rounded-xl border border-white/5 hover:border-[#D4AF37]/35 transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-[#F3E5AB] transition-colors">
                      {node.name}
                    </div>
                    <div className="text-[10px] text-zinc-400">{node.role}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    {node.state}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-white/5 text-[10px]">
                  <div>
                    <span className="text-zinc-500 block">TEMP</span>
                    <strong className="text-zinc-200">{node.temp}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">SYNC</span>
                    <strong className="text-[#D4AF37]">{node.sync}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">TONE</span>
                    <strong className="text-[#00F0FF]">{node.tone}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Physiological Principles & Science Note */}
          <div className="p-3 bg-[#0A0A0F]/50 rounded-xl border border-white/5 text-xs text-zinc-400 space-y-1">
            <div className="font-bold text-zinc-300 text-[11px] flex items-center gap-1.5">
              <span>🔬</span> AUTONOMIC STABILITY MECHANICS:
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              Waveform synthesis couples ventricular action potentials (E_ion) with fluidic gloop Reynolds-number turbulence. When anomalous flutter occurs, the Vagal Homeostasis Regulator applies an exponential dampening coefficient (zeta = 0.85) to restore sinus rhythm within 180 cardiac cycles.
            </p>
          </div>
        </div>

        {/* Event Logs & Stability Alerts Feed (1 col) */}
        <div className="sophisticated-card rounded-2xl p-5 border border-[#D4AF37]/25 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#F3E5AB] tracking-wide flex items-center gap-2">
                <span>📋</span> HOMEOSTATIC EVENT LOG
              </h3>
              <p className="text-xs text-zinc-400">Live cardiac & stability occurrences</p>
            </div>
            <button
              onClick={() => setAlerts([])}
              className="text-[10px] text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              CLEAR
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500">
                No active stability anomalies detected. System operating in equilibrium.
              </div>
            ) : (
              alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                    al.type === 'ARRHYTHMIA'
                      ? 'bg-red-950/40 border-red-800/80 text-red-200'
                      : al.type === 'RESYNC'
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                      : 'bg-[#0A0A0F]/80 border-white/5 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-zinc-400">[{al.timestamp}]</span>
                    <span className={`font-bold ${al.type === 'ARRHYTHMIA' ? 'text-red-400' : 'text-[#D4AF37]'}`}>
                      {al.stability.toFixed(1)}% STABILITY
                    </span>
                  </div>
                  <p className="text-[11px] leading-tight">{al.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

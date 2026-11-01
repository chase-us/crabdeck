import React, { useState, useEffect, useRef } from 'react';
import { soundFX } from '../utils/audio';

interface HeartbeatProps {
  pulseFrequency?: number;
  systemStability?: number;
  onSyncTrigger?: () => void;
}

export const BiologicalHeartbeat: React.FC<HeartbeatProps> = ({
  pulseFrequency = 4.20,
  systemStability = 99.9,
  onSyncTrigger
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [freq, setFreq] = useState(pulseFrequency);
  const [phase, setPhase] = useState<'Systole' | 'Flow' | 'Diastole' | 'Return'>('Systole');
  const [amplitude, setAmplitude] = useState(40);

  useEffect(() => {
    const phases: Array<'Systole' | 'Flow' | 'Diastole' | 'Return'> = ['Systole', 'Flow', 'Diastole', 'Return'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setPhase(phases[idx]);
    }, 1200 / (freq / 4));

    return () => clearInterval(interval);
  }, [freq]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      offset += freq * 1.5;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid background lines
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Sine + ECG Heartbeat Waveform
      ctx.beginPath();
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#D4AF37';
      ctx.shadowBlur = 12;

      const centerY = h / 2;

      for (let x = 0; x < w; x++) {
        const xPos = (x + offset) % 300;
        let y = centerY + Math.sin((x + offset) * 0.04) * (amplitude * 0.3);

        // ECG Spike
        if (xPos > 120 && xPos < 130) {
          y -= amplitude * 1.2;
        } else if (xPos >= 130 && xPos < 145) {
          y += amplitude * 1.6;
        } else if (xPos >= 145 && xPos < 160) {
          y -= amplitude * 0.5;
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [freq, amplitude]);

  return (
    <div className="p-5 sophisticated-card rounded-2xl font-code space-y-4 border border-white/10 shadow-lg backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D4AF37]/25 pb-3">
        <div>
          <h3 className="text-base font-bold text-[#F3E5AB] tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
            BIOLOGICAL HEARTBEAT TELEMETRY v4.2.0
          </h3>
          <p className="text-xs text-zinc-400">4-Phase Biological Neural Pulse Oscillator</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-[#0A0A0F]/80 border border-[#D4AF37]/40 rounded text-xs text-white">
            PHASE: <strong className="text-[#D4AF37] uppercase">{phase}</strong>
          </div>
          <button
            onClick={() => {
              soundFX.playWiggle();
              onSyncTrigger?.();
            }}
            className="px-3 py-1.5 gold-gradient-bg text-black font-bold text-xs rounded hover:brightness-110 transition-all cursor-pointer"
          >
            FORCE SYNC
          </button>
        </div>
      </div>

      {/* Real-time Waveform Canvas */}
      <div className="relative w-full h-[140px] bg-[#020205] rounded-lg border border-[#D4AF37]/30 overflow-hidden">
        <canvas ref={canvasRef} width={800} height={140} className="w-full h-full" />
        <div className="absolute top-2 left-2 text-[10px] text-[#F3E5AB] font-bold bg-black/70 px-2 py-0.5 rounded border border-[#D4AF37]/40">
          OSCILLOSCOPE: {freq.toFixed(2)} Hz
        </div>
      </div>

      {/* Controls & Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        {/* Frequency Slider */}
        <div className="p-3 bg-[#0A0A0F]/80 border border-white/10 rounded-lg space-y-2">
          <div className="flex justify-between text-xs text-zinc-300">
            <span>PULSE FREQUENCY:</span>
            <strong className="text-[#F3E5AB]">{freq.toFixed(2)} Hz</strong>
          </div>
          <input
            type="range"
            min="1.0"
            max="12.0"
            step="0.1"
            value={freq}
            onChange={(e) => setFreq(parseFloat(e.target.value))}
            className="w-full accent-[#D4AF37] cursor-pointer"
          />
        </div>

        {/* Amplitude Slider */}
        <div className="p-3 bg-[#0A0A0F]/80 border border-white/10 rounded-lg space-y-2">
          <div className="flex justify-between text-xs text-zinc-300">
            <span>WAVE AMPLITUDE:</span>
            <strong className="text-[#E5C158]">{amplitude} px</strong>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            step="2"
            value={amplitude}
            onChange={(e) => setAmplitude(parseInt(e.target.value))}
            className="w-full accent-[#E5C158] cursor-pointer"
          />
        </div>

        {/* System Stability Gauge */}
        <div className="p-3 bg-[#0A0A0F]/80 border border-white/10 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">SYSTEM STABILITY</div>
            <div className="text-lg font-bold text-[#10B981]">{systemStability}%</div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#10B981] flex items-center justify-center text-xs font-bold text-[#10B981]">
            LOCK
          </div>
        </div>
      </div>
    </div>
  );
};

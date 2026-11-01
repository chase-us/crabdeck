import React, { useState } from 'react';
import { soundFX } from '../utils/audio';

export type QuantProfile = 'Q4_K_M' | 'Q5_K_M' | 'Q8_0';

interface QuantSpec {
  profile: QuantProfile;
  vramGb: number;
  tokensPerSec: number;
  perplexity: number;
  description: string;
}

const QUANT_SPECS: Record<QuantProfile, QuantSpec> = {
  Q4_K_M: {
    profile: 'Q4_K_M',
    vramGb: 4.5,
    tokensPerSec: 118,
    perplexity: 4.88,
    description: 'Fastest inference with minimal memory footprint. Ideal for local APU edge execution.'
  },
  Q5_K_M: {
    profile: 'Q5_K_M',
    vramGb: 5.8,
    tokensPerSec: 86,
    perplexity: 4.62,
    description: 'Recommended sweet spot. Pristine reasoning accuracy with conservative VRAM footprint.'
  },
  Q8_0: {
    profile: 'Q8_0',
    vramGb: 9.4,
    tokensPerSec: 52,
    perplexity: 4.41,
    description: 'Full uncompressed precision for extreme mathematical deduction and multi-agent synthesis.'
  }
};

export const CopilotFusionView: React.FC = () => {
  const [activeQuant, setActiveQuant] = useState<QuantProfile>('Q5_K_M');
  const [circuitBreakerStatus, setCircuitBreakerStatus] = useState<'CLOSED' | 'OPEN' | 'HALF_OPEN'>('CLOSED');
  const [latencyMs, setLatencyMs] = useState<number>(142);
  const [fallbackModel, setFallbackModel] = useState<string>('Qwen-2.5-Coder-Fast');
  const [activeModel, setActiveModel] = useState<string>('Hermes-3-70B-Fusion');
  const [prompt, setPrompt] = useState<string>('Refactor multi-agent gossip consensus without lock starvation.');
  const [benchmarkResult, setBenchmarkResult] = useState<string | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);

  const currentSpec = QUANT_SPECS[activeQuant];

  // Simulate latency spike that trips circuit breaker (> 1200ms)
  const handleSimulateLatencySpike = () => {
    soundFX.playAlarm();
    setLatencyMs(1840);
    setCircuitBreakerStatus('OPEN');
    setBenchmarkResult('🚨 LATENCY BREACH: 1,840ms detected (Threshold: 1,200ms). Circuit breaker tripped! Auto-diverted traffic to local lightweight fallback node [ Qwen-2.5-Coder-Fast ] in 6.4ms.');
  };

  const handleResetCircuitBreaker = () => {
    soundFX.playClick();
    setCircuitBreakerStatus('CLOSED');
    setLatencyMs(118);
    setBenchmarkResult(null);
  };

  const handleRunBenchmark = () => {
    soundFX.playWiggle();
    setIsBenchmarking(true);
    setBenchmarkResult(null);

    setTimeout(() => {
      setIsBenchmarking(false);
      soundFX.playChime();
      setLatencyMs(currentSpec.profile === 'Q4_K_M' ? 84 : currentSpec.profile === 'Q5_K_M' ? 128 : 210);
      setBenchmarkResult(
        `✅ Benchmark Passed under ${currentSpec.profile}: Generated 342 tokens at ${currentSpec.tokensPerSec} tok/s with ${currentSpec.vramGb} GB VRAM. Zero packet loss, all AST invariants preserved.`
      );
    }, 800);
  };

  return (
    <div className="space-y-6 font-code text-white">
      {/* Top Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[#0E0A24] via-[#160E36] to-[#0A071A] border border-[#FFD700]/30 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h2 className="text-xl font-extrabold text-white font-sans tracking-wide">
                Copilot Fusion & Le Chonk Quantization
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Multi-model routing simulator with automated latency circuit breakers (&gt;1,200ms threshold) and dynamic quantization weight toggles.
            </p>
          </div>

          {/* Circuit Breaker Status Indicator */}
          <div className="flex items-center gap-3 bg-black/50 px-4 py-2.5 rounded-xl border border-white/10">
            <div>
              <div className="text-[10px] text-zinc-400 uppercase font-bold">CIRCUIT BREAKER</div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    circuitBreakerStatus === 'CLOSED'
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-rose-500 animate-ping'
                  }`}
                />
                <span
                  className={`text-xs font-extrabold ${
                    circuitBreakerStatus === 'CLOSED' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {circuitBreakerStatus === 'CLOSED' ? 'NORMAL // CLOSED' : 'TRIPPED // OPEN (>1200ms)'}
                </span>
              </div>
            </div>

            <div className="border-l border-white/10 pl-3">
              <span className="text-[10px] text-zinc-400 block font-bold">LATENCY</span>
              <span
                className={`text-sm font-extrabold ${
                  latencyMs > 1200 ? 'text-rose-400' : 'text-[#FFD700]'
                }`}
              >
                {latencyMs} ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Quantization Toggles & Routing Circuit Breaker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Le Chonk Quantization Controls (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#080514]/90 border border-white/10 shadow-lg backdrop-blur-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#FFD700] flex items-center gap-2">
                <span>🎛️</span> LE CHONK QUANTIZATION PROFILES
              </h3>
              <p className="text-[11px] text-zinc-400">
                Toggle weight bit-depth to match local APU memory bandwidth and thermal dissipation caps.
              </p>
            </div>

            <span className="text-[10px] text-[#70D6FF] font-mono">GGUF / K-Quants Engine</span>
          </div>

          {/* Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['Q4_K_M', 'Q5_K_M', 'Q8_0'] as QuantProfile[]).map((p) => {
              const spec = QUANT_SPECS[p];
              const isSelected = activeQuant === p;
              return (
                <div
                  key={p}
                  onClick={() => {
                    soundFX.playClick();
                    setActiveQuant(p);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#1E1736] to-[#120E24] border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.25)]'
                      : 'bg-black/40 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-white">{p}</span>
                    {isSelected && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FFD700] text-black font-extrabold">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-400 text-[11px]">
                      <span>VRAM:</span>
                      <span className="text-white font-bold">{spec.vramGb} GB</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 text-[11px]">
                      <span>SPEED:</span>
                      <span className="text-[#00FF66] font-bold">{spec.tokensPerSec} tok/s</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 text-[11px]">
                      <span>PERPLEXITY:</span>
                      <span className="text-[#70D6FF] font-bold">{spec.perplexity}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-tight pt-1 border-t border-white/5">
                    {spec.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Prompt Benchmark Simulator */}
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <span>💬</span> MULTI-MODEL BENCHMARK PROMPT
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-black/60 border border-white/15 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFD700]"
              />
              <button
                onClick={handleRunBenchmark}
                disabled={isBenchmarking}
                className="px-4 py-2 gold-gradient-bg text-black font-extrabold rounded-xl text-xs hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>⚡</span>
                <span>{isBenchmarking ? 'STREAMING TOKENS...' : 'RUN BENCHMARK'}</span>
              </button>
            </div>

            {benchmarkResult && (
              <div className="p-3 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-zinc-200">
                {benchmarkResult}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Latency Circuit Breaker Simulator (1 col) */}
        <div className="flex flex-col gap-5">
          <div className="p-5 rounded-2xl bg-[#0D0922]/90 border border-[#FF2A55]/30 shadow-lg backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs text-[#FF2A55] font-bold tracking-wider flex items-center gap-1.5">
                <span>🛡️</span> LATENCY CIRCUIT BREAKER
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">&gt;1,200ms CAP</span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Guards against slow remote models. If latency exceeds 1,200ms, immediately cuts off pipeline and re-routes to local fast fallback model in &lt;10ms.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 flex justify-between">
                <span className="text-zinc-400">Primary Target:</span>
                <span className="text-[#FFD700] font-bold">{activeModel}</span>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 flex justify-between">
                <span className="text-zinc-400">Fallback Target:</span>
                <span className="text-[#00FF66] font-bold">{fallbackModel}</span>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 flex justify-between">
                <span className="text-zinc-400">Breaker Tripped Count:</span>
                <span className="text-white font-bold">{circuitBreakerStatus === 'OPEN' ? 1 : 0}</span>
              </div>
            </div>

            {/* Circuit Breaker Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleSimulateLatencySpike}
                className="w-full py-2.5 bg-red-950/70 border border-red-800 text-red-300 font-extrabold rounded-xl text-xs hover:bg-red-900/80 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <span>💥</span> SIMULATE 1,800ms LATENCY SPIKE
              </button>

              <button
                onClick={handleResetCircuitBreaker}
                className="w-full py-2 bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🔄</span> RESET CIRCUIT BREAKER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

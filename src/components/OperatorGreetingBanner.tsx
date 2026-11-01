import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { soundFX } from '../utils/audio';
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  Network,
  Flame,
  ShieldCheck,
  ArrowRight,
  Coffee
} from 'lucide-react';

interface OperatorGreetingBannerProps {
  activeModelName: string;
  onNavigateToView?: (view: string) => void;
  onScrollToMascot?: () => void;
}

export const OperatorGreetingBanner: React.FC<OperatorGreetingBannerProps> = ({
  activeModelName,
  onNavigateToView,
  onScrollToMascot
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const triggerCoffeeConfetti = () => {
    soundFX.playWiggle();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x: 0.5, y: 0.2 },
      colors: ['#FFD700', '#FF2A55', '#70D6FF', '#00FF66', '#A855F7']
    });
  };

  return (
    <div className="clay-card-3d p-5 sm:p-6 relative overflow-hidden transition-all rounded-3xl">
      {/* Background Neon Glow Spheres */}
      <div className="absolute top-0 right-0 w-80 h-36 bg-gradient-to-bl from-[#70D6FF]/15 via-[#A855F7]/10 to-transparent pointer-events-none rounded-bl-full" />
      <div className="absolute -bottom-8 -left-8 w-44 h-44 bg-[#FFD700]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3.5">
          <div
            onClick={triggerCoffeeConfetti}
            className="w-12 h-12 rounded-2xl clay-btn-gold flex items-center justify-center text-2xl shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
            title="Click for coffee & confetti cheer!"
          >
            🦀
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
              <span className="text-[11px] font-code font-bold tracking-wider text-[#FFD700] uppercase">
                Operator Morning Briefing · Loopback Active
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight mt-0.5 flex items-center gap-2">
              Welcome back, Operator!
              <span className="text-xs font-code font-normal text-[#70D6FF] hidden md:inline">
                (1,440 Swarm Synced)
              </span>
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={triggerCoffeeConfetti}
            className="px-3 py-1.5 rounded-xl clay-btn-blue font-code font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Send Virtual Coffee to the Swarm"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">VIRTUAL COFFEE</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setIsMinimized(!isMinimized);
            }}
            className="px-3 py-1.5 rounded-xl clay-nav-btn text-xs font-code font-bold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            {isMinimized ? (
              <>
                <span>EXPAND</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#FFD700]" />
              </>
            ) : (
              <>
                <span>COLLAPSE</span>
                <ChevronUp className="w-3.5 h-3.5 text-[#FFD700]" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Briefing Content */}
      {!isMinimized && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in fade-in duration-200 relative z-10">
          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans max-w-4xl">
            All 1,440 swarm nodes are synchronized with zero clock drift. Primary LLM runtime{' '}
            <strong className="text-[#FFD700] font-code font-bold">{activeModelName}</strong> is
            operating at sub-5ms loopback latency. APU thermals are chill at{' '}
            <strong className="text-[#00FF66] font-code font-bold">42.8°C</strong> (well below the 75°C
            Flux-Smith thermal ceiling). All 58 security and AST patch assertions are certified passing.
          </p>

          {/* 4 Tactile 3D Metric Cards (Vibrant 5-color neon palette) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 clay-card-3d-hover">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1 font-code font-bold">
                <Cpu className="w-3.5 h-3.5 text-[#70D6FF]" />
                <span>PRIMARY BRAIN</span>
              </div>
              <div className="text-white font-display font-extrabold text-sm truncate">{activeModelName}</div>
              <div className="text-[10px] font-code text-[#70D6FF] font-bold mt-0.5">4.2ms · GGUF</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 clay-card-3d-hover">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1 font-code font-bold">
                <Network className="w-3.5 h-3.5 text-[#00FF66]" />
                <span>SWARM MESH</span>
              </div>
              <div className="text-white font-display font-extrabold text-sm">1,440 Nodes</div>
              <div className="text-[10px] font-code text-[#00FF66] font-bold mt-0.5">100% Synced</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 clay-card-3d-hover">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1 font-code font-bold">
                <Flame className="w-3.5 h-3.5 text-[#FF2A55]" />
                <span>APU THERMAL</span>
              </div>
              <div className="text-white font-display font-extrabold text-sm font-code tabular-nums">42.8°C</div>
              <div className="text-[10px] font-code text-zinc-400 mt-0.5">75°C Ceiling</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 clay-card-3d-hover">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1 font-code font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A855F7]" />
                <span>SMOKE SUITE</span>
              </div>
              <div className="text-white font-display font-extrabold text-sm font-code tabular-nums">58 / 58</div>
              <div className="text-[10px] font-code text-[#00FF66] font-bold mt-0.5">0 Violations</div>
            </div>
          </div>

          {/* Plain-English Quick Jumps */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-code">
            {onNavigateToView && (
              <>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onNavigateToView('bhive-mesh');
                  }}
                  className="text-[#70D6FF] hover:text-white flex items-center gap-1 transition-colors cursor-pointer font-bold"
                >
                  <span>🌐 1,440 Swarm Mesh</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-zinc-600">·</span>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onNavigateToView('bhive-chat');
                  }}
                  className="text-[#A855F7] hover:text-white flex items-center gap-1 transition-colors cursor-pointer font-bold"
                >
                  <span>💬 Swarm Chat Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-zinc-600">·</span>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onNavigateToView('ast-auditor');
                  }}
                  className="text-[#00FF66] hover:text-white flex items-center gap-1 transition-colors cursor-pointer font-bold"
                >
                  <span>🛡️ AST SecAuditor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            {onScrollToMascot && (
              <>
                <span className="text-zinc-600">·</span>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onScrollToMascot();
                  }}
                  className="text-[#FFD700] hover:text-white flex items-center gap-1 transition-colors cursor-pointer font-bold"
                >
                  <span>🦀 Crab-E Mascot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

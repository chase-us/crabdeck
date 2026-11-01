import React from 'react';
import confetti from 'canvas-confetti';
import { ModelBot } from '../types';
import { soundFX } from '../utils/audio';
import { Cpu, RefreshCw, Zap } from 'lucide-react';

interface ModelSelectorPanelProps {
  models: ModelBot[];
  activeModelId: string;
  onSelectModel: (id: string) => void;
  isClayMode?: boolean;
}

export const ModelSelectorPanel: React.FC<ModelSelectorPanelProps> = ({
  models,
  activeModelId,
  onSelectModel
}) => {
  const handleModelClick = (id: string) => {
    soundFX.playHotSwap();
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#FFD700', '#FF2A55', '#70D6FF', '#00FF66', '#A855F7']
    });
    onSelectModel(id);
  };

  return (
    <div className="p-6 rounded-3xl clay-card-3d transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#FFD700]" />
            <h3 className="text-lg sm:text-xl font-display font-extrabold tracking-tight text-white">
              MODEL HOT-SWAPPING MATRIX
            </h3>
          </div>
          <p className="text-xs text-zinc-300 font-sans mt-0.5">
            Click any autonomous LLM archetype node below to hot-swap quantum runtime routing in real time.
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-code font-bold rounded-xl badge-gold self-start sm:self-auto flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#FFD700]" />
          <span>ZERO-DRIFT HOT-SWAP</span>
        </span>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {models.map((model) => {
          const isActive = model.id === activeModelId;
          return (
            <button
              key={model.id}
              onClick={() => handleModelClick(model.id)}
              className={`flex flex-col text-left p-4 rounded-3xl transition-all relative overflow-hidden group cursor-pointer ${
                isActive
                  ? 'clay-btn-purple text-white border-2 border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.35)] scale-102'
                  : 'clay-card-3d border border-white/10 text-zinc-300 hover:border-[#70D6FF]/50 hover:scale-101'
              }`}
            >
              {/* Active Indicator Pulse */}
              {isActive && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 badge-gold px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
                  <span className="text-[10px] font-extrabold font-code text-white">
                    PRIMARY
                  </span>
                </div>
              )}

              {/* Avatar & Title */}
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/20 flex-shrink-0 bg-black/40 shadow-sm">
                  <img
                    src={model.avatarUrl}
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-display font-extrabold text-sm text-white truncate">
                    {model.name}
                  </h4>
                  <span className="text-[11px] font-code text-[#70D6FF] font-bold block truncate">
                    {model.tier}
                  </span>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-xs mb-3 text-zinc-300 font-sans line-clamp-2">
                {model.tagline}
              </p>

              {/* Footer Latency Stat */}
              <div className="mt-auto pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-code">
                <span className="text-zinc-400">
                  LATENCY: <strong className="text-[#00FF66]">{model.latency}ms</strong>
                </span>
                <span className="group-hover:translate-x-1 transition-transform font-bold text-[#FFD700] flex items-center gap-1">
                  <span>SWAP</span>
                  <span>➔</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

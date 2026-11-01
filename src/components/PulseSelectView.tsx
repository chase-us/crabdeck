import React from 'react';
import { ModelBot } from '../types';
import { GooglyEyes } from './GooglyEyes';
import { soundFX } from '../utils/audio';

interface PulseSelectViewProps {
  models: ModelBot[];
  activeModelId: string;
  onSelectModel: (id: string) => void;
  onConfirmDeployment: () => void;
}

export const PulseSelectView: React.FC<PulseSelectViewProps> = ({
  models,
  activeModelId,
  onSelectModel,
  onConfirmDeployment
}) => {
  return (
    <div className="space-y-8 font-hanken max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="p-8 sophisticated-card rounded-3xl text-white relative border border-[#D4AF37]/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <span className="px-3 py-1 gold-badge font-bold text-xs rounded uppercase tracking-wider">
              QUANTUM OMNI-LAYER DEPLOYMENT HUB
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-extrabold tracking-tight gold-gradient-text">
              CHOOSE YOUR PULSE ⚡
            </h1>
            <p className="text-sm font-semibold max-w-xl text-zinc-300">
              Select an intelligent bot node to anchor your neural execution matrix. Each bot possesses distinct velocity characteristics and wasp wiggle harmonics.
            </p>
          </div>

          <GooglyEyes size="lg" label="PULSE SELECTOR" expression="happy" />
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.filter(m => ['hermes', 'deepseek', 'qwen'].includes(m.id)).map((model) => {
          const isSelected = model.id === activeModelId;
          return (
            <div
              key={model.id}
              onClick={() => {
                soundFX.playHotSwap();
                onSelectModel(model.id);
              }}
              className={`p-6 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#12121A] border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.25)] scale-102 ring-1 ring-[#D4AF37]'
                  : 'bg-[#0A0A0F]/80 border-white/10 hover:border-[#D4AF37]/40 hover:bg-[#101016]'
              }`}
            >
              {/* Top Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-[#1A1810] border border-[#D4AF37]/40 text-[#F3E5AB] font-bold text-xs rounded">
                  {model.tier}
                </span>
                <span className="font-mono-space text-xs font-bold text-[#D4AF37]">
                  LATENCY: {model.latency}ms
                </span>
              </div>

              {/* Bot Avatar */}
              <div className="flex justify-center my-4">
                <div className="w-36 h-36 rounded-2xl border border-[#D4AF37]/30 overflow-hidden bg-black/40 shadow-lg">
                  <img
                    src={model.avatarUrl}
                    alt={model.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Bot Info */}
              <div className="text-center space-y-2 mb-6">
                <h3 className="font-serif-luxury text-2xl font-bold text-white">
                  {model.name}
                </h3>
                <p className="text-xs font-medium text-zinc-300 leading-relaxed px-2">
                  {model.tagline}
                </p>
              </div>

              {/* Specs List */}
              <div className="space-y-2 bg-[#050508]/80 p-3 border border-white/10 rounded-xl mb-6 font-mono-space text-xs">
                {model.specs.map((spec, i) => (
                  <div key={i} className="flex justify-between text-zinc-300">
                    <span className="font-semibold text-zinc-400">{spec.label}:</span>
                    <strong className="text-[#F3E5AB]">{spec.value}</strong>
                  </div>
                ))}
              </div>

              {/* Select Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundFX.playHotSwap();
                  onSelectModel(model.id);
                }}
                className={`w-full py-3 text-xs font-extrabold uppercase rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'gold-gradient-bg text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'bg-[#1A1810] border border-[#D4AF37]/40 text-[#F3E5AB] hover:border-[#D4AF37]'
                }`}
              >
                {isSelected ? '✓ PRIMARY LINKED' : 'SELECT PULSE NODE'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Bar */}
      <div className="p-6 sophisticated-card rounded-3xl border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
        <div>
          <h4 className="font-serif-luxury text-xl font-bold gold-gradient-text">
            CONFIRM LINKAGE TO {models.find(m => m.id === activeModelId)?.name}
          </h4>
          <p className="text-xs font-medium text-zinc-300">
            Click below to route the bHive Swarm 3D matrix through your chosen primary node.
          </p>
        </div>

        <button
          onClick={() => {
            soundFX.playGloop();
            onConfirmDeployment();
          }}
          className="px-8 py-3.5 gold-gradient-bg text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all cursor-pointer whitespace-nowrap"
        >
          🚀 DEPLOY TO QUANTUM MATRIX ➔
        </button>
      </div>
    </div>
  );
};
